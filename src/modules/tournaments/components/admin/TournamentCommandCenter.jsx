import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  MapPin,
  Radio,
  ShieldAlert,
  Siren,
  Trophy,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";

const label=(v="")=>String(v).replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
const when=(v)=>v?new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(v)):"TBA";
const money=(v)=>`₹${Number(v||0).toLocaleString("en-IN",{maximumFractionDigits:0})}`;

function Metric({title,value,note,icon:Icon,tone="neutral"}){
  const toneClass=tone==="danger"?"border-red-200 bg-red-50/60 dark:border-red-950 dark:bg-red-950/20":tone==="good"?"border-emerald-200 bg-emerald-50/50 dark:border-emerald-950 dark:bg-emerald-950/20":"border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";
  return <div className={`rounded-xl border p-4 ${toneClass}`}>
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-[11px] font-bold uppercase tracking-[.12em] text-slate-500">{title}</p><p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{value}</p><p className="mt-1 text-[11px] text-slate-500">{note}</p></div>
      <Icon className={`h-4 w-4 ${tone==="danger"?"text-red-600":tone==="good"?"text-emerald-600":"text-slate-400"}`}/>
    </div>
  </div>;
}

function ScoreRow({m}){
  const[a,b]=m.participants||[];
  return <Link href={m.href} className="grid grid-cols-[74px_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
    <div><p className={`text-[10px] font-black uppercase ${m.status==="LIVE"?"text-red-600":"text-slate-500"}`}>{m.status==="LIVE"?"● LIVE":when(m.scheduledOn)}</p><p className="mt-1 truncate text-[10px] text-slate-400">{m.venue}</p></div>
    <div className="min-w-0"><p className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-400">{m.event} · {label(m.round)}</p><p className="mt-1 truncate text-sm font-bold text-slate-950 dark:text-white">{a?.family||"TBD"} <span className="px-1.5 tabular-nums text-slate-500">{a?.score??0}-{b?.score??0}</span> {b?.family||"TBD"}</p></div>
    <ArrowRight className="h-4 w-4 text-slate-300"/>
  </Link>;
}

function Severity({value}){
  const cls=value==="CRITICAL"?"bg-red-100 text-red-700":value==="WARNING"?"bg-amber-100 text-amber-700":"bg-slate-100 text-slate-600";
  return <span className={`rounded-full px-2 py-0.5 text-[9px] font-black tracking-wide ${cls}`}>{value}</span>;
}

