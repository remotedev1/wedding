import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { registrationRepository } from "@/modules/registrations/repository";
import { buildRegistrationReference, createGuestRegistrationAccess } from "@/modules/registrations/server/guest-access";
import { createPaymentToken } from "@/modules/payments/server/token";

import { evaluateRegistrationReadiness } from "@/modules/registrations/server/readiness";
export class RegistrationConflictError extends Error {
  constructor(message, details = {}) { super(message); this.name = "RegistrationConflictError"; this.details = details; }
}
export class RegistrationValidationError extends Error {
  constructor(message, status = 409) { super(message); this.name = "RegistrationValidationError"; this.status = status; }
}

function minorAmount(game) {
  const value = game.registrationFeeMinor ?? Math.round(Number(game.registrationFee || 0) * 100);
  if (!Number.isInteger(value) || value < 0) throw new RegistrationValidationError("Event registration fee is invalid", 500);
  return value;
}

function existingResponse({ existing, participation, tournamentId, familyId, familyName, gameName }) {
  const amountMinor = Number(existing.paymentAmountMinor ?? Math.round(Number(existing.paymentAmount || 0) * 100));
  const paymentToken = existing.paymentStatus !== "COMPLETED" && amountMinor > 0
    ? createPaymentToken({ participationId: participation.id, tournamentId, familyId, registrationIds: [existing.id] })
    : null;
  throw new RegistrationConflictError(
    paymentToken
      ? `${familyName} is already registered for ${gameName}. Continue the existing payment instead of registering again.`
      : `${familyName} is already registered for ${gameName}. A family can enter an event only once.`,
    {
      code: "ALREADY_REGISTERED",
      registrationId: existing.id,
      paymentUrl: paymentToken ? `/secure/payment?token=${encodeURIComponent(paymentToken)}` : null,
    },
  );
}

