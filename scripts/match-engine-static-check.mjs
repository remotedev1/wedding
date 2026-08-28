import fs from "node:fs";
import path from "node:path";

const root=path.resolve(process.cwd());
const read=(rel)=>fs.readFileSync(path.join(root,rel),"utf8");
const failures=[];

const schema=read("prisma/schema.prisma");
for(const required of [
  "controlVersion Int @default(0)",
  "resultVersion Int @default(0)",
  "model TournamentProgressionLock",
  "key       String   @unique",
  "@@index([matchId, actionId])",
]){
  if(!schema.includes(required)) failures.push(`Schema invariant missing: ${required}`);
}

const route=read("src/app/api/tournaments/[tournamentId]/matches/[matchesId]/route.js");
for(const required of [
  "expectedControlVersion",
  "actionId:",
  "commitLiveMatchMutation",
  "Knockout matches cannot be recorded as a draw",
  "Winner must be a participating family",
  "Complete matches through the live result workflow",
  "This result is locked",
]){
  if(!route.includes(required)) failures.push(`Match route invariant missing: ${required}`);
}
const deleteBlock=route.slice(route.indexOf("async function handleDelete"));
if(deleteBlock.includes("isLiveUpdate")||deleteBlock.includes("body.action")){
  failures.push("Delete handler contains leaked live-update variables.");
}

const service=read("src/modules/matches/service.js");
for(const required of [
  "compareAndSwap",
  "controlVersion: { increment: 1 }",
  "resultVersion: { increment: 1 }",
  "lockedAt: new Date()",
  "reopenCompletedMatch",
  "MATCH_VERSION_CONFLICT",
  "KNOCKOUT_ALREADY_ADVANCED",
]){
  if(!service.includes(required)) failures.push(`Match service invariant missing: ${required}`);
}

const hook=read("src/modules/matches/hooks/useLiveMatchControl.js");
for(const required of [
  "expectedControlVersion",
  "crypto.randomUUID",
  "pending.size > 0",
]){
  if(!hook.includes(required)) failures.push(`Live client invariant missing: ${required}`);
}

const knockout=read("src/modules/tournaments/server/knockout.js");
for(const required of [
  "tournamentProgressionLock",
  "acquireProgressionLock",
  "ensureProgressionMatch",
  "FINAL:1",
  "THIRD_PLACE:1",
]){
  if(!knockout.includes(required)) failures.push(`Knockout idempotency invariant missing: ${required}`);
}

const events=read("src/modules/tournaments/server/match-events.js");
if(events.includes("Date.now() * 1000")) failures.push("Match event sequence still uses unsafe timestamp multiplication.");
if(!events.includes("match.controlVersion")) failures.push("Match events are not sequenced from the authoritative control version.");

if(failures.length){
  console.error("Professional match engine static check FAILED");
  failures.forEach(f=>console.error(`- ${f}`));
  process.exit(1);
}
console.log("Professional match engine static check passed");
