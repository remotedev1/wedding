import { z } from "zod";
import { db } from "@/lib/db";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { setupApiHandler, successResponse, withErrorHandling } from "@/lib/api/helpers";

const querySchema = z.object({ search: z.string().trim().max(80).optional() });

async function handleGet(request) {
  const setup = await setupApiHandler(request, "public:families:list", {
    requireAuthentication: false,
    rateLimitPreset: RATE_LIMIT_PRESETS.PUBLIC_API,
  });
  if (setup.error) return setup.error;

  const { searchParams } = new URL(request.url);
  const { search } = querySchema.parse({ search: searchParams.get("search") || undefined });
  const where = {
    AND: [
      { OR: [{ status: "ACTIVE" }, { status: null }] },
      ...(search ? [{ familyName: { contains: search, mode: "insensitive" } }] : []),
    ],
  };
  const families = await db.families.findMany({
    where,
    take: 40,
    orderBy: { familyName: "asc" },
    select: { id: true, familyName: true, shortName: true, crestUrl: true, colors: true, images: true, _count: { select: { players: true } } },
  });
  return successResponse({ families });
}

export const GET = withErrorHandling(handleGet, "public-families");
