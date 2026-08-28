const EMPTY = () => ({
  goals: 0,
  shots: 0,
  shotsOnTarget: 0,
  penaltyCorners: 0,
  penaltyStrokes: 0,
  greenCards: 0,
  yellowCards: 0,
  redCards: 0,
  substitutions: 0,
  shootoutAttempts: 0,
  shootoutScored: 0,
  circleEntries: 0,
  fouls: 0,
  saves: 0,
  possession: null,
});

function ensure(map, familyId, familyName) {
  if (!familyId) return null;
  if (!map.has(familyId)) map.set(familyId, { familyId, familyName: familyName || "Team", ...EMPTY() });
  return map.get(familyId);
}

export function calculateMatchStatistics(match) {
  const map = new Map();
  for (const participant of match?.participants || []) {
    const row = ensure(map, participant.familyId, participant.family);
    if (!row) continue;
    if (match.sport === "FIELD_HOCKEY") row.goals = Number(participant.hockeyData?.goals || 0);
    if (match.sport === "FOOTBALL") row.goals = Number(participant.footballData?.goals || 0);
  }

  for (const event of match?.events || []) {
    const row = ensure(map, event.familyId, event.familyName);
    if (!row) continue;
    if (event.type === "SHOT") {
      row.shots += 1;
      if (event.metadata?.onTarget) row.shotsOnTarget += 1;
    }
    if (event.type === "PENALTY") {
      if (event.metadata?.penaltyType === "PENALTY_CORNER") row.penaltyCorners += 1;
      if (event.metadata?.penaltyType === "PENALTY_STROKE") row.penaltyStrokes += 1;
    }
    if (event.type === "CARD") {
      const key = `${String(event.metadata?.cardType || "").toLowerCase()}Cards`;
      if (key in row) row[key] += 1;
    }
    if (event.type === "SUBSTITUTION") row.substitutions += 1;
    if (event.type === "SHOOTOUT_ATTEMPT") {
      row.shootoutAttempts += 1;
      if (event.value === 1) row.shootoutScored += 1;
    }
    if (event.type === "STAT_UPDATE") {
      const statKey = event.metadata?.statKey;
      if (!(statKey in row)) continue;
      const value = Number(event.value || 0);
      if (event.metadata?.mode === "SET") row[statKey] = value;
      else row[statKey] = Number(row[statKey] || 0) + value;
    }
  }

  return Array.from(map.values());
}

export function calculatePlayerMatchStatistics(match) {
  const rows = new Map();
  const ensurePlayer = (event) => {
    if (!event.playerId || !event.playerName) return null;
    const key = event.playerId;
    if (!rows.has(key)) rows.set(key, {
      playerId: event.playerId,
      playerName: event.playerName,
      familyId: event.familyId || null,
      familyName: event.familyName || null,
      goals: 0,
      shots: 0,
      shotsOnTarget: 0,
      greenCards: 0,
      yellowCards: 0,
      redCards: 0,
    });
    return rows.get(key);
  };
  for (const event of match?.events || []) {
    const row = ensurePlayer(event);
    if (!row) continue;
    if (event.type === "GOAL") row.goals += 1;
    if (event.type === "SHOT") {
      row.shots += 1;
      if (event.metadata?.onTarget) row.shotsOnTarget += 1;
    }
    if (event.type === "CARD") {
      const key = `${String(event.metadata?.cardType || "").toLowerCase()}Cards`;
      if (key in row) row[key] += 1;
    }
  }
  return Array.from(rows.values()).sort((a,b) => b.goals-a.goals || b.shotsOnTarget-a.shotsOnTarget || a.playerName.localeCompare(b.playerName));
}
