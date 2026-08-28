import { db } from "@/lib/db";
import { evaluateRegistrationReadiness } from "@/modules/registrations/server/readiness";

const DAY = 24 * 60 * 60 * 1000;
const activeStatuses = ["REGISTRATION", "UPCOMING", "ONGOING"];

function iso(value) { return value ? new Date(value).toISOString() : null; }
function score(match) {
  return (match.participants || []).map((p) => ({
    familyId: p.familyId,
    family: p.family,
    score: Number(p.score || 0),
  }));
}
function matchView(match) {
  return {
    id: match.id,
    tournamentId: match.tournamentId,
    matchNo: match.matchNo,
    name: match.name,
    status: match.status,
    round: match.round,
    scheduledOn: iso(match.scheduledOn),
    durationMinutes: Number(match.durationMinutes || match.game?.matchDurationMinutes || 60),
    venue: match.venueRef?.shortName || match.venueRef?.name || match.venue,
    event: match.game?.shortName || match.game?.name || match.sport,
    participants: score(match),
    officials: match.officials || [],
    href: `/dashboard/tournaments/${match.tournamentId}/matches/${match.id}/live`,
  };
}
function overlap(aStart, aEnd, bStart, bEnd) { return aStart < bEnd && bStart < aEnd; }
function priority(issue) {
  return issue.severity === "CRITICAL" ? 0 : issue.severity === "WARNING" ? 1 : 2;
}

async function resolveTournament(tournamentId) {
  if (tournamentId) {
    return db.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id:true,name:true,shortName:true,status:true,startDate:true,endDate:true,
        registrationDeadline:true,timezone:true,visibility:true,
      },
    });
  }
  return db.tournament.findFirst({
    where: { status: { in: activeStatuses } },
    orderBy: [{ status: "desc" }, { startDate: "asc" }],
    select: {
      id:true,name:true,shortName:true,status:true,startDate:true,endDate:true,
      registrationDeadline:true,timezone:true,visibility:true,
    },
  });
}

