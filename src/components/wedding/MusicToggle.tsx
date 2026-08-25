"use client";

import { useEffect, useRef, useState } from "react";
import { wedding } from "@/data/wedding";

export function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = () => setAvailable(false);
    audio.addEventListener("error", handleError);
    return () => audio.removeEventListener("error", handleError);
  }, []);

  if (!wedding.audio.enabled || !available) return null;

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
    } catch {
      setAvailable(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop preload="none">
        <source src={wedding.audio.src} type="audio/mpeg" />
      </audio>

      <button
        className={`music-toggle ${playing ? "is-playing" : ""}`}
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause background music" : "Play background music"}
        aria-pressed={playing}
      >
        <span className="music-bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>{playing ? "Pause" : wedding.audio.label}</span>
      </button>
    </>
  );
}
