import { Prisma } from "@prisma/client";

const NEXT_ROUND = { QUARTER_FINAL: "SEMI_FINAL", SEMI_FINAL: "FINAL" };
const LOCK_STALE_MS = 2 * 60 * 1000;

function loserOf(match) {
  if (!match?.winnerId) return null;
  return (match.participants || []).find((p) => p.familyId !== match.winnerId) || null;
}

async function nextMatchNo(db, tournamentId, sport) {
  const max = await db.matches.aggregate({
    where: { tournamentId, sport },
    _max: { matchNo: true },
  });
  return (max._max.matchNo || 0) + 1;
}

async function createWithMatchNoRetry(db, data, attempts = 5) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const matchNo = await nextMatchNo(db, data.tournamentId, data.sport);
    try {
      return await db.matches.create({ data: { ...data, matchNo } });
    } catch (error) {
      lastError = error;
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    }
  }
  throw lastError || new Error("Unable to allocate a unique match number");
}

async function acquireProgressionLock(db, key) {
  try {
    const lock = await db.tournamentProgressionLock.create({ data: { key } });
    return { owner: true, lock };
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const existing = await db.tournamentProgressionLock.findUnique({ where: { key } });
    if (!existing) return { owner: false, lock: null };

    // Recover a process that acquired the lock but died before attaching a match.
    if (!existing.matchId && Date.now() - new Date(existing.createdAt).getTime() > LOCK_STALE_MS) {
      const removed = await db.tournamentProgressionLock.deleteMany({
        where: { id: existing.id, matchId: null, updatedAt: existing.updatedAt },
      });
      if (removed.count === 1) return acquireProgressionLock(db, key);
    }
    return { owner: false, lock: existing };
  }
}

async function ensureProgressionMatch(db, { key, data }) {
  const acquired = await acquireProgressionLock(db, key);
  if (!acquired.owner) {
    if (!acquired.lock?.matchId) return null;
    return db.matches.findUnique({ where: { id: acquired.lock.matchId } });
  }

  try {
    const match = await createWithMatchNoRetry(db, data);
    await db.tournamentProgressionLock.update({
      where: { id: acquired.lock.id },
      data: { matchId: match.id },
    });
    return match;
  } catch (error) {
    await db.tournamentProgressionLock.delete({ where: { id: acquired.lock.id } }).catch(() => undefined);
    throw error;
  }
}

async function linkFeeders(db, feeders, matchId) {
  if (!matchId) return;
  await db.matches.updateMany({
    where: { id: { in: feeders.map((match) => match.id) }, nextMatchId: null },
    data: { nextMatchId: matchId },
  });
}

export async function advanceKnockoutIfReady(db, { tournamentId, gameId, round }) {
  const nextRound = NEXT_ROUND[round];
  if (!nextRound || !gameId) return { advanced: false };

  const current = await db.matches.findMany({
    where: { tournamentId, gameId, round, status: { not: "CANCELLED" } },
    orderBy: { matchNo: "asc" },
  });
  const required = round === "QUARTER_FINAL" ? 4 : 2;
  if (
    current.length !== required ||
    current.some((match) => !["COMPLETED", "WALKOVER"].includes(match.status) || !match.winnerId)
  ) {
    return { advanced: false };
  }

  const game = await db.tournamentGame.findUnique({
    where: { id: gameId },
    select: { name: true, sportType: true },
  });
  if (!game) return { advanced: false };

  const latest = Math.max(...current.map((match) => new Date(match.actualEndTime || match.scheduledOn).getTime()));
  const scheduledOn = new Date(latest + 3 * 60 * 60 * 1000);
  const venuePool = [...new Set(current.map((match) => match.venue).filter(Boolean))];
  const created = [];

  if (round === "QUARTER_FINAL") {
    for (let index = 0; index < 2; index += 1) {
      const feeders = [current[index * 2], current[index * 2 + 1]];
      const participants = feeders.map((match) =>
        (match.participants || []).find((participant) => participant.familyId === match.winnerId),
      );
      if (participants.some((participant) => !participant)) return { advanced: false, reason: "winner-missing" };

      const key = `${tournamentId}:${gameId}:SEMI_FINAL:${index + 1}`;
      const match = await ensureProgressionMatch(db, {
        key,
        data: {
          tournamentId,
          gameId,
          sport: game.sportType,
          name: `${game.name} - Semi Final ${index + 1}`,
          venue: venuePool[index % Math.max(1, venuePool.length)] || "GROUND_1",
          scheduledOn,
          round: "SEMI_FINAL",
          status: "SCHEDULED",
          participants,
          previousMatches: feeders.map((item) => item.id),
          images: [],
        },
      });
      if (match) {
        await linkFeeders(db, feeders, match.id);
        created.push(match);
      }
    }
  } else {
    const winners = current.map((match) =>
      (match.participants || []).find((participant) => participant.familyId === match.winnerId),
    );
    const losers = current.map(loserOf);
    if (winners.some((participant) => !participant)) return { advanced: false, reason: "winner-missing" };

    const final = await ensureProgressionMatch(db, {
      key: `${tournamentId}:${gameId}:FINAL:1`,
      data: {
        tournamentId,
        gameId,
        sport: game.sportType,
        name: `${game.name} - Final`,
        venue: venuePool[0] || "MAIN_STADIUM",
        scheduledOn,
        round: "FINAL",
        status: "SCHEDULED",
        participants: winners,
        previousMatches: current.map((match) => match.id),
        images: [],
      },
    });
    if (final) {
      await linkFeeders(db, current, final.id);
      created.push(final);
    }

    if (losers.every(Boolean)) {
      const thirdPlace = await ensureProgressionMatch(db, {
        key: `${tournamentId}:${gameId}:THIRD_PLACE:1`,
        data: {
          tournamentId,
          gameId,
          sport: game.sportType,
          name: `${game.name} - Third Place`,
          venue: venuePool[1] || venuePool[0] || "GROUND_1",
          scheduledOn,
          round: "THIRD_PLACE",
          status: "SCHEDULED",
          participants: losers,
          previousMatches: current.map((match) => match.id),
          images: [],
        },
      });
      if (thirdPlace) created.push(thirdPlace);
    }
  }

  return { advanced: created.length > 0, created };
}
