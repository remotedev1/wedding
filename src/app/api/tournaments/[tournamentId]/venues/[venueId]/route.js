import { errorResponse,logActivity,readJsonRequest,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { updateVenueSchema } from "@/modules/tournaments/schemas/core";
import { deleteVenue,updateVenue } from "@/modules/tournaments/core-service";
import { tournamentCoreErrorResponse } from "@/modules/tournaments/http";

async function handlePatch(request,{params}){
  const setup=await setupApiHandler(request,"tournament-venues:update");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.UPDATE,RESOURCES.TOURNAMENT))return errorResponse("You don't have permission to manage tournament venues",403);
  const input=updateVenueSchema.parse(await readJsonRequest(request,16*1024));
  try{
    const venue=await updateVenue(params.tournamentId,params.venueId,input);
    await logActivity({userId:setup.user.id||setup.user.userId,action:"updated",entity:"tournament-venue",entityId:venue.id,entityName:venue.name,description:`Updated venue ${venue.name}`,request});
    return successResponse(venue,"Venue updated");
  }catch(error){return tournamentCoreErrorResponse(error)}
}
async function handleDelete(request,{params}){
  const setup=await setupApiHandler(request,"tournament-venues:delete");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.UPDATE,RESOURCES.TOURNAMENT))return errorResponse("You don't have permission to manage tournament venues",403);
  try{
    const venue=await deleteVenue(params.tournamentId,params.venueId);
    await logActivity({userId:setup.user.id||setup.user.userId,action:"deleted",entity:"tournament-venue",entityId:venue.id,entityName:venue.name,description:`Deleted venue ${venue.name}`,request});
    return successResponse({id:venue.id},"Venue deleted");
  }catch(error){return tournamentCoreErrorResponse(error)}
}
export const PATCH=withErrorHandling(handlePatch,"tournament venue");
export const DELETE=withErrorHandling(handleDelete,"tournament venue");