export async function createGuestEventRegistration({ tournamentId, familyId, gameId }) {
  const now = new Date();
  const [tournament, family, game] = await Promise.all([
    db.tournament.findUnique({
      where: { id: tournamentId },
      select: { id:true,name:true,shortName:true,year:true,status:true,registrationDeadline:true,visibility:true },
    }),
    db.families.findUnique({
      where: { id: familyId },
      select: { id:true,familyName:true,status:true,_count:{select:{players:{where:{isActive:true}}}} },
    }),
    db.tournamentGame.findFirst({
      where: { id: gameId, tournamentId, isActive:true },
      select: { id:true,name:true,shortName:true,eventCode:true,sportType:true,category:true,registrationFee:true,registrationFeeMinor:true,registrationDeadline:true },
    }),
  ]);

  if (!tournament || tournament.visibility === "PRIVATE") throw new RegistrationValidationError("Tournament not found", 404);
  if (tournament.status !== "REGISTRATION") throw new RegistrationValidationError("Tournament registration is not open");
  if (tournament.registrationDeadline && tournament.registrationDeadline < now) throw new RegistrationValidationError("Tournament registration has closed");
  if (!family || (family.status && family.status !== "ACTIVE")) throw new RegistrationValidationError("Selected family is not available for registration", 404);
  if (!game) throw new RegistrationValidationError("Selected event is unavailable", 404);
  if (game.registrationDeadline && game.registrationDeadline < now) throw new RegistrationValidationError(`Registration has closed for ${game.name}`);

  let participation = await registrationRepository.findParticipation(tournamentId, familyId);
  if (participation) {
    const existing = await registrationRepository.findEventRegistration(gameId, participation.id);
    if (existing) existingResponse({ existing, participation, tournamentId, familyId, familyName:family.familyName, gameName:game.name });
  } else {
    try {
      participation = await registrationRepository.createParticipation({
        tournamentId, familyId, registeredBy:null, registeredVia:"WEB", totalAmountPaid:0,
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
      participation = await registrationRepository.findParticipation(tournamentId, familyId);
      if (!participation) throw error;
    }
  }

  const amountMinor = minorAmount(game);
  let registration;
  try {
    registration = await registrationRepository.createRegistration({
      gameId,
      participationId: participation.id,
      paymentStatus: amountMinor > 0 ? "PENDING" : "COMPLETED",
      paymentAmount: amountMinor / 100,
      paymentAmountMinor: amountMinor,
      paymentDate: amountMinor > 0 ? null : now,
      status: "PENDING",
      roster: [],
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const existing = await registrationRepository.findEventRegistration(gameId, participation.id);
    if (!existing) throw error;
    existingResponse({ existing, participation, tournamentId, familyId, familyName:family.familyName, gameName:game.name });
  }

  const registrationReference = buildRegistrationReference({ tournament, game, registrationId: registration.id });
  registration = await registrationRepository.updateRegistration(registration.id, { registrationReference }, {
    include: { game: { select: { id:true,name:true,sportType:true,category:true } } },
  });

  const guestAccess = createGuestRegistrationAccess({
    registrationId:registration.id, participationId:participation.id, tournamentId, familyId,
  });
  const paymentToken = amountMinor > 0
    ? createPaymentToken({ participationId:participation.id, tournamentId, familyId, registrationIds:[registration.id] })
    : null;

  return {
    participationId:participation.id,
    registrationId:registration.id,
    familyName:family.familyName,
    tournamentName:tournament.name,
    registration,
    totalAmountMinor:amountMinor,
    totalAmount:amountMinor/100,
    paymentRequired:Boolean(paymentToken),
    paymentToken,
    paymentUrl:paymentToken?`/secure/payment?token=${encodeURIComponent(paymentToken)}`:null,
    registrationReference,
    confirmationUrl:`/registration/confirmation?access=${encodeURIComponent(guestAccess)}`,
    activePlayerCount:family._count.players,
    rosterWarning:family._count.players===0?"No active players are currently recorded for this family. Add the roster before competition.":null,
  };
}



export async function updateRegistrationStatus({ tournamentId, participationId, registrationId, status, pool }) {
  const existing = await db.gameRegistration.findFirst({
    where: { id: registrationId, participationId },
    include: {
      game: { select: { name:true,minRosterSize:true,maxRosterSize:true,registrationFeeMinor:true } },
      participation: { include: { family: { select: { familyName:true } } } },
    },
  });
  if (!existing || existing.participation.tournamentId !== tournamentId) {
    throw new RegistrationValidationError("Game registration not found",404);
  }
  if (status === "CONFIRMED") {
    const readiness=evaluateRegistrationReadiness(existing);
    if(!readiness.ready) throw new RegistrationConflictError(
      `Registration is not ready for confirmation: ${readiness.reasons.join("; ")}`,
      {readiness},
    );
  }
  return db.gameRegistration.update({
    where:{id:existing.id},
    data:{
      ...(status!==undefined&&{status,confirmedAt:status==="CONFIRMED"?new Date():null}),
      ...(pool!==undefined&&{pool}),
    },
    include:{game:{select:{id:true,name:true,sportType:true,category:true}}},
  });
}

export async function bulkUpdateRegistrationStatus({ tournamentId, registrationIds, status }) {
  const unique=[...new Set(registrationIds)];
  if(unique.length!==registrationIds.length) throw new RegistrationValidationError("Duplicate registration IDs are not allowed",400);
  const registrations=await db.gameRegistration.findMany({
    where:{id:{in:unique}},
    include:{
      game:{select:{name:true,minRosterSize:true,maxRosterSize:true,registrationFeeMinor:true}},
      participation:{include:{family:{select:{familyName:true}}}},
    },
  });
  if(registrations.length!==unique.length||registrations.some(item=>item.participation.tournamentId!==tournamentId)){
    throw new RegistrationValidationError("Some selected registrations do not belong to this tournament",400);
  }
  if(status==="CONFIRMED"){
    const blocked=registrations.map(item=>({item,readiness:evaluateRegistrationReadiness(item)})).filter(x=>!x.readiness.ready);
    if(blocked.length) throw new RegistrationConflictError(
      `${blocked.length} selected registration(s) are not ready for confirmation`,
      {blocked:blocked.map(({item,readiness})=>({
        registrationId:item.id,familyName:item.participation.family.familyName,eventName:item.game.name,reasons:readiness.reasons,
      }))},
    );
  }
  const result=await db.gameRegistration.updateMany({
    where:{id:{in:unique}},
    data:{status,confirmedAt:status==="CONFIRMED"?new Date():null},
  });
  if(result.count!==unique.length) throw new RegistrationConflictError("Registration state changed during the bulk update. Refresh and retry.");
  return {count:result.count,status};
}
