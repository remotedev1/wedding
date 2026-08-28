import { db } from "@/lib/db";

export const officialRepository = {
  getMatch(tournamentId, matchId) {
    return db.matches.findFirst({
      where: { id: matchId, tournamentId },
      include: {
        tournament: { select: { id:true,name:true } },
        game: { select: { id:true,name:true,shortName:true,matchDurationMinutes:true } },
        venueRef: { select: { id:true,name:true,shortName:true } },
        officials: { orderBy: [{ role:"asc" },{ name:"asc" }] },
      },
    });
  },
  listMatchOfficials(matchId) {
    return db.matchOfficial.findMany({
      where: { matchId, status: { not:"CANCELLED" } },
      orderBy: [{ role:"asc" },{ name:"asc" }],
    });
  },
  listActiveStaff() {
    return db.user.findMany({
      where: {
        isActive:true,
        isBlocked:false,
        role:{in:["SUPER_ADMIN","ADMIN","SCORER","MODERATOR"]},
      },
      orderBy:[{firstName:"asc"},{lastName:"asc"}],
      select:{id:true,firstName:true,lastName:true,email:true,phoneNumber:true,role:true},
      take:500,
    });
  },
  getUser(userId) {
    return db.user.findFirst({
      where:{id:userId,isActive:true,isBlocked:false},
      select:{id:true,firstName:true,lastName:true,email:true,phoneNumber:true,role:true},
    });
  },
  getAssignmentsForUser(userId, start, end, excludeMatchId=null) {
    return db.matchOfficial.findMany({
      where:{
        userId,
        status:{notIn:["CANCELLED","NO_SHOW"]},
        ...(excludeMatchId?{matchId:{not:excludeMatchId}}:{}),
        match:{is:{
          scheduledOn:{gte:start,lte:end},
          status:{notIn:["CANCELLED","POSTPONED","ABANDONED","NO_RESULT"]},
        }},
      },
      include:{
        match:{
          select:{
            id:true,matchNo:true,name:true,scheduledOn:true,durationMinutes:true,venue:true,
            game:{select:{name:true,shortName:true,matchDurationMinutes:true}},
          },
        },
      },
      take:100,
    });
  },
  getAssignmentsForUsers(userIds, start, end, excludeMatchId=null) {
    if (!userIds.length) return [];
    return db.matchOfficial.findMany({
      where:{
        userId:{in:userIds},
        status:{notIn:["CANCELLED","NO_SHOW"]},
        ...(excludeMatchId?{matchId:{not:excludeMatchId}}:{}),
        match:{is:{
          scheduledOn:{gte:start,lte:end},
          status:{notIn:["CANCELLED","POSTPONED","ABANDONED","NO_RESULT"]},
        }},
      },
      include:{
        match:{
          select:{
            id:true,matchNo:true,name:true,scheduledOn:true,durationMinutes:true,venue:true,
            game:{select:{name:true,shortName:true,matchDurationMinutes:true}},
          },
        },
      },
      take:2000,
    });
  },
  create(data){ return db.matchOfficial.create({data}); },
  update(id,data){ return db.matchOfficial.update({where:{id},data}); },
  findOnMatch(id,matchId){ return db.matchOfficial.findFirst({where:{id,matchId}}); },
};
