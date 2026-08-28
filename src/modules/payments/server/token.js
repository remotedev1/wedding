import crypto from "crypto";

const TOKEN_TTL_SECONDS = 60 * 60 * 24;

function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required");
  return value;
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createPaymentToken({ participationId, tournamentId, familyId, registrationIds }) {
  const payload = encode({
    participationId,
    tournamentId,
    familyId,
    registrationIds: [...new Set(registrationIds)],
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  });
  return `${payload}.${sign(payload)}`;
}

export function verifyPaymentToken(token) {
  if (!token || typeof token !== "string") return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    if (!data.participationId || !data.tournamentId || !data.familyId || !Array.isArray(data.registrationIds)) return null;
    return data;
  } catch {
    return null;
  }
}
