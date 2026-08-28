import slugifyPackage from "slugify";
import { slugify as appSlugify } from "@/lib/utils";
import { tournamentRepository } from "@/modules/tournaments/repository";

export class TournamentCoreError extends Error {
  constructor(message,status=409,details={}) { super(message); this.name="TournamentCoreError"; this.status=status; this.details=details; }
}

export async function listTournaments(args) {
  const [tournaments,total]=await tournamentRepository.listTournaments(args);
  return {tournaments,total};
}

export async function createTournament(input,userId) {
  const startDate=new Date(input.startDate);
  const endDate=new Date(input.endDate);
  if(endDate<=startDate) throw new TournamentCoreError("End date must be after start date",400);
  if(input.registrationDeadline&&new Date(input.registrationDeadline)>=startDate) {
    throw new TournamentCoreError("Registration deadline must be before the tournament starts",400);
  }
  const status=input.status||"DRAFT";
  const visibility=input.visibility||"PUBLIC";
  return tournamentRepository.createTournament({
    name:input.name,
    shortName:input.shortName||input.name,
    slug:appSlugify(`${input.name}-${input.year}`),
    year:input.year,
    timezone:input.timezone||"Asia/Kolkata",
    visibility,
    publishedAt:visibility==="PUBLIC"&&status!=="DRAFT"?new Date():null,
    startDate,endDate,
    registrationDeadline:input.registrationDeadline?new Date(input.registrationDeadline):null,
    status,
    description:input.description||null,
    info:input.info||[],
    images:input.images||[],
    createdBy:{connect:{id:userId}},
  });
}

export async function getTournament(id,options={}) {
  const include={
    participation:options.includeParticipation?{
      include:{
        family:{select:{id:true,familyName:true,images:true,_count:{select:{players:{where:{isActive:true}}}}}},
        gameRegistrations:{select:{
          id:true,gameId:true,status:true,paymentStatus:true,paymentAmount:true,pool:true,confirmedAt:true,
          roster:true,captainPlayerId:true,managerName:true,managerPhone:true,rosterLockedAt:true,
          game:{select:{id:true,name:true,sportType:true,category:true}},
        }},
      },
    }:false,
    games:options.includeGames?{orderBy:{date:"asc"},include:{_count:{select:{registrations:true,matches:true}}}}:false,
    matches:options.includeMatches?{orderBy:{scheduledOn:"asc"}}:false,
    placements:options.includePlacements?{
      include:{family:{select:{id:true,familyName:true,images:true,_count:{select:{players:{where:{isActive:true}}}}}}},
    }:false,
    _count:{select:{participation:true,matches:true,placements:true,games:true}},
  };
  const tournament=await tournamentRepository.getTournament(id,include);
  if(!tournament) throw new TournamentCoreError("Tournament not found",404);
  return tournament;
}

export async function updateTournament(id,input) {
  const existing=await tournamentRepository.getTournamentRaw(id);
  if(!existing) throw new TournamentCoreError("Tournament not found",404);
  const start=input.startDate?new Date(input.startDate):existing.startDate;
  const end=input.endDate?new Date(input.endDate):existing.endDate;
  if(end<=start) throw new TournamentCoreError("End date must be after start date",400);
  const deadline=input.registrationDeadline!==undefined
    ? (input.registrationDeadline?new Date(input.registrationDeadline):null)
    : existing.registrationDeadline;
  if(deadline&&deadline>=start) throw new TournamentCoreError("Registration deadline must be before start date",400);

  const data={
    ...(input.name!==undefined&&{name:input.name,slug:appSlugify(`${input.name}-${input.year||existing.year}`)}),
    ...(input.shortName!==undefined&&{shortName:input.shortName||null}),
    ...(input.year!==undefined&&{year:input.year,...(!input.name&&{slug:appSlugify(`${existing.name}-${input.year}`)})}),
    ...(input.timezone!==undefined&&{timezone:input.timezone}),
    ...(input.visibility!==undefined&&{visibility:input.visibility}),
    ...(input.startDate!==undefined&&{startDate:start}),
    ...(input.endDate!==undefined&&{endDate:end}),
    ...(input.registrationDeadline!==undefined&&{registrationDeadline:deadline}),
    ...(input.status!==undefined&&{status:input.status}),
    ...(input.description!==undefined&&{description:input.description||null}),
    ...(input.info!==undefined&&{info:input.info}),
    ...(input.images!==undefined&&{images:input.images}),
  };
  const nextVisibility=input.visibility??existing.visibility;
  const nextStatus=input.status??existing.status;
  if(nextVisibility==="PUBLIC"&&nextStatus!=="DRAFT"&&!existing.publishedAt) data.publishedAt=new Date();
  if(input.visibility&&input.visibility!=="PUBLIC") data.publishedAt=null;

  return tournamentRepository.updateTournament(id,data,{_count:{select:{participation:true,matches:true,placements:true}}});
}

