import { tournamentRepository } from "@/modules/tournaments/repository";
import { TournamentCoreError } from "@/modules/tournaments/core-service";
import { calculatePoolStandings } from "@/modules/tournaments/server/standings";
import { distributePools, getMatchDurationMinutes, roundRobinPairs, windowsOverlap } from "@/modules/tournaments/server/scheduling";

function teamFromRegistration(registration) {
  return {
    registrationId: registration.id,
    familyId: registration.participation.family.id,
    familyName: registration.teamName || registration.participation.family.familyName,
  };
}
function duration(match) {
  return Number(match.durationMinutes || match.game?.matchDurationMinutes || getMatchDurationMinutes(match.sport) || 60);
}
function scheduleView(match) {
  return {
    id:match.id,matchNo:match.matchNo,name:match.name,status:match.status,publicationStatus:match.publicationStatus,
    scheduledOn:match.scheduledOn,round:match.round,pool:match.pool,sport:match.sport,durationMinutes:duration(match),
    game:match.game,venueId:match.venueId,venue:match.venueRef?.name||match.venue,
    participants:match.participants,officials:match.officials||[],
  };
}
function scheduleWarnings(rows) {
  const result=new Map(rows.map(r=>[r.id,[]]));
  for(let i=0;i<rows.length;i++) for(let j=i+1;j<rows.length;j++) {
    const a=rows[i],b=rows[j];
    if(["POSTPONED","ABANDONED"].includes(a.status)||["POSTPONED","ABANDONED"].includes(b.status)) continue;
    if(!windowsOverlap(a.scheduledOn,duration(a),b.scheduledOn,duration(b))) continue;
    if(a.venueId&&b.venueId&&a.venueId===b.venueId) {
      result.get(a.id).push({type:"VENUE",severity:"CRITICAL",message:`Venue overlaps Match #${b.matchNo}`});
      result.get(b.id).push({type:"VENUE",severity:"CRITICAL",message:`Venue overlaps Match #${a.matchNo}`});
    }
    const af=(a.participants||[]).map(p=>p.familyId),bf=(b.participants||[]).map(p=>p.familyId);
    if(af.some(id=>bf.includes(id))) {
      result.get(a.id).push({type:"TEAM",severity:"CRITICAL",message:`Team time overlaps Match #${b.matchNo}`});
      result.get(b.id).push({type:"TEAM",severity:"CRITICAL",message:`Team time overlaps Match #${a.matchNo}`});
    }
  }
  const byTeam=new Map();
  rows.forEach(m=>(m.participants||[]).forEach(p=>{
    if(!p.familyId)return;
    const list=byTeam.get(p.familyId)||[];list.push(m);byTeam.set(p.familyId,list);
  }));
  byTeam.forEach(list=>{
    list.sort((a,b)=>new Date(a.scheduledOn)-new Date(b.scheduledOn));
    for(let i=1;i<list.length;i++) {
      const prev=list[i-1],cur=list[i];
      const rest=(new Date(cur.scheduledOn)-new Date(prev.scheduledOn))/60000-duration(prev);
      if(rest>=0&&rest<90) result.get(cur.id)?.push({type:"REST",severity:"WARNING",message:`Only ${Math.round(rest)} min rest after Match #${prev.matchNo}`});
    }
  });
  rows.forEach(m=>{
    if(["SCHEDULED","DELAYED"].includes(m.status)&&!(m.officials||[]).some(o=>["SCORER","TECHNICAL_OFFICIAL"].includes(o.role))) {
      result.get(m.id)?.push({type:"STAFF",severity:"INFO",message:"Scorer / technical official not assigned"});
    }
  });
  return result;
}