export async function getTournamentCommandCenter(tournamentId = null) {
  const now = new Date();
  const horizon = new Date(now.getTime() + DAY);
  const tournament = await resolveTournament(tournamentId);
  if (!tournament) {
    return {
      tournament:null, live:[], next:[], today:[], issues:[], readiness:[],
      venueConflicts:[], scorerMissing:[], fieldOfficialMissing:[], counts:{},
    };
  }

  const tid = tournament.id;
  const [matches, registrations, incidents, payments] = await Promise.all([
    db.matches.findMany({
      where:{tournamentId:tid,status:{not:"CANCELLED"}},
      orderBy:[{scheduledOn:"asc"},{matchNo:"asc"}],
      include:{
        game:{select:{id:true,name:true,shortName:true,matchDurationMinutes:true}},
        venueRef:{select:{id:true,name:true,shortName:true}},
        officials:{
          where:{status:{not:"CANCELLED"}},
          select:{id:true,role:true,userId:true,name:true,status:true,checkedInAt:true},
        },
      },
      take:1000,
    }),
    db.gameRegistration.findMany({
      where:{participation:{is:{tournamentId:tid}},status:{in:["PENDING","CONFIRMED","WAITLISTED"]}},
      include:{
        game:{select:{id:true,name:true,shortName:true,tournamentId:true,minRosterSize:true,maxRosterSize:true,registrationFeeMinor:true}},
        participation:{include:{family:{select:{id:true,familyName:true,shortName:true}}}},
      },
      take:1000,
    }),
    db.matchIncident.findMany({
      where:{tournamentId:tid,resolvedAt:null},
      orderBy:[{severity:"desc"},{createdAt:"desc"}],
      take:100,
    }),
    db.payment.aggregate({
      where:{tournamentId:tid,status:"COMPLETED"},
      _sum:{amountMinor:true,amount:true},
      _count:true,
    }),
  ]);

  const views = matches.map(matchView);
  const live = views.filter(m => m.status === "LIVE");
  const next = views
    .filter(m => ["SCHEDULED","DELAYED","POSTPONED"].includes(m.status) && new Date(m.scheduledOn) >= now)
    .slice(0,20);

  const todayKey = now.toLocaleDateString("en-CA", { timeZone: tournament.timezone || "Asia/Kolkata" });
  const today = views.filter(m => {
    if (!m.scheduledOn) return false;
    return new Date(m.scheduledOn).toLocaleDateString("en-CA", { timeZone: tournament.timezone || "Asia/Kolkata" }) === todayKey;
  });

  const disrupted = views.filter(m => ["DELAYED","SUSPENDED","POSTPONED","ABANDONED","NO_RESULT"].includes(m.status));

  const readiness = registrations.map(r => {
    const state = evaluateRegistrationReadiness(r);
    return {
      id:r.id,
      family:r.participation.family.familyName,
      familyId:r.participation.family.id,
      event:r.game.shortName||r.game.name,
      gameId:r.game.id,
      status:r.status,
      paymentStatus:r.paymentStatus,
      paid:state.paymentReady,
      rosterCount:state.rosterCount,
      minRosterSize:state.minRosterSize,
      rosterReady:state.rosterReady,
      managerReady:state.managerReady,
      ready:r.status==="CONFIRMED" && state.ready,
      reasons:state.reasons,
      href:`/dashboard/tournaments/${tid}/participants`,
    };
  });

  const issues = [];
  for (const r of readiness) {
    if (r.status === "PENDING") issues.push({
      key:`registration-${r.id}`,type:"REGISTRATION",severity:"WARNING",
      title:"Registration awaiting review",detail:`${r.family} · ${r.event}`,href:r.href,
    });
    if (r.status === "CONFIRMED" && !r.paid) issues.push({
      key:`payment-${r.id}`,type:"PAYMENT",severity:"WARNING",
      title:"Payment not settled",detail:`${r.family} · ${r.event}`,href:r.href,
    });
    if (r.status === "CONFIRMED" && !r.rosterReady) issues.push({
      key:`roster-${r.id}`,type:"ROSTER",severity:"WARNING",
      title:"Roster not ready",detail:`${r.family} · ${r.event} · ${r.rosterCount}/${r.minRosterSize||"?"}`,href:r.href,
    });
  }
  for (const m of disrupted) issues.push({
    key:`match-${m.id}`,type:"MATCH",severity:["SUSPENDED","ABANDONED"].includes(m.status)?"CRITICAL":"WARNING",
    title:`Fixture ${m.status.toLowerCase().replaceAll("_"," ")}`,
    detail:`${m.name||`Match #${m.matchNo}`} · ${m.venue}`,href:m.href,
  });
  for (const incident of incidents) issues.push({
    key:`incident-${incident.id}`,type:"INCIDENT",severity:incident.severity,
    title:`${incident.type.replaceAll("_"," ")} incident`,
    detail:incident.description,href:`/dashboard/tournaments/${tid}/matches/${incident.matchId}/live`,
  });

  const scheduled = matches.filter(m => m.venueId && ["SCHEDULED","LIVE","DELAYED"].includes(m.status));
  const venueConflicts = [];
  for (let i=0;i<scheduled.length;i++) {
    for (let j=i+1;j<scheduled.length;j++) {
      const a=scheduled[i], b=scheduled[j];
      if (a.venueId !== b.venueId) continue;
      const as=new Date(a.scheduledOn), bs=new Date(b.scheduledOn);
      const ae=new Date(as.getTime()+Number(a.durationMinutes||a.game?.matchDurationMinutes||60)*60000);
      const be=new Date(bs.getTime()+Number(b.durationMinutes||b.game?.matchDurationMinutes||60)*60000);
      if (overlap(as,ae,bs,be)) {
        venueConflicts.push({
          key:`${a.id}-${b.id}`,
          venue:a.venueRef?.name||a.venue,
          first:matchView(a),
          second:matchView(b),
        });
      }
    }
  }

  const next24 = views.filter(m =>
    ["SCHEDULED","DELAYED"].includes(m.status) &&
    new Date(m.scheduledOn) >= now &&
    new Date(m.scheduledOn) <= horizon
  );

  const scorerMissing = next24.filter(m => !m.officials.some(o =>
    ["SCORER","TECHNICAL_OFFICIAL"].includes(o.role) && !["NO_SHOW","CANCELLED"].includes(o.status)
  ));
  const fieldOfficialMissing = next24.filter(m => !m.officials.some(o =>
    ["REFEREE","UMPIRE","MATCH_COMMISSIONER"].includes(o.role) && !["NO_SHOW","CANCELLED"].includes(o.status)
  ));

  for (const m of scorerMissing.slice(0,30)) issues.push({
    key:`scorer-${m.id}`,type:"OFFICIAL",severity:"WARNING",
    title:"Scorer/table official not assigned",detail:`${m.name||`Match #${m.matchNo}`} · ${m.event}`,
    href:`/dashboard/tournaments/${tid}/staff`,
  });
  for (const m of fieldOfficialMissing.slice(0,30)) issues.push({
    key:`field-official-${m.id}`,type:"OFFICIAL",severity:"WARNING",
    title:"Referee/umpire coverage missing",detail:`${m.name||`Match #${m.matchNo}`} · ${m.event}`,
    href:`/dashboard/tournaments/${tid}/staff`,
  });
  for (const conflict of venueConflicts) issues.push({
    key:`venue-${conflict.key}`,type:"VENUE",severity:"CRITICAL",
    title:"Venue schedule conflict",detail:`${conflict.venue} · Match #${conflict.first.matchNo} / #${conflict.second.matchNo}`,
    href:`/dashboard/tournaments/${tid}/schedule`,
  });

  issues.sort((a,b) => priority(a)-priority(b) || a.title.localeCompare(b.title));

  const completed = views.filter(m => ["COMPLETED","WALKOVER"].includes(m.status));
  const setupChecks = [
    { key:"dates", label:"Tournament dates", ready:Boolean(tournament.startDate&&tournament.endDate) },
    { key:"registrations", label:"Confirmed event entries", ready:readiness.some(r=>r.status==="CONFIRMED") },
    { key:"fixtures", label:"Fixtures scheduled", ready:views.length>0 },
    { key:"staff", label:"Next 24h staff coverage", ready:scorerMissing.length===0&&fieldOfficialMissing.length===0 },
    { key:"venues", label:"Venue schedule integrity", ready:venueConflicts.length===0 },
  ];

  const collectedMinor = Number(payments._sum?.amountMinor || 0);
  const collected = collectedMinor > 0 ? collectedMinor / 100 : Number(payments._sum?.amount || 0);

  return {
    tournament:{
      ...tournament,
      startDate:iso(tournament.startDate),
      endDate:iso(tournament.endDate),
      registrationDeadline:iso(tournament.registrationDeadline),
    },
    live,
    next,
    today,
    readiness,
    issues:issues.slice(0,100),
    venueConflicts,
    scorerMissing,
    fieldOfficialMissing,
    setupChecks,
    counts:{
      live:live.length,
      next:next24.length,
      today:today.length,
      completed:completed.length,
      attention:issues.filter(i=>i.severity!=="INFO").length,
      critical:issues.filter(i=>i.severity==="CRITICAL").length,
      incidents:incidents.length,
      pending:readiness.filter(r=>r.status==="PENDING").length,
      payment:readiness.filter(r=>r.status==="CONFIRMED"&&!r.paid).length,
      roster:readiness.filter(r=>r.status==="CONFIRMED"&&!r.rosterReady).length,
      ready:readiness.filter(r=>r.ready).length,
      totalRegistrations:readiness.length,
      venueConflicts:venueConflicts.length,
      scorerMissing:scorerMissing.length,
      fieldOfficialMissing:fieldOfficialMissing.length,
      checkedIn:matches.flatMap(m=>m.officials||[]).filter(o=>o.status==="CHECKED_IN").length,
      payments:payments._count||0,
      collected,
    },
  };
}
