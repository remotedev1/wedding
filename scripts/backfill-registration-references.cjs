const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function cleanCode(value, fallback) {
  const code = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
  return code || fallback;
}

function reference(registration) {
  const tournament = registration.participation.tournament;
  const game = registration.game;
  const tournamentCode = cleanCode(tournament.shortName || tournament.name, "TRN");
  const eventCode = cleanCode(game.eventCode || game.shortName || game.name, "EVT");
  return `${tournamentCode}-${tournament.year || new Date().getFullYear()}-${eventCode}-${registration.id.slice(-6).toUpperCase()}`;
}

async function main() {
  const rows = await prisma.gameRegistration.findMany({
    where: { registrationReference: null },
    include: {
      game: { select: { name: true, shortName: true, eventCode: true } },
      participation: { include: { tournament: { select: { name: true, shortName: true, year: true } } } },
    },
  });
  let updated = 0;
  for (const row of rows) {
    await prisma.gameRegistration.update({ where: { id: row.id }, data: { registrationReference: reference(row) } });
    updated += 1;
  }
  console.log(`Registration references backfilled: ${updated}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
