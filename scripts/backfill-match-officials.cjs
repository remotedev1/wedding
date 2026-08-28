const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$runCommandRaw({
    update: "MatchOfficial",
    updates: [
      { q: { status: { $exists: false } }, u: { $set: { status: "ASSIGNED" } }, multi: true },
      { q: { checkedInAt: { $exists: false } }, u: { $set: { checkedInAt: null } }, multi: true },
      { q: { checkedOutAt: { $exists: false } }, u: { $set: { checkedOutAt: null } }, multi: true },
      { q: { assignedById: { $exists: false } }, u: { $set: { assignedById: null } }, multi: true },
    ],
  });
  console.log("Match official backfill complete", result);
}
main().catch((error)=>{console.error(error);process.exitCode=1}).finally(async()=>prisma.$disconnect());
