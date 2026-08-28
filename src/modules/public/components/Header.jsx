
"use client";

import Link from "next/link";
import { Menu, Search, ShieldCheck, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

const links = siteConfig.publicNavigation.map((item) => ({ href: item.href, label: item.title }));

function activeFor(pathname, href) {
  if (href === "/") return pathname === "/";
  if (href === "/tournament") return pathname === "/tournament" || pathname.startsWith("/tournament/events/") || pathname.startsWith("/tournament/matches/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800 bg-slate-950 text-white shadow-sm">
      <div className="border-b border-white/10 bg-slate-900">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-[11px] font-semibold text-slate-300 sm:px-6 lg:px-8">
          <span>Kodava Family Hockey · Official Tournament Platform</span>
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 hover:text-white"><ShieldCheck className="h-3 w-3"/> Staff</Link>
        </div>
      </div>
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Chenanda Hockey home">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-red-700 text-xs font-black">CH</div>
          <div className="hidden leading-tight sm:block"><div className="font-black tracking-tight">CHENANDA</div><div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Tournament Centre</div></div>
        </Link>
        <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map((link) => {
            const active = activeFor(pathname, link.href);
            return <Link key={link.href} href={link.href} className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>{link.label}</Link>;
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Link href="/search" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Search"><Search className="h-4 w-4"/></Link>
          <Link href="/tournament-registration" className="rounded-lg bg-red-700 px-4 py-2 text-sm font-black text-white hover:bg-red-600">Register</Link>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="ml-auto rounded-lg p-2 hover:bg-white/10 lg:hidden" aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}</button>
      </div>
      {open && <div className="fixed inset-x-0 top-[88px] h-[calc(100vh-88px)] overflow-y-auto bg-slate-950 lg:hidden"><nav className="grid gap-1 px-4 py-4">{links.map((link) => <Link key={link.href} href={link.href} className={`rounded-lg px-4 py-3 font-semibold ${activeFor(pathname, link.href) ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/10"}`}>{link.label}</Link>)}<Link href="/search" className="mt-2 rounded-lg border border-white/15 px-4 py-3 font-semibold text-slate-200">Search tournament</Link><Link href="/tournament-registration" className="rounded-lg bg-red-700 px-4 py-3 text-center font-black text-white">Register</Link><Link href="/auth/login" className="mt-2 rounded-lg border border-white/15 px-4 py-3 text-center font-semibold">Staff login</Link></nav></div>}
    </header>
  );
}
