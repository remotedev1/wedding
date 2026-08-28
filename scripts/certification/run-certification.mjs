import { spawnSync } from "node:child_process";

const includeDb = process.argv.includes("--db");
const includeHttp = process.argv.includes("--http");
const includePrisma = !process.argv.includes("--no-prisma");

const commands = [
  ["node", ["scripts/check-src-architecture.cjs"]],
  ["node", ["scripts/security-core-static-check.mjs"]],
  ["node", ["scripts/transaction-core-static-check.mjs"]],
  ["node", ["scripts/match-engine-static-check.mjs"]],
  ["node", ["scripts/staff-officials-static-check.mjs"]],
  ["node", ["scripts/admin-operations-ux-static-check.mjs"]],
  ["node", ["scripts/public-portal-static-check.mjs"]],
  ["node", ["scripts/tournament-core-api-static-check.mjs"]],
  ["node", ["scripts/certification/source-hygiene.mjs"]],
  ["node", ["--test", "tests/certification/*.test.mjs"], { shell:true }],
];

if (includePrisma) commands.push(["npx", ["prisma", "validate"]]);
if (includeDb) commands.push(["node", ["scripts/certification/db-integrity.mjs"]]);
if (includeHttp) commands.push(["node", ["scripts/certification/http-smoke.mjs"]]);

let failed = false;
for (const [command,args,options={}] of commands) {
  console.log(`\n=== ${command} ${args.join(" ")} ===`);
  const result=spawnSync(command,args,{stdio:"inherit",cwd:process.cwd(),shell:Boolean(options.shell)});
  if(result.status!==0){
    failed=true;
    console.error(`FAILED: ${command} ${args.join(" ")}`);
    break;
  }
}
if(failed) process.exit(1);
console.log("\nProduction certification completed successfully.");
