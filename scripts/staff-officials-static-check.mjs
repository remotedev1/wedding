import fs from "node:fs";
import path from "node:path";
const root=path.resolve(process.cwd());
const read=(rel)=>fs.readFileSync(path.join(root,rel),"utf8");
const failures=[];
const schema=read("prisma/schema.prisma");
for(const v of ["OfficialAssignmentStatus","checkedInAt","checkedOutAt","assignedById"]) if(!schema.includes(v)) failures.push(`Schema missing ${v}`);
const service=read("src/modules/officials/service.js");
for(const v of ["OFFICIAL_DOUBLE_BOOKED","getAssignmentsForUsers","canStaffScoreMatch","CHECKED_IN"]) if(!service.includes(v)) failures.push(`Official service missing ${v}`);
const matchRoute=read("src/app/api/tournaments/[tournamentId]/matches/[matchesId]/route.js");
if(!matchRoute.includes("SCORER_NOT_ASSIGNED")) failures.push("Match-scoped scorer authorization missing");
const page=read("src/app/(protected)/dashboard/tournaments/[tournamentId]/staff/page.jsx");
if(!page.includes("Coverage gaps")) failures.push("Staff operations page missing coverage view");
if(failures.length){console.error("Staff officials static check FAILED");failures.forEach(x=>console.error(`- ${x}`));process.exit(1)}
console.log("Staff officials static check passed");
