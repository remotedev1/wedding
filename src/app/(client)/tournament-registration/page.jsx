import { db } from "@/lib/db";
import { TournamentRegistration } from "@/modules/registrations/components/public/tournament-registration";

export const dynamic = "force-dynamic";

export default async function TournamentRegistrationPage() {
  const now = new Date();
  const tournament = await db.tournament.findFirst({
    where: {
      status: "REGISTRATION",
      OR: [{ registrationDeadline: null }, { registrationDeadline: { gte: now } }],
    },
    orderBy: { startDate: "asc" },
    select: { id: true, name: true },
  });

  if (!tournament) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tournament registration</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Registration is currently closed</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">There is no tournament accepting registrations right now. Please check back when the next registration window opens.</p>
        </div>
      </main>
    );
  }

  return <TournamentRegistration tournamentId={tournament.id} tournamentName={tournament.name} />;
}
