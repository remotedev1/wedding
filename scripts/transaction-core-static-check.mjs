import fs from "node:fs";
import path from "node:path";

const root=path.resolve(process.cwd());
const read=(rel)=>fs.readFileSync(path.join(root,rel),"utf8");
const failures=[];

const schema=read("prisma/schema.prisma");
if(!schema.includes("@@unique([gameId, participationId])")) failures.push("Registration compound uniqueness is missing.");

const paymentService=read("src/modules/payments/service.js");
for(const required of [
  'paymentStatus:"PENDING",paymentId:null',
  'claimed.count!==payment.registrationIds.length',
  'payments.fetch(paymentId)',
  'gateway.order_id!==payment.orderId',
  'Number(gateway.amount)!==Number(payment.amountMinor',
  'gateway.status!=="captured"',
  'Invalid client verification must never mutate the payment state',
  'recordFailedPaymentAttempt',
]){
  if(!paymentService.includes(required)) failures.push(`Payment invariant missing: ${required}`);
}

const registrationService=read("src/modules/registrations/service.js");
if(!registrationService.includes("PrismaClientKnownRequestError")||!registrationService.includes('error.code !== "P2002"')){
  failures.push("Registration service is not explicitly handling uniqueness races.");
}
if(!registrationService.includes("evaluateRegistrationReadiness")) failures.push("Admin confirmation does not use shared readiness.");

const thinRoutes=[
  "src/app/api/public/tournaments/[tournamentId]/registration/complete/route.js",
  "src/app/api/razorpay/create-order/route.js",
  "src/app/api/razorpay/verify-payment/route.js",
  "src/app/api/tournaments/[tournamentId]/participants/[participationId]/registrations/[registrationId]/route.js",
  "src/app/api/tournaments/[tournamentId]/registrations/bulk/route.js",
];
for(const rel of thinRoutes){
  const text=read(rel);
  if(text.includes("db.")) failures.push(`Thin API route still performs direct database work: ${rel}`);
}

if(failures.length){
  console.error("Transaction core static check FAILED");
  failures.forEach(f=>console.error(`- ${f}`));
  process.exit(1);
}
console.log("Transaction core static check passed");
