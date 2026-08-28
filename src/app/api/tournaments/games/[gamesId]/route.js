import { errorResponse,logActivity,readJsonRequest,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { updateGameSchema } from "@/modules/tournaments/schemas/core";
import { deleteGame,getGame,updateGame } from "@/modules/tournaments/core-service";
import { tournamentCoreErrorResponse } from "@/modules/tournaments/http";

async function handleGet(request,{params}){
  const setup=await setupApiHandler(request,"tournament-games:read");if(setup.error)return setup.error;
  try{return successResponse(await getGame(params.gamesId))}
  catch(error){return tournamentCoreErrorResponse(error)}
}

async function handlePatch(request,{params}){
  const setup=await setupApiHandler(request,"tournament-games:update");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.UPDATE,RESOURCES.TOURNAMENT_GAME))return errorResponse("You don't have permission to update tournament games",403);
  const input=updateGameSchema.parse(await readJsonRequest(request,64*1024));
  try{
    const {game,existing}=await updateGame(params.gamesId,input);
    await logActivity({userId:setup.user.id||setup.user.userId,action:"updated",entity:"tournament-game",entityId:game.id,entityName:game.name,description:`Updated game "${game.name}" in tournament "${existing.tournament.name}"`,request});
    return successResponse(game,"Tournament game updated successfully");
  }catch(error){return tournamentCoreErrorResponse(error)}
}

async function handleDelete(request,{params}){
  const setup=await setupApiHandler(request,"tournament-games:delete");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.DELETE,RESOURCES.TOURNAMENT_GAME))return errorResponse("You don't have permission to delete tournament games",403);
  try{
    const game=await deleteGame(params.gamesId);
    await logActivity({userId:setup.user.id||setup.user.userId,action:"deleted",entity:"tournament-game",entityId:game.id,entityName:game.name,description:`Deleted game "${game.name}" from tournament "${game.tournament.name}"`,request});
    return successResponse({id:game.id},"Tournament game deleted successfully");
  }catch(error){return tournamentCoreErrorResponse(error)}
}

export const GET=withErrorHandling(handleGet,"tournament-game");
export const PATCH=withErrorHandling(handlePatch,"tournament-game");
export const DELETE=withErrorHandling(handleDelete,"tournament-game");
