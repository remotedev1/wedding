import { db } from "@/lib/db";
import { PaymentControl } from "@/modules/payments/components/admin/payment-control";
import { requirePermission } from "@/modules/auth/server/session";
import { PERMISSIONS } from "@/modules/auth/server/permissions";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  await requirePermission(PERMISSIONS.PAYMENTS_VIEW, "/dashboard/payments");
  const [payments, outstanding] = await Promise.all([
    db.payment.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { family: { select: { familyName: true } } } }),
    db.gameRegistration.findMany({
      where: { paymentAmount: { gt: 0 }, paymentStatus: { not: "COMPLETED" } },
      orderBy: { registeredAt: "desc" }, take: 250,
      include: {
        game: { select: { name: true, tournamentId: true, tournament: { select: { name: true } } } },
        participation: { include: { family: { select: { familyName: true } } } },
      },
    }),
  ]);
  return <PaymentControl initialPayments={JSON.parse(JSON.stringify(payments))} initialOutstanding={JSON.parse(JSON.stringify(outstanding))} />;
}
