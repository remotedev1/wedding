import fs from "node:fs";
import path from "node:path";

const root=path.resolve(process.cwd());
const read=(rel)=>fs.readFileSync(path.join(root,rel),"utf8");
const failures=[];

const publicService=read("src/modules/tournaments/server/public.js");
if(!publicService.includes('publicationStatus: "PUBLISHED"')) failures.push("Public tournament snapshot does not restrict fixtures to PUBLISHED.");
if(publicService.includes("matches: tournament._count.matches")) failures.push("Public match count exposes hidden fixture totals.");
if(!publicService.includes('where: { status: { in: ["ASSIGNED", "CHECKED_IN", "COMPLETED"] } }')) failures.push("Public match officials are not projected through a safe assignment-status filter.");

const home=read("src/app/(client)/page.js");
if(!home.includes("PublicLiveTicker")) failures.push("Homepage live ticker missing.");

const tournament=read("src/app/(client)/tournament/page.jsx");
if(!tournament.includes("PublicLiveTicker")) failures.push("Tournament centre live ticker missing.");

const center=read("src/modules/tournaments/components/public/TournamentCenter.jsx");
if(!center.includes("tickerOffset")) failures.push("Tournament centre ticker spacing integration missing.");

const matchPage=read("src/app/(client)/tournament/matches/[matchId]/page.jsx");
if(!matchPage.includes("generateMetadata")) failures.push("Dynamic public match metadata missing.");

const header=read("src/modules/public/components/Header.jsx");
if(!header.includes("siteConfig.publicNavigation")) failures.push("Public header is not using centralized navigation config.");

for(const rel of [
  "src/app/(client)/loading.jsx",
  "src/app/(client)/tournament/loading.jsx",
  "src/app/(client)/tournament/matches/[matchId]/loading.jsx",
]){
  if(!fs.existsSync(path.join(root,rel))) failures.push(`Loading state missing: ${rel}`);
}

if(failures.length){
  console.error("Public sports portal static check FAILED");
  failures.forEach(item=>console.error(`- ${item}`));
  process.exit(1);
}
console.log("Public sports portal static check passed");
