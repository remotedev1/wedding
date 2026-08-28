import { z } from "zod";
import { db } from "@/lib/db";
import { ACTIONS, RESOURCES } from "@/modules/auth/server/resource-authorization";
import { errorResponse, logActivity, requirePermission, setupApiHandler, successResponse, withErrorHandling } from "@/lib/api/helpers";

const schema = z.object({
  registrationIds: z.array(z.string().min(1)).min(1).max(50),
  paymentMethod: z.enum(["CASH", "UPI", "CHEQUE", "BANK_TRANSFER", "PAYTM", "PHONEPE", "GPAY", "OTHER"]),
  reference: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});

async function handlePost(request) {
  const setup = await setupApiHandler(request, "payments:manual-complete");
  if (setup.error) return setup.error;
  const denied = requirePermission(setup.user, ACTIONS.MANAGE, RESOURCES.PAYMENT);
  if (denied) return denied;
  const input = schema.parse(await request.json());

  const registrations = await db.gameRegistration.findMany({
    where: { id: { in: [...new Set(input.registrationIds)] } },
    include: {
      game: { select: { id: true, name: true, sportType: true, tournamentId: true, tournament: { select: { name: true } } } },
      participation: { include: { family: { select: { id: true, familyName: true } } } },
    },
  });
  if (registrations.length !== new Set(input.registrationIds).size) return errorResponse("One or more registrations were not found", 404);
  const outstanding = registrations.filter((item) => Number(item.paymentAmountMinor ?? Math.round(Number(item.paymentAmount || 0) * 100)) > 0 && item.paymentStatus !== "COMPLETED");
  if (!outstanding.length) return errorResponse("Selected registrations have no outstanding balance", 409);
  const familyIds = [...new Set(outstanding.map((item) => item.participation.familyId))];
  const tournamentIds = [...new Set(outstanding.map((item) => item.game.tournamentId))];
  if (familyIds.length !== 1 || tournamentIds.length !== 1) return errorResponse("Manual payments must belong to one family and one tournament", 400);

  const amountMinor = outstanding.reduce((sum, item) => sum + Number(item.paymentAmountMinor ?? Math.round(Number(item.paymentAmount || 0) * 100)), 0);
  const amount = amountMinor / 100;
  const receipt = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const payment = await db.payment.create({
    data: {
      familyId: familyIds[0], amount, amountMinor, currency: "INR", paymentType: "GAME_FEE", paymentMethod: input.paymentMethod,
      status: "COMPLETED", transactionId: input.reference ? `manual:${input.paymentMethod}:${input.reference}` : `manual:${receipt}`, receiptNumber: receipt,
      purpose: `Tournament registration - ${outstanding[0].game.tournament.name}`,
      description: outstanding.map((item) => item.game.name).join(", "), tournamentId: tournamentIds[0],
      tournamentName: outstanding[0].game.tournament.name, sport: outstanding.length === 1 ? outstanding[0].game.sportType : undefined,
      gameId: outstanding.length === 1 ? outstanding[0].gameId : undefined, registrationIds: outstanding.map((item) => item.id),
      payerName: outstanding[0].participation.family.familyName, paidAt: new Date(), paymentDate: new Date(),
      notes: input.notes || (input.reference ? `Reference: ${input.reference}` : "Recorded manually by administrator"), attachments: [],
    },
  });

  for (const registration of outstanding) {
    await db.paymentAllocation.create({
      data: {
        paymentId: payment.id,
        registrationId: registration.id,
        tournamentId: tournamentIds[0],
        gameId: registration.gameId,
        amountMinor: Number(registration.paymentAmountMinor ?? Math.round(Number(registration.paymentAmount || 0) * 100)),
        currency: "INR",
        purpose: registration.game?.name || "Tournament event registration",
      },
    });
  }

  await db.gameRegistration.updateMany({ where: { id: { in: payment.registrationIds } }, data: { paymentStatus: "COMPLETED", paymentId: payment.id, paymentDate: payment.paidAt } });
  const participationId = outstanding[0].participationId;
  const aggregate = await db.gameRegistration.aggregate({ where: { participationId, paymentStatus: "COMPLETED" }, _sum: { paymentAmount: true } });
  await db.tournamentParticipation.update({ where: { id: participationId }, data: { totalAmountPaid: aggregate._sum.paymentAmount || 0 } });
  await logActivity({ userId: setup.user.id, action: "recorded", entity: "payment", entityId: payment.id, entityName: receipt, description: `Recorded ₹${amount} manual payment for ${payment.payerName}`, request });
  return successResponse(payment, "Manual payment recorded", 201);
}

export const POST = withErrorHandling(handlePost, "manual payment");
