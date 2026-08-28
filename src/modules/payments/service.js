import crypto from "node:crypto";
import { db } from "@/lib/db";
import { paymentRepository } from "@/modules/payments/repository";
import { getRazorpayClient, toPaise, verifyRazorpaySignature } from "@/modules/payments/server/razorpay";
import { verifyPaymentToken } from "@/modules/payments/server/token";
import { createGuestRegistrationAccess } from "@/modules/registrations/server/guest-access";

const STALE_INTENT_MS = 2 * 60 * 1000;

export class PaymentServiceError extends Error {
  constructor(message, status = 409, details = {}) {
    super(message);
    this.name = "PaymentServiceError";
    this.status = status;
    this.details = details;
  }
}

function amountMinor(registration) {
  const value = Number(registration.paymentAmountMinor ?? toPaise(registration.paymentAmount || 0));
  if (!Number.isInteger(value) || value < 0) throw new PaymentServiceError("Registration payment amount is invalid", 500);
  return value;
}

async function releasePaymentClaim(payment, note) {
  await db.gameRegistration.updateMany({
    where: { id: { in: payment.registrationIds }, paymentId: payment.id, paymentStatus: "PROCESSING" },
    data: { paymentStatus: "PENDING", paymentId: null },
  });
  await paymentRepository.update(payment.id, { status: "FAILED", notes: note }).catch(() => undefined);
}

async function recoverStaleIntent(payment) {
  if (!payment || payment.status !== "PROCESSING" || payment.orderId) return false;
  if (Date.now() - new Date(payment.createdAt).getTime() < STALE_INTENT_MS) return false;
  await releasePaymentClaim(payment, "Recovered stale payment intent before Razorpay order creation");
  return true;
}

async function loadPaymentContext(tokenValue) {
  const token = verifyPaymentToken(tokenValue);
  if (!token) throw new PaymentServiceError("Payment link is invalid or expired", 401);

  const participation = await db.tournamentParticipation.findFirst({
    where: { id: token.participationId, tournamentId: token.tournamentId, familyId: token.familyId },
    include: {
      family: { select: { id:true,familyName:true } },
      tournament: { select: { id:true,name:true,status:true } },
      gameRegistrations: {
        where: { id: { in: token.registrationIds } },
        include: { game: { select: { id:true,name:true,sportType:true,category:true } } },
      },
    },
  });
  if (!participation) throw new PaymentServiceError("Registration could not be found", 404);
  if (participation.gameRegistrations.length !== new Set(token.registrationIds).size) {
    throw new PaymentServiceError("Payment token does not match the current registrations", 409);
  }
  return { token, participation };
}

export async function getPublicPaymentContext(tokenValue) {
  const { token, participation } = await loadPaymentContext(tokenValue);
  const registrations = participation.gameRegistrations.map((registration) => ({
    id:registration.id,
    game:registration.game,
    paymentAmount:registration.paymentAmount,
    paymentAmountMinor:amountMinor(registration),
    paymentStatus:registration.paymentStatus,
    paymentId:registration.paymentId,
  }));
  const pending = registrations.filter(item=>item.paymentAmountMinor>0&&item.paymentStatus!=="COMPLETED");
  const amountDueMinor = pending.reduce((sum,item)=>sum+item.paymentAmountMinor,0);
  const primary=participation.gameRegistrations[0]||null;
  const guestAccess=primary?createGuestRegistrationAccess({
    registrationId:primary.id,participationId:participation.id,tournamentId:participation.tournament.id,familyId:participation.family.id,
  }):null;
  return {
    family:participation.family,
    tournament:participation.tournament,
    registrations,
    pendingRegistrationIds:pending.map(item=>item.id),
    amountDueMinor,
    amountDue:amountDueMinor/100,
    currency:"INR",
    payable:amountDueMinor>0,
    keyId:process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID||process.env.RAZORPAY_KEY_ID||null,
    confirmationUrl:guestAccess?`/registration/confirmation?access=${encodeURIComponent(guestAccess)}`:null,
  };
}

