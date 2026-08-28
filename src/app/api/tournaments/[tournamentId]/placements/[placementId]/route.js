import { errorResponse,logActivity,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { deletePlacement } from "@/modules/tournaments/results-service";
import { tournamentCoreErrorResponse } from "@/modules/tournaments/http";

async function handleDelete(request,{params}){
  const setup=await setupApiHandler(request,"placements:delete");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.DELETE,RESOURCES.PLACEMENT))return errorResponse("You don't have permission to remove placements",403);
  try{
    const existing=await deletePlacement(params.tournamentId,params.placementId);
    await logActivity({userId:setup.user.id||setup.user.userId,action:"deleted",entity:"placement",entityId:params.placementId,entityName:`${existing.sport} ${existing.placement}`,description:`Removed ${existing.placement} placement for ${existing.family.familyName}`,request});
    return successResponse(null,"Placement removed");
  }catch(error){return tournamentCoreErrorResponse(error)}
}
export const DELETE=withErrorHandling(handleDelete,"placement");
