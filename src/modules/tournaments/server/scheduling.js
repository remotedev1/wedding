export const DEFAULT_MATCH_MINUTES = {
  FIELD_HOCKEY: 75,
  FOOTBALL: 120,
  CRICKET: 240,
  BASKETBALL: 90,
  VOLLEYBALL: 90,
  KABADDI: 60,
  BADMINTON: 60,
  TABLE_TENNIS: 45,
  TENNIS: 120,
  OTHER: 90,
};

export function getMatchDurationMinutes(sport, override) {
  if (Number.isFinite(override) && override >= 15) return override;
  return DEFAULT_MATCH_MINUTES[sport] || DEFAULT_MATCH_MINUTES.OTHER;
}

export function windowsOverlap(startA, minutesA, startB, minutesB, bufferMinutes = 0) {
  const a0 = new Date(startA).getTime();
  const b0 = new Date(startB).getTime();
  const a1 = a0 + (minutesA + bufferMinutes) * 60_000;
  const b1 = b0 + (minutesB + bufferMinutes) * 60_000;
  return a0 < b1 && b0 < a1;
}

export function roundRobinPairs(teams) {
  const items = [...teams];
  if (items.length < 2) return [];
  if (items.length % 2) items.push(null);
  const rounds = [];
  const n = items.length;
  const state = [...items];
  for (let round = 0; round < n - 1; round += 1) {
    const pairs = [];
    for (let i = 0; i < n / 2; i += 1) {
      const a = state[i];
      const b = state[n - 1 - i];
      if (a && b) pairs.push([a, b]);
    }
    rounds.push(pairs);
    state.splice(1, 0, state.pop());
  }
  return rounds;
}

function groupCode(index) {
  let value = index + 1;
  let code = "";
  while (value > 0) {
    value -= 1;
    code = String.fromCharCode(65 + (value % 26)) + code;
    value = Math.floor(value / 26);
  }
  return code;
}

export function distributePools(registrations, poolCount) {
  const poolNames = Array.from({ length: poolCount }, (_, index) => groupCode(index));
  const assigned = new Map(poolNames.map((pool) => [pool, []]));
  const unassigned = [];

  for (const registration of registrations) {
    if (registration.pool && assigned.has(registration.pool)) assigned.get(registration.pool).push(registration);
    else unassigned.push(registration);
  }

  unassigned.sort((a, b) =>
    (a.participation?.family?.familyName || "").localeCompare(b.participation?.family?.familyName || ""),
  );
  for (const registration of unassigned) {
    const target = [...assigned.entries()].sort((a, b) => a[1].length - b[1].length)[0][0];
    assigned.get(target).push(registration);
  }
  return assigned;
}
