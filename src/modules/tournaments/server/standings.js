function scoreForParticipant(match, participant) {
  if (!participant) return 0;
  if (match.sport === "FIELD_HOCKEY") return Number(participant.hockeyData?.goals || 0);
  if (match.sport === "FOOTBALL") return Number(participant.footballData?.goals || 0);
  return 0;
}

export function calculatePoolStandings(matches = []) {
  const pools = new Map();

  for (const match of matches) {
    if (match.round !== "POOL_STAGE" || !match.pool) continue;
    if (!["COMPLETED", "WALKOVER"].includes(match.status)) continue;
    const participants = match.participants || [];
    if (participants.length !== 2) continue;

    if (!pools.has(match.pool)) pools.set(match.pool, new Map());
    const table = pools.get(match.pool);
    for (const participant of participants) {
      if (!table.has(participant.familyId)) {
        table.set(participant.familyId, {
          familyId: participant.familyId,
          family: participant.family,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        });
      }
    }

    const [home, away] = participants;
    const homeRow = table.get(home.familyId);
    const awayRow = table.get(away.familyId);
    const homeScore = scoreForParticipant(match, home);
    const awayScore = scoreForParticipant(match, away);
    homeRow.played += 1;
    awayRow.played += 1;
    homeRow.goalsFor += homeScore;
    homeRow.goalsAgainst += awayScore;
    awayRow.goalsFor += awayScore;
    awayRow.goalsAgainst += homeScore;

    if (match.isDraw || (!match.winnerId && homeScore === awayScore && match.status === "COMPLETED")) {
      homeRow.drawn += 1; awayRow.drawn += 1;
      homeRow.points += 1; awayRow.points += 1;
    } else {
      const winnerId = match.winnerId || (homeScore > awayScore ? home.familyId : away.familyId);
      const winner = winnerId === home.familyId ? homeRow : awayRow;
      const loser = winnerId === home.familyId ? awayRow : homeRow;
      winner.won += 1; winner.points += 3; loser.lost += 1;
    }
  }

  return [...pools.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pool, rows]) => {
      const standings = [...rows.values()]
        .map((row) => ({ ...row, goalDifference: row.goalsFor - row.goalsAgainst }))
        .sort((a, b) =>
          b.points - a.points ||
          b.goalDifference - a.goalDifference ||
          b.goalsFor - a.goalsFor ||
          b.won - a.won ||
          a.family.localeCompare(b.family),
        )
        .map((row, index) => ({
          ...row,
          position: index + 1,
          qualificationStatus: index < 2 ? "QUALIFYING" : "OUTSIDE",
        }));
      return { pool, standings };
    });
}