export async function createRazorpayRegistrationOrder(paymentToken) {
  let { token, participation } = await loadPaymentContext(paymentToken);

  // Recover only abandoned local intents that never received a gateway order.
  for (const registration of participation.gameRegistrations) {
    if (registration.paymentStatus !== "PROCESSING" || !registration.paymentId) continue;
    const existing = await paymentRepository.findById(registration.paymentId);
    if (existing?.status === "PROCESSING" && existing.orderId) {
      const samePayment = participation.gameRegistrations.every(item =>
        item.paymentStatus === "COMPLETED" || item.paymentId === existing.id
      );
      if (samePayment) {
        return {
          paymentId:existing.id,orderId:existing.orderId,
          amount:existing.amountMinor??toPaise(existing.amount),currency:existing.currency,
          keyId:process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID||process.env.RAZORPAY_KEY_ID,reused:true,
        };
      }
      throw new PaymentServiceError("A payment is already being processed for this registration");
    }
    if (existing && await recoverStaleIntent(existing)) {
      ({ token, participation } = await loadPaymentContext(paymentToken));
    } else if (existing) {
      throw new PaymentServiceError("A payment is already being prepared. Retry shortly.");
    }
  }

  const pending=participation.gameRegistrations.filter(item=>amountMinor(item)>0&&item.paymentStatus==="PENDING"&&!item.paymentId);
  if (!pending.length) {
    const completed=participation.gameRegistrations.every(item=>amountMinor(item)===0||item.paymentStatus==="COMPLETED");
    throw new PaymentServiceError(completed?"There is no outstanding registration payment":"Payment state changed. Refresh and try again.");
  }

  const totalMinor=pending.reduce((sum,item)=>sum+amountMinor(item),0);
  if(!Number.isInteger(totalMinor)||totalMinor<=0) throw new PaymentServiceError("Invalid outstanding amount");

  const intentId=`intent:${crypto.randomUUID()}`;
  const receipt=`reg_${participation.id.slice(-10)}_${Date.now().toString().slice(-8)}`;
  const payment=await paymentRepository.create({
    familyId:token.familyId,
    amount:totalMinor/100,
    amountMinor:totalMinor,
    currency:"INR",
    paymentType:"GAME_FEE",
    paymentMethod:"RAZORPAY",
    status:"PROCESSING",
    transactionId:intentId,
    receiptNumber:receipt,
    purpose:`Tournament registration - ${participation.tournament.name}`,
    description:pending.map(item=>item.game.name).join(", "),
    tournamentId:token.tournamentId,
    tournamentName:participation.tournament.name,
    registrationIds:pending.map(item=>item.id),
    payerName:participation.family.familyName,
    attachments:[],
  });

  // Atomic conditional claim: only one concurrent checkout can claim all obligations.
  const claimed=await db.gameRegistration.updateMany({
    where:{id:{in:payment.registrationIds},paymentStatus:"PENDING",paymentId:null},
    data:{paymentStatus:"PROCESSING",paymentId:payment.id},
  });
  if(claimed.count!==payment.registrationIds.length){
    await db.gameRegistration.updateMany({
      where:{id:{in:payment.registrationIds},paymentId:payment.id,paymentStatus:"PROCESSING"},
      data:{paymentStatus:"PENDING",paymentId:null},
    });
    await paymentRepository.delete(payment.id).catch(()=>undefined);
    throw new PaymentServiceError("Another checkout already claimed this registration. Refresh and continue the existing payment.");
  }

  try {
    for(const registration of pending){
      await paymentRepository.createAllocation({
        paymentId:payment.id,registrationId:registration.id,tournamentId:token.tournamentId,
        gameId:registration.gameId,amountMinor:amountMinor(registration),currency:"INR",
        purpose:registration.game?.name||"Tournament event registration",
      });
    }

    const order=await getRazorpayClient().orders.create({
      amount:totalMinor,currency:"INR",receipt,
      notes:{paymentId:payment.id,participationId:participation.id,tournamentId:token.tournamentId,familyId:token.familyId},
    });
    const updated=await paymentRepository.update(payment.id,{
      orderId:order.id,transactionId:`pending:${order.id}`,
    });
    return {
      paymentId:updated.id,orderId:order.id,amount:order.amount,currency:order.currency,
      keyId:process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID||process.env.RAZORPAY_KEY_ID,reused:false,
    };
  } catch(error) {
    await releasePaymentClaim(payment, `Razorpay order creation failed: ${error?.message||"unknown error"}`);
    throw error;
  }
}

async function recomputeParticipationTotals(registrationIds) {
  const rows=await db.gameRegistration.findMany({
    where:{id:{in:registrationIds}},
    select:{participationId:true},
  });
  for(const participationId of [...new Set(rows.map(row=>row.participationId))]){
    const paid=await db.gameRegistration.findMany({
      where:{participationId,paymentStatus:"COMPLETED"},
      select:{paymentAmountMinor:true,paymentAmount:true},
    });
    const totalMinor=paid.reduce((sum,row)=>sum+Number(row.paymentAmountMinor??toPaise(row.paymentAmount||0)),0);
    await db.tournamentParticipation.update({where:{id:participationId},data:{totalAmountPaid:totalMinor/100}});
  }
}

async function assertGatewayPayment(payment, paymentId) {
  const gateway=await getRazorpayClient().payments.fetch(paymentId);
  if(!gateway) throw new PaymentServiceError("Unable to verify payment with Razorpay",502);
  if(gateway.order_id!==payment.orderId) throw new PaymentServiceError("Gateway payment belongs to a different order",409);
  if(Number(gateway.amount)!==Number(payment.amountMinor??toPaise(payment.amount))) throw new PaymentServiceError("Gateway amount does not match the registration obligation",409);
  if(String(gateway.currency||"").toUpperCase()!==String(payment.currency||"INR").toUpperCase()) throw new PaymentServiceError("Gateway currency does not match",409);
  if(gateway.status!=="captured") throw new PaymentServiceError(`Payment is not captured yet (${gateway.status||"unknown"})`,409);
  return gateway;
}

