import { z } from "zod";
import { ACTIONS, canResource, RESOURCES } from "@/modules/auth/server/resource-authorization";
import { errorResponse, logActivity, readJsonRequest, setupApiHandler, successResponse, withErrorHandling } from "@/lib/api/helpers";
import { assignOfficial, OfficialConflictError, removeOfficial, updateOfficialStatus } from "@/modules/officials/service";
import { officialRepository } from "@/modules/officials/repository";

const createSchema=z.object({
  role:z.enum(["REFEREE","ASSISTANT_REFEREE","UMPIRE","SCORER","TIMEKEEPER","MATCH_COMMISSIONER","TECHNICAL_OFFICIAL","OTHER"]),
  userId:z.string().min(1).nullable().optional(),
  name:z.string().trim().max(120).optional(),
  phone:z.string().trim().max(30).nullable().optional(),
  notes:z.string().trim().max(500).nullable().optional(),
});
const updateSchema=z.object({
  officialId:z.string().min(1),
  status:z.enum(["ASSIGNED","CHECKED_IN","COMPLETED","CANCELLED","NO_SHOW"]),
});
const deleteSchema=z.object({officialId:z.string().min(1)});

function forbidden(user){
  return !canResource(user,ACTIONS.UPDATE,RESOURCES.MATCH);
}
async function handleGet(request,{params}){
  const setup=await setupApiHandler(request,"matches:list");if(setup.error)return setup.error;
  const match=await officialRepository.getMatch(params.tournamentId,params.matchesId);
  if(!match)return errorResponse("Match not found",404);
  return successResponse(match.officials||[]);
}
async function handlePost(request,{params}){
  const setup=await setupApiHandler(request,"matches:update");if(setup.error)return setup.error;
  if(forbidden(setup.user))return errorResponse("You don't have permission to manage match officials",403);
  const input=createSchema.parse(await readJsonRequest(request,16*1024));
  try{
    const official=await assignOfficial({
      tournamentId:params.tournamentId,matchId:params.matchesId,...input,
      actorId:setup.user.id||setup.user.userId,
    });
    await logActivity({userId:setup.user.id||setup.user.userId,action:"official_assigned",entity:"match",entityId:params.matchesId,entityName:official.name,description:`Assigned ${official.name} as ${official.role.replaceAll("_"," ")}`,request,metadata:{officialId:official.id,role:official.role,userId:official.userId||null}});
    return successResponse(official,"Official assigned",201);
  }catch(error){
    if(error instanceof OfficialConflictError)return errorResponse(error.message,error.details?.status||409,error.details);
    throw error;
  }
}
async function handlePatch(request,{params}){
  const setup=await setupApiHandler(request,"matches:update");if(setup.error)return setup.error;
  if(forbidden(setup.user))return errorResponse("You don't have permission to manage match officials",403);
  const input=updateSchema.parse(await readJsonRequest(request,8*1024));
  try{
    const official=await updateOfficialStatus({tournamentId:params.tournamentId,matchId:params.matchesId,...input});
    await logActivity({userId:setup.user.id||setup.user.userId,action:"official_status",entity:"match",entityId:params.matchesId,entityName:official.name,description:`Set ${official.name} to ${official.status}`,request,metadata:{officialId:official.id,status:official.status}});
    return successResponse(official,"Official status updated");
  }catch(error){
    if(error instanceof OfficialConflictError)return errorResponse(error.message,error.details?.status||409,error.details);
    throw error;
  }
}
async function handleDelete(request,{params}){
  const setup=await setupApiHandler(request,"matches:update");if(setup.error)return setup.error;
  if(forbidden(setup.user))return errorResponse("You don't have permission to manage match officials",403);
  const input=deleteSchema.parse(await readJsonRequest(request,8*1024));
  try{
    const official=await removeOfficial({tournamentId:params.tournamentId,matchId:params.matchesId,officialId:input.officialId});
    await logActivity({userId:setup.user.id||setup.user.userId,action:"official_removed",entity:"match",entityId:params.matchesId,entityName:official.name,description:`Removed ${official.name} from active match duty`,request,metadata:{officialId:official.id,role:official.role}});
    return successResponse(official,"Official removed");
  }catch(error){
    if(error instanceof OfficialConflictError)return errorResponse(error.message,error.details?.status||409,error.details);
    throw error;
  }
}
export const GET=withErrorHandling(handleGet,"match officials");
export const POST=withErrorHandling(handlePost,"match officials");
export const PATCH=withErrorHandling(handlePatch,"match officials");
export const DELETE=withErrorHandling(handleDelete,"match officials");
