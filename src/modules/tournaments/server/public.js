import { db } from "@/lib/db";
import { calculatePoolStandings } from "@/modules/tournaments/server/standings";
import { calculateMatchStatistics, calculatePlayerMatchStatistics } from "@/modules/tournaments/server/match-statistics";

const DISPLAY_STATUS_PRIORITY = {
  ONGOING: 0,
  REGISTRATION: 1,
  UPCOMING: 2,
  COMPLETED: 3,
};

function toIso(value) {
  return value ? new Date(value).toISOString() : null;
}

function dayKeyInTimeZone(value, timeZone = "Asia/Kolkata") {
  if (!value) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(value));
  const pick = (type) => parts.find((part) => part.type === type)?.value;
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

function scoreForParticipant(match, participant) {
  if (!participant) return 0;
  if (match.sport === "FIELD_HOCKEY") return Number(participant.hockeyData?.goals || 0);
  if (match.sport === "FOOTBALL") return Number(participant.footballData?.goals || 0);
  if (match.sport === "CRICKET") return Number(participant.cricketData?.runs || 0);
  return 0;
}

function normalizeMatch(match) {
  const participants = (match.participants || []).map((participant) => ({
    familyId: participant.familyId,
    family: participant.family,
    score: scoreForParticipant(match, participant),
    hockeyData: participant.hockeyData
      ? {
          goals: participant.hockeyData.goals || 0,
          shootoutResults: participant.hockeyData.shootoutResults || [],
          goalDetails: participant.hockeyData.goalDetails || [],
        }
      : null,
  }));

  return {
    id: match.id,
    matchNo: match.matchNo,
    name: match.name,
    sport: match.sport,
    gameId: match.gameId,
    gameName: match.game?.name || null,
    gameShortName: match.game?.shortName || null,
    gameSlug: match.game?.slug || null,
    eventCode: match.game?.eventCode || null,
    venue: match.venueRef?.shortName || match.venueRef?.name || match.venue,
    scheduledOn: toIso(match.scheduledOn),
    actualStartTime: toIso(match.actualStartTime),
    actualEndTime: toIso(match.actualEndTime),
    pool: match.pool,
    round: match.round,
    currentPeriod: match.currentPeriod,
    clockSeconds: match.clockSeconds || 0,
    clockRunning: Boolean(match.clockRunning),
    clockStartedAt: toIso(match.clockStartedAt),
    clockAccumulatedSeconds: match.clockAccumulatedSeconds || 0,
    status: match.status,
    participants,
    winnerId: match.winnerId,
    winnerName: match.winnerName,
    isDraw: match.isDraw,
  };
}

function pickDisplayTournament(tournaments) {
  const now = Date.now();
  return [...tournaments].sort((a, b) => {
    const statusDiff =
      (DISPLAY_STATUS_PRIORITY[a.status] ?? 99) -
      (DISPLAY_STATUS_PRIORITY[b.status] ?? 99);
    if (statusDiff !== 0) return statusDiff;

    const aDistance = Math.abs(new Date(a.startDate).getTime() - now);
    const bDistance = Math.abs(new Date(b.startDate).getTime() - now);
    return aDistance - bDistance;
  })[0];
}

