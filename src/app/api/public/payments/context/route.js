import { errorResponse, setupApiHandler, successResponse, withErrorHandling } from "@/lib/api/helpers";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { getPublicPaymentContext, PaymentServiceError } from "@/modules/payments/service";

async function handleGet(request){
  const setup=await setupApiHandler(request,"public:payment-context",{requireAuthentication:false,rateLimitPreset:RATE_LIMIT_PRESETS.PUBLIC_API,sameOriginMutation:false});
  if(setup.error)return setup.error;
  try{
    const token=new URL(request.url).searchParams.get("token");
    return successResponse(await getPublicPaymentContext(token));
  }catch(error){
    if(error instanceof PaymentServiceError)return errorResponse(error.message,error.status,error.details);
    throw error;
  }
}
export const GET=withErrorHandling(handleGet,"payment context");
