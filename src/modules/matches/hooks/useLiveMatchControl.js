// hooks/useLiveMatchControl.js
"use client";

import { useCallback, useRef, useReducer, useEffect } from "react";
import { toast } from "sonner";

/* ─────────────────────────────────────────────
   Reducer
───────────────────────────────────────────── */

const initialState = {
  pending: new Set(),
  match: null,
  error: null,
  isConnected: true,
  activeUsers: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "INIT":
      return { ...state, match: action.payload, error: null };

    case "ACTION_START":
      return {
        ...state,
        error: null,
        pending: new Set([...state.pending, action.key]),
        match: action.optimistic
          ? deepMergeMatch(state.match, action.optimistic)
          : state.match,
      };

    case "ACTION_SUCCESS":
      return {
        ...state,
        match: action.payload,
        pending: new Set([...state.pending].filter((k) => k !== action.key)),
      };

    case "ACTION_REVERT":
      return {
        ...state,
        match: action.previous,
        error: action.error,
        pending: new Set([...state.pending].filter((k) => k !== action.key)),
      };

    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload };

    case "SET_ACTIVE_USERS":
      return { ...state, activeUsers: action.payload };

    default:
      return state;
  }
}

/* Deep merge helper for nested participant data */
function deepMergeMatch(match, patch) {
  if (!match) return patch;
  return { ...match, ...patch };
}

/* ─────────────────────────────────────────────
   Optimistic patches per action type
───────────────────────────────────────────── */

function getOptimisticPatch(actionType, payload, currentMatch) {
  const now = new Date().toISOString();

  switch (actionType) {
    case "START_MATCH":
      return { status: "LIVE", actualStartTime: now, currentPeriod: "WARM_UP" };

    case "END_MATCH":
      return {
        status: "COMPLETED",
        actualEndTime: now,
        currentPeriod: "FULL_TIME",
      };

    case "SET_PERIOD":
      return { currentPeriod: payload.period };

    case "START_CLOCK":
      return { clockRunning: true, clockStartedAt: now };

    case "PAUSE_CLOCK": {
      const extra = currentMatch?.clockStartedAt ? Math.max(0, Math.floor((Date.now() - new Date(currentMatch.clockStartedAt).getTime()) / 1000)) : 0;
      return { clockRunning: false, clockStartedAt: null, clockAccumulatedSeconds: (currentMatch?.clockAccumulatedSeconds || 0) + extra };
    }

    case "RESET_CLOCK":
      return { clockRunning: false, clockStartedAt: null, clockAccumulatedSeconds: 0, clockSeconds: 0 };

    case "SET_STATUS":
      return {
        status: payload.status,
        ...(payload.status === "LIVE" ? { actualStartTime: now } : {}),
        ...(["COMPLETED", "ABANDONED", "WALKOVER"].includes(payload.status)
          ? { actualEndTime: now }
          : {}),
      };

    case "SET_WINNER":
      return {
        winnerId: payload.winnerId,
        winnerName: payload.winnerName,
        isDraw: false,
      };

    case "SET_DRAW":
      return { isDraw: true, winnerId: null, winnerName: null };

    case "SET_MAN_OF_MATCH":
      return { manOfTheMatchId: payload.manOfTheMatchId };

    case "ADD_NOTE":
      return { notes: payload.note };

    case "ADD_HOCKEY_GOAL": {
      const participants = (currentMatch?.participants || []).map((p) => {
        if (p.familyId !== payload.familyId) return p;
        const hockeyData = p.hockeyData || {
          goals: 0,
          shootoutResults: [],
          goalDetails: [],
        };
        return {
          ...p,
          hockeyData: {
            ...hockeyData,
            goals: hockeyData.goals + 1,
            goalDetails: [
              ...(hockeyData.goalDetails || []),
              {
                minute: payload.minute,
                period: payload.period,
                type: payload.type,
                playerId: payload.playerId,
                playerName: payload.playerName,
                jerseyNumber: payload.jerseyNumber || null,
              },
            ],
          },
        };
      });
      return { participants };
    }

    case "DELETE_HOCKEY_GOAL": {
      const participants = (currentMatch?.participants || []).map((p) => {
        if (p.familyId !== payload.familyId) return p;
        const hd = p.hockeyData || {
          goals: 0,
          shootoutResults: [],
          goalDetails: [],
        };
        const goalDetails = (hd.goalDetails || []).filter(
          (_, i) => i !== payload.index,
        );
        return {
          ...p,
          hockeyData: { ...hd, goals: Math.max(0, hd.goals - 1), goalDetails },
        };
      });
      return { participants };
    }

    case "ADD_SHOOTOUT": {
      const participants = (currentMatch?.participants || []).map((p) => {
        if (p.familyId !== payload.familyId) return p;
        const hd = p.hockeyData || {
          goals: 0,
          shootoutResults: [],
          goalDetails: [],
        };
        return {
          ...p,
          hockeyData: {
            ...hd,
            shootoutResults: [...(hd.shootoutResults || []), payload.scored],
          },
        };
      });
      return { participants };
    }

    case "DELETE_SHOOTOUT": {
      const participants = (currentMatch?.participants || []).map((p) => {
        if (p.familyId !== payload.familyId) return p;
        const hd = p.hockeyData || {
          goals: 0,
          shootoutResults: [],
          goalDetails: [],
        };
        return {
          ...p,
          hockeyData: {
            ...hd,
            shootoutResults: (hd.shootoutResults || []).filter(
              (_, i) => i !== payload.index,
            ),
          },
        };
      });
      return { participants };
    }

    case "SET_WALKOVER": {
      const participants = (currentMatch?.participants || []).map((p) => ({
        ...p,
        walkover: p.familyId === payload.familyId ? true : p.walkover,
      }));
      return { participants, status: "WALKOVER" };
    }

    case "ADD_FOOTBALL_GOAL":
    case "DELETE_FOOTBALL_GOAL":
    case "ADD_CRICKET_DATA":
      // For football/cricket, just do a refetch - complex to optimistically update
      return null;

    default:
      return null;
  }
}

