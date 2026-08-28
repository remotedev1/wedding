import fs from "node:fs";
import path from "node:path";

const root=path.resolve(process.cwd());
const read=(rel)=>fs.readFileSync(path.join(root,rel),"utf8");
const failures=[];

const routes=[
  "src/app/api/tournaments/route.js",
  "src/app/api/tournaments/[tournamentId]/route.js",
  "src/app/api/tournaments/games/route.js",
  "src/app/api/tournaments/games/[gamesId]/route.js",
  "src/app/api/tournaments/[tournamentId]/venues/route.js",
  "src/app/api/tournaments/[tournamentId]/venues/[venueId]/route.js",
  "src/app/api/tournaments/[tournamentId]/fixtures/generate/route.js",
  "src/app/api/tournaments/[tournamentId]/knockout/generate/route.js",
  "src/app/api/tournaments/[tournamentId]/matches/schedule-board/route.js",
  "src/app/api/tournaments/[tournamentId]/standings/route.js",
  "src/app/api/tournaments/[tournamentId]/placements/route.js",
  "src/app/api/tournaments/[tournamentId]/placements/[placementId]/route.js",
  "src/app/api/tournaments/[tournamentId]/results-center/route.js",
];

for(const rel of routes){
  const source=read(rel);
  if(/\b(?:db|prisma)\./.test(source)) failures.push(`Converted route still accesses Prisma directly: ${rel}`);
  if(source.includes('from "@/lib/db"')) failures.push(`Converted route still imports DB directly: ${rel}`);
  if(!source.includes("setupApiHandler(")) failures.push(`Converted route skipped shared API setup: ${rel}`);
}

for(const rel of [
  "src/modules/tournaments/core-service.js",
  "src/modules/tournaments/fixture-service.js",
  "src/modules/tournaments/results-service.js",
]){
  const source=read(rel);
  if(source.includes('from "@/lib/db"')) failures.push(`Service bypasses repository boundary: ${rel}`);
}

const repository=read("src/modules/tournaments/repository.js");
if(!repository.includes('from "@/lib/db"')) failures.push("Tournament repository does not own database access.");
if(!repository.includes("commitPoolFixtures")) failures.push("Fixture transaction boundary is missing.");
if(!repository.includes("acquireOperationLock")) failures.push("Fixture/knockout generation lock is missing.");

const fixture=read("src/modules/tournaments/fixture-service.js");
for(const invariant of [
  "FIXTURE_GENERATION_BUSY",
  "KNOCKOUT_GENERATION_BUSY",
  "commitPoolFixtures",
  "commitKnockoutFixtures",
  "Venue overlaps Match #",
  "A participating team overlaps Match #",
]){
  if(!fixture.includes(invariant)) failures.push(`Fixture service invariant missing: ${invariant}`);
}

const schemas=read("src/modules/tournaments/schemas/core.js");
for(const name of [
  "createTournamentSchema","updateTournamentSchema","createGameSchema","updateGameSchema",
  "venueSchema","fixtureGenerationSchema","knockoutGenerationSchema","schedulePatchSchema","createPlacementSchema",
]){
  if(!schemas.includes(`const ${name}`)&&!schemas.includes(`const ${name}=`)&&!schemas.includes(`export const ${name}`)) {
    failures.push(`Central tournament schema missing: ${name}`);
  }
}

if(failures.length){
  console.error("Tournament core API architecture check FAILED");
  failures.forEach(item=>console.error(`- ${item}`));
  process.exit(1);
}
console.log("Tournament core API architecture check passed");
