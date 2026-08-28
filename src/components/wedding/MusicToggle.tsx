"use client";

import { useEffect, useRef, useState } from "react";
import { wedding } from "@/data/wedding";

export const WEDDING_MUSIC_START_EVENT = "wedding:music-start";

interface MusicToggleProps {
  visible?: boolean;
}

export function MusicToggle({ visible = true }: MusicToggleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const play = async () => {
      try {
        await audio.play();
      } catch {
        setPlaying(false);
      }
    };
    const handleError = () => setAvailable(false);
    const handlePause = () => setPlaying(false);
    const handlePlay = () => setPlaying(true);

    audio.addEventListener("error", handleError);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    window.addEventListener(WEDDING_MUSIC_START_EVENT, play);

    return () => {
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      window.removeEventListener(WEDDING_MUSIC_START_EVENT, play);
    };
  }, []);

  if (!wedding.audio.enabled) return null;

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop preload="auto">
        <source src={wedding.audio.src} type="audio/mpeg" />
      </audio>

      {visible && available && (
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
      )}
    </>
  );
}
