import { db } from "@/lib/db";
import { setupApiHandler, successResponse, errorResponse, withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS, canResource, RESOURCES } from "@/modules/auth/server/resource-authorization";

async function handleGet(request) {
  const setup = await setupApiHandler(request, "operations:activity");
  if (setup.error) return setup.error;
  if (!canResource(setup.user, ACTIONS.READ, RESOURCES.AUDIT)) return errorResponse("You don't have permission to view the audit log", 403);

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 200);
  const entity = searchParams.get("entity") || undefined;
  const userId = searchParams.get("userId") || undefined;
  const query = (searchParams.get("q") || "").trim();

  const where = {
    ...(entity ? { entity } : {}),
    ...(userId ? { userId } : {}),
    ...(query ? { OR: [
      { description: { contains: query, mode: "insensitive" } },
      { entityName: { contains: query, mode: "insensitive" } },
      { action: { contains: query, mode: "insensitive" } },
    ] } : {}),
  };

  const rows = await db.activityLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: limit,
    include: { User: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
  });
  return successResponse(rows);
}

export const GET = withErrorHandling(handleGet, "audit log");
