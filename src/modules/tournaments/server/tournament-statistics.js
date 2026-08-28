
import { db } from "@/lib/db";
import { calculateMatchStatistics, calculatePlayerMatchStatistics } from "@/modules/tournaments/server/match-statistics";

const FINISHED = new Set(["COMPLETED", "WALKOVER"]);

function scoreFor(match, participant) {
  if (!participant) return 0;
  if (match.sport === "FIELD_HOCKEY") return Number(participant.hockeyData?.goals || 0);
  if (match.sport === "FOOTBALL") return Number(participant.footballData?.goals || 0);
  if (match.sport === "CRICKET") return Number(participant.cricketData?.runs || 0);
  return 0;
}

function ensureFamily(map, id, name) {
  if (!id) return null;
  if (!map.has(id)) map.set(id, {
    familyId: id, familyName: name || "Team", played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, goalDifference: 0, cleanSheets: 0, form: [],
  });
  return map.get(id);
}

export function calculateTournamentStatistics(matches) {
  const families = new Map();
  const players = new Map();
  const eventSummary = new Map();

  for (const match of matches || []) {
    if (!FINISHED.has(match.status)) continue;
    const participants = match.participants || [];
    const [a, b] = participants;
    const aScore = scoreFor(match, a);
    const bScore = scoreFor(match, b);

    const aRow = ensureFamily(families, a?.familyId, a?.family);
    const bRow = ensureFamily(families, b?.familyId, b?.family);
    if (aRow && bRow) {
      aRow.played += 1; bRow.played += 1;
      aRow.goalsFor += aScore; aRow.goalsAgainst += bScore;
      bRow.goalsFor += bScore; bRow.goalsAgainst += aScore;
      if (bScore === 0) aRow.cleanSheets += 1;
      if (aScore === 0) bRow.cleanSheets += 1;
      if (match.isDraw || aScore === bScore) {
        aRow.drawn += 1; bRow.drawn += 1;
        aRow.form.push("D"); bRow.form.push("D");
      } else {
        const winnerId = match.winnerId || (aScore > bScore ? a?.familyId : b?.familyId);
        if (winnerId === a?.familyId) {
          aRow.won += 1; bRow.lost += 1; aRow.form.push("W"); bRow.form.push("L");
        } else {
          bRow.won += 1; aRow.lost += 1; bRow.form.push("W"); aRow.form.push("L");
        }
      }
    }

    const eventKey = match.gameId || match.sport;
    if (!eventSummary.has(eventKey)) eventSummary.set(eventKey, {
      gameId: match.gameId || null,
      gameName: match.game?.shortName || match.game?.name || match.sport.replaceAll("_", " "),
      matches: 0, goals: 0,
    });
    const summary = eventSummary.get(eventKey);
    summary.matches += 1;
    summary.goals += participants.reduce((sum, p) => sum + scoreFor(match, p), 0);

    for (const row of calculatePlayerMatchStatistics(match)) {
      if (!players.has(row.playerId)) players.set(row.playerId, {
        playerId: row.playerId, playerName: row.playerName, familyId: row.familyId,
        familyName: row.familyName, goals: 0, shots: 0, shotsOnTarget: 0,
        greenCards: 0, yellowCards: 0, redCards: 0, matchesWithRecordedEvents: 0,
      });
      const target = players.get(row.playerId);
      target.goals += row.goals || 0;
      target.shots += row.shots || 0;
      target.shotsOnTarget += row.shotsOnTarget || 0;
      target.greenCards += row.greenCards || 0;
      target.yellowCards += row.yellowCards || 0;
      target.redCards += row.redCards || 0;
      target.matchesWithRecordedEvents += 1;
    }
  }

  const familyRows = [...families.values()].map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst,
    winRate: row.played ? Math.round((row.won / row.played) * 100) : 0,
    form: row.form.slice(-5),
  })).sort((a, b) => b.won - a.won || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.familyName.localeCompare(b.familyName));

  const playerRows = [...players.values()].sort((a, b) =>
    b.goals - a.goals || b.shotsOnTarget - a.shotsOnTarget || a.playerName.localeCompare(b.playerName)
  );

  return {
    families: familyRows,
    players: playerRows,
    events: [...eventSummary.values()].map((row) => ({
      ...row,
      goalsPerMatch: row.matches ? Number((row.goals / row.matches).toFixed(2)) : 0,
    })),
    totals: {
      completedMatches: (matches || []).filter((m) => FINISHED.has(m.status)).length,
      goals: [...eventSummary.values()].reduce((sum, row) => sum + row.goals, 0),
      families: familyRows.length,
      playersWithRecordedEvents: playerRows.length,
    },
    leaders: {
      scorers: playerRows.slice(0, 10),
      shotsOnTarget: [...playerRows].sort((a,b) => b.shotsOnTarget-a.shotsOnTarget || b.goals-a.goals).slice(0,10),
      cards: [...playerRows].sort((a,b) => (b.yellowCards+b.redCards)-(a.yellowCards+a.redCards)).slice(0,10),
      form: familyRows.slice(0, 10),
    },
  };
}

export async function getPublicTournamentStatistics() {
  const tournament = await db.tournament.findFirst({
    where: {
      visibility: "PUBLIC",
      status: { in: ["ONGOING", "COMPLETED", "UPCOMING", "REGISTRATION"] },
    },
    orderBy: [{ startDate: "desc" }],
    select: { id: true, name: true, shortName: true, slug: true, year: true, status: true },
  });
  if (!tournament) return null;

  const matches = await db.matches.findMany({
    where: {
      tournamentId: tournament.id,
      publicationStatus: { not: "HIDDEN" },
      status: { in: ["COMPLETED", "WALKOVER"] },
    },
    orderBy: { scheduledOn: "asc" },
    include: {
      game: { select: { id: true, name: true, shortName: true } },
      events: { orderBy: [{ createdAt: "asc" }, { sequence: "asc" }] },
    },
  });

  return { tournament, ...calculateTournamentStatistics(matches) };
}
