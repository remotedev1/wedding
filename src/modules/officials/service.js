import { officialRepository } from "@/modules/officials/repository";
import { getMatchDurationMinutes } from "@/modules/tournaments/server/scheduling";

export class OfficialConflictError extends Error {
  constructor(message, details={}) { super(message); this.name="OfficialConflictError"; this.details=details; }
}

function fullName(user){
  return [user.firstName,user.lastName].filter(Boolean).join(" ").trim();
}
function duration(match){
  return Number(match.durationMinutes || match.game?.matchDurationMinutes || getMatchDurationMinutes(match.sport) || 60);
}
function windowFor(match){
  const start=new Date(match.scheduledOn);
  const end=new Date(start.getTime()+duration(match)*60000);
  return {start,end};
}
function overlaps(a,b){ return a.start < b.end && b.start < a.end; }

export async function getOfficialCandidates({tournamentId,matchId}){
  const [match,staff]=await Promise.all([
    officialRepository.getMatch(tournamentId,matchId),
    officialRepository.listActiveStaff(),
  ]);
  if(!match) throw new OfficialConflictError("Match not found",{status:404});
  const target=windowFor(match);
  const searchStart=new Date(target.start.getTime()-12*60*60*1000);
  const searchEnd=new Date(target.end.getTime()+12*60*60*1000);
  const assignments=await officialRepository.getAssignmentsForUsers(
    staff.map(item=>item.id),searchStart,searchEnd,match.id,
  );
  const byUser=new Map();
  for(const assignment of assignments){
    const list=byUser.get(assignment.userId)||[];
    list.push(assignment);byUser.set(assignment.userId,list);
  }
  const result=staff.map(user=>{
    const userAssignments=byUser.get(user.id)||[];
    const conflicts=userAssignments.filter(item=>overlaps(target,windowFor(item.match)));
    return {
      ...user,
      name:fullName(user),
      conflicts:conflicts.map(item=>({
        officialId:item.id,role:item.role,matchId:item.match.id,
        matchNo:item.match.matchNo,name:item.match.name,
        scheduledOn:item.match.scheduledOn,venue:item.match.venue,
      })),
      available:conflicts.length===0,
      workloadToday:userAssignments.filter(item=>{
        const d=new Date(item.match.scheduledOn),t=new Date(match.scheduledOn);
        return d.toDateString()===t.toDateString();
      }).length,
    };
  });
  return {match,staff:result};
}

export async function assignOfficial({
  tournamentId,matchId,role,userId,name,phone,notes,actorId,
}){
  const match=await officialRepository.getMatch(tournamentId,matchId);
  if(!match) throw new OfficialConflictError("Match not found",{status:404});

  let resolvedName=name?.trim()||"";
  let resolvedPhone=phone?.trim()||null;
  let user=null;

  if(userId){
    user=await officialRepository.getUser(userId);
    if(!user) throw new OfficialConflictError("Selected staff member is not active",{status:400});
    resolvedName=fullName(user);
    resolvedPhone=user.phoneNumber||resolvedPhone;
    const target=windowFor(match);
    const searchStart=new Date(target.start.getTime()-12*60*60*1000);
    const searchEnd=new Date(target.end.getTime()+12*60*60*1000);
    const assignments=await officialRepository.getAssignmentsForUser(user.id,searchStart,searchEnd,match.id);
    const conflict=assignments.find(item=>overlaps(target,windowFor(item.match)));
    if(conflict){
      throw new OfficialConflictError(
        `${resolvedName} is already assigned to Match #${conflict.match.matchNo} during this time.`,
        {code:"OFFICIAL_DOUBLE_BOOKED",conflictMatchId:conflict.match.id},
      );
    }
    const duplicate=(match.officials||[]).find(item=>item.userId===userId&&item.status!=="CANCELLED");
    if(duplicate) throw new OfficialConflictError(`${resolvedName} is already assigned to this match.`,{code:"OFFICIAL_ALREADY_ASSIGNED"});
  }

  if(resolvedName.length<2) throw new OfficialConflictError("Official name is required",{status:400});

  if(role==="SCORER" && user && !["SCORER","ADMIN","SUPER_ADMIN"].includes(user.role)){
    throw new OfficialConflictError("Scorer assignments require a scorer/admin account.",{status:400});
  }

  return officialRepository.create({
    matchId:match.id,role,userId:user?.id||null,name:resolvedName,phone:resolvedPhone,notes:notes||null,
    status:"ASSIGNED",assignedById:actorId||null,
  });
}

export async function updateOfficialStatus({tournamentId,matchId,officialId,status}){
  const match=await officialRepository.getMatch(tournamentId,matchId);
  if(!match) throw new OfficialConflictError("Match not found",{status:404});
  const official=await officialRepository.findOnMatch(officialId,matchId);
  if(!official) throw new OfficialConflictError("Match official not found",{status:404});

  const now=new Date();
  const data={status};
  if(status==="CHECKED_IN") data.checkedInAt=official.checkedInAt||now;
  if(status==="COMPLETED") data.checkedOutAt=official.checkedOutAt||now;
  if(["CANCELLED","NO_SHOW"].includes(status) && !official.checkedOutAt) data.checkedOutAt=now;

  return officialRepository.update(official.id,data);
}

export async function removeOfficial({tournamentId,matchId,officialId}){
  const match=await officialRepository.getMatch(tournamentId,matchId);
  if(!match) throw new OfficialConflictError("Match not found",{status:404});
  const official=await officialRepository.findOnMatch(officialId,matchId);
  if(!official) throw new OfficialConflictError("Match official not found",{status:404});
  if(official.checkedInAt){
    return officialRepository.update(official.id,{status:"CANCELLED",checkedOutAt:new Date()});
  }
  return officialRepository.update(official.id,{status:"CANCELLED"});
}

export async function canStaffScoreMatch({user,matchId}){
  if(!user) return false;
  if(["SUPER_ADMIN","ADMIN"].includes(user.role)) return true;
  if(user.role!=="SCORER") return false;
  const assignments=await officialRepository.listMatchOfficials(matchId);
  return assignments.some(item=>
    item.userId===user.id &&
    ["SCORER","TECHNICAL_OFFICIAL"].includes(item.role) &&
    !["CANCELLED","NO_SHOW"].includes(item.status)
  );
}
