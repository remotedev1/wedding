"use client";

import { useEffect, useMemo, useState } from "react";
import { wedding } from "@/data/wedding";

function difference(target: number) {
  const total = Math.max(0, target - Date.now());
  return {
    days: Math.floor(total / 86400000),
    hours: Math.floor((total / 3600000) % 24),
    minutes: Math.floor((total / 60000) % 60),
    seconds: Math.floor((total / 1000) % 60)
  };
}

export function Countdown() {
  const target = useMemo(() => new Date(wedding.weddingDate).getTime(), []);
  const [time, setTime] = useState(() => difference(target));

  useEffect(() => {
    const timer = window.setInterval(() => setTime(difference(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <div className="countdown" aria-label="Countdown to the wedding">
      {[
        ["Days", time.days],
        ["Hours", time.hours],
        ["Minutes", time.minutes],
        ["Seconds", time.seconds]
      ].map(([label, value]) => (
        <div className="countdown-cell" key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
