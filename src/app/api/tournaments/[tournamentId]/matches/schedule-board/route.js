import { errorResponse,logActivity,readJsonRequest,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { scheduleBulkSchema,schedulePatchSchema } from "@/modules/tournaments/schemas/core";
import { bulkPublishFixtures,getScheduleBoard,updateScheduleFixture } from "@/modules/tournaments/fixture-service";
import { tournamentCoreErrorResponse } from "@/modules/tournaments/http";

async function handleGet(request,{params}){
  const setup=await setupApiHandler(request,"matches:list");if(setup.error)return setup.error;
  return successResponse(await getScheduleBoard(params.tournamentId));
}
async function handlePatch(request,{params}){
  const setup=await setupApiHandler(request,"matches:update");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.UPDATE,RESOURCES.MATCH))return errorResponse("You don't have permission to manage the fixture schedule",403);
  const input=schedulePatchSchema.parse(await readJsonRequest(request,16*1024));
  try{
    const updated=await updateScheduleFixture(params.tournamentId,input);
    await logActivity({userId:setup.user.id||setup.user.userId,action:"schedule_updated",entity:"match",entityId:updated.id,entityName:updated.name||`Match #${updated.matchNo}`,description:`Updated fixture schedule for Match #${updated.matchNo}`,request,metadata:{scheduledOn:updated.scheduledOn,status:updated.status,publicationStatus:updated.publicationStatus}});
    return successResponse(updated,"Fixture updated");
  }catch(error){return tournamentCoreErrorResponse(error)}
}
async function handlePost(request,{params}){
  const setup=await setupApiHandler(request,"matches:update");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.UPDATE,RESOURCES.MATCH))return errorResponse("You don't have permission to publish fixtures",403);
  const input=scheduleBulkSchema.parse(await readJsonRequest(request,16*1024));
  try{
    const result=await bulkPublishFixtures(params.tournamentId,input);
    await logActivity({userId:setup.user.id||setup.user.userId,action:"fixtures_published",entity:"match",entityName:params.tournamentId,description:`Set ${result.count} fixtures to ${input.publicationStatus}`,request});
    return successResponse(result,"Fixture publication updated");
  }catch(error){return tournamentCoreErrorResponse(error)}
}
export const GET=withErrorHandling(handleGet,"schedule-board");
export const PATCH=withErrorHandling(handlePatch,"schedule-board");
export const POST=withErrorHandling(handlePost,"schedule-board");
