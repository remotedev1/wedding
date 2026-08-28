import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { permissionsForRole } from "@/modules/auth/server/permissions";
import { logger } from "@/lib/logger";

const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;
const SESSION_DAYS = 7;
const DUMMY_HASH = "$2b$12$DqYNJ9vYh6Y5xnGZQ0uFG.LXGrUcPxYMb37RGHoHuLHn38Yr/BmxK";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function writeLoginActivity(userId, action, description, context = {}) {
  if (!userId) return;
  try {
    await db.activityLog.create({
      data: {
        userId,
        action,
        entity: "Session",
        description,
        timestamp: new Date(),
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null,
      },
    });
  } catch (error) {
    logger.error("Unable to write login activity", error);
  }
}

export async function validateCredentials(email, password, context = {}) {
  const normalized = normalizeEmail(email);
  const user = await db.user.findUnique({ where: { email: normalized } });

  if (!user) {
    await bcrypt.compare(String(password || ""), DUMMY_HASH);
    return null;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) return null;
  if (user.isBlocked || !user.isActive) return null;

  const valid = await bcrypt.compare(String(password || ""), user.password);
  if (!valid) {
    const failures = (user.failedLoginAttempts || 0) + 1;
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failures,
        lockedUntil:
          failures >= MAX_FAILURES
            ? new Date(Date.now() + LOCK_MINUTES * 60_000)
            : null,
      },
    });
    await writeLoginActivity(user.id, "FAILED_LOGIN", "Failed credential login", context);
    return null;
  }

  const dbSession = await db.session.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      userAgent: context.userAgent || null,
      ipAddress: context.ipAddress || null,
      expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000),
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: context.ipAddress || null,
    },
  });

  await writeLoginActivity(user.id, "LOGIN", "Successful credential login", context);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    roles: [user.role],
    permissions: permissionsForRole(user.role),
    phoneNumber: user.phoneNumber,
    familyId: user.familyId,
    authVersion: user.authVersion || 0,
    sessionId: dbSession.id,
  };
}

export async function validatePhoneCredentials(phoneNumber, password, context = {}) {
  const normalized = String(phoneNumber || "").trim();
  const user = await db.user.findUnique({ where: { phoneNumber: normalized } });

  if (!user) {
    await bcrypt.compare(String(password || ""), DUMMY_HASH);
    return null;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) return null;
  if (user.isBlocked || !user.isActive) return null;

  const valid = await bcrypt.compare(String(password || ""), user.password);
  if (!valid) {
    const failures = (user.failedLoginAttempts || 0) + 1;
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failures,
        lockedUntil:
          failures >= MAX_FAILURES
            ? new Date(Date.now() + LOCK_MINUTES * 60_000)
            : null,
      },
    });
    await writeLoginActivity(user.id, "FAILED_LOGIN", "Failed phone credential login", context);
    return null;
  }

  const dbSession = await db.session.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      userAgent: context.userAgent || null,
      ipAddress: context.ipAddress || null,
      expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000),
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: context.ipAddress || null,
    },
  });

  await writeLoginActivity(user.id, "LOGIN", "Successful phone credential login", context);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    roles: [user.role],
    permissions: permissionsForRole(user.role),
    phoneNumber: user.phoneNumber,
    familyId: user.familyId,
    authVersion: user.authVersion || 0,
    sessionId: dbSession.id,
  };
}
