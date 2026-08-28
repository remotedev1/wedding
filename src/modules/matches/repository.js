import { db } from "@/lib/db";

export const matchRepository = {
  findForControl(tournamentId, matchId) {
    return db.matches.findFirst({
      where: { id: matchId, tournamentId },
      include: { tournament: { select: { id: true, name: true } } },
    });
  },

  async compareAndSwap(matchId, expectedVersion, data) {
    const result = await db.matches.updateMany({
      where: { id: matchId, controlVersion: expectedVersion },
      data: { ...data, controlVersion: { increment: 1 }, updatedAt: new Date() },
    });
    return result.count === 1;
  },

  getDetailed(matchId) {
    return db.matches.findUnique({
      where: { id: matchId },
      include: {
        tournament: { select: { id: true, name: true } },
        game: { select: { id: true, name: true, icon: true, matchDurationMinutes: true, scoringConfig: true } },
        manOfTheMatch: { select: { id: true, playerName: true, displayName: true } },
        events: { orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 250 },
        officials: { orderBy: { role: "asc" } },
        venueRef: true,
      },
    });
  },

  findActionEvent(matchId, actionId) {
    if (!actionId) return null;
    return db.matchEvent.findFirst({ where: { matchId, actionId }, select: { id: true, actionId: true } });
  },
};