export async function getPublicTournamentSnapshot() {
  const tournaments = await db.tournament.findMany({
    where: {
      status: { in: ["REGISTRATION", "UPCOMING", "ONGOING", "COMPLETED"] },
      visibility: "PUBLIC",
    },
    take: 8,
    orderBy: { startDate: "desc" },
    include: {
      games: {
        where: { isActive: true },
        orderBy: { date: "asc" },
        include: {
          _count: { select: { registrations: true, matches: true } },
        },
      },
      matches: {
        where: { publicationStatus: "PUBLISHED", status: { not: "CANCELLED" } },
        orderBy: [{ scheduledOn: "asc" }, { matchNo: "asc" }],
        include: { game: { select: { id: true, name: true, shortName: true, slug: true, eventCode: true } }, venueRef: { select: { id: true, name: true, shortName: true } } },
      },
      sponsor: {
        where: { status: true },
        select: { id: true, name: true, website: true, logo: true },
      },
      placements: {
        include: { family: { select: { familyName: true } }, game: { select: { id: true, name: true, shortName: true, sportType: true } } },
      },
      _count: {
        select: { participation: true, matches: true, games: true },
      },
    },
  });

  const tournament = pickDisplayTournament(tournaments);
  if (!tournament) return null;

  const matches = tournament.matches.map(normalizeMatch);
  const now = Date.now();
  const liveMatches = matches.filter((match) => match.status === "LIVE");
  const upcomingMatches = matches
    .filter(
      (match) =>
        ["SCHEDULED", "DELAYED", "POSTPONED"].includes(match.status) &&
        new Date(match.scheduledOn).getTime() >= now - 6 * 60 * 60 * 1000,
    )
    .slice(0, 10);
  const recentResults = [...matches]
    .filter((match) => ["COMPLETED", "WALKOVER"].includes(match.status))
    .sort((a, b) => new Date(b.scheduledOn) - new Date(a.scheduledOn))
    .slice(0, 8);

  const standingsByGame = tournament.games.map((game) => ({
    gameId: game.id,
    gameName: game.name,
    sportType: game.sportType,
    pools: calculatePoolStandings(
      tournament.matches.filter((match) => match.gameId === game.id && match.publicationStatus === "PUBLISHED"),
    ),
  }));

  const knockoutMatches = matches.filter((match) =>
    ["ROUND_OF_32", "ROUND_OF_16", "PRE_QUARTER", "QUARTER_FINAL", "SEMI_FINAL", "THIRD_PLACE", "FINAL"].includes(
      match.round,
    ),
  );

  return {
    id: tournament.id,
    name: tournament.name,
    shortName: tournament.shortName || tournament.name,
    slug: tournament.slug || null,
    timezone: tournament.timezone || "Asia/Kolkata",
    year: tournament.year,
    status: tournament.status,
    description: tournament.description,
    startDate: toIso(tournament.startDate),
    endDate: toIso(tournament.endDate),
    registrationDeadline: toIso(tournament.registrationDeadline),
    images: tournament.images || [],
    counts: {
      families: tournament._count.participation,
      games: tournament._count.games,
      matches: matches.length,
      completedMatches: matches.filter((match) => ["COMPLETED", "WALKOVER"].includes(match.status)).length,
    },
    games: tournament.games.map((game) => ({
      id: game.id,
      name: game.name,
      shortName: game.shortName || null,
      slug: game.slug || null,
      eventCode: game.eventCode || null,
      sportType: game.sportType,
      category: game.category,
      format: game.format,
      date: toIso(game.date),
      registrationDeadline: toIso(game.registrationDeadline),
      registrationFee: game.registrationFee,
      description: game.description,
      registrationCount: game._count.registrations,
      matchCount: matches.filter((match) => match.gameId === game.id).length,
    })),
    allMatches: matches,
    liveMatches,
    upcomingMatches,
    recentResults,
    standingsByGame,
    knockoutMatches,
    sponsors: tournament.sponsor.map((sponsor) => ({
      id: sponsor.id,
      name: sponsor.name,
      website: sponsor.website,
      logo: sponsor.logo || [],
    })),
    placements: tournament.placements.map((placement) => ({
      id: placement.id,
      sport: placement.sport,
      gameId: placement.gameId || null,
      gameName: placement.game?.shortName || placement.game?.name || null,
      placement: placement.placement,
      familyName: placement.family?.familyName || "",
      prize: placement.prize || null,
    })),
  };
}

