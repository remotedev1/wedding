import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { addHours } from "date-fns";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/modules/auth/server/user-repository";
import { sendPasswordResetEmail } from "@/lib/mail";
import { hashToken } from "@/modules/auth/server/token";
import { readJsonRequest, setupApiHandler } from "@/lib/api/helpers";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { logger } from "@/lib/logger";

const GENERIC = "If an account exists with this email, you will receive a password reset link shortly.";

export async function POST(request) {
  try {
    const setup = await setupApiHandler(request, "auth:forgot-password", {
      requireAuthentication: false,
      rateLimitPreset: RATE_LIMIT_PRESETS.PASSWORD_RESET,
    });
    if (setup.error) return setup.error;

    const body = await readJsonRequest(request, 8 * 1024);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user || user.isBlocked || !user.isActive) return NextResponse.json({ success: GENERIC });

    const plainToken = crypto.randomBytes(32).toString("hex");
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashToken(plainToken),
        passwordResetTokenExpires: addHours(new Date(), 1),
      },
    });

    try {
      await sendPasswordResetEmail({
        email,
        token: plainToken,
        name: user.firstName || "User",
      });
    } catch (error) {
      await db.user.update({
        where: { id: user.id },
        data: { passwordResetToken: null, passwordResetTokenExpires: null },
      });
      logger.error("Password reset email failed", { userId: user.id, error: error?.message });
      return NextResponse.json({ error: "Unable to send password reset email right now." }, { status: 503 });
    }

    return NextResponse.json({ success: GENERIC });
  } catch (error) {
    logger.error("Forgot password request failed", error);
    return NextResponse.json({ error: "Unable to process password reset request." }, { status: 500 });
  }
}
