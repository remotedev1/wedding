import { z } from "zod";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { errorResponse,logActivity,readJsonRequest,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { updateRegistrationStatus,RegistrationConflictError,RegistrationValidationError } from "@/modules/registrations/service";

const schema=z.object({
  status:z.enum(["PENDING","CONFIRMED","WAITLISTED","CANCELLED","REJECTED"]).optional(),
  pool:z.string().trim().min(1).max(32).nullable().optional(),
}).refine(value=>value.status!==undefined||value.pool!==undefined,{message:"No registration changes supplied"});

async function handlePatch(request,{params}){
  const setup=await setupApiHandler(request,"game-registration:update");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.UPDATE,RESOURCES.PARTICIPATION))return errorResponse("You don't have permission to manage registrations",403);
  const input=schema.parse(await readJsonRequest(request,16*1024));
  try{
    const updated=await updateRegistrationStatus({tournamentId:params.tournamentId,participationId:params.participationId,registrationId:params.registrationId,...input});
    await logActivity({userId:setup.user.id,action:"updated",entity:"game-registration",entityId:updated.id,entityName:updated.game?.name,description:`Updated event registration to ${updated.status}`,request});
    return successResponse(updated,"Registration updated");
  }catch(error){
    if(error instanceof RegistrationConflictError)return errorResponse(error.message,409,error.details);
    if(error instanceof RegistrationValidationError)return errorResponse(error.message,error.status||409,error.details);
    throw error;
  }
}
export const PATCH=withErrorHandling(handlePatch,"game-registration");
