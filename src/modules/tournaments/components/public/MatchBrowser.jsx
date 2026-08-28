
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Radio } from "lucide-react";

const label=(v="")=>String(v).replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
const dayKey=(v,timeZone="Asia/Kolkata")=>{
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(v));
  const pick=(type)=>parts.find(p=>p.type===type)?.value;
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
};
const dayLabel=(v)=>new Intl.DateTimeFormat("en-IN",{weekday:"short",day:"2-digit",month:"short",timeZone:"UTC"}).format(new Date(`${v}T00:00:00Z`));
const time=(v)=>new Intl.DateTimeFormat("en-IN",{hour:"2-digit",minute:"2-digit"}).format(new Date(v));

function MatchRow({match}) {
  const [a,b]=match.participants||[];
  const done=["COMPLETED","WALKOVER"].includes(match.status);
  const live=match.status==="LIVE";
  return <Link href={`/tournament/matches/${match.id}`} className="grid grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-2 px-3 py-3 transition hover:bg-slate-50 sm:grid-cols-[74px_minmax(0,1fr)_auto] sm:gap-3 sm:px-4">
    <div className="text-xs font-bold text-slate-500">{live?<span className="text-red-600">● LIVE</span>:done?<span>FT</span>:<span>{time(match.scheduledOn)}</span>}</div>
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><span>{match.gameShortName||match.gameName||label(match.sport)}</span>{match.pool&&<><span>·</span><span>Pool {match.pool}</span></>}</div>
      <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 text-xs sm:gap-2 sm:text-sm"><span className="truncate text-right font-bold text-slate-950">{a?.family||"TBD"}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 font-black tabular-nums text-slate-950">{a?.score??0}-{b?.score??0}</span><span className="truncate font-bold text-slate-950">{b?.family||"TBD"}</span></div>
      <p className="mt-1 truncate text-center text-[11px] text-slate-500">{match.venue||"Venue TBA"} · {label(match.round)}</p>
    </div>
    <ChevronRight className="h-4 w-4 text-slate-300"/>
  </Link>;
}

export default function MatchBrowser({matches=[], timeZone="Asia/Kolkata"}) {
  const router=useRouter();
  const pathname=usePathname();
  const searchParams=useSearchParams();
  const dates=useMemo(()=>[...new Set(matches.map(m=>dayKey(m.scheduledOn,timeZone)))].sort(),[matches,timeZone]);
  const today=dayKey(new Date(),timeZone);
  const initialStatus=["ALL","LIVE","UPCOMING","RESULTS"].includes(searchParams.get("status"))?searchParams.get("status"):"ALL";
  const requestedDate=searchParams.get("date");
  const initialDate=requestedDate&&dates.includes(requestedDate)?requestedDate:(dates.includes(today)?today:"ALL");
  const [status,setStatus]=useState(initialStatus);
  const [date,setDate]=useState(initialDate);

  useEffect(()=>{
    const params=new URLSearchParams(searchParams.toString());
    if(status==="ALL")params.delete("status");else params.set("status",status);
    if(date==="ALL")params.delete("date");else params.set("date",date);
    const query=params.toString();
    router.replace(query?`${pathname}?${query}`:pathname,{scroll:false});
  },[status,date,pathname,router]);
  const filtered=useMemo(()=>matches.filter(match=>{
    const dateOk=date==="ALL"||dayKey(match.scheduledOn,timeZone)===date;
    const statusOk=status==="ALL"||
      (status==="LIVE"&&match.status==="LIVE")||
      (status==="UPCOMING"&&["SCHEDULED","DELAYED","POSTPONED"].includes(match.status))||
      (status==="RESULTS"&&["COMPLETED","WALKOVER"].includes(match.status));
    return dateOk&&statusOk;
  }),[matches,status,date,timeZone]);
  const grouped=useMemo(()=>{
    const map=new Map();
    for(const match of filtered){const key=dayKey(match.scheduledOn,timeZone);if(!map.has(key))map.set(key,[]);map.get(key).push(match);}
    return [...map.entries()].sort(([a],[b])=>a.localeCompare(b));
  },[filtered,timeZone]);

  return <section id="matches" className="rounded-xl border border-slate-200 bg-white">
    <div className="border-b border-slate-200 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 className="font-black text-slate-950">Match browser</h2><p className="text-xs text-slate-500">Browse by match state and tournament date.</p></div>
        <div className="flex gap-1 overflow-x-auto">{["ALL","LIVE","UPCOMING","RESULTS"].map(value=><button key={value} onClick={()=>setStatus(value)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-black ${status===value?"bg-slate-950 text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{value==="LIVE"&&<Radio className="mr-1 inline h-3 w-3"/>}{label(value)}</button>)}</div>
      </div>
      {!!dates.length&&<div className="mt-3 flex gap-1 overflow-x-auto border-t border-slate-100 pt-3"><button onClick={()=>setDate("ALL")} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${date==="ALL"?"bg-red-700 text-white":"bg-slate-50 text-slate-600"}`}>All dates</button>{dates.map(value=><button key={value} onClick={()=>setDate(value)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${date===value?"bg-red-700 text-white":"bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>{dayLabel(value)}</button>)}</div>}
    </div>
    {grouped.length?<div>{grouped.map(([key,rows])=><div key={key}><div className="sticky top-[88px] z-10 flex items-center gap-2 border-y border-slate-100 bg-slate-50/95 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500 backdrop-blur"><CalendarDays className="h-3.5 w-3.5"/>{dayLabel(key)}<span className="font-semibold normal-case tracking-normal text-slate-400">· {rows.length} match{rows.length===1?"":"es"}</span></div><div className="divide-y divide-slate-100">{rows.map(match=><MatchRow key={match.id} match={match}/>)}</div></div>)}</div>:<div className="p-10 text-center"><Filter className="mx-auto h-7 w-7 text-slate-300"/><p className="mt-3 text-sm font-bold text-slate-900">No matches in this view.</p><button onClick={()=>{setStatus("ALL");setDate("ALL")}} className="mt-2 text-sm font-bold text-red-700">Clear filters</button></div>}
  </section>;
}