function PhaseRail({t,data}){
  const steps=[
    {label:"Setup",ready:data.setupChecks?.filter(x=>["dates","venues"].includes(x.key)).every(x=>x.ready)},
    {label:"Registration",ready:data.counts.totalRegistrations>0},
    {label:"Scheduling",ready:(data.counts.today+data.counts.completed+data.counts.next)>0},
    {label:"Match day",ready:t.status==="ONGOING"||data.counts.live>0||data.counts.completed>0},
    {label:"Results",ready:data.counts.completed>0},
  ];
  return <div className="grid gap-2 sm:grid-cols-5">{steps.map((step,index)=><div key={step.label} className={`rounded-lg border px-3 py-2 ${step.ready?"border-emerald-200 bg-emerald-50":"border-slate-200 bg-white"}`}><div className="flex items-center gap-2"><span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${step.ready?"bg-emerald-600 text-white":"bg-slate-100 text-slate-500"}`}>{index+1}</span><span className="text-xs font-bold text-slate-800">{step.label}</span></div></div>)}</div>;
}

function Checklist({checks=[]}){
  return <div className="divide-y divide-slate-100 dark:divide-slate-800">{checks.map(check=><div key={check.key} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><div className="flex items-center gap-2">{check.ready?<BadgeCheck className="h-4 w-4 text-emerald-600"/>:<Clock3 className="h-4 w-4 text-amber-600"/>}<span className={check.ready?"text-slate-600":"font-semibold text-slate-900 dark:text-white"}>{check.label}</span></div><span className={`text-[10px] font-black ${check.ready?"text-emerald-600":"text-amber-600"}`}>{check.ready?"READY":"ACTION"}</span></div>)}</div>;
}

export default function TournamentCommandCenter({data,scoped=false}){
  const t=data.tournament;
  if(!t)return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900"><h1 className="text-2xl font-black">No tournament available</h1><p className="mt-2 text-sm text-slate-500">Create or activate a tournament to open the operations workspace.</p><Link href="/dashboard/tournaments" className="mt-4 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">Manage tournaments</Link></div>;

  const readinessPct=data.counts.totalRegistrations?Math.round(data.counts.ready/data.counts.totalRegistrations*100):0;
  const base=`/dashboard/tournaments/${t.id}`;

  return <div className="space-y-6 pb-8">
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-sm">
      <div className="grid gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end sm:px-7">
        <div>
          <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-black uppercase tracking-[.16em] text-red-400">{scoped?"Tournament operations":"Active tournament command center"}</p><span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-black uppercase text-slate-300">{label(t.status)}</span></div>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t.shortName||t.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Run the tournament from exceptions, not from menus. Live scoring, readiness, staffing, fixture integrity and results are surfaced here first.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link href={`${base}/schedule`} className="rounded-lg bg-red-700 px-4 py-2 text-center text-sm font-bold text-white hover:bg-red-600">Schedule board</Link>
          <Link href={`${base}/matches`} className="rounded-lg bg-white px-4 py-2 text-center text-sm font-bold text-slate-950 hover:bg-slate-100">Match control</Link>
          <Link href={`${base}/staff`} className="rounded-lg border border-white/20 px-4 py-2 text-center text-sm font-bold text-white hover:bg-white/10">Staff</Link>
          <Link href={`${base}/results`} className="rounded-lg border border-white/20 px-4 py-2 text-center text-sm font-bold text-white hover:bg-white/10">Results</Link>
        </div>
      </div>
      <div className="border-t border-white/10 bg-white/[.03] px-5 py-4 sm:px-7"><PhaseRail t={t} data={data}/></div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
      <Metric title="Live" value={data.counts.live} note="Matches in play" icon={Radio} tone={data.counts.live?"danger":"neutral"}/>
      <Metric title="Today" value={data.counts.today} note="Tournament-day fixtures" icon={CalendarClock}/>
      <Metric title="Attention" value={data.counts.attention} note={`${data.counts.critical} critical`} icon={ShieldAlert} tone={data.counts.attention?"danger":"good"}/>
      <Metric title="Entries ready" value={`${readinessPct}%`} note={`${data.counts.ready}/${data.counts.totalRegistrations}`} icon={UserCheck} tone={readinessPct===100&&data.counts.totalRegistrations?"good":"neutral"}/>
      <Metric title="Staff gaps" value={data.counts.scorerMissing+data.counts.fieldOfficialMissing} note="Next 24 hours" icon={UsersRound} tone={(data.counts.scorerMissing+data.counts.fieldOfficialMissing)?"danger":"good"}/>
      <Metric title="Checked in" value={data.counts.checkedIn} note="Officials on duty" icon={BadgeCheck}/>
      <Metric title="Collected" value={money(data.counts.collected)} note={`${data.counts.payments} payments`} icon={CircleDollarSign}/>
    </section>

    <section className="grid gap-5 xl:grid-cols-[1.35fr_.85fr]">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800"><div><h2 className="font-black">Now & next</h2><p className="text-xs text-slate-500">Immediate match-day operating queue.</p></div><Radio className="h-4 w-4 text-red-600"/></div>
        {data.live.length?data.live.map(m=><ScoreRow key={m.id} m={m}/>):<div className="px-4 py-4 text-sm text-slate-500">No match is live right now.</div>}
        {data.next.slice(0,8).map(m=><ScoreRow key={m.id} m={m}/>)}
        {!data.live.length&&!data.next.length&&<div className="px-4 py-8 text-center text-sm text-slate-500">No upcoming fixtures in the current queue.</div>}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800"><Siren className="h-4 w-4 text-red-600"/><div><h2 className="font-black">Action queue</h2><p className="text-xs text-slate-500">Critical work is always shown first.</p></div></div>
        <div className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
          {data.issues.length?data.issues.slice(0,40).map(issue=><Link key={issue.key} href={issue.href} className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"><div className="flex items-center justify-between gap-2"><p className="text-sm font-bold">{issue.title}</p><Severity value={issue.severity}/></div><p className="mt-1 text-xs leading-5 text-slate-500">{issue.detail}</p></Link>):<div className="p-8 text-center"><BadgeCheck className="mx-auto h-6 w-6 text-emerald-600"/><p className="mt-2 text-sm font-bold">No operational exceptions</p><p className="text-xs text-slate-500">Current tournament state is clear.</p></div>}
        </div>
      </div>
    </section>

    <section className="grid gap-5 xl:grid-cols-3">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800"><h2 className="font-black">Readiness gates</h2><p className="text-xs text-slate-500">Core prerequisites before match-day operation.</p></div>
        <Checklist checks={data.setupChecks}/>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800"><div><h2 className="font-black">Registration readiness</h2><p className="text-xs text-slate-500">Entries requiring administrative completion.</p></div><Link href={`${base}/participants`} className="text-xs font-bold text-red-700">Open all →</Link></div>
        <div className="max-h-[360px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">{data.readiness.length?data.readiness.slice(0,30).map(r=><Link key={r.id} href={r.href} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"><div className="min-w-0"><p className="truncate text-sm font-bold">{r.family}</p><p className="truncate text-xs text-slate-500">{r.event} · roster {r.rosterCount}{r.minRosterSize?`/${r.minRosterSize}`:""}</p></div><span className={`self-center rounded-full px-2 py-1 text-[9px] font-black ${r.ready?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}>{r.ready?"READY":"ACTION"}</span></Link>):<p className="p-8 text-center text-sm text-slate-500">No tournament entries yet.</p>}</div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800"><h2 className="font-black">Integrity snapshot</h2><p className="text-xs text-slate-500">Scheduling, staffing and incident health.</p></div>
        <div className="grid grid-cols-2 gap-3 p-4">
          <Metric title="Venue conflicts" value={data.counts.venueConflicts} note="Schedule overlaps" icon={MapPin} tone={data.counts.venueConflicts?"danger":"good"}/>
          <Metric title="Open incidents" value={data.counts.incidents} note="Needs resolution" icon={AlertTriangle} tone={data.counts.incidents?"danger":"good"}/>
          <Metric title="Scorer gaps" value={data.counts.scorerMissing} note="Next 24h" icon={ClipboardCheck} tone={data.counts.scorerMissing?"danger":"good"}/>
          <Metric title="Field official gaps" value={data.counts.fieldOfficialMissing} note="Next 24h" icon={Users} tone={data.counts.fieldOfficialMissing?"danger":"good"}/>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-4 dark:border-slate-800"><Link href={`${base}/staff`} className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-bold hover:bg-slate-50 dark:border-slate-700">Staff operations</Link><Link href={`${base}/schedule`} className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-bold hover:bg-slate-50 dark:border-slate-700">Fixture integrity</Link></div>
      </div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Link href={`${base}/participants`} className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400"><ClipboardCheck className="h-4 w-4 text-slate-500"/><p className="mt-3 font-black">Registrations</p><p className="mt-1 text-xs text-slate-500">{data.counts.pending} pending · {data.counts.payment} payment issues</p></Link>
      <Link href={`${base}/schedule`} className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400"><CalendarClock className="h-4 w-4 text-slate-500"/><p className="mt-3 font-black">Fixture operations</p><p className="mt-1 text-xs text-slate-500">{data.counts.today} today · {data.counts.next} next 24h</p></Link>
      <Link href={`${base}/staff`} className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400"><UsersRound className="h-4 w-4 text-slate-500"/><p className="mt-3 font-black">Staff & officials</p><p className="mt-1 text-xs text-slate-500">{data.counts.checkedIn} currently checked in</p></Link>
      <Link href={`${base}/results`} className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400"><Trophy className="h-4 w-4 text-slate-500"/><p className="mt-3 font-black">Results & progression</p><p className="mt-1 text-xs text-slate-500">{data.counts.completed} completed fixtures</p></Link>
    </section>
  </div>;
}
