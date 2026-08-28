import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, Radio, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/modules/tournaments/utils/tournament";

export function TournamentStats({ tournament }) {
  if (!tournament) return null;
  const matches = tournament.matches || [];
  const live = matches.filter((m) => m.status === "LIVE" || m.status === "ONGOING").length;
  const completed = matches.filter((m) => m.status === "COMPLETED").length;
  const stats = [
    ["Families", tournament._count?.participation || 0, Users, "Registered families"],
    ["Matches", tournament._count?.matches || 0, Trophy, "Scheduled fixtures"],
    ["Live", live, Radio, "Matches in progress"],
    ["Completed", completed, CheckCircle2, "Finished matches"],
  ];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([title,value,Icon,description]) => <Card key={title} className="border-slate-200 bg-white shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle><Icon className="h-4 w-4 text-slate-500" /></CardHeader><CardContent><div className="text-2xl font-semibold text-slate-950">{formatNumber(value)}</div><p className="mt-1 text-xs text-slate-500">{description}</p></CardContent></Card>)}</div>;
}
