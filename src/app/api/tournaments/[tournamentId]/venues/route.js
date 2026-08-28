import { errorResponse,logActivity,readJsonRequest,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { venueSchema } from "@/modules/tournaments/schemas/core";
import { createVenue,listVenues } from "@/modules/tournaments/core-service";
import { tournamentCoreErrorResponse } from "@/modules/tournaments/http";

async function handleGet(request,{params}){
  const setup=await setupApiHandler(request,"tournament-venues:list");if(setup.error)return setup.error;
  return successResponse(await listVenues(params.tournamentId));
}
async function handlePost(request,{params}){
  const setup=await setupApiHandler(request,"tournament-venues:create");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.UPDATE,RESOURCES.TOURNAMENT))return errorResponse("You don't have permission to manage tournament venues",403);
  const input=venueSchema.parse(await readJsonRequest(request,16*1024));
  try{
    const {venue,tournament}=await createVenue(params.tournamentId,input);
    await logActivity({userId:setup.user.id||setup.user.userId,action:"created",entity:"tournament-venue",entityId:venue.id,entityName:venue.name,description:`Added venue ${venue.name} to ${tournament.name}`,request});
    return successResponse(venue,"Venue added",201);
  }catch(error){return tournamentCoreErrorResponse(error)}
}
export const GET=withErrorHandling(handleGet,"tournament venues");
export const POST=withErrorHandling(handlePost,"tournament venue");
