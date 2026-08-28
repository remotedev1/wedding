const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'item';
}

function moneyMinor(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) : 0;
}

async function uniqueSlug(base, used) {
  let candidate = base || 'item';
  let n = 2;
  while (used.has(candidate)) candidate = `${base}-${n++}`;
  used.add(candidate);
  return candidate;
}

async function migrateTournaments() {
  const tournaments = await db.tournament.findMany({
    include: {
      games: { include: { registrations: true } },
      matches: true,
    },
  });
  const usedTournamentSlugs = new Set();

  for (const tournament of tournaments) {
    const tournamentSlug = await uniqueSlug(
      tournament.slug || slugify(`${tournament.name}-${tournament.year}`),
      usedTournamentSlugs,
    );

    await db.tournament.update({
      where: { id: tournament.id },
      data: {
        slug: tournamentSlug,
        shortName: tournament.shortName || tournament.name,
        visibility: tournament.visibility || 'PUBLIC',
        publishedAt: tournament.publishedAt || (tournament.status !== 'DRAFT' ? new Date() : null),
      },
    });

    const venueByLegacyName = new Map();
    const legacyVenues = [...new Set(tournament.matches.map((m) => m.venue).filter(Boolean))];
    for (const [index, venueName] of legacyVenues.entries()) {
      const existing = await db.tournamentVenue.findFirst({
        where: { tournamentId: tournament.id, name: venueName },
      });
      const venue = existing || await db.tournamentVenue.create({
        data: {
          tournamentId: tournament.id,
          name: venueName.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          shortName: venueName,
          slug: slugify(venueName),
          sortOrder: index,
        },
      });
      venueByLegacyName.set(venueName, venue.id);
    }

    for (const match of tournament.matches) {
      const venueId = venueByLegacyName.get(match.venue);
      if (venueId || !match.publicationStatus) {
        await db.matches.update({ where: { id: match.id }, data: {
          ...(venueId && !match.venueId ? { venueId } : {}),
          ...(!match.publicationStatus ? { publicationStatus: 'PUBLISHED' } : {}),
          durationMinutes: match.durationMinutes || null,
        } });
      }
    }

    const usedGameSlugs = new Set();
    for (const game of tournament.games) {
      const gameSlug = await uniqueSlug(game.slug || slugify(game.name), usedGameSlugs);
      await db.tournamentGame.update({
        where: { id: game.id },
        data: {
          slug: gameSlug,
          shortName: game.shortName || game.name,
          eventCode: game.eventCode || `${game.sportType}-${game.category}-${game.id.slice(-5)}`,
          registrationFeeMinor: game.registrationFeeMinor ?? moneyMinor(game.registrationFee),
          matchDurationMinutes: game.matchDurationMinutes || (game.sportType === 'FIELD_HOCKEY' ? 75 : null),
          minimumRestMinutes: game.minimumRestMinutes || 30,
          pointsConfig: game.pointsConfig || { win: 3, draw: 1, loss: 0 },
          tieBreakerConfig: game.tieBreakerConfig || ['points', 'difference', 'scored', 'wins', 'name'],
        },
      });

      let poolStage = await db.tournamentStage.findFirst({ where: { gameId: game.id, code: 'POOL' } });
      const hasPoolMatches = tournament.matches.some((m) => m.gameId === game.id && m.round === 'POOL_STAGE');
      if (hasPoolMatches && !poolStage) {
        poolStage = await db.tournamentStage.create({
          data: {
            tournamentId: tournament.id,
            gameId: game.id,
            name: 'Pool Stage',
            code: 'POOL',
            type: 'GROUP',
            order: 10,
            qualifiersCount: 2,
          },
        });
      }

      if (poolStage) {
        const groupCodes = [...new Set([
          ...game.registrations.map((r) => r.pool).filter(Boolean),
          ...tournament.matches.filter((m) => m.gameId === game.id).map((m) => m.pool).filter(Boolean),
        ])];
        for (const [index, code] of groupCodes.entries()) {
          const group = await db.stageGroup.upsert({
            where: { stageId_code: { stageId: poolStage.id, code } },
            update: { name: `Pool ${code}`, order: index },
            create: { stageId: poolStage.id, code, name: `Pool ${code}`, order: index },
          });
          await db.gameRegistration.updateMany({
            where: { gameId: game.id, pool: code, groupId: null },
            data: { groupId: group.id },
          });
          await db.matches.updateMany({
            where: { gameId: game.id, pool: code, groupId: null },
            data: { groupId: group.id, stageId: poolStage.id },
          });
        }
      }

      const knockoutRounds = ['ROUND_OF_32','ROUND_OF_16','PRE_QUARTER','QUARTER_FINAL','SEMI_FINAL','THIRD_PLACE','FINAL'];
      const hasKnockout = tournament.matches.some((m) => m.gameId === game.id && knockoutRounds.includes(m.round));
      if (hasKnockout) {
        const knockout = await db.tournamentStage.findFirst({ where: { gameId: game.id, code: 'KNOCKOUT' } });
        const stage = knockout || await db.tournamentStage.create({
          data: {
            tournamentId: tournament.id,
            gameId: game.id,
            name: 'Knockout',
            code: 'KNOCKOUT',
            type: 'KNOCKOUT',
            order: 20,
          },
        });
        await db.matches.updateMany({
          where: { gameId: game.id, round: { in: knockoutRounds }, stageId: null },
          data: { stageId: stage.id },
        });
      }
    }
  }
}

