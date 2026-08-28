import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { db } from "@/lib/db";
import { hashToken } from "@/modules/auth/server/token";
import { readJsonRequest, setupApiHandler } from "@/lib/api/helpers";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { logger } from "@/lib/logger";

export async function POST(request) {
  try {
    const setup = await setupApiHandler(request, "auth:reset-password", {
      requireAuthentication: false,
      rateLimitPreset: RATE_LIMIT_PRESETS.PASSWORD_RESET,
    });
    if (setup.error) return setup.error;

    const body = await readJsonRequest(request, 16 * 1024);
    const token = String(body?.token || "");
    const password = String(body?.password || "");

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }
    if (password.length < 12 || password.length > 128) {
      return NextResponse.json({ error: "Password must be between 12 and 128 characters." }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: { passwordResetToken: hashToken(token) },
      select: { id:true,password:true,passwordResetTokenExpires:true,isBlocked:true,isActive:true },
    });
    if (!user || !user.passwordResetTokenExpires || user.passwordResetTokenExpires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }
    if (user.isBlocked || !user.isActive) {
      return NextResponse.json({ error: "Account is not available." }, { status: 403 });
    }
    if (await bcryptjs.compare(password, user.password)) {
      return NextResponse.json({ error: "New password must be different from the current password." }, { status: 400 });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id:user.id },
        data: {
          password:hashedPassword,
          passwordResetToken:null,
          passwordResetTokenExpires:null,
          authVersion:{ increment:1 },
        },
      });
      await tx.session.updateMany({ where:{ userId:user.id,revokedAt:null }, data:{ revokedAt:new Date() } });
    });

    return NextResponse.json({ success:"Password reset successfully. Please sign in again." });
  } catch (error) {
    logger.error("Reset password request failed", error);
    return NextResponse.json({ error:"Unable to reset password." }, { status:500 });
  }
}
