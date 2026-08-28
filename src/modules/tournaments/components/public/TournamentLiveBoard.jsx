"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, CalendarClock, MapPin, RefreshCw, Trophy } from "lucide-react";

function label(value = "") {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTime(value) {
  if (!value) return "TBA";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function MatchCard({ match, live = false }) {
  const [home, away] = match.participants || [];
  return (
    <Link href={`/tournament/matches/${match.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        <span>{match.gameName || label(match.sport)}</span>
        <span className={live ? "text-red-600" : "text-slate-600"}>
          {live ? "● Live" : label(match.status)}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">{home?.family || "TBD"}</p>
        </div>
        <div className="rounded-xl bg-slate-950 px-3 py-2 text-center text-white">
          <div className="text-xl font-black tabular-nums sm:text-2xl">
            {home?.score ?? 0} <span className="text-slate-500">–</span> {away?.score ?? 0}
          </div>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">{away?.family || "TBD"}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" />{formatTime(match.scheduledOn)}</span>
        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{label(match.venue)}</span>
        <span>{label(match.round)}</span>
      </div>
    </Link>
  );
}

export default function TournamentLiveBoard({ initialTournament, compact = false }) {
  const [tournament, setTournament] = useState(initialTournament);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/public/tournaments/current", { cache: "no-store" });
      const payload = await response.json();
      if (response.ok && payload.success) setTournament(payload.data);
    } catch {
      // Keep the last known server-rendered snapshot on transient network errors.
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(refresh, 15000);
    const onVisibility = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  if (!tournament) return null;

  const liveMatches = tournament.liveMatches || [];
  const upcoming = tournament.upcomingMatches || [];

  return (
    <section id="live" className="bg-slate-50 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-red-600">
              <Activity className="h-4 w-4" /> Tournament pulse
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {liveMatches.length ? "Live now" : "Next on the turf"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Scores and fixture status are published from the same tournament-control system used by officials.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {liveMatches.length ? (
          <div className={`grid gap-4 ${compact ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
            {liveMatches.map((match) => <MatchCard key={match.id} match={match} live />)}
          </div>
        ) : upcoming.length ? (
          <div className={`grid gap-4 ${compact ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
            {upcoming.slice(0, compact ? 4 : 6).map((match) => <MatchCard key={match.id} match={match} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <Trophy className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-800">No published fixtures yet.</p>
          </div>
        )}

        {compact && (
          <div className="mt-6 text-center">
            <Link href="/tournament" className="font-semibold text-blue-700 hover:text-blue-900">
              View full schedule, standings and results →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
