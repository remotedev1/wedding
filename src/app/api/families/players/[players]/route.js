// app/api/players/[id]/route.js
import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { ACTIONS, canResource, RESOURCES } from "@/modules/auth/server/resource-authorization";
import { normalizePersonName } from "@/modules/players/server/eligibility";

/* ---------------- SCHEMAS ---------------- */

const updatePlayerSchema = z.object({
  playerName: z
    .string()
    .min(2, "Player name must be at least 2 characters")
    .max(100, "Player name must be less than 100 characters")
    .optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  verificationStatus: z.enum(["UNVERIFIED", "VERIFIED", "REJECTED"]).optional(),
  verificationNote: z.string().trim().max(500).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  dateOfBirth: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .optional()
    .nullable()
    .or(z.date().optional().nullable()),
  primarySport: z
    .enum([
      "FIELD_HOCKEY", "FOOTBALL", "CRICKET", "RELAY", "BASKETBALL",
      "VOLLEYBALL", "KABADDI", "ATHLETICS", "BADMINTON", "TABLE_TENNIS",
      "TENNIS", "SQUASH", "CARROM", "CHESS", "THROWBALL", "KHO_KHO",
      "SWIMMING", "WRESTLING", "BOXING", "OTHER",
    ])
    .optional()
    .nullable(),
  jerseyNumber: z
    .number()
    .int()
    .min(0)
    .max(999)
    .optional()
    .nullable(),
  biography: z
    .string()
    .max(2000, "Biography must be less than 2000 characters")
    .optional(),
  info: z.array(z.record(z.any())).optional(),
  familyId: z.string().optional(),
  isActive: z.boolean().optional(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "players:read");
  if (setup.error) return setup.error;

  const { players: id } = params;

  // Fetch player with related data
  const player = await db.player.findUnique({
    where: { id },
    include: {
      family: {
        select: { id: true, familyName: true, colors: true, images: true },
      },
      manOfTheMatchIn: {
        select: {
          id: true, name: true, sport: true, scheduledOn: true,
          tournament: { select: { id: true, name: true, year: true } },
        },
        orderBy: { scheduledOn: "desc" },
      },
      _count: { select: { manOfTheMatchIn: true } },
    },
  });

  if (!player) {
    return errorResponse("Player not found", 404);
  }

  return successResponse(player);
}

async function handlePatch(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "players:update");
  if (setup.error) return setup.error;

  const user = setup.user;
  const { players: playerId } = params;

  // Ability check
  if (!canResource(user, ACTIONS.UPDATE, RESOURCES.PLAYER)) {
    return errorResponse("You don't have permission to update players", 403);
  }

  // Validate body
  const body = await request.json();
  const validated = updatePlayerSchema.parse(body);

  // Check if player exists
  const existing = await db.player.findUnique({
    where: { id: playerId },
    include: {
      family: {
        select: {
          familyName: true,
        },
      },
    },
  });

  if (!existing) {
    return errorResponse("Player not found", 404);
  }

  // If familyId is being changed, verify new family exists
  if (validated.familyId && validated.familyId !== existing.familyId) {
    const newFamily = await db.families.findUnique({
      where: { id: validated.familyId },
    });

    if (!newFamily) {
      return errorResponse("Selected family does not exist", 400);
    }
  }

  const targetFamilyId = validated.familyId || existing.familyId;
  const nextName = validated.playerName || existing.playerName;
  const normalizedName = normalizePersonName(nextName);
  const duplicate = await db.player.findFirst({
    where: {
      familyId: targetFamilyId,
      id: { not: playerId },
      OR: [{ normalizedName }, { playerName: { equals: nextName, mode: "insensitive" } }],
    },
    select: { id: true, playerName: true },
  });
  if (duplicate) return errorResponse(`A player named ${duplicate.playerName} already exists in this family`, 409);

  if (validated.jerseyNumber != null) {
    const targetFamilyId = validated.familyId || existing.familyId;
    const jerseyDuplicate = await db.player.findFirst({
      where: { id: { not: playerId }, familyId: targetFamilyId, jerseyNumber: validated.jerseyNumber, isActive: true },
      select: { id: true, playerName: true },
    });
    if (jerseyDuplicate) return errorResponse(`Jersey #${validated.jerseyNumber} is already assigned to ${jerseyDuplicate.playerName} in this family`, 409);
  }

  // Build update data - only include fields that are provided
  const updateData = {
    ...(validated.playerName && { playerName: validated.playerName.trim(), normalizedName }),
    ...(!validated.playerName && !existing.normalizedName ? { normalizedName } : {}),
    ...(validated.gender !== undefined && { gender: validated.gender }),
    ...(validated.verificationStatus !== undefined && { verificationStatus: validated.verificationStatus }),
    ...(validated.verificationNote !== undefined && { verificationNote: validated.verificationNote }),
    ...(validated.photoUrl !== undefined && { photoUrl: validated.photoUrl }),
    ...(validated.dateOfBirth !== undefined && {
      dateOfBirth: validated.dateOfBirth,
    }),
    ...(validated.primarySport !== undefined && {
      primarySport: validated.primarySport,
    }),
    ...(validated.jerseyNumber !== undefined && {
      jerseyNumber: validated.jerseyNumber,
    }),
    ...(validated.biography !== undefined && {
      biography: validated.biography,
    }),
    ...(validated.info !== undefined && {
      info: validated.info,
    }),
    ...(validated.familyId && { familyId: validated.familyId }),
    ...(validated.isActive !== undefined && { isActive: validated.isActive }),
    updatedAt: new Date(),
  };

  // Update player
  const player = await db.player.update({
    where: { id: playerId },
    data: updateData,
    include: {
      family: {
        select: {
          id: true,
          familyName: true,
        },
      },
      _count: { select: { manOfTheMatchIn: true } },
    },
  });

  // Log activity
  await logActivity({
    userId: setup.user.userId,
    action: "updated",
    entity: "player",
    entityId: player.id,
    entityName: player.playerName,
    description: `Updated player "${player.playerName}"`,
    request,
  });

  return successResponse(player, "Player updated successfully");
}

