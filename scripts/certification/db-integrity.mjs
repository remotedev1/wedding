import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required for database certification.");
  process.exit(2);
}

const db = new PrismaClient();
const failures = [];
const warnings = [];

const push = (condition, message, details = null) => {
  if (condition) failures.push({ message, details });
};
const warn = (condition, message, details = null) => {
  if (condition) warnings.push({ message, details });
};
const minor = (value, fallback = 0) => Number(value ?? Math.round(Number(fallback || 0) * 100));

function overlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

try {
  const [
    registrations,
    payments,
    allocations,
    matches,
    events,
    officials,
    progressionLocks,
    sessions,
  ] = await Promise.all([
    db.gameRegistration.findMany({
      select: {
        id:true, gameId:true, participationId:true, paymentStatus:true,
        paymentAmount:true, paymentAmountMinor:true, paymentId:true,
        status:true, confirmedAt:true, roster:true, captainPlayerId:true,
        managerName:true, rosterLockedAt:true,
      },
      take:10000,
    }),
    db.payment.findMany({
      select: {
        id:true, amount:true, amountMinor:true, currency:true, status:true,
        paymentMethod:true, transactionId:true, orderId:true,
        registrationIds:true, paidAt:true, isRefunded:true,
        refundAmount:true, refundAmountMinor:true,
      },
      take:10000,
    }),
    db.paymentAllocation.findMany({
      select:{id:true,paymentId:true,registrationId:true,amountMinor:true,currency:true},
      take:20000,
    }),
    db.matches.findMany({
      select: {
        id:true,tournamentId:true,gameId:true,matchNo:true,sport:true,status:true,
        round:true,participants:true,winnerId:true,isDraw:true,
        resultVersion:true,controlVersion:true,lockedAt:true,
        clockRunning:true,clockStartedAt:true,actualEndTime:true,
        nextMatchId:true,scheduledOn:true,durationMinutes:true,
      },
      take:10000,
    }),
    db.matchEvent.findMany({
      select:{id:true,matchId:true,sequence:true,actionId:true},
      take:50000,
    }),
    db.matchOfficial.findMany({
      select:{
        id:true,matchId:true,userId:true,name:true,role:true,status:true,
        checkedInAt:true,checkedOutAt:true,
        match:{
          select:{
            id:true,status:true,scheduledOn:true,durationMinutes:true,
            game:{select:{matchDurationMinutes:true}},
          },
        },
      },
      take:20000,
    }),
    db.tournamentProgressionLock.findMany({
      select:{id:true,key:true,matchId:true,createdAt:true,updatedAt:true},
      take:5000,
    }),
    db.session.findMany({
      select:{id:true,userId:true,expiresAt:true,revokedAt:true,lastActiveAt:true},
      take:20000,
    }),
  ]);

  const regKey = new Set();
  for (const row of registrations) {
    const key = `${row.gameId}:${row.participationId}`;
    push(regKey.has(key), "Duplicate game registration exists despite compound uniqueness", { key, registrationId: row.id });
    regKey.add(key);

    const due = minor(row.paymentAmountMinor, row.paymentAmount);
    push(row.paymentStatus === "COMPLETED" && due > 0 && !row.paymentId,
      "Paid registration has no paymentId", { registrationId: row.id });
    push(row.paymentStatus === "PROCESSING" && !row.paymentId,
      "Processing registration has no payment claim", { registrationId: row.id });
    push(row.status === "CONFIRMED" && !row.confirmedAt,
      "Confirmed registration has no confirmedAt timestamp", { registrationId: row.id });
  }

  const allocationsByPayment = new Map();
  for (const allocation of allocations) {
    const list = allocationsByPayment.get(allocation.paymentId) || [];
    list.push(allocation);
    allocationsByPayment.set(allocation.paymentId, list);
    push(allocation.amountMinor < 0, "Payment allocation has negative amount", { allocationId: allocation.id });
  }

  const paymentById = new Map(payments.map((payment) => [payment.id, payment]));
  for (const payment of payments) {
    const amount = minor(payment.amountMinor, payment.amount);
    const rows = allocationsByPayment.get(payment.id) || [];
    const allocated = rows.reduce((sum, row) => sum + Number(row.amountMinor || 0), 0);

    push(amount < 0, "Payment amount is negative", { paymentId: payment.id });
    push(payment.status === "COMPLETED" && payment.paymentMethod === "RAZORPAY" && !payment.orderId,
      "Completed Razorpay payment has no orderId", { paymentId: payment.id });
    push(payment.status === "COMPLETED" && !payment.transactionId,
      "Completed payment has no transactionId", { paymentId: payment.id });
    push(payment.status === "COMPLETED" && !payment.paidAt,
      "Completed payment has no paidAt", { paymentId: payment.id });
    push(rows.length > 0 && allocated !== amount,
      "Payment allocations do not reconcile to canonical payment amount",
      { paymentId: payment.id, amountMinor: amount, allocatedMinor: allocated });
    push(payment.isRefunded && minor(payment.refundAmountMinor, payment.refundAmount) > amount,
      "Refund exceeds original payment", { paymentId: payment.id });
  }

  for (const row of registrations) {
    if (!row.paymentId) continue;
    const payment = paymentById.get(row.paymentId);
    push(!payment, "Registration references a missing payment", { registrationId: row.id, paymentId: row.paymentId });
    if (payment && row.paymentStatus === "COMPLETED") {
      push(payment.status !== "COMPLETED",
        "Registration is paid but linked payment is not completed",
        { registrationId: row.id, paymentId: payment.id, paymentStatus: payment.status });
    }
  }

  const knockoutRounds = new Set(["ROUND_OF_32","ROUND_OF_16","PRE_QUARTER","QUARTER_FINAL","SEMI_FINAL","THIRD_PLACE","FINAL"]);
  for (const match of matches) {
    push(match.controlVersion < 0 || match.resultVersion < 0,
      "Match version counters are invalid", { matchId: match.id });
    push(["COMPLETED","WALKOVER"].includes(match.status) && !match.lockedAt,
      "Completed/walkover match is not result-locked", { matchId: match.id, status: match.status });
    push(["COMPLETED","WALKOVER"].includes(match.status) && match.resultVersion < 1,
      "Completed/walkover match has no result version", { matchId: match.id });
    push(knockoutRounds.has(match.round) && ["COMPLETED","WALKOVER"].includes(match.status) && !match.winnerId,
      "Completed knockout match has no winner", { matchId: match.id, round: match.round });
    push(match.clockRunning && !match.clockStartedAt,
      "Running match clock has no clockStartedAt", { matchId: match.id });
    push(["COMPLETED","WALKOVER"].includes(match.status) && match.clockRunning,
      "Completed match still has running clock", { matchId: match.id });
  }

  const eventSequence = new Set();
  const actionIds = new Set();
  for (const event of events) {
    const sequenceKey = `${event.matchId}:${event.sequence}`;
    push(eventSequence.has(sequenceKey), "Duplicate match event sequence detected", { key: sequenceKey });
    eventSequence.add(sequenceKey);
    if (event.actionId) {
      const actionKey = `${event.matchId}:${event.actionId}`;
      push(actionIds.has(actionKey), "Duplicate match event actionId detected", { key: actionKey });
      actionIds.add(actionKey);
    }
  }

  const activeOfficials = officials.filter((row) =>
    row.userId && !["CANCELLED","NO_SHOW"].includes(row.status) &&
    !["CANCELLED","POSTPONED","ABANDONED","NO_RESULT"].includes(row.match?.status)
  );
  const byUser = new Map();
  for (const official of activeOfficials) {
    const list = byUser.get(official.userId) || [];
    list.push(official);
    byUser.set(official.userId, list);
  }
  for (const [userId, rows] of byUser) {
    rows.sort((a,b)=>new Date(a.match.scheduledOn)-new Date(b.match.scheduledOn));
    for (let i=0;i<rows.length;i++) {
      const a=rows[i];
      const aStart=new Date(a.match.scheduledOn);
      const aEnd=new Date(aStart.getTime()+Number(a.match.durationMinutes||a.match.game?.matchDurationMinutes||60)*60000);
      for (let j=i+1;j<rows.length;j++) {
        const b=rows[j];
        const bStart=new Date(b.match.scheduledOn);
        if (bStart >= aEnd) break;
        const bEnd=new Date(bStart.getTime()+Number(b.match.durationMinutes||b.match.game?.matchDurationMinutes||60)*60000);
        push(overlap(aStart,aEnd,bStart,bEnd),
          "Linked official is double-booked across overlapping fixtures",
          { userId, firstOfficialId:a.id, secondOfficialId:b.id, firstMatchId:a.matchId, secondMatchId:b.matchId });
      }
    }
  }

  const staleCutoff = Date.now() - 10 * 60 * 1000;
  for (const lock of progressionLocks) {
    warn(!lock.matchId && new Date(lock.updatedAt).getTime() < staleCutoff,
      "Stale knockout progression lock without matchId", { lockId: lock.id, key: lock.key });
  }

  const now = new Date();
  const expiredActiveSessions = sessions.filter((row) => !row.revokedAt && row.expiresAt < now);
  warn(expiredActiveSessions.length > 0,
    "Expired sessions remain unrevoked; cleanup is recommended",
    { count: expiredActiveSessions.length });

  console.log(JSON.stringify({
    ok: failures.length === 0,
    counts: {
      registrations: registrations.length,
      payments: payments.length,
      allocations: allocations.length,
      matches: matches.length,
      events: events.length,
      officials: officials.length,
      sessions: sessions.length,
    },
    failures,
    warnings,
  }, null, 2));

  if (failures.length) process.exitCode = 1;
} finally {
  await db.$disconnect();
}
