"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Radio, RefreshCw } from "lucide-react";

const tc=(v="")=>String(v).replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());

function Fixture({match}){
  const[a,b]=match.participants||[];
  const live=match.status==="LIVE";
  return <Link href={`/tournament/matches/${match.id}`} className="flex min-w-[280px] items-center gap-3 border-r border-slate-800 px-4 py-3 hover:bg-white/5">
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.12em] text-slate-500">
        <span className={live?"text-red-400":""}>{live?"● LIVE":tc(match.status)}</span>
        <span>·</span>
        <span className="truncate">{match.gameShortName||match.gameName||tc(match.sport)}</span>
      </div>
      <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-xs font-bold text-white">
        <span className="truncate text-right">{a?.family||"TBD"}</span>
        <span className="rounded bg-white/10 px-2 py-1 font-black tabular-nums">{a?.score??0}-{b?.score??0}</span>
        <span className="truncate">{b?.family||"TBD"}</span>
      </div>
    </div>
  </Link>;
}

export default function PublicLiveTicker({initialTournament}){
  const[tournament,setTournament]=useState(initialTournament);
  const[refreshing,setRefreshing]=useState(false);

  const refresh=useCallback(async()=>{
    try{
      setRefreshing(true);
      const response=await fetch("/api/public/tournaments/current",{cache:"no-store"});
      const body=await response.json();
      if(response.ok&&body.success)setTournament(body.data);
    }catch{}finally{setRefreshing(false)}
  },[]);

  useEffect(()=>{
    const timer=window.setInterval(refresh,15000);
    const visible=()=>document.visibilityState==="visible"&&refresh();
    document.addEventListener("visibilitychange",visible);
    return()=>{window.clearInterval(timer);document.removeEventListener("visibilitychange",visible)}
  },[refresh]);

  if(!tournament)return null;
  const rows=(tournament.liveMatches?.length?tournament.liveMatches:tournament.upcomingMatches||[]).slice(0,8);
  if(!rows.length)return null;

  return <section aria-label="Live tournament ticker" className="border-y border-slate-800 bg-slate-950 text-white">
    <div className="mx-auto flex max-w-[1600px] items-stretch">
      <div className="flex w-[112px] shrink-0 items-center justify-center gap-2 border-r border-slate-800 bg-red-700 px-3 text-[10px] font-black uppercase tracking-[.12em]">
        <Radio className="h-3.5 w-3.5"/>{tournament.liveMatches?.length?"Live":"Next"}
      </div>
      <div className="flex min-w-0 flex-1 overflow-x-auto">{rows.map(match=><Fixture key={match.id} match={match}/>)}</div>
      <button type="button" onClick={refresh} aria-label="Refresh scores" className="hidden w-12 shrink-0 place-items-center border-l border-slate-800 text-slate-400 hover:bg-white/5 hover:text-white sm:grid">
        <RefreshCw className={`h-4 w-4 ${refreshing?"animate-spin":""}`}/>
      </button>
    </div>
  </section>;
}
