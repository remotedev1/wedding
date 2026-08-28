export function evaluateRegistrationReadiness(registration) {
  const game = registration?.game || {};
  const amountDueMinor = Number(
    registration?.paymentAmountMinor ??
    game.registrationFeeMinor ??
    Math.round(Number(registration?.paymentAmount || game.registrationFee || 0) * 100),
  );
  const paymentReady = amountDueMinor <= 0 || registration?.paymentStatus === "COMPLETED";

  const rosterCount = Array.isArray(registration?.roster) ? registration.roster.length : 0;
  const minRosterSize = Number(game.minRosterSize || 0);
  const maxRosterSize = Number(game.maxRosterSize || 0);
  const rosterMinReady = minRosterSize > 0 ? rosterCount >= minRosterSize : rosterCount > 0;
  const rosterMaxReady = maxRosterSize > 0 ? rosterCount <= maxRosterSize : true;
  const managerReady = Boolean(registration?.managerName?.trim() && registration?.managerPhone?.trim());
  const captainReady = !registration?.captainPlayerId || (registration.roster || []).some((member) => member.playerId === registration.captainPlayerId);

  const reasons = [];
  if (!paymentReady) reasons.push("Payment is not completed");
  if (!rosterMinReady) reasons.push(minRosterSize > 0 ? `Roster requires at least ${minRosterSize} players` : "Roster has no players");
  if (!rosterMaxReady) reasons.push(`Roster exceeds the maximum of ${maxRosterSize} players`);
  if (!managerReady) reasons.push("Manager name and phone are required");
  if (!captainReady) reasons.push("Captain is not part of the submitted roster");

  const locked = Boolean(registration?.rosterLockedAt);
  return {
    ready: reasons.length === 0,
    reasons,
    paymentReady,
    rosterReady: rosterMinReady && rosterMaxReady,
    managerReady,
    captainReady,
    rosterCount,
    minRosterSize,
    maxRosterSize,
    amountDueMinor,
    locked,
  };
}
