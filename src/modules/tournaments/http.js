import { errorResponse } from "@/lib/api/helpers";
import { TournamentCoreError } from "@/modules/tournaments/core-service";

export function tournamentCoreErrorResponse(error) {
  if (error instanceof TournamentCoreError) {
    return errorResponse(error.message,error.status,error.details);
  }
  throw error;
}
