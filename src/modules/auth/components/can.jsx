"use client";

import { useCurrentUser } from "@/modules/auth/hooks/use-current-user";
import { canResource } from "@/modules/auth/server/resource-authorization";

export function Can({ I, a, children, fallback = null }) {
  const { user } = useCurrentUser();
  return canResource(user, I, a) ? <>{children}</> : <>{fallback}</>;
}

export function Cannot({ I, a, children, fallback = null }) {
  const { user } = useCurrentUser();
  return !canResource(user, I, a) ? <>{children}</> : <>{fallback}</>;
}
