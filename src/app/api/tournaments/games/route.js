import {
  buildPaginationResponse,buildSearchWhere,errorResponse,logActivity,parsePagination,readJsonRequest,
  setupApiHandler,successResponse,withErrorHandling,
} from "@/lib/api/helpers";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { createGameSchema,gameListQuerySchema } from "@/modules/tournaments/schemas/core";
import { createGame,listGames } from "@/modules/tournaments/core-service";
import { tournamentCoreErrorResponse } from "@/modules/tournaments/http";

async function handleGet(request){
  const setup=await setupApiHandler(request,"tournament-games:list");if(setup.error)return setup.error;
  const {searchParams}=new URL(request.url);
  const validated=gameListQuerySchema.parse({
    page:searchParams.get("page"),limit:searchParams.get("limit"),search:searchParams.get("search")||undefined,
    tournamentId:searchParams.get("tournamentId")||undefined,sportType:searchParams.get("sportType")||undefined,
    category:searchParams.get("category")||undefined,status:searchParams.get("status")||undefined,
    sortBy:searchParams.get("sortBy")||undefined,sortOrder:searchParams.get("sortOrder")||undefined,
  });
  const {page,limit,skip}=parsePagination(searchParams);
  const where={
    ...buildSearchWhere(validated.search,["name","description","format"]),
    ...(validated.tournamentId&&{tournamentId:validated.tournamentId}),
    ...(validated.sportType&&{sportType:validated.sportType}),
    ...(validated.category&&{category:validated.category}),
    ...(validated.status&&{isActive:validated.status==="active"}),
  };
  const {games,total}=await listGames({where,skip,take:limit,orderBy:{[validated.sortBy]:validated.sortOrder}});
  return successResponse({games,pagination:buildPaginationResponse(page,limit,total,games)});
}

async function handlePost(request){
  const setup=await setupApiHandler(request,"tournament-games:create");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.CREATE,RESOURCES.TOURNAMENT_GAME))return errorResponse("You don't have permission to create tournament games",403);
  const input=createGameSchema.parse(await readJsonRequest(request,64*1024));
  try{
    const {game,tournament}=await createGame(input);
    await logActivity({userId:setup.user.id||setup.user.userId,action:"created",entity:"tournament-game",entityId:game.id,entityName:game.name,description:`Created game "${game.name}" in tournament "${tournament.name}"`,request});
    return successResponse(game,"Tournament game created successfully",201);
  }catch(error){return tournamentCoreErrorResponse(error)}
}

export const GET=withErrorHandling(handleGet,"tournament-games");
export const POST=withErrorHandling(handlePost,"tournament-game");
