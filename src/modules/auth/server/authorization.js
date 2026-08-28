import { auth } from "@/lib/auth";
import { hasPermission } from "@/modules/auth/server/permissions";

export async function getAuthorizedSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.invalidated) return null;
  return session;
}

export async function requireSession() {
  const session = await getAuthorizedSession();
  if (!session) {
    const error = new Error("Authentication is required");
    error.status = 401;
    throw error;
  }
  return session;
}

export async function requireAuth() {
  return (await requireSession()).user;
}

export async function requireRole(...roles) {
  const user = await requireAuth();
  const normalized = roles.flat().map((role) => String(role).toUpperCase());
  if (!normalized.includes(String(user.role || "").toUpperCase())) {
    const error = new Error("You do not have permission to perform this action");
    error.status = 403;
    throw error;
  }
  return user;
}

export async function requirePermission(permission) {
  const user = await requireAuth();
  if (!hasPermission(user.permissions, permission)) {
    const error = new Error(`Missing permission: ${permission}`);
    error.status = 403;
    throw error;
  }
  return user;
}