/* ─────────────────────────────────────────────
   Main hook
───────────────────────────────────────────── */

export function useLiveMatchControl(
  matchId,
  tournamentId,
  initialMatch = null,
) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    match: initialMatch,
  });

  const abortRefs = useRef({});
  // Always keep a ref to the latest state to avoid stale closures in dispatch_action
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    if (initialMatch) {
      dispatch({ type: "INIT", payload: initialMatch });
    }
  }, [initialMatch]);

  /* ── Live synchronization ──
     The project did not include a Socket.IO server, so the previous client
     attempted to connect to a non-existent endpoint. Use lightweight polling
     instead: deterministic, deployable on standard Next.js hosting, and easy
     to replace with SSE/WebSockets later if needed.
  ── */
  const refetchRef = useRef(null);

  useEffect(() => {
    if (!matchId || !tournamentId) return;

    const refresh = () => refetchRef.current?.();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 10000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [matchId, tournamentId]);

  const broadcastUpdate = useCallback(() => {}, []);

  /* ── Core PATCH dispatcher ── */
  const dispatch_action = useCallback(
    async (actionType, payload = {}, key = actionType) => {
      // Always read from ref to avoid stale closures — state.match is null on first render
      const { pending, match: currentMatch } = stateRef.current;

      if (pending.size > 0) {
        toast.info("A match update is still being saved");
        return null;
      }

      if (abortRefs.current[key]) {
        abortRefs.current[key].abort();
      }
      const controller = new AbortController();
      abortRefs.current[key] = controller;

      const previousMatch = currentMatch;
      const optimistic = getOptimisticPatch(actionType, payload, currentMatch);

      dispatch({ type: "ACTION_START", key, optimistic });

      try {
        const response = await fetch(
          `/api/tournaments/${tournamentId}/matches/${matchId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: actionType,
              ...payload,
              expectedControlVersion: Number(currentMatch?.controlVersion || 0),
              actionId: typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            }),
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          const error = new Error(body.error || body.message || `${actionType} failed`);
          error.status = response.status;
          error.code = body?.details?.code || body?.code || null;
          throw error;
        }

        const result = await response.json();

        const updatedMatch = result.data;
        dispatch({ type: "ACTION_SUCCESS", key, payload: updatedMatch });
        broadcastUpdate(updatedMatch);
        return updatedMatch;
      } catch (err) {
        if (err.name === "AbortError") return null;
        dispatch({
          type: "ACTION_REVERT",
          key,
          previous: previousMatch,
          error: err.message,
        });
        if (err.status === 409 && err.code === "MATCH_VERSION_CONFLICT") {
          toast.error("Another scorer updated this match. Refreshing the latest state.");
          await refetchRef.current?.();
        } else {
          toast.error(err.message || "Action failed");
        }
        throw err;
      } finally {
        delete abortRefs.current[key];
      }
    },
    [matchId, tournamentId, broadcastUpdate], // stateRef always has latest — no stale dep needed
  );

  /* ── Full refetch (for complex mutations) ── */
  const refetch = useCallback(async () => {
    if (!matchId || stateRef.current.pending.size > 0) return;
    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/matches/${matchId}`,
      );
      if (!res.ok) throw new Error("Refetch failed");
      const data = await res.json();
      const match = data.data;
      dispatch({ type: "INIT", payload: match });
      broadcastUpdate(match);
      return match;
    } catch (err) {
      toast.error("Failed to refresh match data");
    }
  }, [matchId, tournamentId, broadcastUpdate]);

  refetchRef.current = refetch;

  /* ── Match lifecycle ── */
  const startMatch = useCallback(
    () => dispatch_action("START_MATCH"),
    [dispatch_action],
  );
  const endMatch = useCallback(
    () => dispatch_action("END_MATCH"),
    [dispatch_action],
  );

  /* ── Status & Period ── */
  const setPeriod = useCallback(
    (period) => dispatch_action("SET_PERIOD", { period }, `PERIOD_${period}`),
    [dispatch_action],
  );
  const setStatus = useCallback(
    (status) => dispatch_action("SET_STATUS", { status }, `STATUS_${status}`),
    [dispatch_action],
  );
  const startClock = useCallback(() => dispatch_action("START_CLOCK"), [dispatch_action]);
  const pauseClock = useCallback(() => dispatch_action("PAUSE_CLOCK"), [dispatch_action]);
  const resetClock = useCallback(() => dispatch_action("RESET_CLOCK"), [dispatch_action]);

  /* ── Result ── */
  const setWinner = useCallback(
    (winnerId, winnerName) =>
      dispatch_action("SET_WINNER", { winnerId, winnerName }),
    [dispatch_action],
  );
  const setDraw = useCallback(
    () => dispatch_action("SET_DRAW"),
    [dispatch_action],
  );
  const setManOfMatch = useCallback(
    (manOfTheMatchId) =>
      dispatch_action("SET_MAN_OF_MATCH", { manOfTheMatchId }),
    [dispatch_action],
  );

  /* ── Hockey specific ── */
  const addHockeyGoal = useCallback(
    (familyId, goalData) =>
      dispatch_action(
        "ADD_HOCKEY_GOAL",
        { familyId, ...goalData },
        `GOAL_${familyId}`,
      ),
    [dispatch_action],
  );
  const deleteHockeyGoal = useCallback(
    (familyId, index) =>
      dispatch_action(
        "DELETE_HOCKEY_GOAL",
        { familyId, index },
        `DEL_GOAL_${familyId}_${index}`,
      ),
    [dispatch_action],
  );
  const addShootout = useCallback(
    (familyId, scored) =>
      dispatch_action(
        "ADD_SHOOTOUT",
        { familyId, scored },
        `SHOOTOUT_${familyId}`,
      ),
    [dispatch_action],
  );
  const deleteShootout = useCallback(
    (familyId, index) =>
      dispatch_action(
        "DELETE_SHOOTOUT",
        { familyId, index },
        `DEL_SHOOTOUT_${familyId}_${index}`,
      ),
    [dispatch_action],
  );

  /* ── Football specific ── */
  const addFootballGoal = useCallback(
    (familyId, goalData) =>
      dispatch_action(
        "ADD_FOOTBALL_GOAL",
        { familyId, ...goalData },
        `FGOAL_${familyId}`,
      ).then(refetch),
    [dispatch_action, refetch],
  );
  const deleteFootballGoal = useCallback(
    (familyId, index) =>
      dispatch_action(
        "DELETE_FOOTBALL_GOAL",
        { familyId, index },
        `DEL_FGOAL_${familyId}_${index}`,
      ).then(refetch),
    [dispatch_action, refetch],
  );

  /* ── Walkover / Forfeit ── */
  const setWalkover = useCallback(
    (familyId) =>
      dispatch_action("SET_WALKOVER", { familyId }, `WALKOVER_${familyId}`),
    [dispatch_action],
  );

  /* ── Notes ── */
  const addNote = useCallback(
    (note) => dispatch_action("ADD_NOTE", { note }),
    [dispatch_action],
  );
  const addCard = useCallback((payload) => dispatch_action("ADD_CARD", payload, `CARD_${Date.now()}`), [dispatch_action]);
  const addPenalty = useCallback((payload) => dispatch_action("ADD_PENALTY", payload, `PENALTY_${Date.now()}`), [dispatch_action]);
  const addSubstitution = useCallback((payload) => dispatch_action("ADD_SUBSTITUTION", payload, `SUB_${Date.now()}`), [dispatch_action]);
  const addShot = useCallback((payload) => dispatch_action("ADD_SHOT", payload, `SHOT_${Date.now()}`).then(refetch), [dispatch_action, refetch]);
  const setTeamStat = useCallback((payload) => dispatch_action("SET_TEAM_STAT", payload, `STAT_${payload.familyId}_${payload.statKey}_${Date.now()}`).then(refetch), [dispatch_action, refetch]);
  const addCommentary = useCallback((description) => dispatch_action("ADD_COMMENTARY", { description }, `COMMENTARY_${Date.now()}`).then(refetch), [dispatch_action, refetch]);

  /* ── Sync from outside (socket, SSE, etc.) ── */
  const syncMatch = useCallback((match) => {
    dispatch({ type: "INIT", payload: match });
  }, []);

  /* ── Derived ── */
  const isAnyPending = state.pending.size > 0;
  const isActionPending = useCallback(
    (key) => stateRef.current.pending.has(key),
    [], // stateRef is stable
  );

  // Inside useLiveMatchControl, after all the callbacks are defined:
  useEffect(() => {
    refetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    match: state.match,
    error: state.error,
    isConnected: state.isConnected,
    activeUsers: state.activeUsers,

    // Loading
    loading: isAnyPending,
    isActionPending,
    pendingActions: state.pending,

    // Lifecycle
    startMatch,
    endMatch,

    // Status & Period
    setPeriod,
    setStatus,
    startClock,
    pauseClock,
    resetClock,

    // Result
    setWinner,
    setDraw,
    setManOfMatch,

    // Hockey
    addHockeyGoal,
    deleteHockeyGoal,
    addShootout,
    deleteShootout,

    // Football
    addFootballGoal,
    deleteFootballGoal,

    // General
    setWalkover,
    addNote,
    addCard,
    addPenalty,
    addSubstitution,
    addShot,
    setTeamStat,
    addCommentary,

    // Utils
    syncMatch,
    refetch,
  };
}
