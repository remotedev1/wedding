import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(process.cwd());
const schema=fs.readFileSync(path.join(root,"prisma/schema.prisma"),"utf8");
const registrations=fs.readFileSync(path.join(root,"src/modules/registrations/service.js"),"utf8");
const payments=fs.readFileSync(path.join(root,"src/modules/payments/service.js"),"utf8");
const matches=fs.readFileSync(path.join(root,"src/modules/matches/service.js"),"utf8");
const officials=fs.readFileSync(path.join(root,"src/modules/officials/service.js"),"utf8");

test("duplicate tournament-event registration has a database uniqueness boundary",()=>{
  assert.match(schema,/model GameRegistration[\s\S]*@@unique\(\[gameId,\s*participationId\]\)/);
  assert.match(registrations,/P2002/);
});

test("payment checkout claims pending obligations before gateway order creation",()=>{
  const claim=payments.indexOf('paymentStatus:"PENDING",paymentId:null');
  const razorpay=payments.indexOf("orders.create");
  assert.ok(claim>=0 && razorpay>claim);
  assert.match(payments,/claimed\.count!==payment\.registrationIds\.length/);
});

test("payment completion verifies authoritative gateway state",()=>{
  assert.match(payments,/payments\.fetch\(paymentId\)/);
  assert.match(payments,/gateway\.order_id!==payment\.orderId/);
  assert.match(payments,/gateway\.status!=="captured"/);
  assert.match(payments,/gateway\.amount/);
  assert.match(payments,/gateway\.currency/);
});

test("live scoring uses optimistic concurrency and result locking",()=>{
  assert.match(schema,/controlVersion Int @default\(0\)/);
  assert.match(matches,/compareAndSwap/);
  assert.match(matches,/MATCH_VERSION_CONFLICT/);
  assert.match(matches,/lockedAt:\s*new Date\(\)/);
});

test("scorer access is match-assignment scoped and officials are conflict checked",()=>{
  assert.match(officials,/SCORER_NOT_ASSIGNED|canStaffScoreMatch/);
  assert.match(officials,/OFFICIAL_DOUBLE_BOOKED/);
  assert.match(officials,/overlaps\(/);
});
