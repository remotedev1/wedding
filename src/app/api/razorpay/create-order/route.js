import { z } from "zod";
import { errorResponse, readJsonRequest, setupApiHandler, successResponse, withErrorHandling } from "@/lib/api/helpers";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { createRazorpayRegistrationOrder, PaymentServiceError } from "@/modules/payments/service";

const schema=z.object({paymentToken:z.string().min(20)});

async function handlePost(request){
  const setup=await setupApiHandler(request,"public:razorpay-create-order",{requireAuthentication:false,rateLimitPreset:RATE_LIMIT_PRESETS.PAYMENT});
  if(setup.error)return setup.error;
  const input=schema.parse(await readJsonRequest(request,16*1024));
  try{return successResponse(await createRazorpayRegistrationOrder(input.paymentToken));}
  catch(error){if(error instanceof PaymentServiceError)return errorResponse(error.message,error.status,error.details);throw error;}
}
export const POST=withErrorHandling(handlePost,"Razorpay order");