export async function generatePoolFixtures(tournamentId,input) {
  const game=await tournamentRepository.getFixtureGenerationGame(tournamentId,input.gameId);
  if(!game) throw new TournamentCoreError("Active tournament game not found",404);
  if(game.registrations.length<2) throw new TournamentCoreError("At least two confirmed registrations are required",409);
  if(await tournamentRepository.countExistingGameFixtures(tournamentId,game.id)) {
    throw new TournamentCoreError("This event already has fixtures. Delete/cancel the existing schedule before generating a new one.",409);
  }

  const durationMinutes=getMatchDurationMinutes(game.sportType,input.slotMinutes);
  const pools=distributePools(game.registrations,input.poolCount);
  if(!input.assignPools&&game.registrations.some(r=>!r.pool)) {
    throw new TournamentCoreError("Some registrations do not have a pool. Assign pools first or enable automatic pool assignment.",409);
  }

  const effectivePools=input.assignPools?pools:new Map();
  if(!input.assignPools) {
    for(const registration of game.registrations) {
      if(!effectivePools.has(registration.pool)) effectivePools.set(registration.pool,[]);
      effectivePools.get(registration.pool).push(registration);
    }
  }

  const existing=await tournamentRepository.listSchedulingMatches(tournamentId);
  const maxMatch=await tournamentRepository.getMaxMatchNo(tournamentId,game.sportType);
  let matchNo=(maxMatch._max.matchNo||0)+1;
  const generated=[],busy=[...existing];
  const scheduleStart=new Date(input.startAt);
  const scanStepMinutes=15;

  for(const [pool,registrations] of effectivePools.entries()) {
    const rounds=roundRobinPairs(registrations.map(teamFromRegistration));
    for(let roundIndex=0;roundIndex<rounds.length;roundIndex+=1) {
      for(const [home,away] of rounds[roundIndex]) {
        let best=null;
        for(const venue of input.venues) {
          const candidate=new Date(scheduleStart);
          for(let attempts=0;attempts<3000;attempts+=1) {
            const operationalConflict=busy.some(scheduled=>{
              const scheduledDuration=getMatchDurationMinutes(scheduled.sport);
              if(!windowsOverlap(candidate,durationMinutes,scheduled.scheduledOn,scheduledDuration)) return false;
              if(scheduled.venue===venue) return true;
              return (scheduled.participants||[]).some(participant=>[home.familyId,away.familyId].includes(participant.familyId));
            });
            const restConflict=generated.some(scheduled=>{
              if(![home.familyId,away.familyId].some(id=>scheduled.teamIds.includes(id))) return false;
              const scheduledEnd=new Date(scheduled.scheduledOn).getTime()+durationMinutes*60000;
              return candidate.getTime()<scheduledEnd+input.restMinutes*60000;
            });
            if(!operationalConflict&&!restConflict) {
              if(!best||candidate<best.scheduledOn) best={venue,scheduledOn:new Date(candidate)};
              break;
            }
            candidate.setMinutes(candidate.getMinutes()+scanStepMinutes);
          }
        }
        if(!best) throw new TournamentCoreError("Unable to produce a conflict-free schedule with the selected venues/rest interval",409);
        const fixture={
          tournamentId,sport:game.sportType,gameId:game.id,matchNo:matchNo++,
          name:`${game.name} - Pool ${pool} - R${roundIndex+1}`,venue:best.venue,
          scheduledOn:best.scheduledOn,pool,round:"POOL_STAGE",status:"SCHEDULED",
          participants:[{familyId:home.familyId,family:home.familyName},{familyId:away.familyId,family:away.familyName}],
          images:[],teamIds:[home.familyId,away.familyId],
        };
        generated.push(fixture);busy.push(fixture);
      }
    }
  }

  generated.sort((a,b)=>new Date(a.scheduledOn)-new Date(b.scheduledOn)||a.venue.localeCompare(b.venue));
  const endBoundary=game.tournament.endDate?new Date(game.tournament.endDate):null;
  if(endBoundary&&generated.some(f=>f.scheduledOn>endBoundary)) {
    throw new TournamentCoreError("Generated fixtures extend beyond the tournament end date. Add venues or shorten the slot/rest interval.",409);
  }

  const preview={
    game:{id:game.id,name:game.name,sportType:game.sportType},
    durationMinutes,
    pools:Object.fromEntries([...effectivePools.entries()].map(([p,regs])=>[p,regs.map(teamFromRegistration)])),
    fixtures:generated.map(({teamIds,...fixture})=>fixture),
  };
  if(!input.commit) return {...preview,preview:true};

  const lock=await tournamentRepository.acquireOperationLock(`fixture-generation:${tournamentId}:${game.id}`);
  if(!lock.owner) throw new TournamentCoreError("Fixture generation is already running for this event. Retry after it finishes.",409,{code:"FIXTURE_GENERATION_BUSY"});
  try {
    if(await tournamentRepository.countExistingGameFixtures(tournamentId,game.id)) {
      throw new TournamentCoreError("This event already has fixtures. Refresh before generating another schedule.",409);
    }
    const poolAssignments=[];
    if(input.assignPools) {
      for(const [pool,registrations] of effectivePools.entries()) {
        for(const registration of registrations) if(registration.pool!==pool) poolAssignments.push({id:registration.id,pool});
      }
    }
    const fixtures=generated.map(({teamIds,...fixture})=>fixture);
    const created=await tournamentRepository.commitPoolFixtures(poolAssignments,fixtures);
    return {...preview,created:created.length,fixtures:created,preview:false};
  } finally {
    await tournamentRepository.releaseOperationLock(lock.lock.id);
  }
}