export async function deleteTournament(id) {
  const tournament=await tournamentRepository.getTournament(id,{
    _count:{select:{participation:true,matches:true,placements:true}},
  });
  if(!tournament) throw new TournamentCoreError("Tournament not found",404);
  const hasData=tournament._count.participation>0||tournament._count.matches>0||tournament._count.placements>0;
  if(hasData) {
    const value=await tournamentRepository.updateTournament(id,{status:"CANCELLED"});
    return {mode:"cancelled",tournament:value};
  }
  await tournamentRepository.deleteTournament(id);
  return {mode:"deleted",tournament};
}

export async function listGames(args) {
  const [games,total]=await tournamentRepository.listGames(args);
  return {games,total};
}

function validateGameDates(input,tournament,current={}) {
  const date=input.date??current.date;
  if(!date) throw new TournamentCoreError("Game date is required",400);
  if(date<tournament.startDate||date>tournament.endDate) throw new TournamentCoreError("Game date must fall within the tournament dates",400);
  const deadline=input.registrationDeadline!==undefined?input.registrationDeadline:current.registrationDeadline;
  if(deadline&&deadline>=date) throw new TournamentCoreError("Game registration deadline must be before the game date",400);
  const min=input.minAge!==undefined?input.minAge:current.minAge;
  const max=input.maxAge!==undefined?input.maxAge:current.maxAge;
  if(min!=null&&max!=null&&min>max) throw new TournamentCoreError("Minimum age cannot exceed maximum age",400);
  const minRoster=input.minRosterSize!==undefined?input.minRosterSize:current.minRosterSize;
  const maxRoster=input.maxRosterSize!==undefined?input.maxRosterSize:current.maxRosterSize;
  if(minRoster!=null&&maxRoster!=null&&minRoster>maxRoster) throw new TournamentCoreError("Minimum roster size cannot exceed maximum roster size",400);
}

export async function createGame(input) {
  const tournament=await tournamentRepository.getTournamentForGame(input.tournamentId);
  if(!tournament) throw new TournamentCoreError("Selected tournament does not exist",400);
  validateGameDates(input,tournament);
  if(await tournamentRepository.findGameNameDuplicate(input.tournamentId,input.name)) {
    throw new TournamentCoreError("A game with this name already exists in this tournament",409);
  }
  const data={
    tournamentId:input.tournamentId,sportType:input.sportType,name:input.name,
    shortName:input.shortName||input.name,slug:slugifyPackage(input.name,{lower:true,strict:true}),
    eventCode:input.eventCode||null,format:input.format||null,category:input.category,date:input.date,
    registrationDeadline:input.registrationDeadline||null,registrationFee:input.registrationFee,
    registrationFeeMinor:Math.round(Number(input.registrationFee||0)*100),
    matchDurationMinutes:input.matchDurationMinutes||null,minimumRestMinutes:input.minimumRestMinutes??30,
    teamSize:input.teamSize||null,minRosterSize:input.minRosterSize||null,maxRosterSize:input.maxRosterSize||null,
    minAge:input.minAge??null,maxAge:input.maxAge??null,eligibilityCutoffDate:input.eligibilityCutoffDate||null,
    allowedGenders:input.allowedGenders||[],pointsConfig:{win:3,draw:1,loss:0},
    tieBreakerConfig:["points","difference","scored","wins","name"],isActive:input.isActive,
    icon:input.icon||null,description:input.description||null,rules:input.rules||null,
  };
  return {game:await tournamentRepository.createGame(data),tournament};
}

export async function getGame(id) {
  const game=await tournamentRepository.getGame(id);
  if(!game) throw new TournamentCoreError("Tournament game not found",404);
  return game;
}

