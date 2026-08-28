import crypto from "crypto";

const ACCESS_TTL_SECONDS = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required");
  return value;
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signature(payload) {
  return crypto.createHmac("sha256", secret()).update(`guest-registration:${payload}`).digest("base64url");
}

export function createGuestRegistrationAccess({ registrationId, participationId, tournamentId, familyId }) {
  const payload = encode({
    registrationId,
    participationId,
    tournamentId,
    familyId,
    exp: Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS,
  });
  return `${payload}.${signature(payload)}`;
}

export function verifyGuestRegistrationAccess(token) {
  if (!token || typeof token !== "string") return null;
  const [payload, supplied] = token.split(".");
  if (!payload || !supplied) return null;
  const expected = signature(payload);
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    if (!data.registrationId || !data.participationId || !data.tournamentId || !data.familyId) return null;
    return data;
  } catch {
    return null;
  }
}

function cleanCode(value, fallback) {
  const code = String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 5);
  return code || fallback;
}

export function buildRegistrationReference({ tournament, game, registrationId }) {
  const tournamentCode = cleanCode(tournament?.shortName || tournament?.name, "TRN");
  const eventCode = cleanCode(game?.eventCode || game?.shortName || game?.name, "EVT");
  const year = String(tournament?.year || new Date().getFullYear());
  const suffix = String(registrationId).slice(-6).toUpperCase();
  return `${tournamentCode}-${year}-${eventCode}-${suffix}`;
}
