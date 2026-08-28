import { db } from "@/lib/db";
import { ACTIONS, RESOURCES } from "@/modules/auth/server/resource-authorization";
import { errorResponse, logActivity, requirePermission, setupApiHandler, successResponse, withErrorHandling } from "@/lib/api/helpers";

async function handlePost(request, { params }) {
  const setup = await setupApiHandler(request, "payments:reconcile");
  if (setup.error) return setup.error;
  const denied = requirePermission(setup.user, ACTIONS.MANAGE, RESOURCES.PAYMENT);
  if (denied) return denied;
  const payment = await db.payment.findUnique({ where: { id: params.paymentId } });
  if (!payment) return errorResponse("Payment not found", 404);
  if (payment.status !== "COMPLETED") return errorResponse("Only completed payments can be reconciled", 409);

  await db.gameRegistration.updateMany({ where: { id: { in: payment.registrationIds }, paymentId: payment.id }, data: { paymentStatus: "COMPLETED", paymentDate: payment.paidAt || payment.paymentDate } });
  const regs = await db.gameRegistration.findMany({ where: { id: { in: payment.registrationIds } }, select: { participationId: true } });
  for (const participationId of [...new Set(regs.map((item) => item.participationId))]) {
    const aggregate = await db.gameRegistration.aggregate({ where: { participationId, paymentStatus: "COMPLETED" }, _sum: { paymentAmount: true } });
    await db.tournamentParticipation.update({ where: { id: participationId }, data: { totalAmountPaid: aggregate._sum.paymentAmount || 0 } });
  }
  await logActivity({ userId: setup.user.id, action: "reconciled", entity: "payment", entityId: payment.id, entityName: payment.receiptNumber, description: `Reconciled payment ${payment.receiptNumber}`, request });
  return successResponse({ id: payment.id, registrationIds: payment.registrationIds }, "Payment reconciled");
}
export const POST = withErrorHandling(handlePost, "payment reconciliation");
