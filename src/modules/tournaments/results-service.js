import { tournamentRepository } from "@/modules/tournaments/repository";
import { TournamentCoreError } from "@/modules/tournaments/core-service";
import { calculatePoolStandings } from "@/modules/tournaments/server/standings";

export async function listPlacements(tournamentId) {
  return tournamentRepository.listPlacements(tournamentId);
}

export async function createPlacement(tournamentId,input) {
  const [participation,game]=await tournamentRepository.getPlacementContext(tournamentId,input.familyId,input.gameId);
  if(!participation) throw new TournamentCoreError("The selected family is not registered for this tournament",400);
  if(!game) throw new TournamentCoreError("The selected event does not belong to this tournament",400);
  if(!participation.gameRegistrations.length) throw new TournamentCoreError("This family is not registered for the selected event",400);
  if(await tournamentRepository.findPlacementDuplicate(tournamentId,game.id,input.placement)) {
    throw new TournamentCoreError(`${input.placement.replaceAll("_"," ")} is already assigned for ${game.name}`,409);
  }
  const result=await tournamentRepository.createPlacement({
    tournamentId,familyId:input.familyId,gameId:game.id,sport:game.sportType,placement:input.placement,prize:input.prize,
  });
  return {result,participation,game};
}

export async function deletePlacement(tournamentId,placementId) {
  const existing=await tournamentRepository.getPlacement(tournamentId,placementId);
  if(!existing) throw new TournamentCoreError("Placement not found",404);
  await tournamentRepository.deletePlacement(placementId);
  return existing;
}

export async function getResultsCenter(tournamentId) {
  const [games,matches,placements]=await Promise.all([
    tournamentRepository.listResultsGames(tournamentId),
    tournamentRepository.listResultsMatches(tournamentId),
    tournamentRepository.listResultsPlacements(tournamentId),
  ]);
  const events=games.map(game=>{
    const gm=matches.filter(m=>m.gameId===game.id);
    const pool=gm.filter(m=>m.round==="POOL_STAGE");
    const completedPool=pool.filter(m=>["COMPLETED","WALKOVER"].includes(m.status));
    const knockout=gm.filter(m=>m.round!=="POOL_STAGE");
    const final=knockout.find(m=>m.round==="FINAL"&&["COMPLETED","WALKOVER"].includes(m.status));
    return {
      game,
      totalMatches:gm.length,
      completedMatches:gm.filter(m=>["COMPLETED","WALKOVER"].includes(m.status)).length,
      poolComplete:pool.length>0&&pool.length===completedPool.length,
      pools:calculatePoolStandings(completedPool),
      knockout:knockout.map(m=>({
        id:m.id,matchNo:m.matchNo,name:m.name,round:m.round,status:m.status,
        participants:m.participants,winnerId:m.winnerId,winnerName:m.winnerName,
        isDraw:m.isDraw,lockedAt:m.lockedAt,resultVersion:m.resultVersion,scheduledOn:m.scheduledOn,
      })),
      champion:final?{familyId:final.winnerId,family:final.winnerName}:null,
      placements:placements.filter(p=>p.gameId===game.id),
    };
  });
  return {
    events,
    tieBreakOrder:["Points","Goal difference","Goals scored","Wins","Family name (deterministic fallback)"],
  };
}
