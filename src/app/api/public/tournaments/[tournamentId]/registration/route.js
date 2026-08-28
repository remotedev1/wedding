import { z } from "zod";
import { db } from "@/lib/db";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { createPaymentToken } from "@/modules/payments/server/token";
import { errorResponse, setupApiHandler, successResponse, withErrorHandling } from "@/lib/api/helpers";

const querySchema = z.object({ familyId: z.string().min(1).optional() });

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "public:tournament-registration:context", {
    requireAuthentication: false,
    rateLimitPreset: RATE_LIMIT_PRESETS.PUBLIC_API,
  });
  if (setup.error) return setup.error;

  const { searchParams } = new URL(request.url);
  const { familyId } = querySchema.parse({ familyId: searchParams.get("familyId") || undefined });

  const [tournament, participation] = await Promise.all([
    db.tournament.findUnique({
      where: { id: params.tournamentId },
      select: {
        id: true,
        name: true,
        shortName: true,
        year: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        status: true,
        visibility: true,
        description: true,
        games: {
          where: { isActive: true },
          orderBy: [{ date: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            shortName: true,
            code: true,
            sportType: true,
            category: true,
            format: true,
            date: true,
            registrationDeadline: true,
            registrationFee: true,
            registrationFeeMinor: true,
            description: true,
            minRosterSize: true,
            maxRosterSize: true,
            _count: { select: { registrations: true } },
          },
        },
      },
    }),
    familyId
      ? db.tournamentParticipation.findUnique({
          where: { tournamentId_familyId: { tournamentId: params.tournamentId, familyId } },
          select: { id: true, gameRegistrations: { select: { id: true, gameId: true, status: true, paymentStatus: true, paymentAmountMinor: true, paymentAmount: true } } },
        })
      : Promise.resolve(null),
  ]);

  if (!tournament || tournament.visibility === "PRIVATE") return errorResponse("Tournament not found", 404);

  const now = new Date();
  const tournamentDeadlinePassed = tournament.registrationDeadline && tournament.registrationDeadline < now;
  const registrationOpen = tournament.status === "REGISTRATION" && !tournamentDeadlinePassed;
  const existingByGame = new Map((participation?.gameRegistrations || []).map((registration) => [registration.gameId, registration]));

  const games = tournament.games.map((game) => {
    const existing = existingByGame.get(game.id);
    return {
      ...game,
      registrationFeeMinor: game.registrationFeeMinor ?? Math.round(Number(game.registrationFee || 0) * 100),
      registrationOpen: registrationOpen && (!game.registrationDeadline || game.registrationDeadline >= now) && !existing,
      alreadyRegistered: Boolean(existing),
      existingRegistration: existing || null,
      resumePaymentUrl:
        existing && existing.paymentStatus !== "COMPLETED" && Number(existing.paymentAmountMinor ?? Math.round(Number(existing.paymentAmount || 0) * 100)) > 0 && participation
          ? `/secure/payment?token=${encodeURIComponent(createPaymentToken({ participationId: participation.id, tournamentId: params.tournamentId, familyId, registrationIds: [existing.id] }))}`
          : null,
    };
  });

  return successResponse({ ...tournament, registrationOpen, games });
}

export const GET = withErrorHandling(handleGet, "public-tournament-registration");
