"use server";

import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";

export async function logout() {
  const session = await auth();
  const sessionId = session?.user?.sessionId;

  if (sessionId) {
    await db.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  await signOut({ redirectTo: "/auth/login" });
}
