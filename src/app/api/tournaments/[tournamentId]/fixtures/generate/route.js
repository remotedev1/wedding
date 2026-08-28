import { errorResponse,logActivity,readJsonRequest,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { fixtureGenerationSchema } from "@/modules/tournaments/schemas/core";
import { generatePoolFixtures } from "@/modules/tournaments/fixture-service";
import { tournamentCoreErrorResponse } from "@/modules/tournaments/http";

async function handlePost(request,{params}){
  const setup=await setupApiHandler(request,"fixtures:generate");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.CREATE,RESOURCES.MATCH))return errorResponse("You don't have permission to generate fixtures",403);
  const input=fixtureGenerationSchema.parse(await readJsonRequest(request,32*1024));
  try{
    const result=await generatePoolFixtures(params.tournamentId,input);
    if(!input.commit)return successResponse(result,"Fixture preview generated");
    await logActivity({userId:setup.user.id||setup.user.userId,action:"generated",entity:"fixtures",entityId:input.gameId,entityName:result.game.name,description:`Generated ${result.created} pool-stage fixtures for ${result.game.name}`,request});
    return successResponse(result,`${result.created} fixtures generated`,201);
  }catch(error){return tournamentCoreErrorResponse(error)}
}
export const POST=withErrorHandling(handlePost,"fixtures");
