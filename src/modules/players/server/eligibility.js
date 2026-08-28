export function normalizePersonName(value = "") {
  return String(value).trim().replace(/\s+/g, " ").toLocaleLowerCase("en-IN");
}

export function ageOnDate(dateOfBirth, cutoffDate = new Date()) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const cutoff = new Date(cutoffDate);
  if (Number.isNaN(dob.getTime()) || Number.isNaN(cutoff.getTime())) return null;
  let age = cutoff.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday = cutoff.getUTCMonth() < dob.getUTCMonth() ||
    (cutoff.getUTCMonth() === dob.getUTCMonth() && cutoff.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function evaluatePlayerEligibility(player, game) {
  const reasons = [];
  if (!player?.isActive) reasons.push("Player is inactive");
  if (player?.verificationStatus === "REJECTED") reasons.push("Player record has been rejected");

  const cutoff = game?.eligibilityCutoffDate || game?.date || new Date();
  const hasAgeRule = game?.minAge != null || game?.maxAge != null;
  const age = ageOnDate(player?.dateOfBirth, cutoff);
  if (hasAgeRule && age == null) reasons.push("Date of birth is required for this event");
  if (age != null && game?.minAge != null && age < game.minAge) reasons.push(`Minimum age is ${game.minAge}`);
  if (age != null && game?.maxAge != null && age > game.maxAge) reasons.push(`Maximum age is ${game.maxAge}`);

  const allowedGenders = Array.isArray(game?.allowedGenders) ? game.allowedGenders : [];
  if (allowedGenders.length && !player?.gender) reasons.push("Gender is required for this event");
  if (allowedGenders.length && player?.gender && !allowedGenders.includes(player.gender)) {
    reasons.push(`Eligible gender: ${allowedGenders.join(", ")}`);
  }

  return { eligible: reasons.length === 0, reasons, age };
}