export async function getPublicMatchDetail(matchId) {
  if (!matchId) return null;
  const match = await db.matches.findUnique({
    where: { id: matchId },
    include: {
      tournament: { select: { id: true, name: true, shortName: true, slug: true, timezone: true, visibility: true, status: true } },
      game: { select: { id: true, name: true, shortName: true, slug: true, eventCode: true, sportType: true, category: true, format: true } },
      venueRef: { select: { id: true, name: true, shortName: true, address: true } },
      manOfTheMatch: { select: { id: true, playerName: true, displayName: true, slug: true, jerseyNumber: true, familyId: true } },
      events: { orderBy: [{ createdAt: "asc" }, { sequence: "asc" }] },
      officials: {
        where: { status: { in: ["ASSIGNED", "CHECKED_IN", "COMPLETED"] } },
        orderBy: { role: "asc" },
        select: { id: true, role: true, name: true },
      },
    },
  });
  if (!match) return null;
  if (match.publicationStatus === "HIDDEN" || match.tournament?.visibility === "PRIVATE" || match.tournament?.status === "DRAFT") return null;

  const normalized = normalizeMatch(match);
  const embeddedGoals = (normalized.participants || []).flatMap((participant) =>
    (participant.hockeyData?.goalDetails || []).map((goal, index) => ({
      id: `legacy-goal-${participant.familyId}-${index}`,
      type: goal.type === "OWN_GOAL" ? "OWN_GOAL" : "GOAL",
      period: goal.period,
      minute: goal.minute,
      familyId: participant.familyId,
      familyName: participant.family,
      playerId: goal.playerId,
      playerName: goal.playerName,
      description: null,
      createdAt: null,
      legacy: true,
    })),
  );

  const eventRows = match.events?.length ? match.events : embeddedGoals;
  const familyIds = [...new Set((normalized.participants || []).map((p) => p.familyId).filter(Boolean))];
  const playerIds = [...new Set([
    ...eventRows.map((event) => event.playerId),
    ...eventRows.map((event) => event.secondaryPlayerId),
    match.manOfTheMatchId,
  ].filter(Boolean))];

  const [families, players, relatedMatches] = await Promise.all([
    familyIds.length ? db.families.findMany({
      where: { id: { in: familyIds }, status: "ACTIVE" },
      select: { id: true, familyName: true, shortName: true, slug: true, crestUrl: true, images: true },
    }) : [],
    playerIds.length ? db.player.findMany({
      where: { id: { in: playerIds }, isActive: true, verificationStatus: { not: "REJECTED" } },
      select: { id: true, playerName: true, displayName: true, slug: true, photoUrl: true, familyId: true },
    }) : [],
    db.matches.findMany({
      where: {
        tournamentId: match.tournamentId,
        publicationStatus: "PUBLISHED",
        status: { not: "CANCELLED" },
        ...(match.gameId ? { gameId: match.gameId } : {}),
      },
      orderBy: [{ scheduledOn: "asc" }, { matchNo: "asc" }],
      take: 300,
      include: {
        game: { select: { id: true, name: true, shortName: true, slug: true, eventCode: true } },
        venueRef: { select: { id: true, name: true, shortName: true } },
      },
    }),
  ]);

  const familyMap = new Map(families.map((family) => [family.id, {
    ...family,
    href: `/teams/${family.slug || family.id}`,
    image: family.crestUrl || family.images?.[0] || null,
  }]));
  const playerMap = new Map(players.map((player) => [player.id, {
    ...player,
    href: `/players/${player.slug || player.id}`,
  }]));

  const participants = normalized.participants.map((participant) => ({
    ...participant,
    profile: familyMap.get(participant.familyId) || null,
  }));

  const enrichedMatch = { ...match, participants: normalized.participants, events: match.events || [] };
  const teamStatistics = calculateMatchStatistics(enrichedMatch);
  const playerStatistics = calculatePlayerMatchStatistics(enrichedMatch).map((row) => ({
    ...row,
    profile: playerMap.get(row.playerId) || null,
    familyProfile: familyMap.get(row.familyId) || null,
  }));

  const normalizedRelated = relatedMatches.map(normalizeMatch);
  const currentIndex = normalizedRelated.findIndex((row) => row.id === match.id);
  const previousMatch = currentIndex > 0 ? normalizedRelated[currentIndex - 1] : null;
  const nextMatch = currentIndex >= 0 && currentIndex < normalizedRelated.length - 1 ? normalizedRelated[currentIndex + 1] : null;

  const related = normalizedRelated
    .filter((row) => row.id !== match.id)
    .sort((a, b) => Math.abs(new Date(a.scheduledOn) - new Date(match.scheduledOn)) - Math.abs(new Date(b.scheduledOn) - new Date(match.scheduledOn)))
    .slice(0, 6);

  const events = eventRows.map((event) => ({
    id: event.id,
    type: event.type,
    period: event.period,
    minute: event.minute,
    second: event.second,
    familyId: event.familyId,
    familyName: event.familyName,
    familyProfile: familyMap.get(event.familyId) || null,
    playerId: event.playerId,
    playerName: event.playerName,
    playerProfile: playerMap.get(event.playerId) || null,
    secondaryPlayerId: event.secondaryPlayerId,
    secondaryPlayerName: event.secondaryPlayerName,
    secondaryPlayerProfile: playerMap.get(event.secondaryPlayerId) || null,
    value: event.value,
    description: event.description,
    metadata: event.metadata,
    createdAt: toIso(event.createdAt),
  })).sort((a, b) => Number(a.minute || 0) - Number(b.minute || 0));

  return {
    ...normalized,
    participants,
    teamStatistics,
    playerStatistics,
    tournament: match.tournament,
    game: match.game,
    eventHref: match.game ? `/tournament/events/${match.game.slug || match.game.id}` : "/tournament",
    matchDay: dayKeyInTimeZone(match.scheduledOn, match.tournament?.timezone || "Asia/Kolkata"),
    venueDetail: match.venueRef || null,
    manOfTheMatch: match.manOfTheMatch ? {
      ...match.manOfTheMatch,
      href: playerMap.get(match.manOfTheMatch.id)?.href || `/players/${match.manOfTheMatch.slug || match.manOfTheMatch.id}`,
    } : null,
    officials: match.officials || [],
    events,
    navigation: { previousMatch, nextMatch, related },
  };
}

