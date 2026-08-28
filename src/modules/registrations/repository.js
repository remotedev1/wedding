import { db } from "@/lib/db";

export const registrationRepository = {
  findParticipation(tournamentId, familyId) {
    return db.tournamentParticipation.findUnique({
      where: { tournamentId_familyId: { tournamentId, familyId } },
    });
  },
  findEventRegistration(gameId, participationId) {
    return db.gameRegistration.findUnique({
      where: { gameId_participationId: { gameId, participationId } },
    });
  },
  findEventRegistrationById(id) {
    return db.gameRegistration.findUnique({ where: { id } });
  },
  createParticipation(data) {
    return db.tournamentParticipation.create({ data });
  },
  createRegistration(data) {
    return db.gameRegistration.create({ data });
  },
  updateRegistration(id, data, args = {}) {
    return db.gameRegistration.update({ where: { id }, data, ...args });
  },
  updateRegistrations(where, data) {
    return db.gameRegistration.updateMany({ where, data });
  },
};
