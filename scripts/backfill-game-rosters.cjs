const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$runCommandRaw({
    update: "GameRegistration",
    updates: [
      {
        q: { roster: { $exists: false } },
        u: { $set: { roster: [] } },
        multi: true,
      },
    ],
  });
  console.log("GameRegistration roster backfill complete:", result);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