function publicEventIdentifier(identifier) {
  const value = String(identifier || "").trim();
  if (!value) return { slug: "__missing__" };
  return /^[a-f0-9]{24}$/i.test(value)
    ? { OR: [{ id: value }, { slug: value }] }
    : { slug: value };
}

export async function getPublicTournamentEvent(identifier) {
  const game = await db.tournamentGame.findFirst({
    where: {
      AND: [
        publicEventIdentifier(identifier),
        { isActive: true },
        { tournament: { is: { visibility: "PUBLIC", status: { in: ["REGISTRATION", "UPCOMING", "ONGOING", "COMPLETED"] } } } },
      ],
    },
    include: {
      tournament: {
        select: {
          id: true, name: true, shortName: true, slug: true, year: true, status: true,
          startDate: true, endDate: true, timezone: true,
        },
      },
      matches: {
        where: { publicationStatus: "PUBLISHED", status: { not: "CANCELLED" } },
        orderBy: [{ scheduledOn: "asc" }, { matchNo: "asc" }],
        include: { venueRef: { select: { id: true, name: true, shortName: true } } },
      },
      registrations: {
        where: { status: "CONFIRMED" },
        select: {
          id: true, pool: true,
          participation: { select: { family: { select: { id: true, familyName: true, shortName: true, slug: true, crestUrl: true, images: true } } } },
        },
      },
      placements: {
        orderBy: { placement: "asc" },
        include: { family: { select: { id: true, familyName: true, shortName: true, slug: true } } },
      },
      _count: { select: { registrations: true, matches: true } },
    },
  });
  if (!game) return null;

  const matches = game.matches.map((match) => normalizeMatch({ ...match, game }));
  const pools = calculatePoolStandings(game.matches);
  const liveMatches = matches.filter((m) => m.status === "LIVE");
  const upcomingMatches = matches.filter((m) => ["SCHEDULED", "DELAYED", "POSTPONED"].includes(m.status));
  const results = [...matches].filter((m) => ["COMPLETED", "WALKOVER"].includes(m.status)).sort((a,b)=>new Date(b.scheduledOn)-new Date(a.scheduledOn));
  const knockout = matches.filter((m) => ["ROUND_OF_32","ROUND_OF_16","PRE_QUARTER","QUARTER_FINAL","SEMI_FINAL","THIRD_PLACE","FINAL"].includes(m.round));

  return {
    id: game.id,
    name: game.name,
    shortName: game.shortName || game.name,
    slug: game.slug || null,
    eventCode: game.eventCode || null,
    sportType: game.sportType,
    category: game.category,
    format: game.format,
    date: toIso(game.date),
    description: game.description,
    rules: game.rules,
    matchDurationMinutes: game.matchDurationMinutes,
    teamSize: game.teamSize,
    minRosterSize: game.minRosterSize,
    maxRosterSize: game.maxRosterSize,
    tournament: {
      ...game.tournament,
      startDate: toIso(game.tournament.startDate),
      endDate: toIso(game.tournament.endDate),
    },
    counts: { registrations: game._count.registrations, matches: game._count.matches },
    teams: game.registrations.map((r) => ({
      registrationId: r.id,
      pool: r.pool,
      family: {
        ...r.participation.family,
        href: `/teams/${r.participation.family.slug || r.participation.family.id}`,
        image: r.participation.family.crestUrl || r.participation.family.images?.[0] || null,
      },
    })),
    allMatches: matches,
    liveMatches,
    upcomingMatches,
    results,
    pools,
    knockoutMatches: knockout,
    placements: game.placements.map((p) => ({
      id: p.id, placement: p.placement,
      family: { ...p.family, href: `/teams/${p.family.slug || p.family.id}` },
    })),
  };
}
