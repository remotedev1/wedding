
import { db } from "@/lib/db";

const FINISHED = new Set(["COMPLETED", "WALKOVER"]);
const PUBLIC_TOURNAMENT = {
  visibility: "PUBLIC",
  status: { in: ["REGISTRATION", "UPCOMING", "ONGOING", "COMPLETED"] },
};

function scoreFor(match, participant) {
  if (!participant) return 0;
  if (match.sport === "FIELD_HOCKEY") return Number(participant.hockeyData?.goals || 0);
  if (match.sport === "FOOTBALL") return Number(participant.footballData?.goals || 0);
  if (match.sport === "CRICKET") return Number(participant.cricketData?.runs || 0);
  return 0;
}

function identifierWhere(identifier) {
  const value = String(identifier || "").trim();
  if (!value) return { slug: "__missing__" };
  return /^[a-f0-9]{24}$/i.test(value) ? { OR: [{ id: value }, { slug: value }] } : { slug: value };
}

function iso(value) {
  return value ? new Date(value).toISOString() : null;
}

function normalizePublicMatch(match) {
  return {
    id: match.id,
    name: match.name,
    matchNo: match.matchNo,
    status: match.status,
    round: match.round,
    pool: match.pool,
    scheduledOn: iso(match.scheduledOn),
    venue: match.venueRef?.shortName || match.venueRef?.name || match.venue,
    game: match.game ? { id: match.game.id, name: match.game.name, shortName: match.game.shortName } : null,
    tournament: match.tournament ? { id: match.tournament.id, name: match.tournament.name, shortName: match.tournament.shortName } : null,
    participants: (match.participants || []).map((p) => ({
      familyId: p.familyId,
      family: p.family,
      score: scoreFor(match, p),
    })),
    winnerId: match.winnerId,
    winnerName: match.winnerName,
    isDraw: match.isDraw,
  };
}

export async function getPublicFamilies() {
  const families = await db.families.findMany({
    where: { status: "ACTIVE" },
    orderBy: { familyName: "asc" },
    select: {
      id: true, familyName: true, shortName: true, slug: true, description: true,
      colors: true, crestUrl: true, images: true,
      _count: { select: { players: true, participations: true, placements: true } },
    },
  });
  return families.map((family) => ({
    ...family,
    href: `/teams/${family.slug || family.id}`,
    image: family.crestUrl || family.images?.[0] || null,
  }));
}

export async function getPublicFamilyProfile(identifier) {
  const family = await db.families.findFirst({
    where: { AND: [{ status: "ACTIVE" }, identifierWhere(identifier)] },
    select: {
      id: true, familyName: true, shortName: true, slug: true, description: true,
      colors: true, crestUrl: true, images: true, allTimeAchievements: true,
      players: {
        where: { isActive: true, verificationStatus: { not: "REJECTED" } },
        orderBy: [{ jerseyNumber: "asc" }, { playerName: "asc" }],
        select: {
          id: true, playerName: true, displayName: true, slug: true, jerseyNumber: true,
          primarySport: true, photoUrl: true, verificationStatus: true,
        },
      },
      placements: {
        select: {
          id: true, placement: true, sport: true,
          tournament: { select: { id: true, name: true, shortName: true, year: true, visibility: true } },
          game: { select: { id: true, name: true, shortName: true } },
        },
      },
      participations: {
        select: {
          id: true, status: true,
          tournament: { select: { id: true, name: true, shortName: true, year: true, visibility: true, status: true } },
          gameRegistrations: {
            where: { status: { in: ["CONFIRMED", "PENDING"] } },
            select: { id: true, status: true, game: { select: { id: true, name: true, shortName: true, sportType: true } } },
          },
        },
      },
    },
  });
  if (!family) return null;

  const matches = await db.matches.findMany({
    where: {
      publicationStatus: "PUBLISHED",
      tournament: { is: PUBLIC_TOURNAMENT },
    },
    orderBy: { scheduledOn: "desc" },
    take: 400,
    include: {
      tournament: { select: { id: true, name: true, shortName: true } },
      game: { select: { id: true, name: true, shortName: true } },
      venueRef: { select: { name: true, shortName: true } },
    },
  });
  const familyMatches = matches.filter((m) => (m.participants || []).some((p) => p.familyId === family.id));
  const completed = familyMatches.filter((m) => FINISHED.has(m.status));
  let won=0, drawn=0, lost=0, gf=0, ga=0;
  for (const match of completed) {
    const mine=(match.participants||[]).find((p)=>p.familyId===family.id);
    const other=(match.participants||[]).find((p)=>p.familyId!==family.id);
    const a=scoreFor(match,mine), b=scoreFor(match,other);
    gf+=a; ga+=b;
    if (match.isDraw || a===b) drawn+=1;
    else if (match.winnerId===family.id || (!match.winnerId && a>b)) won+=1;
    else lost+=1;
  }

  return {
    ...family,
    image: family.crestUrl || family.images?.[0] || null,
    players: family.players.map((p)=>({...p, href:`/players/${p.slug || p.id}`})),
    placements: family.placements.filter((p)=>p.tournament?.visibility==="PUBLIC").sort((a,b)=>(b.tournament?.year||0)-(a.tournament?.year||0)),
    participations: family.participations.filter((p)=>p.tournament?.visibility==="PUBLIC").sort((a,b)=>(b.tournament?.year||0)-(a.tournament?.year||0)),
    stats: { played: completed.length, won, drawn, lost, goalsFor:gf, goalsAgainst:ga, goalDifference:gf-ga },
    recentMatches: familyMatches.slice(0,10).map(normalizePublicMatch),
  };
}


