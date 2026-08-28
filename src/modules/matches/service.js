import { db } from "@/lib/db";
import { matchRepository } from "@/modules/matches/repository";
import { appendLiveMatchEvent } from "@/modules/tournaments/server/match-events";
import { advanceKnockoutIfReady } from "@/modules/tournaments/server/knockout";
import { createOperationalNotification } from "@/modules/operations/server/notifications";
import { logger } from "@/lib/logger";

export class MatchConflictError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "MatchConflictError";
    this.details = details;
  }
}

export async function commitLiveMatchMutation({
  existing,
  updateData,
  action,
  payload,
  userId,
  expectedControlVersion,
}) {
  if (!Number.isInteger(expectedControlVersion) || expectedControlVersion < 0) {
    throw new MatchConflictError("Match control version is required. Refresh the match and retry.");
  }

  if (payload.actionId) {
    const duplicate = await matchRepository.findActionEvent(existing.id, payload.actionId);
    if (duplicate) {
      return matchRepository.getDetailed(existing.id);
    }
  }

  const resultChanging = [
    "END_MATCH",
    "SET_WINNER",
    "SET_DRAW",
    "SET_WALKOVER",
    "ADD_HOCKEY_GOAL",
    "DELETE_HOCKEY_GOAL",
    "ADD_SHOOTOUT",
    "DELETE_SHOOTOUT",
  ].includes(action);

  const completing = ["END_MATCH", "SET_WALKOVER"].includes(action);
  const committed = await matchRepository.compareAndSwap(
    existing.id,
    expectedControlVersion,
    {
      ...updateData,
      ...(resultChanging ? { resultVersion: { increment: 1 } } : {}),
      ...(completing ? { lockedAt: new Date() } : {}),
    },
  );

  if (!committed) {
    const latest = await matchRepository.getDetailed(existing.id);
    throw new MatchConflictError(
      "This match was updated by another scorer or device. Your change was not applied. Refresh and retry.",
      { code: "MATCH_VERSION_CONFLICT", latestControlVersion: latest?.controlVersion ?? null },
    );
  }

  const match = await matchRepository.getDetailed(existing.id);
  if (!match) throw new MatchConflictError("Match no longer exists.");

  // Event write is idempotent by actionId lookup. It is intentionally after the
  // authoritative compare-and-swap so stale clients cannot create ghost events.
  try {
    await appendLiveMatchEvent({
      match,
      action,
      payload: { ...payload, actionId: payload.actionId, sequence: match.controlVersion },
      userId,
    });
  } catch (error) {
    logger.error("Committed match action could not append normalized event", {
      matchId: match.id,
      action,
      actionId: payload.actionId,
      controlVersion: match.controlVersion,
      error: error?.message,
    });
    await createOperationalNotification({
      type: "SYSTEM",
      severity: "CRITICAL",
      title: `Match audit event requires attention · ${match.name || `Match #${match.matchNo}`}`,
      message: `Action ${action} committed at control version ${match.controlVersion}, but its normalized event could not be written.`,
      href: `/dashboard/tournaments/${match.tournamentId}/matches/${match.id}/live`,
      entity: "match",
      entityId: match.id,
    }).catch(() => undefined);
  }

  if (["COMPLETED", "WALKOVER"].includes(match.status) && ["QUARTER_FINAL", "SEMI_FINAL"].includes(match.round)) {
    await advanceKnockoutIfReady(db, {
      tournamentId: match.tournamentId,
      gameId: match.gameId,
      round: match.round,
    });
  }

  if (["DELAYED", "SUSPENDED", "POSTPONED", "ABANDONED", "NO_RESULT"].includes(match.status)) {
    await createOperationalNotification({
      type: "MATCH",
      severity: ["ABANDONED", "SUSPENDED"].includes(match.status) ? "CRITICAL" : "WARNING",
      title: `${match.status.replaceAll("_", " ")} · ${match.name || `Match #${match.matchNo}`}`,
      message: `${match.tournament.name} requires operational attention for this fixture.`,
      href: `/dashboard/tournaments/${match.tournamentId}/matches/${match.id}/live`,
      entity: "match",
      entityId: match.id,
    });
  }

  if (match.status === "LIVE" && match.gameId) {
    const familyIds = (match.participants || []).map((participant) => participant.familyId);
    const participations = await db.tournamentParticipation.findMany({
      where: { tournamentId: match.tournamentId, familyId: { in: familyIds } },
      select: { id: true },
    });
    if (participations.length) {
      await db.gameRegistration.updateMany({
        where: {
          gameId: match.gameId,
          participationId: { in: participations.map((item) => item.id) },
          rosterLockedAt: null,
        },
        data: { rosterLockedAt: match.actualStartTime || new Date() },
      });
    }
  }

  return match;
}

export async function reopenCompletedMatch({
  tournamentId,
  matchId,
  expectedResultVersion,
  reason,
}) {
  const match = await db.matches.findFirst({
    where: { id: matchId, tournamentId },
    select: {
      id: true, status: true, round: true, nextMatchId: true,
      resultVersion: true, lockedAt: true, notes: true,
    },
  });
  if (!match) throw new MatchConflictError("Match not found.");
  if (!["COMPLETED", "WALKOVER"].includes(match.status)) {
    throw new MatchConflictError("Only a completed or walkover result can be reopened.");
  }
  if (match.resultVersion !== expectedResultVersion) {
    throw new MatchConflictError("Result version changed. Refresh before requesting a correction.", {
      code: "RESULT_VERSION_CONFLICT",
      latestResultVersion: match.resultVersion,
    });
  }
  if (match.nextMatchId) {
    throw new MatchConflictError(
      "This result has already fed a later knockout fixture. Reset downstream progression before reopening it.",
      { code: "KNOCKOUT_ALREADY_ADVANCED" },
    );
  }

  const result = await db.matches.updateMany({
    where: {
      id: match.id,
      resultVersion: expectedResultVersion,
      status: { in: ["COMPLETED", "WALKOVER"] },
    },
    data: {
      status: "SUSPENDED",
      currentPeriod: null,
      actualEndTime: null,
      winnerId: null,
      winnerName: null,
      isDraw: false,
      lockedAt: null,
      clockRunning: false,
      clockStartedAt: null,
      resultVersion: { increment: 1 },
      controlVersion: { increment: 1 },
      notes: [match.notes, `RESULT CORRECTION: ${reason}`].filter(Boolean).join("\n"),
    },
  });
  if (result.count !== 1) {
    throw new MatchConflictError("Result changed while reopening. Refresh and retry.");
  }
  return matchRepository.getDetailed(match.id);
}
