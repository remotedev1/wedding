import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { errorResponse,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { getOfficialCandidates,OfficialConflictError } from "@/modules/officials/service";
async function handleGet(request,{params}){
  const setup=await setupApiHandler(request,"matches:list");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.UPDATE,RESOURCES.MATCH))return errorResponse("You don't have permission to assign officials",403);
  try{return successResponse(await getOfficialCandidates({tournamentId:params.tournamentId,matchId:params.matchesId}));}
  catch(error){if(error instanceof OfficialConflictError)return errorResponse(error.message,error.details?.status||409,error.details);throw error;}
}
export const GET=withErrorHandling(handleGet,"official candidates");
