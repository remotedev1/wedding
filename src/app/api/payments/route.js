import { db } from "@/lib/db";
import { ACTIONS, RESOURCES } from "@/modules/auth/server/resource-authorization";
import { requirePermission, setupApiHandler, successResponse, withErrorHandling } from "@/lib/api/helpers";

async function handleGet(request) {
  const setup = await setupApiHandler(request, "payments:list");
  if (setup.error) return setup.error;
  const denied = requirePermission(setup.user, ACTIONS.READ, RESOURCES.PAYMENT);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const tournamentId = searchParams.get("tournamentId");
  const where = { ...(status && status !== "ALL" ? { status } : {}), ...(tournamentId ? { tournamentId } : {}) };
  const payments = await db.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 250,
    include: { family: { select: { id: true, familyName: true } } },
  });
  return successResponse(payments);
}

export const GET = withErrorHandling(handleGet, "payments");
