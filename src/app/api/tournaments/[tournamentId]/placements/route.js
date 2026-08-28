import { errorResponse,logActivity,readJsonRequest,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { createPlacementSchema } from "@/modules/tournaments/schemas/core";
import { createPlacement,listPlacements } from "@/modules/tournaments/results-service";
import { tournamentCoreErrorResponse } from "@/modules/tournaments/http";

async function handleGet(request,{params}){
  const setup=await setupApiHandler(request,"placements:list");if(setup.error)return setup.error;
  return successResponse(await listPlacements(params.tournamentId));
}
async function handlePost(request,{params}){
  const setup=await setupApiHandler(request,"placements:create");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.CREATE,RESOURCES.PLACEMENT))return errorResponse("You don't have permission to record placements",403);
  const input=createPlacementSchema.parse(await readJsonRequest(request,16*1024));
  try{
    const {result,participation,game}=await createPlacement(params.tournamentId,input);
    await logActivity({userId:setup.user.id||setup.user.userId,action:"created",entity:"placement",entityId:result.id,entityName:`${game.name} ${input.placement}`,description:`Recorded ${input.placement} for ${participation.family.familyName} in ${game.name}`,request});
    return successResponse(result,"Placement recorded",201);
  }catch(error){return tournamentCoreErrorResponse(error)}
}
export const GET=withErrorHandling(handleGet,"placement");
export const POST=withErrorHandling(handlePost,"placement");
