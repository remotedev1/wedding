"use client";

import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data: session, status, update } = useSession();
  return {
    user: session?.user ?? null,
    session,
    status,
    update,
    // Temporary compatibility for existing navigation while callers migrate.
    userData: session ? { ...session, status } : { status },
  };
}
