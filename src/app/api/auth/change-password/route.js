import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { db } from "@/lib/db";
import { readJsonRequest, setupApiHandler } from "@/lib/api/helpers";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";

export async function POST(request) {
  try {
    const setup = await setupApiHandler(request, "auth:change-password", {
      rateLimitPreset: RATE_LIMIT_PRESETS.AUTHENTICATED_API,
    });
    if (setup.error) return setup.error;

    const userId = setup.user.id;
    const body = await readJsonRequest(request, 16 * 1024);
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (!currentPassword || newPassword.length < 12 || newPassword.length > 128) {
      return NextResponse.json(
        { error: "Current password is required and the new password must be 12-128 characters." },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, isBlocked: true, isActive: true },
    });
    if (!user || user.isBlocked || !user.isActive) {
      return NextResponse.json({ error: "Account is not available." }, { status: 403 });
    }
    if (!(await bcryptjs.compare(currentPassword, user.password))) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }
    if (await bcryptjs.compare(newPassword, user.password)) {
      return NextResponse.json({ error: "New password must be different from your current password." }, { status: 400 });
    }

    const password = await bcryptjs.hash(newPassword, 12);
    await db.user.update({ where: { id: userId }, data: { password, authVersion: { increment: 1 } } });
    await db.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });

    return NextResponse.json({ success: true, message: "Password changed successfully. Please sign in again." });
  } catch (error) {
    return NextResponse.json({ error: "Unable to change password." }, { status: 500 });
  }
}
