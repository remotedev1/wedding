import { db } from "@/lib/db";

function minutes(value){ return Number(value||60); }
function dayKey(value){ return new Date(value).toISOString().slice(0,10); }

export async function getTournamentStaffOperations(tournamentId){
  const tournament=await db.tournament.findUnique({
    where:{id:tournamentId},
    select:{id:true,name:true,shortName:true,status:true,startDate:true,endDate:true},
  });
  if(!tournament) return null;

  const matches=await db.matches.findMany({
    where:{tournamentId,status:{not:"CANCELLED"}},
    orderBy:[{scheduledOn:"asc"},{matchNo:"asc"}],
    include:{
      game:{select:{name:true,shortName:true,matchDurationMinutes:true}},
      venueRef:{select:{name:true,shortName:true}},
      officials:{where:{status:{not:"CANCELLED"}},orderBy:[{role:"asc"},{name:"asc"}]},
    },
    take:1000,
  });

  const staffMap=new Map();
  const missing=[];
  for(const match of matches){
    const officials=match.officials||[];
    const hasScorer=officials.some(o=>["SCORER","TECHNICAL_OFFICIAL"].includes(o.role)&&!["NO_SHOW","CANCELLED"].includes(o.status));
    const hasFieldOfficial=officials.some(o=>["REFEREE","UMPIRE","MATCH_COMMISSIONER"].includes(o.role)&&!["NO_SHOW","CANCELLED"].includes(o.status));
    if(["SCHEDULED","DELAYED","LIVE"].includes(match.status) && (!hasScorer||!hasFieldOfficial)){
      missing.push({
        id:match.id,matchNo:match.matchNo,name:match.name,scheduledOn:match.scheduledOn,
        venue:match.venueRef?.shortName||match.venueRef?.name||match.venue,
        event:match.game?.shortName||match.game?.name||match.sport,
        missingScorer:!hasScorer,missingFieldOfficial:!hasFieldOfficial,
      });
    }
    for(const official of officials){
      const key=official.userId||`external:${official.name.toLowerCase()}`;
      const row=staffMap.get(key)||{
        key,userId:official.userId||null,name:official.name,roles:new Set(),assignments:[],checkedIn:0,noShow:0,
      };
      row.roles.add(official.role);
      row.assignments.push({
        officialId:official.id,matchId:match.id,matchNo:match.matchNo,matchName:match.name,
        role:official.role,status:official.status,scheduledOn:match.scheduledOn,
        venue:match.venueRef?.shortName||match.venueRef?.name||match.venue,
        durationMinutes:minutes(match.durationMinutes||match.game?.matchDurationMinutes),
      });
      if(official.status==="CHECKED_IN") row.checkedIn+=1;
      if(official.status==="NO_SHOW") row.noShow+=1;
      staffMap.set(key,row);
    }
  }

  const staff=[...staffMap.values()].map(row=>{
    const byDay={};
    for(const a of row.assignments){
      const key=dayKey(a.scheduledOn);
      byDay[key]=(byDay[key]||0)+1;
    }
    return {
      ...row,
      roles:[...row.roles],
      assignmentCount:row.assignments.length,
      busiestDay:Object.entries(byDay).sort((a,b)=>b[1]-a[1])[0]||null,
      assignments:row.assignments,
    };
  }).sort((a,b)=>b.assignmentCount-a.assignmentCount||a.name.localeCompare(b.name));

  return {
    tournament,
    staff,
    missing,
    counts:{
      staff:staff.length,
      assignments:staff.reduce((n,row)=>n+row.assignmentCount,0),
      missing:missing.length,
      checkedIn:staff.reduce((n,row)=>n+row.checkedIn,0),
      noShow:staff.reduce((n,row)=>n+row.noShow,0),
    },
  };
}