export async function getPublicPlayers() {
  const players = await db.player.findMany({
    where: {
      isActive: true,
      verificationStatus: { not: "REJECTED" },
      family: { is: { status: "ACTIVE" } },
    },
    orderBy: { playerName: "asc" },
    take: 300,
    select: {
      id: true, playerName: true, displayName: true, slug: true, photoUrl: true,
      jerseyNumber: true, primarySport: true, verificationStatus: true,
      family: { select: { id: true, familyName: true, shortName: true, slug: true } },
    },
  });
  return players.map((player) => ({
    ...player,
    href: `/players/${player.slug || player.id}`,
    familyHref: `/teams/${player.family.slug || player.family.id}`,
  }));
}

export async function getPublicPlayerProfile(identifier) {
  const player = await db.player.findFirst({
    where: {
      AND: [
        { isActive: true },
        { verificationStatus: { not: "REJECTED" } },
        identifierWhere(identifier),
        { family: { is: { status: "ACTIVE" } } },
      ],
    },
    select: {
      id: true, playerName: true, displayName: true, slug: true,
      photoUrl: true, primarySport: true, jerseyNumber: true, biography: true,
      achievements: true, verificationStatus: true,
      family: { select: { id: true, familyName: true, shortName: true, slug: true, crestUrl: true, images: true } },
      manOfTheMatchIn: {
        where: { publicationStatus: "PUBLISHED", tournament: { is: PUBLIC_TOURNAMENT } },
        orderBy: { scheduledOn: "desc" },
        select: {
          id: true, name: true, scheduledOn: true,
          tournament: { select: { name: true, shortName: true } },
          game: { select: { name: true, shortName: true } },
        },
      },
    },
  });
  if (!player) return null;

  const events = await db.matchEvent.findMany({
    where: {
      playerId: player.id,
      match: { is: { publicationStatus: "PUBLISHED", tournament: { is: PUBLIC_TOURNAMENT } } },
    },
    orderBy: { createdAt: "desc" },
    take: 1000,
    select: {
      id: true, type: true, value: true, metadata: true, minute: true, createdAt: true,
      familyId: true, familyName: true,
      match: {
        select: {
          id: true, status: true, scheduledOn: true, round: true,
          tournament: { select: { name: true, shortName: true } },
          game: { select: { name: true, shortName: true } },
        },
      },
    },
  });

  const stats={goals:0,shots:0,shotsOnTarget:0,greenCards:0,yellowCards:0,redCards:0};
  const matchIds=new Set();
  for(const event of events){
    matchIds.add(event.match.id);
    if(event.type==="GOAL") stats.goals+=1;
    if(event.type==="SHOT"){stats.shots+=1;if(event.metadata?.onTarget)stats.shotsOnTarget+=1;}
    if(event.type==="CARD"){
      const type=String(event.metadata?.cardType||"").toUpperCase();
      if(type==="GREEN")stats.greenCards+=1;
      if(type==="YELLOW")stats.yellowCards+=1;
      if(type==="RED")stats.redCards+=1;
    }
  }

  return {
    ...player,
    family: {...player.family, href:`/teams/${player.family.slug || player.family.id}`, image:player.family.crestUrl||player.family.images?.[0]||null},
    stats:{...stats,matchesWithRecordedEvents:matchIds.size,playerOfMatchAwards:player.manOfTheMatchIn.length},
    recentEvents: events.slice(0,15).map((e)=>({...e,createdAt:iso(e.createdAt),match:{...e.match,scheduledOn:iso(e.match.scheduledOn)}})),
  };
}

export async function searchPublicTournament(query) {
  const q=String(query||"").trim().slice(0,80);
  if(q.length<2) return {query:q,teams:[],players:[],events:[],matches:[]};

  const [teams,players,events,matches] = await Promise.all([
    db.families.findMany({
      where:{status:"ACTIVE",OR:[{familyName:{contains:q,mode:"insensitive"}},{shortName:{contains:q,mode:"insensitive"}}]},
      take:8, orderBy:{familyName:"asc"},
      select:{id:true,familyName:true,shortName:true,slug:true,crestUrl:true,images:true},
    }),
    db.player.findMany({
      where:{isActive:true,verificationStatus:{not:"REJECTED"},family:{is:{status:"ACTIVE"}},OR:[{playerName:{contains:q,mode:"insensitive"}},{displayName:{contains:q,mode:"insensitive"}}]},
      take:10, orderBy:{playerName:"asc"},
      select:{id:true,playerName:true,displayName:true,slug:true,jerseyNumber:true,photoUrl:true,family:{select:{id:true,familyName:true,slug:true}}},
    }),
    db.tournamentGame.findMany({
      where:{isActive:true,tournament:{is:PUBLIC_TOURNAMENT},OR:[{name:{contains:q,mode:"insensitive"}},{shortName:{contains:q,mode:"insensitive"}},{eventCode:{contains:q,mode:"insensitive"}}]},
      take:8, orderBy:{date:"desc"},
      select:{id:true,name:true,shortName:true,eventCode:true,sportType:true,category:true,tournament:{select:{id:true,name:true,shortName:true}}},
    }),
    db.matches.findMany({
      where:{publicationStatus:"PUBLISHED",tournament:{is:PUBLIC_TOURNAMENT},OR:[{name:{contains:q,mode:"insensitive"}},{venue:{contains:q,mode:"insensitive"}}]},
      take:8, orderBy:{scheduledOn:"desc"},
      include:{tournament:{select:{name:true,shortName:true}},game:{select:{name:true,shortName:true}}},
    }),
  ]);
  return {
    query:q,
    teams:teams.map(t=>({...t,href:`/teams/${t.slug||t.id}`,image:t.crestUrl||t.images?.[0]||null})),
    players:players.map(p=>({...p,href:`/players/${p.slug||p.id}`})),
    events,
    matches:matches.map(normalizePublicMatch),
  };
}
