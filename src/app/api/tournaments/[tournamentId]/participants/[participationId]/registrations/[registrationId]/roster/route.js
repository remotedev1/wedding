import { z } from "zod";
import { db } from "@/lib/db";
import { ACTIONS, canResource, RESOURCES } from "@/modules/auth/server/resource-authorization";
import { errorResponse, logActivity, setupApiHandler, successResponse, withErrorHandling } from "@/lib/api/helpers";
import { evaluatePlayerEligibility } from "@/modules/players/server/eligibility";

const rosterSchema = z.object({
  playerIds: z.array(z.string()).max(40),
  captainPlayerId: z.string().nullable().optional(),
  goalkeeperPlayerId: z.string().nullable().optional(),
  managerName: z.string().trim().max(120).nullable().optional(),
  managerPhone: z.string().trim().max(30).nullable().optional(),
});

const LOCKED_STATUSES = ["LIVE", "SUSPENDED", "COMPLETED", "ABANDONED", "WALKOVER", "NO_RESULT"];

async function loadRegistration(params) {
  return db.gameRegistration.findFirst({
    where: { id: params.registrationId, participationId: params.participationId },
    include: {
      game: { select: { id: true, name: true, sportType: true, category: true, tournamentId: true, date: true, minRosterSize: true, maxRosterSize: true, minAge: true, maxAge: true, eligibilityCutoffDate: true, allowedGenders: true } },
      participation: {
        include: {
          family: {
            select: {
              id: true,
              familyName: true,
              players: {
                where: { isActive: true },
                orderBy: { playerName: "asc" },
                select: { id: true, playerName: true, jerseyNumber: true, primarySport: true, dateOfBirth: true, gender: true, verificationStatus: true, photoUrl: true },
              },
            },
          },
        },
      },
    },
  });
}

async function competitionStarted(registration, tournamentId) {
  if (registration.rosterLockedAt) return true;
  return Boolean(await db.matches.findFirst({
    where: {
      tournamentId,
      gameId: registration.gameId,
      OR: [
        { actualStartTime: { not: null } },
        { status: { in: LOCKED_STATUSES } },
      ],
    },
    select: { id: true },
  }));
}

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "game-registration:roster:read");
  if (setup.error) return setup.error;
  if (!canResource(setup.user, ACTIONS.READ, RESOURCES.PARTICIPATION) && !canResource(setup.user, ACTIONS.READ, RESOURCES.PLAYER)) {
    return errorResponse("You don't have permission to view team rosters", 403);
  }

  const registration = await loadRegistration(params);
  if (!registration || registration.participation.tournamentId !== params.tournamentId || registration.game.tournamentId !== params.tournamentId) {
    return errorResponse("Game registration not found", 404);
  }
  const isLocked = await competitionStarted(registration, params.tournamentId);
  return successResponse({
    registration: {
      id: registration.id,
      status: registration.status,
      game: registration.game,
      family: { id: registration.participation.family.id, familyName: registration.participation.family.familyName },
      roster: registration.roster || [],
      captainPlayerId: registration.captainPlayerId || null,
      managerName: registration.managerName || "",
      managerPhone: registration.managerPhone || "",
      rosterLockedAt: registration.rosterLockedAt || null,
    },
    availablePlayers: registration.participation.family.players.map((player) => ({ ...player, eligibility: evaluatePlayerEligibility(player, registration.game) })),
    isLocked,
  });
}

async function handlePatch(request, { params }) {
  const setup = await setupApiHandler(request, "game-registration:roster:update");
  if (setup.error) return setup.error;
  if (!canResource(setup.user, ACTIONS.UPDATE, RESOURCES.PARTICIPATION) || !canResource(setup.user, ACTIONS.UPDATE, RESOURCES.PLAYER)) {
    return errorResponse("You don't have permission to manage team rosters", 403);
  }

  const registration = await loadRegistration(params);
  if (!registration || registration.participation.tournamentId !== params.tournamentId || registration.game.tournamentId !== params.tournamentId) {
    return errorResponse("Game registration not found", 404);
  }
  if (await competitionStarted(registration, params.tournamentId)) {
    if (!registration.rosterLockedAt) await db.gameRegistration.update({ where: { id: registration.id }, data: { rosterLockedAt: new Date() } });
    return errorResponse("This roster is locked because competition for this event has already started", 409);
  }

  const input = rosterSchema.parse(await request.json());
  const uniqueIds = [...new Set(input.playerIds)];
  if (uniqueIds.length !== input.playerIds.length) return errorResponse("A player can only appear once in an event roster", 400);

  const playerMap = new Map(registration.participation.family.players.map((player) => [player.id, player]));
  const selected = uniqueIds.map((id) => playerMap.get(id));
  if (selected.some((player) => !player)) return errorResponse("Every roster player must be an active member of this family", 400);
  const minimum = Number(registration.game.minRosterSize || 0);
  const maximum = Number(registration.game.maxRosterSize || 40);
  if (minimum && selected.length < minimum) return errorResponse(`Select at least ${minimum} players for ${registration.game.name}`, 400);
  if (selected.length > maximum) return errorResponse(`This event allows a maximum roster of ${maximum} players`, 400);
  for (const player of selected) {
    const eligibility = evaluatePlayerEligibility(player, registration.game);
    if (!eligibility.eligible) return errorResponse(`${player.playerName} is not eligible: ${eligibility.reasons.join("; ")}`, 409);
  }
  if (input.captainPlayerId && !uniqueIds.includes(input.captainPlayerId)) return errorResponse("Captain must be selected in the roster", 400);
  if (input.goalkeeperPlayerId && !uniqueIds.includes(input.goalkeeperPlayerId)) return errorResponse("Goalkeeper must be selected in the roster", 400);

  const jerseyOwners = new Map();
  for (const player of selected) {
    if (player.jerseyNumber == null) continue;
    if (jerseyOwners.has(player.jerseyNumber)) {
      return errorResponse(`Jersey #${player.jerseyNumber} is assigned to more than one selected player`, 409);
    }
    jerseyOwners.set(player.jerseyNumber, player.id);
  }

  const roster = selected.map((player) => ({
    playerId: player.id,
    playerName: player.playerName,
    jerseyNumber: player.jerseyNumber ?? null,
    role: player.id === input.goalkeeperPlayerId ? "GOALKEEPER" : "PLAYER",
  }));

  const updated = await db.gameRegistration.update({
    where: { id: registration.id },
    data: {
      roster,
      captainPlayerId: input.captainPlayerId || null,
      managerName: input.managerName || null,
      managerPhone: input.managerPhone || null,
    },
    select: { id: true, roster: true, captainPlayerId: true, managerName: true, managerPhone: true, rosterLockedAt: true },
  });

  await logActivity({
    userId: setup.user.id,
    action: "updated",
    entity: "game-roster",
    entityId: registration.id,
    entityName: `${registration.participation.family.familyName} - ${registration.game.name}`,
    description: `Updated ${registration.game.name} roster for ${registration.participation.family.familyName} (${roster.length} players)`,
    request,
  });
  return successResponse(updated, "Team roster saved");
}

export const GET = withErrorHandling(handleGet, "game-roster");
export const PATCH = withErrorHandling(handlePatch, "game-roster");
