import { db } from "@/lib/db";

export async function consumeRateLimit(key, options) {
  const now = new Date();
  const windowMs = Number(options.windowMs || 60_000);
  const maxRequests = Number(options.maxRequests || 60);
  const lockoutMs = Number(options.lockoutMs || 0);

  let entry = await db.abuseRateLimit.findUnique({ where: { key } });

  if (!entry) {
    try {
      entry = await db.abuseRateLimit.create({
        data: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
      });
      return { allowed: true, remaining: Math.max(0, maxRequests - 1), resetAt: entry.resetAt };
    } catch {
      entry = await db.abuseRateLimit.findUnique({ where: { key } });
    }
  }

  if (entry?.lockedUntil && entry.lockedUntil > now) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((entry.lockedUntil.getTime() - now.getTime()) / 1000)),
      resetAt: entry.resetAt,
    };
  }

  if (!entry || entry.resetAt <= now) {
    const reset = await db.abuseRateLimit.upsert({
      where: { key },
      update: { count: 1, resetAt: new Date(now.getTime() + windowMs), lockedUntil: null },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
    });
    return { allowed: true, remaining: Math.max(0, maxRequests - 1), resetAt: reset.resetAt };
  }

  if (entry.count >= maxRequests) {
    const lockedUntil = lockoutMs ? new Date(now.getTime() + lockoutMs) : null;
    if (lockedUntil) await db.abuseRateLimit.update({ where: { key }, data: { lockedUntil } });
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil(((lockedUntil || entry.resetAt).getTime() - now.getTime()) / 1000)),
      resetAt: entry.resetAt,
    };
  }

  const updated = await db.abuseRateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - updated.count),
    resetAt: updated.resetAt,
  };
}

export async function clearRateLimit(key) {
  await db.abuseRateLimit.delete({ where: { key } }).catch(() => undefined);
}

export async function cleanupRateLimiter() {
  const now = new Date();
  await db.abuseRateLimit.deleteMany({
    where: { resetAt: { lt: now }, OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }] },
  });
}

// Compatibility exports for older imports.
export async function checkRateLimit(key, options) {
  return consumeRateLimit(key, options);
}
export async function incrementRateLimit() {
  // consumeRateLimit increments atomically enough for the current Prisma/MongoDB boundary.
  return undefined;
}
