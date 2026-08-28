import { z } from "zod";
import { db } from "@/lib/db";
import { createPaymentToken } from "@/modules/payments/server/token";
import { buildRegistrationReference, verifyGuestRegistrationAccess } from "@/modules/registrations/server/guest-access";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { errorResponse, setupApiHandler, successResponse, withErrorHandling } from "@/lib/api/helpers";
import { evaluatePlayerEligibility } from "@/modules/players/server/eligibility";

const updateSchema = z.object({
  managerName: z.string().trim().min(2).max(120),
  managerPhone: z.string().trim().min(7).max(30),
  playerIds: z.array(z.string().min(1)).max(40),
  captainPlayerId: z.string().nullable().optional(),
  goalkeeperPlayerId: z.string().nullable().optional(),
});

const LOCKED_STATUSES = ["LIVE", "SUSPENDED", "COMPLETED", "ABANDONED", "WALKOVER", "NO_RESULT"];

async function loadRegistration(access) {
  return db.gameRegistration.findFirst({
    where: {
      id: access.registrationId,
      participationId: access.participationId,
      participation: { is: { tournamentId: access.tournamentId, familyId: access.familyId } },
    },
    include: {
      game: {
        select: {
          id: true,
          name: true,
          shortName: true,
          eventCode: true,
          category: true,
          sportType: true,
          format: true,
          minRosterSize: true,
          maxRosterSize: true,
          teamSize: true,
          minAge: true,
          maxAge: true,
          eligibilityCutoffDate: true,
          allowedGenders: true,
          registrationFee: true,
          registrationFeeMinor: true,
          tournamentId: true,
        },
      },
      participation: {
        include: {
          tournament: { select: { id: true, name: true, shortName: true, year: true, status: true, startDate: true, endDate: true } },
          family: {
            select: {
              id: true,
              familyName: true,
              shortName: true,
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

async function isRosterLocked(registration) {
  if (registration.rosterLockedAt) return true;
  return Boolean(await db.matches.findFirst({
    where: {
      tournamentId: registration.participation.tournamentId,
      gameId: registration.gameId,
      OR: [{ actualStartTime: { not: null } }, { status: { in: LOCKED_STATUSES } }],
    },
    select: { id: true },
  }));
}

async function normalizeRegistrationReference(registration) {
  if (registration.registrationReference) return registration.registrationReference;
  const reference = buildRegistrationReference({
    tournament: registration.participation.tournament,
    game: registration.game,
    registrationId: registration.id,
  });
  await db.gameRegistration.update({ where: { id: registration.id }, data: { registrationReference: reference } });
  return reference;
}

async function resolve(request) {
  const setup = await setupApiHandler(request, "public:registration-context", { requireAuthentication: false, rateLimitPreset: RATE_LIMIT_PRESETS.AUTH });
  if (setup.error) return { error: setup.error };
  const accessValue = new URL(request.url).searchParams.get("access");
  const access = verifyGuestRegistrationAccess(accessValue);
  if (!access) return { error: errorResponse("This registration access link is invalid or expired", 401) };
  const registration = await loadRegistration(access);
  if (!registration) return { error: errorResponse("Registration could not be found", 404) };
  return { access, registration };
}

async function handleGet(request) {
  const resolved = await resolve(request);
  if (resolved.error) return resolved.error;
  const { access, registration } = resolved;
  const reference = await normalizeRegistrationReference(registration);
  const locked = await isRosterLocked(registration);
  const amountMinor = Number(registration.paymentAmountMinor ?? Math.round(Number(registration.paymentAmount || 0) * 100));
  const paymentComplete = registration.paymentStatus === "COMPLETED" || amountMinor === 0;
  const payment = registration.paymentId
    ? await db.payment.findUnique({
        where: { id: registration.paymentId },
        select: { id: true, receiptNumber: true, status: true, paymentMethod: true, amount: true, amountMinor: true, currency: true, transactionId: true, paidAt: true, paymentDate: true },
      })
    : null;
  const paymentToken = !paymentComplete && amountMinor > 0
    ? createPaymentToken({ participationId: access.participationId, tournamentId: access.tournamentId, familyId: access.familyId, registrationIds: [registration.id] })
    : null;
  const roster = registration.roster || [];
  const minRosterSize = Number(registration.game.minRosterSize || 0);
  const rosterComplete = Boolean(registration.managerName && registration.managerPhone && roster.length > 0 && (!minRosterSize || roster.length >= minRosterSize));

  const playersWithEligibility = registration.participation.family.players.map((player) => ({
    ...player,
    eligibility: evaluatePlayerEligibility(player, registration.game),
  }));

  return successResponse({
    registration: {
      id: registration.id,
      reference,
      status: registration.status,
      registeredAt: registration.registeredAt,
      paymentStatus: registration.paymentStatus,
      paymentAmount: registration.paymentAmount,
      paymentAmountMinor: amountMinor,
      managerName: registration.managerName || "",
      managerPhone: registration.managerPhone || "",
      roster,
      captainPlayerId: registration.captainPlayerId || null,
      rosterLockedAt: registration.rosterLockedAt || null,
    },
    tournament: registration.participation.tournament,
    family: { id: registration.participation.family.id, familyName: registration.participation.family.familyName, shortName: registration.participation.family.shortName },
    game: registration.game,
    availablePlayers: playersWithEligibility,
    payment,
    paymentComplete,
    paymentUrl: paymentToken ? `/secure/payment?token=${encodeURIComponent(paymentToken)}` : null,
    rosterLocked: locked,
    rosterComplete,
    teamEntryRequired: paymentComplete && !rosterComplete,
  });
}

async function handlePatch(request) {
  const resolved = await resolve(request);
  if (resolved.error) return resolved.error;
  const { registration } = resolved;
  const amountMinor = Number(registration.paymentAmountMinor ?? Math.round(Number(registration.paymentAmount || 0) * 100));
  if (registration.paymentStatus !== "COMPLETED" && amountMinor > 0) {
    return errorResponse("Complete the registration payment before submitting the team entry", 409);
  }
  if (await isRosterLocked(registration)) return errorResponse("This team roster is locked because competition has already started", 409);

  const input = updateSchema.parse(await request.json());
  const uniqueIds = [...new Set(input.playerIds)];
  if (uniqueIds.length !== input.playerIds.length) return errorResponse("A player can only appear once in the roster", 400);

  const minimum = Number(registration.game.minRosterSize || 0);
  const maximum = Number(registration.game.maxRosterSize || 40);
  if (minimum && uniqueIds.length < minimum) return errorResponse(`Select at least ${minimum} players for ${registration.game.name}`, 400);
  if (uniqueIds.length > maximum) return errorResponse(`This event allows a maximum roster of ${maximum} players`, 400);

  const playerMap = new Map(registration.participation.family.players.map((player) => [player.id, player]));
  const selected = uniqueIds.map((id) => playerMap.get(id));
  if (selected.some((player) => !player)) return errorResponse("Every selected player must be an active member of this family", 400);
  for (const player of selected) {
    const eligibility = evaluatePlayerEligibility(player, registration.game);
    if (!eligibility.eligible) return errorResponse(`${player.playerName} is not eligible: ${eligibility.reasons.join("; ")}`, 409);
  }
  if (input.captainPlayerId && !uniqueIds.includes(input.captainPlayerId)) return errorResponse("Captain must be part of the selected roster", 400);
  if (input.goalkeeperPlayerId && !uniqueIds.includes(input.goalkeeperPlayerId)) return errorResponse("Goalkeeper must be part of the selected roster", 400);

  const jerseyOwners = new Map();
  for (const player of selected) {
    if (player.jerseyNumber == null) continue;
    if (jerseyOwners.has(player.jerseyNumber)) return errorResponse(`Jersey #${player.jerseyNumber} is assigned to more than one selected player`, 409);
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
      managerName: input.managerName,
      managerPhone: input.managerPhone,
      roster,
      captainPlayerId: input.captainPlayerId || null,
    },
    select: { id: true, managerName: true, managerPhone: true, roster: true, captainPlayerId: true, registrationReference: true },
  });
  return successResponse(updated, "Team entry saved");
}

export const GET = withErrorHandling(handleGet, "public registration context");
export const PATCH = withErrorHandling(handlePatch, "public registration team entry");