async function handleDelete(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "players:delete");
  if (setup.error) return setup.error;

  const user = setup.user;
  const { players: playerId } = params;

  // Ability check
  if (!canResource(user, ACTIONS.DELETE, RESOURCES.PLAYER)) {
    return errorResponse("You don't have permission to delete players", 403);
  }

  // Check if player exists
  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      family: {
        select: {
          familyName: true,
        },
      },
      _count: { select: { manOfTheMatchIn: true } },
    },
  });

  if (!player) {
    return errorResponse("Player not found", 404);
  }

  // Check for associated data and prevent deletion if any exist
  const counts = player._count;
  const associations = [];

  const participations = await db.tournamentParticipation.findMany({
    where: { familyId: player.familyId },
    select: { gameRegistrations: { select: { id: true, roster: true } } },
  });
  const rosterUseCount = participations.reduce((count, participation) => count + participation.gameRegistrations.filter((registration) => (registration.roster || []).some((member) => member.playerId === playerId)).length, 0);
  if (rosterUseCount > 0) associations.push(`${rosterUseCount} submitted event roster(s)`);

  if (counts.manOfTheMatchIn > 0)
    associations.push(`${counts.manOfTheMatchIn} man of the match award(s)`);

  if (associations.length > 0) {
    return errorResponse(
      `Cannot delete player. It is associated with ${associations.join(", ")}. Please remove the associations first.`,
      400
    );
  }

  // Delete player
  await db.player.delete({
    where: { id: playerId },
  });

  // Log activity
  await logActivity({
    userId: setup.user.userId,
    action: "deleted",
    entity: "player",
    entityId: playerId,
    entityName: player.playerName,
    description: `Deleted player "${player.playerName}" from family "${player.family.familyName}"`,
    request,
  });

  return successResponse({ id: playerId }, "Player deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "player");
export const PATCH = withErrorHandling(handlePatch, "player");
export const DELETE = withErrorHandling(handleDelete, "player");