export async function updateGame(id,input) {
  const existing=await tournamentRepository.getGameForMutation(id);
  if(!existing) throw new TournamentCoreError("Tournament game not found",404);
  validateGameDates(input,existing.tournament,existing);
  if(input.name&&input.name!==existing.name&&await tournamentRepository.findGameNameDuplicate(existing.tournamentId,input.name,id)) {
    throw new TournamentCoreError("A game with this name already exists in this tournament",409);
  }
  const data={
    ...(input.sportType!==undefined&&{sportType:input.sportType}),
    ...(input.name!==undefined&&{name:input.name,slug:slugifyPackage(input.name,{lower:true,strict:true})}),
    ...(input.shortName!==undefined&&{shortName:input.shortName}),
    ...(input.eventCode!==undefined&&{eventCode:input.eventCode}),
    ...(input.format!==undefined&&{format:input.format}),
    ...(input.category!==undefined&&{category:input.category}),
    ...(input.date!==undefined&&{date:input.date}),
    ...(input.registrationDeadline!==undefined&&{registrationDeadline:input.registrationDeadline}),
    ...(input.registrationFee!==undefined&&{registrationFee:input.registrationFee,registrationFeeMinor:Math.round(Number(input.registrationFee||0)*100)}),
    ...(input.matchDurationMinutes!==undefined&&{matchDurationMinutes:input.matchDurationMinutes}),
    ...(input.minimumRestMinutes!==undefined&&{minimumRestMinutes:input.minimumRestMinutes}),
    ...(input.teamSize!==undefined&&{teamSize:input.teamSize}),
    ...(input.minRosterSize!==undefined&&{minRosterSize:input.minRosterSize}),
    ...(input.maxRosterSize!==undefined&&{maxRosterSize:input.maxRosterSize}),
    ...(input.minAge!==undefined&&{minAge:input.minAge}),
    ...(input.maxAge!==undefined&&{maxAge:input.maxAge}),
    ...(input.eligibilityCutoffDate!==undefined&&{eligibilityCutoffDate:input.eligibilityCutoffDate}),
    ...(input.allowedGenders!==undefined&&{allowedGenders:input.allowedGenders}),
    ...(input.isActive!==undefined&&{isActive:input.isActive}),
    ...(input.icon!==undefined&&{icon:input.icon}),
    ...(input.description!==undefined&&{description:input.description}),
    ...(input.rules!==undefined&&{rules:input.rules}),
    updatedAt:new Date(),
  };
  return {game:await tournamentRepository.updateGame(id,data),existing};
}

export async function deleteGame(id) {
  const game=await tournamentRepository.getGameForMutation(id);
  if(!game) throw new TournamentCoreError("Tournament game not found",404);
  const associations=[];
  if(game._count.registrations>0) associations.push(`${game._count.registrations} registration(s)`);
  if(game._count.matches>0) associations.push(`${game._count.matches} match(es)`);
  if(associations.length) throw new TournamentCoreError(`Cannot delete game. It is associated with ${associations.join(", ")}. Please remove the associations first.`,400);
  await tournamentRepository.deleteGame(id);
  return game;
}

export async function listVenues(tournamentId) {
  return tournamentRepository.listVenues(tournamentId);
}

export async function createVenue(tournamentId,input) {
  const tournament=await tournamentRepository.getTournamentVenueContext(tournamentId);
  if(!tournament) throw new TournamentCoreError("Tournament not found",404);
  if(await tournamentRepository.findVenueDuplicate(tournamentId,input.name)) throw new TournamentCoreError("A venue with this name already exists",409);
  const venue=await tournamentRepository.createVenue({
    tournamentId,name:input.name,shortName:input.shortName||input.name,
    slug:slugifyPackage(input.name,{lower:true,strict:true}),address:input.address||null,
    capacity:input.capacity??null,isActive:input.isActive,sortOrder:tournament._count.venues,
  });
  return {venue,tournament};
}

export async function updateVenue(tournamentId,venueId,input) {
  const existing=await tournamentRepository.getVenue(tournamentId,venueId);
  if(!existing) throw new TournamentCoreError("Venue not found",404);
  if(input.name&&input.name!==existing.name&&await tournamentRepository.findVenueDuplicate(tournamentId,input.name,venueId)) {
    throw new TournamentCoreError("A venue with this name already exists",409);
  }
  return tournamentRepository.updateVenue(existing.id,{
    ...input,
    ...(input.name?{slug:slugifyPackage(input.name,{lower:true,strict:true})}:{}),
  });
}

export async function deleteVenue(tournamentId,venueId) {
  const existing=await tournamentRepository.getVenue(tournamentId,venueId);
  if(!existing) throw new TournamentCoreError("Venue not found",404);
  const count=await tournamentRepository.countVenueMatches(existing.id);
  if(count) throw new TournamentCoreError(`Venue is linked to ${count} active match(es). Disable it instead of deleting it.`,409);
  await tournamentRepository.deleteVenue(existing.id);
  return existing;
}