async function migrateFamiliesPlayersMoney() {
  const families = await db.families.findMany();
  const usedFamilySlugs = new Set();
  for (const family of families) {
    const slug = await uniqueSlug(family.slug || slugify(family.familyName), usedFamilySlugs);
    await db.families.update({
      where: { id: family.id },
      data: { slug, shortName: family.shortName || family.familyName },
    });
  }

  const players = await db.player.findMany();
  const usedPlayerSlugs = new Set();
  for (const player of players) {
    const slug = await uniqueSlug(player.slug || slugify(`${player.playerName}-${player.id.slice(-5)}`), usedPlayerSlugs);
    await db.player.update({
      where: { id: player.id },
      data: { slug, displayName: player.displayName || player.playerName },
    });
  }

  const registrations = await db.gameRegistration.findMany();
  for (const registration of registrations) {
    if (registration.paymentAmountMinor == null) {
      await db.gameRegistration.update({
        where: { id: registration.id },
        data: { paymentAmountMinor: moneyMinor(registration.paymentAmount) },
      });
    }
  }

  const payments = await db.payment.findMany();
  for (const payment of payments) {
    await db.payment.update({
      where: { id: payment.id },
      data: {
        amountMinor: payment.amountMinor ?? moneyMinor(payment.amount),
        refundAmountMinor: payment.refundAmountMinor ?? (payment.refundAmount == null ? null : moneyMinor(payment.refundAmount)),
      },
    });
  }
}

async function migratePlacementsAllocationsAndEvents() {
  const placements = await db.tournamentPlacement.findMany();
  for (const placement of placements) {
    if (placement.gameId) continue;
    const candidates = await db.tournamentGame.findMany({
      where: { tournamentId: placement.tournamentId, sportType: placement.sport },
      select: { id: true },
      take: 2,
    });
    if (candidates.length === 1) {
      await db.tournamentPlacement.update({
        where: { id: placement.id },
        data: { gameId: candidates[0].id },
      });
    }
  }

  const payments = await db.payment.findMany();
  for (const payment of payments) {
    for (const registrationId of payment.registrationIds || []) {
      const existing = await db.paymentAllocation.findFirst({
        where: { paymentId: payment.id, registrationId },
      });
      if (existing) continue;
      const registration = await db.gameRegistration.findUnique({
        where: { id: registrationId },
        include: { participation: { select: { tournamentId: true } } },
      });
      if (!registration) continue;
      await db.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          registrationId,
          tournamentId: registration.participation.tournamentId,
          gameId: registration.gameId,
          amountMinor: registration.paymentAmountMinor ?? moneyMinor(registration.paymentAmount),
          currency: payment.currency || 'INR',
          purpose: 'Tournament event registration',
        },
      });
    }
  }

  const matches = await db.matches.findMany({
    select: { id: true, participants: true, sport: true },
  });
  for (const match of matches) {
    const existingCount = await db.matchEvent.count({ where: { matchId: match.id } });
    if (existingCount > 0 || match.sport !== 'FIELD_HOCKEY') continue;
    let sequence = 1;
    for (const participant of match.participants || []) {
      for (const goal of participant.hockeyData?.goalDetails || []) {
        await db.matchEvent.create({
          data: {
            matchId: match.id,
            type: goal.type === 'OWN_GOAL' ? 'OWN_GOAL' : 'GOAL',
            sequence: sequence++,
            period: goal.period || null,
            minute: goal.minute ?? null,
            familyId: participant.familyId || null,
            familyName: participant.family || null,
            playerId: goal.playerId || null,
            playerName: goal.playerName || null,
            metadata: { source: 'legacy_hockey_goal', goalType: goal.type, jerseyNumber: goal.jerseyNumber ?? null },
          },
        });
      }
    }
  }
}

async function main() {
  console.log('Starting tournament domain v2 backfill...');
  await migrateTournaments();
  await migrateFamiliesPlayersMoney();
  await migratePlacementsAllocationsAndEvents();
  console.log('Tournament domain v2 backfill complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => db.$disconnect());
