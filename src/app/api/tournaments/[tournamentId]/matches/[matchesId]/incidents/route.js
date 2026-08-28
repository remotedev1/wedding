import { z } from "zod";
import { db } from "@/lib/db";
import { setupApiHandler, successResponse, errorResponse, logActivity, withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS, canResource, RESOURCES } from "@/modules/auth/server/resource-authorization";
import { createOperationalNotification } from "@/modules/operations/server/notifications";

const incidentSchema = z.object({
  type: z.enum(["INJURY", "CARD", "DISCIPLINE", "TECHNICAL", "WEATHER", "CROWD", "PROTEST", "MEDICAL", "OTHER"]),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]).default("INFO"),
  minute: z.number().int().min(0).max(999).optional().nullable(),
  familyId: z.string().optional().nullable(),
  playerId: z.string().optional().nullable(),
  description: z.string().trim().min(3).max(1500),
});

async function getMatch(tournamentId, matchId) {
  return db.matches.findFirst({ where: { id: matchId, tournamentId }, select: { id: true, name: true, matchNo: true, status: true, participants: true, tournament: { select: { name: true } } } });
}

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "matches:incidents:read");
  if (setup.error) return setup.error;
  if (!canResource(setup.user, ACTIONS.READ, RESOURCES.OPERATIONS)) return errorResponse("Forbidden", 403);
  const match = await getMatch(params.tournamentId, params.matchesId);
  if (!match) return errorResponse("Match not found", 404);
  const incidents = await db.matchIncident.findMany({
    where: { tournamentId: params.tournamentId, matchId: params.matchesId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, firstName: true, lastName: true, role: true } } },
  });
  return successResponse(incidents);
}

async function handlePost(request, { params }) {
  const setup = await setupApiHandler(request, "matches:incidents:create");
  if (setup.error) return setup.error;
  if (!canResource(setup.user, ACTIONS.MANAGE, RESOURCES.OPERATIONS)) return errorResponse("Forbidden", 403);
  const data = incidentSchema.parse(await request.json());
  const match = await getMatch(params.tournamentId, params.matchesId);
  if (!match) return errorResponse("Match not found", 404);
  if (["CANCELLED"].includes(match.status)) return errorResponse("Cannot record an incident for a cancelled match", 409);
  if (data.familyId && !(match.participants || []).some((p) => p.familyId === data.familyId)) return errorResponse("Selected family is not participating in this match", 400);

  const incident = await db.matchIncident.create({
    data: { ...data, minute: data.minute ?? null, familyId: data.familyId || null, playerId: data.playerId || null, tournamentId: params.tournamentId, matchId: params.matchesId, createdById: setup.user.id },
  });
  const label = match.name || `Match #${match.matchNo}`;
  await logActivity({
    userId: setup.user.id,
    action: "incident_recorded",
    entity: "match_incident",
    entityId: incident.id,
    entityName: label,
    description: `${data.severity} ${data.type.toLowerCase()} incident recorded for ${label}: ${data.description}`,
    request,
    metadata: { tournamentId: params.tournamentId, matchId: params.matchesId, severity: data.severity, type: data.type, minute: data.minute ?? null },
  });
  if (data.severity !== "INFO") {
    await createOperationalNotification({
      type: "INCIDENT",
      severity: data.severity,
      title: `${data.severity === "CRITICAL" ? "Critical" : "Match"} incident · ${label}`,
      message: data.description,
      href: `/dashboard/tournaments/${params.tournamentId}/matches/${params.matchesId}/live`,
      entity: "match_incident",
      entityId: incident.id,
    });
  }
  return successResponse(incident, "Incident recorded", 201);
}

export const GET = withErrorHandling(handleGet, "match incidents");
export const POST = withErrorHandling(handlePost, "match incident");
