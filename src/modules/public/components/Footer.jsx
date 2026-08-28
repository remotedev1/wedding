import Link from "next/link";

const navigation = [
  ["Tournament Center", "/tournament"],
  ["Live Scores", "/score-hockey"],
  ["Registration", "/tournament-registration"],
  ["Gallery", "/gallery"],
  ["About Chenanda", "/about-us"],
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <div className="text-2xl font-black tracking-tight">CHENANDA</div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Official public information for the Chenanda Kodava family hockey tournament—fixtures, live scores, standings, results and registration.</p>
        </div>
        <nav className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm" aria-label="Footer navigation">
          {navigation.map(([label, href]) => <Link key={href} href={href} className="text-slate-300 hover:text-amber-400">{label}</Link>)}
        </nav>
      </div>
      <div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span>© {new Date().getFullYear()} Chenanda Okka. All rights reserved.</span><Link href="/auth/login" className="hover:text-slate-300">Tournament administration</Link></div></div>
    </footer>
  );
}
