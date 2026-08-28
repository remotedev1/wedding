import { z } from "zod";
import { db } from "@/lib/db";
import { setupApiHandler, successResponse, errorResponse, logActivity, withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS, canResource, RESOURCES } from "@/modules/auth/server/resource-authorization";

const resolveSchema = z.object({ resolution: z.string().trim().min(3).max(1500) });

async function handlePatch(request, { params }) {
  const setup = await setupApiHandler(request, "matches:incidents:resolve");
  if (setup.error) return setup.error;
  if (!canResource(setup.user, ACTIONS.MANAGE, RESOURCES.OPERATIONS)) return errorResponse("Forbidden", 403);
  const data = resolveSchema.parse(await request.json());
  const existing = await db.matchIncident.findFirst({ where: { id: params.incidentId, tournamentId: params.tournamentId, matchId: params.matchesId } });
  if (!existing) return errorResponse("Incident not found", 404);
  const incident = await db.matchIncident.update({ where: { id: existing.id }, data: { resolution: data.resolution, resolvedAt: new Date() } });
  await logActivity({ userId: setup.user.id, action: "incident_resolved", entity: "match_incident", entityId: incident.id, entityName: incident.type, description: `Resolved ${incident.type.toLowerCase()} incident: ${data.resolution}`, request, metadata: { tournamentId: params.tournamentId, matchId: params.matchesId } });
  return successResponse(incident, "Incident resolved");
}
export const PATCH = withErrorHandling(handlePatch, "match incident");
