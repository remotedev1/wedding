import fs from "node:fs";
import path from "node:path";
const root=path.resolve(process.cwd());
const read=(rel)=>fs.readFileSync(path.join(root,rel),"utf8");
const failures=[];

const ops=read("src/modules/tournaments/server/operations.js");
for(const value of ["fieldOfficialMissing","venueConflicts","setupChecks","collected","getTournamentCommandCenter(tournamentId = null)"]){
  if(!ops.includes(value)) failures.push(`Operations service missing ${value}`);
}
const center=read("src/modules/tournaments/components/admin/TournamentCommandCenter.jsx");
for(const value of ["Now & next","Action queue","Readiness gates","Integrity snapshot","PhaseRail"]){
  if(!center.includes(value)) failures.push(`Command center missing ${value}`);
}
const nav=read("src/modules/tournaments/components/admin/TournamentWorkspaceNav.jsx");
for(const value of ["Operations","Registrations","Schedule","Staff","Results"]){
  if(!nav.includes(value)) failures.push(`Tournament workspace nav missing ${value}`);
}
const policy=read("src/modules/auth/authorization/policy-registry.js");
if(!policy.includes('"/dashboard/tournaments/[tournamentId]/operations"')) failures.push("Scoped tournament operations route policy missing");
if(failures.length){console.error("Admin operations UX static check FAILED");failures.forEach(x=>console.error(`- ${x}`));process.exit(1)}
console.log("Admin operations UX static check passed");
