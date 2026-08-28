const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function normalizeName(value = "") {
  return String(value).trim().replace(/\s+/g, " ").toLocaleLowerCase("en-IN");
}

async function main() {
  const familyResult = await prisma.$runCommandRaw({
    update: "Families",
    updates: [{ q: { status: { $exists: false } }, u: { $set: { status: "ACTIVE" } }, multi: true }],
  });
  const gameResult = await prisma.$runCommandRaw({
    update: "TournamentGame",
    updates: [{ q: { allowedGenders: { $exists: false } }, u: { $set: { allowedGenders: [] } }, multi: true }],
  });
  const players = await prisma.player.findMany({ select: { id: true, playerName: true, normalizedName: true, verificationStatus: true } });
  let updatedPlayers = 0;
  for (const player of players) {
    const data = {};
    if (!player.normalizedName) data.normalizedName = normalizeName(player.playerName);
    if (!player.verificationStatus) data.verificationStatus = "UNVERIFIED";
    if (Object.keys(data).length) {
      await prisma.player.update({ where: { id: player.id }, data });
      updatedPlayers += 1;
    }
  }
  console.log("Directory/eligibility backfill complete", { familyResult, gameResult, updatedPlayers });
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
