import { z } from "zod";
import { errorResponse, readJsonRequest, setupApiHandler, successResponse, withErrorHandling } from "@/lib/api/helpers";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { verifyAndCompleteRazorpayPayment, PaymentServiceError } from "@/modules/payments/service";

const schema=z.object({
  razorpay_order_id:z.string().min(1).max(100),
  razorpay_payment_id:z.string().min(1).max(100),
  razorpay_signature:z.string().min(1).max(200),
});

async function handlePost(request){
  const setup=await setupApiHandler(request,"public:razorpay-verify",{requireAuthentication:false,rateLimitPreset:RATE_LIMIT_PRESETS.PAYMENT});
  if(setup.error)return setup.error;
  const input=schema.parse(await readJsonRequest(request,16*1024));
  try{return successResponse(await verifyAndCompleteRazorpayPayment(input),"Payment verified");}
  catch(error){if(error instanceof PaymentServiceError)return errorResponse(error.message,error.status,error.details);throw error;}
}
export const POST=withErrorHandling(handlePost,"payment verification");