export async function getScheduleBoard(tournamentId) {
  const [rows,venues]=await Promise.all([
    tournamentRepository.getScheduleRows(tournamentId),
    tournamentRepository.listVenues(tournamentId,true),
  ]);
  const map=scheduleWarnings(rows);
  return {matches:rows.map(m=>({...scheduleView(m),warnings:map.get(m.id)||[]})),venues};
}

export async function updateScheduleFixture(tournamentId,input) {
  const existing=await tournamentRepository.getScheduleMatch(tournamentId,input.matchId);
  if(!existing) throw new TournamentCoreError("Match not found",404);
  if(["LIVE","COMPLETED","WALKOVER","ABANDONED"].includes(existing.status)&&(input.scheduledOn!==undefined||input.venueId!==undefined)) {
    throw new TournamentCoreError("A started or completed match cannot be rescheduled from the schedule board",409);
  }

  let venue=existing.venue;
  if(input.venueId!==undefined&&input.venueId) {
    const candidate=await tournamentRepository.getVenue(tournamentId,input.venueId);
    if(!candidate||!candidate.isActive) throw new TournamentCoreError("Venue is not available for this tournament",400);
    venue=candidate.name;
  }
  const scheduledOn=input.scheduledOn?new Date(input.scheduledOn):existing.scheduledOn;
  if(input.scheduledOn!==undefined||input.venueId!==undefined) {
    const others=await tournamentRepository.listSchedulingMatches(tournamentId,existing.id);
    const overlap=others.filter(m=>windowsOverlap(scheduledOn,duration(existing),m.scheduledOn,Number(m.durationMinutes||getMatchDurationMinutes(m.sport)||60)));
    const venueId=input.venueId||existing.venueId;
    const venueConflict=overlap.find(m=>venueId?m.venueId===venueId:m.venue===venue);
    if(venueConflict) throw new TournamentCoreError(`Venue overlaps Match #${venueConflict.matchNo}`,409);
    const families=(existing.participants||[]).map(p=>p.familyId);
    const teamConflict=overlap.find(m=>(m.participants||[]).some(p=>families.includes(p.familyId)));
    if(teamConflict) throw new TournamentCoreError(`A participating team overlaps Match #${teamConflict.matchNo}`,409);
  }
  return tournamentRepository.updateMatch(existing.id,{
    ...(input.scheduledOn!==undefined&&{scheduledOn}),
    ...(input.venueId!==undefined&&{venueId:input.venueId,venue}),
    ...(input.status!==undefined&&{status:input.status}),
    ...(input.publicationStatus!==undefined&&{publicationStatus:input.publicationStatus}),
    ...(input.reason&&{notes:[existing.notes,input.reason].filter(Boolean).join("\n")}),
  });
}

export async function bulkPublishFixtures(tournamentId,input) {
  const unique=[...new Set(input.matchIds)];
  if(unique.length!==input.matchIds.length) throw new TournamentCoreError("Duplicate match IDs are not allowed",400);
  const count=await tournamentRepository.countMatchesByIds(tournamentId,unique);
  if(count!==unique.length) throw new TournamentCoreError("Some selected fixtures do not belong to this tournament",400);
  const result=await tournamentRepository.bulkPublishMatches(tournamentId,unique,input.publicationStatus);
  return {count:result.count,publicationStatus:input.publicationStatus};
}

