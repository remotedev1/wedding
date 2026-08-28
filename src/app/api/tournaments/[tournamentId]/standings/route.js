import { errorResponse,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { getStandings } from "@/modules/tournaments/fixture-service";
import { tournamentCoreErrorResponse } from "@/modules/tournaments/http";

async function handleGet(request,{params}){
  const setup=await setupApiHandler(request,"standings:read");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.READ,RESOURCES.MATCH))return errorResponse("You don't have permission to view standings",403);
  const gameId=new URL(request.url).searchParams.get("gameId");
  if(!gameId)return errorResponse("gameId is required",400);
  try{return successResponse(await getStandings(params.tournamentId,gameId))}
  catch(error){return tournamentCoreErrorResponse(error)}
}
export const GET=withErrorHandling(handleGet,"standings");
