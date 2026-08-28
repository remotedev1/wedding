import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const tournamentRepository = {
  listTournaments({where,skip,take,orderBy}) {
    return Promise.all([
      db.tournament.findMany({
        where,skip,take,orderBy,
        include:{games:true,participation:true,matches:true,placements:true},
      }),
      db.tournament.count({where}),
    ]);
  },
  createTournament(data) {
    return db.tournament.create({
      data,
      include:{games:true,participation:true,matches:true,placements:true},
    });
  },
  getTournament(id, include) {
    return db.tournament.findUnique({where:{id},include});
  },
  getTournamentRaw(id) { return db.tournament.findUnique({where:{id}}); },
  updateTournament(id,data,include) { return db.tournament.update({where:{id},data,include}); },
  deleteTournament(id) { return db.tournament.delete({where:{id}}); },

  listGames({where,skip,take,orderBy}) {
    return Promise.all([
      db.tournamentGame.findMany({
        where,skip,take,orderBy,
        include:{tournament:{select:{id:true,name:true}},_count:{select:{registrations:true,matches:true}}},
      }),
      db.tournamentGame.count({where}),
    ]);
  },
  getGame(id) {
    return db.tournamentGame.findUnique({
      where:{id},
      include:{
        tournament:{select:{id:true,name:true,year:true}},
        registrations:{select:{id:true,createdAt:true},orderBy:{createdAt:"desc"}},
        matches:{select:{id:true,scheduledOn:true},orderBy:{scheduledOn:"desc"}},
        _count:{select:{registrations:true,matches:true}},
      },
    });
  },
  getGameForMutation(id) {
    return db.tournamentGame.findUnique({
      where:{id},
      include:{tournament:{select:{id:true,name:true,startDate:true,endDate:true}},_count:{select:{registrations:true,matches:true}}},
    });
  },
  findGameNameDuplicate(tournamentId,name,excludeId=null) {
    return db.tournamentGame.findFirst({where:{tournamentId,name,...(excludeId?{id:{not:excludeId}}:{})},select:{id:true}});
  },
  getTournamentForGame(id) {
    return db.tournament.findUnique({where:{id},select:{id:true,name:true,startDate:true,endDate:true,registrationDeadline:true,status:true}});
  },
  createGame(data) {
    return db.tournamentGame.create({
      data,
      include:{tournament:{select:{id:true,name:true}},_count:{select:{registrations:true,matches:true}}},
    });
  },
  updateGame(id,data) {
    return db.tournamentGame.update({
      where:{id},data,
      include:{tournament:{select:{id:true,name:true}},_count:{select:{registrations:true,matches:true}}},
    });
  },
  deleteGame(id) { return db.tournamentGame.delete({where:{id}}); },

  listVenues(tournamentId, activeOnly=false) {
    return db.tournamentVenue.findMany({
      where:{tournamentId,...(activeOnly?{isActive:true}:{})},
      orderBy:activeOnly?{name:"asc"}:[{sortOrder:"asc"},{name:"asc"}],
      ...(activeOnly?{select:{id:true,name:true,shortName:true}}:{}),
    });
  },
  getVenue(tournamentId,id) { return db.tournamentVenue.findFirst({where:{id,tournamentId}}); },
  findVenueDuplicate(tournamentId,name,excludeId=null) {
    return db.tournamentVenue.findFirst({
      where:{tournamentId,name:{equals:name,mode:"insensitive"},...(excludeId?{id:{not:excludeId}}:{})},
      select:{id:true},
    });
  },
  getTournamentVenueContext(id) {
    return db.tournament.findUnique({where:{id},select:{id:true,name:true,_count:{select:{venues:true}}}});
  },
  createVenue(data) { return db.tournamentVenue.create({data}); },
  updateVenue(id,data) { return db.tournamentVenue.update({where:{id},data}); },
  deleteVenue(id) { return db.tournamentVenue.delete({where:{id}}); },
  countVenueMatches(venueId) { return db.matches.count({where:{venueId,status:{not:"CANCELLED"}}}); },

  getFixtureGenerationGame(tournamentId,gameId) {
    return db.tournamentGame.findFirst({
      where:{id:gameId,tournamentId,isActive:true},
      include:{
        tournament:{select:{id:true,name:true,startDate:true,endDate:true}},
        registrations:{
          where:{status:"CONFIRMED"},
          include:{participation:{include:{family:{select:{id:true,familyName:true}}}}},
        },
      },
    });
  },
  countExistingGameFixtures(tournamentId,gameId) {
    return db.matches.count({where:{tournamentId,gameId,status:{not:"CANCELLED"}}});
  },
  listSchedulingMatches(tournamentId, excludeId=null) {
    return db.matches.findMany({
      where:{
        tournamentId,
        ...(excludeId?{id:{not:excludeId}}:{}),
        status:{notIn:["CANCELLED","POSTPONED","ABANDONED"]},
      },
      select:{id:true,matchNo:true,sport:true,venue:true,venueId:true,scheduledOn:true,durationMinutes:true,participants:true},
    });
  },
  getMaxMatchNo(tournamentId,sport) {
    return db.matches.aggregate({where:{tournamentId,sport},_max:{matchNo:true}});
  },
  updateRegistrationPool(id,pool) { return db.gameRegistration.update({where:{id},data:{pool}}); },
  createMatch(data) { return db.matches.create({data}); },
  createMatches(data) { return db.matches.createMany({data}); },


  async acquireOperationLock(key, staleMs=120000) {
    try {
      const lock=await db.tournamentProgressionLock.create({data:{key}});
      return {owner:true,lock};
    } catch(error) {
      if(!(error instanceof Prisma.PrismaClientKnownRequestError)||error.code!=="P2002") throw error;
      const existing=await db.tournamentProgressionLock.findUnique({where:{key}});
      if(existing&&!existing.matchId&&Date.now()-new Date(existing.updatedAt).getTime()>staleMs) {
        const removed=await db.tournamentProgressionLock.deleteMany({where:{id:existing.id,matchId:null,updatedAt:existing.updatedAt}});
        if(removed.count===1) return this.acquireOperationLock(key,staleMs);
      }
      return {owner:false,lock:existing};
    }
  },
  releaseOperationLock(id) { return db.tournamentProgressionLock.delete({where:{id}}).catch(()=>undefined); },
  async commitPoolFixtures(poolAssignments,fixtures) {
    return db.$transaction(async tx=>{
      for(const item of poolAssignments) await tx.gameRegistration.update({where:{id:item.id},data:{pool:item.pool}});
      const created=[];
      for(const fixture of fixtures) created.push(await tx.matches.create({data:fixture}));
      return created;
    });
  },
  async commitKnockoutFixtures(fixtures) {
    return db.$transaction(async tx=>{
      const created=[];
      for(const fixture of fixtures) created.push(await tx.matches.create({data:fixture}));
      return created;
    });
  },

  getScheduleRows(tournamentId) {
    return db.matches.findMany({
      where:{tournamentId,status:{not:"CANCELLED"}},
      orderBy:[{scheduledOn:"asc"},{matchNo:"asc"}],
      include:{
        game:{select:{id:true,name:true,shortName:true,matchDurationMinutes:true}},
        venueRef:{select:{id:true,name:true,shortName:true}},
        officials:{select:{id:true,role:true,name:true}},
      },
      take:500,
    });
  },
  getScheduleMatch(tournamentId,id) {
    return db.matches.findFirst({where:{id,tournamentId},include:{game:{select:{matchDurationMinutes:true}}}});
  },
  updateMatch(id,data) { return db.matches.update({where:{id},data}); },
  countMatchesByIds(tournamentId,ids) { return db.matches.count({where:{id:{in:ids},tournamentId}}); },
  bulkPublishMatches(tournamentId,ids,publicationStatus) {
    return db.matches.updateMany({where:{id:{in:ids},tournamentId,status:{not:"LIVE"}},data:{publicationStatus}});
  },

  getKnockoutGame(tournamentId,gameId) {
    return db.tournamentGame.findFirst({where:{id:gameId,tournamentId},select:{id:true,name:true,sportType:true}});
  },
  countKnockoutFixtures(tournamentId,gameId) {
    return db.matches.count({where:{tournamentId,gameId,round:{not:"POOL_STAGE"},status:{not:"CANCELLED"}}});
  },
  listPoolMatches(tournamentId,gameId, completedOnly=false) {
    return db.matches.findMany({
      where:{tournamentId,gameId,round:"POOL_STAGE",...(completedOnly?{status:{in:["COMPLETED","WALKOVER"]}}:{})},
      ...(completedOnly?{orderBy:[{pool:"asc"},{matchNo:"asc"}]}:{}),
    });
  },

  listPlacements(tournamentId) {
    return db.tournamentPlacement.findMany({
      where:{tournamentId},
      include:{family:{select:{id:true,familyName:true,images:true}},game:{select:{id:true,name:true,sportType:true,category:true}}},
      orderBy:[{sport:"asc"},{placement:"asc"}],
    });
  },
  getPlacementContext(tournamentId,familyId,gameId) {
    return Promise.all([
      db.tournamentParticipation.findUnique({
        where:{tournamentId_familyId:{tournamentId,familyId}},
        include:{family:{select:{familyName:true}},gameRegistrations:{where:{gameId},select:{id:true,status:true}}},
      }),
      db.tournamentGame.findFirst({where:{id:gameId,tournamentId},select:{id:true,name:true,sportType:true}}),
    ]);
  },
  findPlacementDuplicate(tournamentId,gameId,placement) {
    return db.tournamentPlacement.findFirst({where:{tournamentId,gameId,placement},select:{id:true}});
  },
  createPlacement(data) {
    return db.tournamentPlacement.create({
      data,
      include:{family:{select:{id:true,familyName:true,images:true}},game:{select:{id:true,name:true,sportType:true,category:true}}},
    });
  },
  getPlacement(tournamentId,id) {
    return db.tournamentPlacement.findFirst({where:{id,tournamentId},include:{family:{select:{familyName:true}}}});
  },
  deletePlacement(id) { return db.tournamentPlacement.delete({where:{id}}); },

  listResultsGames(tournamentId) {
    return db.tournamentGame.findMany({where:{tournamentId},orderBy:{name:"asc"},select:{id:true,name:true,shortName:true,sportType:true,category:true}});
  },
  listResultsMatches(tournamentId) {
    return db.matches.findMany({
      where:{tournamentId,status:{not:"CANCELLED"}},
      orderBy:[{gameId:"asc"},{matchNo:"asc"}],
      include:{manOfTheMatch:{select:{id:true,playerName:true,displayName:true}}},
      take:1000,
    });
  },
  listResultsPlacements(tournamentId) {
    return db.tournamentPlacement.findMany({where:{tournamentId},include:{family:{select:{id:true,familyName:true}},game:{select:{id:true,name:true}}}});
  },
};
