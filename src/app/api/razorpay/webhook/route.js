import crypto from "node:crypto";
import { errorResponse, successResponse, withErrorHandling } from "@/lib/api/helpers";
import { readTextWithLimit } from "@/lib/request-body";
import { completePaymentFromWebhook, recordFailedPaymentAttempt, PaymentServiceError } from "@/modules/payments/service";
import { logger } from "@/lib/logger";

function validSignature(raw,signature){
  const secret=process.env.RAZORPAY_WEBHOOK_SECRET;
  if(!secret||!signature)return false;
  const expected=crypto.createHmac("sha256",secret).update(raw).digest("hex");
  const a=Buffer.from(String(signature)),b=Buffer.from(expected);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}

async function handlePost(request){
  const raw=await readTextWithLimit(request,256*1024);
  if(!validSignature(raw,request.headers.get("x-razorpay-signature")))return errorResponse("Invalid webhook signature",401);
  const event=JSON.parse(raw);
  const entity=event?.payload?.payment?.entity;
  const orderId=entity?.order_id;
  if(!orderId)return successResponse({ignored:true});

  try{
    if(["payment.captured","order.paid"].includes(event.event)){
      return successResponse(await completePaymentFromWebhook({
        orderId,paymentId:entity?.id,amount:entity?.amount,currency:entity?.currency,
      }));
    }
    if(event.event==="payment.failed"){
      return successResponse(await recordFailedPaymentAttempt({orderId,reason:entity?.error_description||"Razorpay payment attempt failed"}));
    }
    return successResponse({ignored:true});
  }catch(error){
    if(error instanceof PaymentServiceError){
      logger.error("Razorpay webhook reconciliation rejected",{orderId,event:event.event,message:error.message});
      return errorResponse(error.message,error.status,error.details);
    }
    throw error;
  }
}
export const POST=withErrorHandling(handlePost,"Razorpay webhook");