export async function verifyAndCompleteRazorpayPayment(input) {
  const payment=await paymentRepository.findByOrderId(input.razorpay_order_id);
  if(!payment) throw new PaymentServiceError("Payment order was not found",404);

  // Invalid client verification must never mutate the payment state.
  if(!verifyRazorpaySignature({
    orderId:input.razorpay_order_id,paymentId:input.razorpay_payment_id,signature:input.razorpay_signature,
  })) throw new PaymentServiceError("Payment verification failed",400);

  if(payment.status==="COMPLETED"){
    if(payment.transactionId!==input.razorpay_payment_id) throw new PaymentServiceError("Payment order is already linked to another transaction",409);
  } else {
    if(payment.transactionId&&!payment.transactionId.startsWith("pending:")&&!payment.transactionId.startsWith("intent:")&&payment.transactionId!==input.razorpay_payment_id){
      throw new PaymentServiceError("Payment order is already linked to another transaction",409);
    }
    await assertGatewayPayment(payment,input.razorpay_payment_id);

    const completed=await paymentRepository.updateWhere(
      {id:payment.id,status:{not:"COMPLETED"}},
      {status:"COMPLETED",transactionId:input.razorpay_payment_id,paidAt:new Date(),paymentDate:new Date()},
    );
    if(completed.count===0){
      const current=await paymentRepository.findById(payment.id);
      if(current?.status!=="COMPLETED"||current.transactionId!==input.razorpay_payment_id){
        throw new PaymentServiceError("Payment state changed while verifying. Refresh and retry.",409);
      }
    }

    await db.gameRegistration.updateMany({
      where:{id:{in:payment.registrationIds},paymentId:payment.id,paymentStatus:"PROCESSING"},
      data:{paymentStatus:"COMPLETED",paymentDate:new Date()},
    });
    await recomputeParticipationTotals(payment.registrationIds);
  }

  const current=await paymentRepository.findById(payment.id);
  const primary=await db.gameRegistration.findFirst({
    where:{id:{in:payment.registrationIds},paymentId:payment.id},
    select:{id:true,participationId:true,participation:{select:{tournamentId:true,familyId:true}}},
  });
  const guestAccess=primary?createGuestRegistrationAccess({
    registrationId:primary.id,participationId:primary.participationId,
    tournamentId:primary.participation.tournamentId,familyId:primary.participation.familyId,
  }):null;
  return {
    paymentId:payment.id,status:"COMPLETED",transactionId:input.razorpay_payment_id,
    receiptNumber:current?.receiptNumber,
    confirmationUrl:guestAccess?`/registration/confirmation?access=${encodeURIComponent(guestAccess)}`:null,
  };
}

export async function completePaymentFromWebhook({ orderId, paymentId, amount, currency }) {
  const payment=await paymentRepository.findByOrderId(orderId);
  if(!payment) return {ignored:true};
  if(payment.status==="COMPLETED"){
    if(payment.transactionId&&paymentId&&payment.transactionId!==paymentId) throw new PaymentServiceError("Webhook transaction conflicts with completed payment",409);
    return {completed:true,idempotent:true};
  }
  if(Number(amount)!==Number(payment.amountMinor??toPaise(payment.amount))) throw new PaymentServiceError("Webhook amount mismatch",409);
  if(String(currency||"").toUpperCase()!==String(payment.currency||"INR").toUpperCase()) throw new PaymentServiceError("Webhook currency mismatch",409);

  const updated=await paymentRepository.updateWhere(
    {id:payment.id,status:{not:"COMPLETED"}},
    {status:"COMPLETED",transactionId:paymentId||payment.transactionId,paidAt:new Date(),paymentDate:new Date()},
  );
  if(updated.count){
    await db.gameRegistration.updateMany({
      where:{id:{in:payment.registrationIds},paymentId:payment.id,paymentStatus:"PROCESSING"},
      data:{paymentStatus:"COMPLETED",paymentDate:new Date()},
    });
    await recomputeParticipationTotals(payment.registrationIds);
  }
  return {completed:true,idempotent:updated.count===0};
}

export async function recordFailedPaymentAttempt({ orderId, reason }) {
  const payment=await paymentRepository.findByOrderId(orderId);
  if(!payment||payment.status==="COMPLETED") return {ignored:true};
  // A Razorpay order can receive another payment attempt. Keep the obligation
  // claimed by the same local payment/order so a failed attempt cannot cause
  // a second concurrent order to be created.
  await paymentRepository.update(payment.id,{
    notes:reason||"A Razorpay payment attempt failed; the order remains available for retry",
  });
  return {failedAttemptRecorded:true,reusableOrder:true};
}
