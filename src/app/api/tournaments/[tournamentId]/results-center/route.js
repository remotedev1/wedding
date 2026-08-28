import { errorResponse,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { getResultsCenter } from "@/modules/tournaments/results-service";

async function handleGet(request,{params}){
  const setup=await setupApiHandler(request,"standings:read");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.READ,RESOURCES.MATCH))return errorResponse("You don't have permission to view tournament results",403);
  return successResponse(await getResultsCenter(params.tournamentId));
}
export const GET=withErrorHandling(handleGet,"results-center");