const pairingsFor=(qualifiers)=>{
  if(qualifiers.length===4) return {round:"SEMI_FINAL",pairs:[[qualifiers[0],qualifiers[3]],[qualifiers[2],qualifiers[1]]]};
  if(qualifiers.length===8) return {round:"QUARTER_FINAL",pairs:[[qualifiers[0],qualifiers[3]],[qualifiers[4],qualifiers[7]],[qualifiers[2],qualifiers[1]],[qualifiers[6],qualifiers[5]]]};
  return null;
};

export async function generateKnockoutFixtures(tournamentId,input) {
  const game=await tournamentRepository.getKnockoutGame(tournamentId,input.gameId);
  if(!game) throw new TournamentCoreError("Tournament game not found",404);
  if(await tournamentRepository.countKnockoutFixtures(tournamentId,input.gameId)) {
    throw new TournamentCoreError("Knockout fixtures already exist for this event",409);
  }
  const poolMatches=await tournamentRepository.listPoolMatches(tournamentId,input.gameId,false);
  if(!poolMatches.length) throw new TournamentCoreError("No pool fixtures exist for this event",409);
  const incomplete=poolMatches.filter(m=>!["COMPLETED","WALKOVER"].includes(m.status));
  if(incomplete.length) throw new TournamentCoreError(`${incomplete.length} pool fixture(s) must be completed before qualification`,409);

  const pools=calculatePoolStandings(poolMatches);
  if(![2,4].includes(pools.length)) throw new TournamentCoreError("Automatic knockout generation currently requires 2 or 4 pools",409);
  if(pools.some(p=>p.standings.length<2)) throw new TournamentCoreError("Each pool requires at least two ranked families",409);

  const qualifiers=pools
    .flatMap(p=>p.standings.slice(0,2).map(row=>({...row,pool:p.pool})))
    .sort((a,b)=>a.pool.localeCompare(b.pool)||a.position-b.position);
  const bracket=pairingsFor(qualifiers);
  if(!bracket) throw new TournamentCoreError("Unsupported qualifier count",409);

  const max=await tournamentRepository.getMaxMatchNo(tournamentId,game.sportType);
  let nextNo=(max._max.matchNo||0)+1;
  const start=new Date(input.startAt);
  const fixtures=bracket.pairs.map((pair,index)=>({
    tournamentId,gameId:game.id,sport:game.sportType,matchNo:nextNo++,
    name:`${game.name} - ${bracket.round.replaceAll("_"," ")} ${index+1}`,
    venue:input.venues[index%input.venues.length],
    scheduledOn:new Date(start.getTime()+Math.floor(index/input.venues.length)*input.slotMinutes*60000),
    round:bracket.round,status:"SCHEDULED",
    participants:pair.map(team=>({familyId:team.familyId,family:team.family})),
    previousMatches:[],images:[],
  }));
  if(input.preview) return {round:bracket.round,qualifiers,fixtures,preview:true};
  const lock=await tournamentRepository.acquireOperationLock(`knockout-generation:${tournamentId}:${game.id}`);
  if(!lock.owner) throw new TournamentCoreError("Knockout generation is already running for this event.",409,{code:"KNOCKOUT_GENERATION_BUSY"});
  try {
    if(await tournamentRepository.countKnockoutFixtures(tournamentId,input.gameId)) throw new TournamentCoreError("Knockout fixtures already exist for this event",409);
    const created=await tournamentRepository.commitKnockoutFixtures(fixtures);
    return {round:bracket.round,qualifiers,created:created.length,fixtures:created,preview:false};
  } finally {
    await tournamentRepository.releaseOperationLock(lock.lock.id);
  }
}

export async function getStandings(tournamentId,gameId) {
  const game=await tournamentRepository.getKnockoutGame(tournamentId,gameId);
  if(!game) throw new TournamentCoreError("Tournament game not found",404);
  const matches=await tournamentRepository.listPoolMatches(tournamentId,gameId,true);
  return {game,pools:calculatePoolStandings(matches),completedPoolMatches:matches.length};
}
