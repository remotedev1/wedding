import { db } from "@/lib/db";

const ACTION_TO_EVENT = {
  START_MATCH: "MATCH_START",
  END_MATCH: "MATCH_END",
  SET_PERIOD: "STATUS_CHANGE",
  SET_STATUS: "STATUS_CHANGE",
  START_CLOCK: "STATUS_CHANGE",
  PAUSE_CLOCK: "STATUS_CHANGE",
  RESET_CLOCK: "SCORE_CORRECTION",
  ADD_CARD: "CARD",
  ADD_PENALTY: "PENALTY",
  ADD_SUBSTITUTION: "SUBSTITUTION",
  ADD_SHOT: "SHOT",
  SET_TEAM_STAT: "STAT_UPDATE",
  ADD_COMMENTARY: "COMMENTARY",
  ADD_HOCKEY_GOAL: "GOAL",
  DELETE_HOCKEY_GOAL: "SCORE_CORRECTION",
  ADD_SHOOTOUT: "SHOOTOUT_ATTEMPT",
  DELETE_SHOOTOUT: "SCORE_CORRECTION",
  SET_WALKOVER: "STATUS_CHANGE",
  SET_WINNER: "STATUS_CHANGE",
  SET_DRAW: "STATUS_CHANGE",
  SET_MAN_OF_MATCH: "STAT_UPDATE",
  ADD_NOTE: "NOTE",
};

export async function appendLiveMatchEvent({ match, action, payload = {}, userId }) {
  const type = ACTION_TO_EVENT[action];
  if (!match?.id || !type) return null;
  // Sequence follows the authoritative match control version. This avoids
  // timestamp collisions/overflow and keeps one deterministic event position per committed action.
  const sequence = Number(payload.sequence ?? match.controlVersion ?? 0);
  const participant = (match.participants || []).find((item) => item.familyId === payload.familyId);
  return db.matchEvent.create({
    data: {
      matchId: match.id,
      type,
      sequence,
      period: payload.period || match.currentPeriod || null,
      minute: Number.isInteger(Number(payload.minute)) ? Number(payload.minute) : null,
      familyId: payload.familyId || null,
      familyName: participant?.family || null,
      playerId: payload.playerId || null,
      playerName: payload.playerName || null,
      secondaryPlayerId: payload.secondaryPlayerId || null,
      secondaryPlayerName: payload.secondaryPlayerName || null,
      value: payload.value ?? (payload.scored === true ? 1 : payload.scored === false ? 0 : null),
      description: payload.description || payload.note || (action === "DELETE_HOCKEY_GOAL" ? "Score correction: goal removed" : null),
      metadata: { action, status: match.status, round: match.round, cardType: payload.cardType || null, penaltyType: payload.penaltyType || null, onTarget: payload.onTarget ?? null, statKey: payload.statKey || null, mode: payload.mode || null },
      createdById: userId || null,
      actionId: payload.actionId || null,
    },
  });
}
