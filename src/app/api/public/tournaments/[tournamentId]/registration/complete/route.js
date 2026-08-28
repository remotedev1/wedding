import { z } from "zod";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { errorResponse, setupApiHandler, successResponse, withErrorHandling, readJsonRequest } from "@/lib/api/helpers";
import { createGuestEventRegistration, RegistrationConflictError, RegistrationValidationError } from "@/modules/registrations/service";

const schema = z.object({ familyId:z.string().min(1), gameId:z.string().min(1) });

async function handlePost(request,{params}){
  const setup=await setupApiHandler(request,"public:tournament-registration:complete",{
    requireAuthentication:false,rateLimitPreset:RATE_LIMIT_PRESETS.PUBLIC_REGISTRATION,
  });
  if(setup.error)return setup.error;
  const input=schema.parse(await readJsonRequest(request,16*1024));
  try{
    const result=await createGuestEventRegistration({tournamentId:params.tournamentId,...input});
    return successResponse(result,result.paymentRequired?"Registration created. Continue to payment.":"Registration completed successfully.",201);
  }catch(error){
    if(error instanceof RegistrationConflictError) return errorResponse(error.message,409,error.details);
    if(error instanceof RegistrationValidationError) return errorResponse(error.message,error.status||409);
    throw error;
  }
}
export const POST=withErrorHandling(handlePost,"guest-tournament-registration");
