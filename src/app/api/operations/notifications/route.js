import { db } from "@/lib/db";
import { setupApiHandler, successResponse, errorResponse, withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS, canResource, RESOURCES } from "@/modules/auth/server/resource-authorization";

async function handleGet(request) {
  const setup = await setupApiHandler(request, "operations:notifications");
  if (setup.error) return setup.error;
  if (!canResource(setup.user, ACTIONS.READ, RESOURCES.OPERATIONS)) return errorResponse("You don't have permission to view operational notifications", 403);
  const now = new Date();
  const rows = await db.operationalNotification.findMany({
    where: { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
  return successResponse(rows.map((item) => ({ ...item, isRead: item.readBy.includes(setup.user.id) })));
}

export const GET = withErrorHandling(handleGet, "operational notifications");
