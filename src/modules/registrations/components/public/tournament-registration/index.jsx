"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, CreditCard, Loader2, Search, ShieldCheck, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

const titleCase = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const money = (minor) => `₹${(Number(minor || 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export function TournamentRegistration({ tournamentId, tournamentName }) {
  const router = useRouter();
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [familySearch, setFamilySearch] = useState("");
  const [families, setFamilies] = useState([]);
  const [familiesLoading, setFamiliesLoading] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [result, setResult] = useState(null);

  async function loadContext(familyId = "") {
    setLoading(true);
    try {
      const suffix = familyId ? `?familyId=${encodeURIComponent(familyId)}` : "";
      const response = await fetch(`/api/public/tournaments/${tournamentId}/registration${suffix}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load registration");
      setContext(body.data);
      setSelectedGameId((current) => body.data.games?.some((game) => game.id === current && game.registrationOpen) ? current : "");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadContext(); }, [tournamentId]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setFamiliesLoading(true);
      try {
        const response = await fetch(`/api/public/families?search=${encodeURIComponent(familySearch)}`, { cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load families");
        setFamilies(body.data?.families || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setFamiliesLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [familySearch]);

  const selectableGames = context?.games?.filter((game) => game.registrationOpen) || [];
  const selectedGame = useMemo(() => context?.games?.find((item) => item.id === selectedGameId) || null, [selectedGameId, context?.games]);
  const totalMinor = Number(selectedGame?.registrationFeeMinor || 0);

  async function chooseFamily(family) {
    setSelectedFamily(family);
    setSelectedGameId("");
    await loadContext(family.id);
  }

  function selectGame(game) {
    if (!game.registrationOpen || game.alreadyRegistered) return;
    setSelectedGameId(game.id);
  }

  async function register() {
    if (!selectedFamily) return toast.error("Select a family");
    if (!selectedGameId) return toast.error("Select an event");
    setSaving(true);
    try {
      const response = await fetch(`/api/public/tournaments/${tournamentId}/registration/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId: selectedFamily.id, gameId: selectedGameId }),
      });
      const body = await response.json();
      if (!response.ok) {
        if (body?.details?.code === "ALREADY_REGISTERED") {
          await loadContext(selectedFamily.id);
          if (body?.details?.paymentUrl) {
            toast.info("This entry already exists. Opening its outstanding payment…");
            router.push(body.details.paymentUrl);
            return;
          }
        }
        throw new Error(body.error || "Registration failed");
      }
      setResult(body.data);
      if (body.data.paymentRequired && body.data.paymentUrl) {
        toast.success("Registration created. Opening secure payment…");
        router.push(body.data.paymentUrl);
        return;
      }
      toast.success("Registration completed");
      if (body.data.confirmationUrl) {
        router.push(body.data.confirmationUrl);
        return;
      }
      await loadContext(selectedFamily.id);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !context) return <main className="mx-auto max-w-6xl px-4 py-20 text-sm text-slate-500">Loading registration…</main>;
  if (!context) return null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Official tournament entry</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{tournamentName}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">No login is required. Select your family, choose an available event and continue directly to secure payment. Each family can enter a particular event only once.</p>
      </div>

      {!context.registrationOpen ? (
        <Card><CardHeader><CardTitle>Registration closed</CardTitle><CardDescription>This tournament is not accepting new entries.</CardDescription></CardHeader></Card>
      ) : result && !result.paymentRequired ? (
        <Card className="max-w-2xl border-emerald-200"><CardContent className="p-8 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50"><Check className="h-6 w-6 text-emerald-700" /></div><h2 className="mt-4 text-2xl font-semibold">Registration complete</h2><p className="mt-2 text-sm text-slate-600">{result.familyName} has been registered for {result.registration?.game?.name || "the selected event"}. No payment is required.</p><Button className="mt-5" variant="outline" onClick={() => { setResult(null); setSelectedGameId(""); }}>Register another available event</Button></CardContent></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="h-fit border-slate-200 shadow-sm">
            <CardHeader><CardTitle>1. Select family</CardTitle><CardDescription>Search the official family directory.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className="pl-9" placeholder="Search family name" value={familySearch} onChange={(e) => setFamilySearch(e.target.value)} /></div>
              <div className="max-h-[430px] space-y-2 overflow-auto pr-1">
                {familiesLoading && <p className="py-4 text-center text-xs text-slate-500">Loading families…</p>}
                {!familiesLoading && families.map((family) => (
                  <button key={family.id} type="button" onClick={() => chooseFamily(family)} className={`w-full rounded-xl border p-3 text-left transition ${selectedFamily?.id === family.id ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" : "border-slate-200 hover:border-slate-400"}`}>
                    <div className="flex items-center justify-between gap-3"><span className="font-medium text-slate-950">{family.familyName}</span>{selectedFamily?.id === family.id && <Check className="h-4 w-4 shrink-0" />}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Users className="h-3.5 w-3.5" />{family._count?.players || 0} players recorded</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>2. Choose event</CardTitle><CardDescription>{selectedFamily ? `Available entries for ${selectedFamily.familyName}` : "Select a family first to see registration availability."}</CardDescription></CardHeader>
              <CardContent>
                {!selectedFamily ? <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">Choose a family from the directory.</div> : loading ? <div className="py-10 text-center text-sm text-slate-500">Checking existing registrations…</div> : (
                  <div className="space-y-3">
                    {(context.games || []).map((game) => (
                      <div key={game.id} className={`rounded-xl border p-4 transition ${game.alreadyRegistered ? "border-emerald-200 bg-emerald-50/60" : !game.registrationOpen ? "border-slate-200 bg-slate-50 opacity-60" : selectedGameId === game.id ? "border-slate-950 bg-slate-50 ring-1 ring-slate-950" : "border-slate-200 hover:border-slate-400"}`}>
                        <button type="button" disabled={!game.registrationOpen} onClick={() => selectGame(game)} className="w-full text-left disabled:cursor-not-allowed">
                          <div className="flex items-start justify-between gap-4">
                            <div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-slate-950">{game.name}</span><Badge variant="secondary">{titleCase(game.category)}</Badge>{game.alreadyRegistered && <Badge className="bg-emerald-700">Already registered</Badge>}</div><p className="mt-1 text-xs text-slate-500">{titleCase(game.sportType)}{game.format ? ` · ${game.format}` : ""}</p>{game.alreadyRegistered && <p className="mt-2 text-xs font-medium text-emerald-800">This family cannot register for this event again.</p>}</div>
                            <div className="text-right"><p className="font-semibold text-slate-950">{money(game.registrationFeeMinor)}</p>{selectedGameId === game.id && <Check className="ml-auto mt-2 h-4 w-4" />}</div>
                          </div>
                        </button>
                        {game.resumePaymentUrl && <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => router.push(game.resumePaymentUrl)}><CreditCard className="mr-2 h-3.5 w-3.5" />Resume outstanding payment</Button>}
                      </div>
                    ))}
                    {!context.games?.length && <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">No events are configured for this tournament.</div>}
                    {context.games?.length > 0 && !selectableGames.length && <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">This family has no additional events available for registration.</div>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm"><CardContent className="p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Registration total</p><p className="mt-1 text-3xl font-semibold text-slate-950">{money(totalMinor)}</p><p className="mt-1 text-xs text-slate-500">Calculated from official event fees on the server.</p></div><Button size="lg" disabled={saving || !selectedFamily || !selectedGameId} onClick={register}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}{totalMinor > 0 ? "Register & continue to payment" : "Complete registration"}</Button></div></CardContent></Card>

            <div className="grid gap-4 sm:grid-cols-2"><Card><CardContent className="p-5"><div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4" />Duplicate protected</div><p className="mt-2 text-xs leading-5 text-slate-500">Existing entries are checked before submission and protected by a database uniqueness constraint.</p></CardContent></Card><Card><CardContent className="p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4" />No account required</div><p className="mt-2 text-xs leading-5 text-slate-500">Public registration does not create a login account. Staff authentication remains separate from tournament entry.</p></CardContent></Card></div>
          </div>
        </div>
      )}
    </main>
  );
}
