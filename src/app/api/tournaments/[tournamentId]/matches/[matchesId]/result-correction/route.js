import { z } from "zod";
import { ACTIONS, canResource, RESOURCES } from "@/modules/auth/server/resource-authorization";
import {
  errorResponse,
  logActivity,
  readJsonRequest,
  setupApiHandler,
  successResponse,
  withErrorHandling,
} from "@/lib/api/helpers";
import { MatchConflictError, reopenCompletedMatch } from "@/modules/matches/service";

const schema = z.object({
  expectedResultVersion: z.number().int().min(0),
  reason: z.string().trim().min(10).max(1000),
});

async function handlePost(request, { params }) {
  const setup = await setupApiHandler(request, "matches:result-correction");
  if (setup.error) return setup.error;

  // Result correction is deliberately an administrative match-management action,
  // not a normal scorer action.
  if (!canResource(setup.user, ACTIONS.UPDATE, RESOURCES.MATCH)) {
    return errorResponse("You don't have permission to reopen a completed result", 403);
  }

  const input = schema.parse(await readJsonRequest(request, 16 * 1024));
  try {
    const match = await reopenCompletedMatch({
      tournamentId: params.tournamentId,
      matchId: params.matchesId,
      expectedResultVersion: input.expectedResultVersion,
      reason: input.reason,
    });

    await logActivity({
      userId: setup.user.id || setup.user.userId,
      action: "result-reopened",
      entity: "match",
      entityId: match.id,
      entityName: match.name || `Match #${match.matchNo}`,
      description: `Reopened a locked match result for correction: ${input.reason}`,
      request,
      metadata: {
        tournamentId: params.tournamentId,
        previousResultVersion: input.expectedResultVersion,
        resultVersion: match.resultVersion,
        controlVersion: match.controlVersion,
      },
    });

    return successResponse(match, "Result reopened for controlled correction");
  } catch (error) {
    if (error instanceof MatchConflictError) {
      return errorResponse(error.message, 409, error.details);
    }
    throw error;
  }
}

export const POST = withErrorHandling(handlePost, "match-result-correction");
