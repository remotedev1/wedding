import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/modules/auth/server/permissions";

export async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user || session.user.invalidated) return null;
  return session.user;
}

export async function requireAuthenticatedUser(callbackUrl = "/dashboard") {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return user;
}

export async function requirePermission(permission, callbackUrl = "/dashboard") {
  const user = await requireAuthenticatedUser(callbackUrl);
  if (!hasPermission(user.permissions, permission)) redirect("/unauthorized");
  return user;
}

export async function requireDashboardAccess() {
  return requirePermission(PERMISSIONS.DASHBOARD_VIEW, "/dashboard");
}
