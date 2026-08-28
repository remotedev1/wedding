import { z } from "zod";
import { ACTIONS,canResource,RESOURCES } from "@/modules/auth/server/resource-authorization";
import { errorResponse,logActivity,readJsonRequest,setupApiHandler,successResponse,withErrorHandling } from "@/lib/api/helpers";
import { bulkUpdateRegistrationStatus,RegistrationConflictError,RegistrationValidationError } from "@/modules/registrations/service";

const schema=z.object({
  registrationIds:z.array(z.string().min(1)).min(1).max(100),
  status:z.enum(["PENDING","CONFIRMED","WAITLISTED","CANCELLED","REJECTED"]),
});

async function handlePost(request,{params}){
  const setup=await setupApiHandler(request,"game-registration:bulk-update");if(setup.error)return setup.error;
  if(!canResource(setup.user,ACTIONS.UPDATE,RESOURCES.PARTICIPATION))return errorResponse("You don't have permission to manage registrations",403);
  const input=schema.parse(await readJsonRequest(request,32*1024));
  try{
    const result=await bulkUpdateRegistrationStatus({tournamentId:params.tournamentId,...input});
    await logActivity({userId:setup.user.id,action:"bulk-updated",entity:"game-registration",entityName:params.tournamentId,description:`Set ${result.count} event registration(s) to ${result.status}`,request});
    return successResponse(result,"Registrations updated");
  }catch(error){
    if(error instanceof RegistrationConflictError)return errorResponse(error.message,409,error.details);
    if(error instanceof RegistrationValidationError)return errorResponse(error.message,error.status||409,error.details);
    throw error;
  }
}
export const POST=withErrorHandling(handlePost,"game-registration-bulk");
