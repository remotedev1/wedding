"use client";

import { useEffect, useState } from "react";
import { wedding } from "@/data/wedding";
import { EnvelopeStage } from "./EnvelopeStage";
import { SplashScreen } from "./SplashScreen";

type Stage = "splash" | "envelope" | "invitation";

export function WeddingExperience() {
  const [stage, setStage] = useState<Stage>("splash");

  useEffect(() => {
    const timer = window.setTimeout(
      () => setStage("envelope"),
      wedding.splash.durationMs
    );

    return () => window.clearTimeout(timer);
  }, []);

  const handleOpened = () => {
    setStage("invitation");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const replay = () => {
    setStage("envelope");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <main className="wedding-shell">
      {stage === "splash" && <SplashScreen />}

      {(stage === "envelope" || stage === "invitation") && (
        <EnvelopeStage
          opened={stage === "invitation"}
          onOpened={handleOpened}
          onReplay={replay}
        />
      )}
    </main>
  );
}
