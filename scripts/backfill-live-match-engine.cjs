const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$runCommandRaw({
    update: "Matches",
    updates: [
      { q: { clockRunning: { $exists: false } }, u: { $set: { clockRunning: false } }, multi: true },
      { q: { clockAccumulatedSeconds: { $exists: false } }, u: { $set: { clockAccumulatedSeconds: 0 } }, multi: true },
      { q: { controlVersion: { $exists: false } }, u: { $set: { controlVersion: 0 } }, multi: true },
      { q: { resultVersion: { $exists: false } }, u: { $set: { resultVersion: 0 } }, multi: true },
    ],
  });
  console.log("Live match engine backfill complete", result);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
