import { errorResponse,logActivity,readJsonRequest,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { knockoutGenerationSchema } from "@/modules/tournaments/schemas/core";
import { generateKnockoutFixtures } from "@/modules/tournaments/fixture-service";
import { tournamentCoreErrorResponse } from "@/modules/tournaments/http";

async function handlePost(request,{params}){
  const setup=await setupApiHandler(request,"knockout:generate");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.CREATE,RESOURCES.MATCH))return errorResponse("You don't have permission to generate knockout fixtures",403);
  const input=knockoutGenerationSchema.parse(await readJsonRequest(request,32*1024));
  try{
    const result=await generateKnockoutFixtures(params.tournamentId,input);
    if(!input.preview)await logActivity({userId:setup.user.id||setup.user.userId,action:"generated",entity:"knockout",entityId:input.gameId,entityName:input.gameId,description:`Generated ${result.created} ${result.round} fixtures`,request});
    return successResponse(result,input.preview?"Knockout preview generated":"Knockout fixtures generated",input.preview?200:201);
  }catch(error){return tournamentCoreErrorResponse(error)}
}
export const POST=withErrorHandling(handlePost,"knockout generation");
