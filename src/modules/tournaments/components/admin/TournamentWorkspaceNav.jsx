"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, ClipboardCheck, LayoutDashboard, MapPin, RadioTower, ShieldCheck, Trophy, UsersRound } from "lucide-react";

const items = [
  { key:"overview", label:"Overview", path:"", icon:LayoutDashboard },
  { key:"operations", label:"Operations", path:"operations", icon:RadioTower },
  { key:"registrations", label:"Registrations", path:"participants", icon:ClipboardCheck },
  { key:"schedule", label:"Schedule", path:"schedule", icon:CalendarDays },
  { key:"matches", label:"Matches", path:"matches", icon:Trophy },
  { key:"staff", label:"Staff", path:"staff", icon:UsersRound },
  { key:"results", label:"Results", path:"results", icon:BarChart3 },
  { key:"venues", label:"Venues", path:"venues", icon:MapPin },
];

export default function TournamentWorkspaceNav({ tournamentId }) {
  const pathname=usePathname();
  const base=`/dashboard/tournaments/${tournamentId}`;
  return <div className="sticky top-0 z-30 -mx-1 mb-5 overflow-x-auto border-b border-slate-200 bg-white/95 px-1 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-950/90">
    <nav className="flex min-w-max items-center gap-1 py-2" aria-label="Tournament workspace">
      {items.map(item=>{
        const href=item.path?`${base}/${item.path}`:base;
        const active=item.path?pathname===href||pathname.startsWith(`${href}/`):pathname===base;
        const Icon=item.icon;
        return <Link key={item.key} href={href} className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold transition ${active?"bg-slate-950 text-white dark:bg-white dark:text-slate-950":"text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"}`}>
          <Icon className="h-3.5 w-3.5"/>{item.label}
        </Link>;
      })}
      <Link href="/tournament" target="_blank" className="ml-2 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800">
        <ShieldCheck className="h-3.5 w-3.5"/>Public portal
      </Link>
    </nav>
  </div>;
}
