import { setupApiHandler, successResponse, errorResponse, withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS, canResource, RESOURCES } from "@/modules/auth/server/resource-authorization";
import { markNotificationRead } from "@/modules/operations/server/notifications";

async function handlePatch(request, { params }) {
  const setup = await setupApiHandler(request, "operations:notifications:read");
  if (setup.error) return setup.error;
  if (!canResource(setup.user, ACTIONS.READ, RESOURCES.OPERATIONS)) return errorResponse("Forbidden", 403);
  const item = await markNotificationRead(params.notificationId, setup.user.id);
  if (!item) return errorResponse("Notification not found", 404);
  return successResponse(item);
}
export const PATCH = withErrorHandling(handlePatch, "notification");
