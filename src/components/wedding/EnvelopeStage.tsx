"use client";

import { type KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { wedding } from "@/data/wedding";
import { InvitationContent } from "./InvitationContent";
import { KodavaSymbol } from "./CulturalImage";
import { MusicToggle, WEDDING_MUSIC_START_EVENT } from "./MusicToggle";

interface EnvelopeStageProps {
  opened: boolean;
  onOpened: () => void;
  onReplay: () => void;
}

export function EnvelopeStage({
  opened,
  onOpened,
  onReplay
}: EnvelopeStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);
  const [animating, setAnimating] = useState(false);

  const requestMusicStart = () => {
    if (!wedding.audio.enabled) return;

    window.dispatchEvent(new Event(WEDDING_MUSIC_START_EVENT));
  };

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const wrap = root.querySelector(".envelope-wrap");
    const scene = root.querySelector(".envelope-scene");
    const body = root.querySelector(".envelope-body");
    const envelopePieces = Array.from(
      root.querySelectorAll(
        ".envelope-back, .envelope-lining, .envelope-left, .envelope-right, .envelope-bottom, .envelope-flap"
      )
    );
    const flap = root.querySelector(".envelope-flap");
    const seal = root.querySelector(".wax-seal");
    const sealRing = root.querySelector(".wax-seal-ring");
    const card = root.querySelector(".invite-card");
    const hint = root.querySelector(".open-hint");

    if (opened) {
      animatingRef.current = false;
      return;
    }

    if (!wrap || !scene || !body || !flap || !seal || !sealRing || !card || !hint) return;

    animatingRef.current = false;
    gsap.killTweensOf([wrap, scene, body, flap, seal, sealRing, card, hint, ...envelopePieces]);

    gsap.set(wrap, {
      opacity: 1,
      pointerEvents: "auto"
    });

    gsap.set(scene, {
      scale: 1,
      rotateX: 0,
      rotateY: 0
    });

    gsap.set(body, {
      opacity: 1,
      y: 0
    });

    gsap.set(envelopePieces, {
      autoAlpha: 1,
      y: 0
    });
    gsap.set(flap, {
      rotateX: 0,
      zIndex: 60,
      transformOrigin: "top center"
    });

    gsap.set(seal, {
      opacity: 1,
      scale: 1,
      rotate: 0,
      zIndex: 80
    });

    gsap.set(sealRing, {
      opacity: 1,
      scale: 1
    });

    gsap.set(card, {
      autoAlpha: 0,
      yPercent: -5,
      scale: 0.94,
      rotateX: 0,
      zIndex: 24
    });
    gsap.set(hint, {
      opacity: 1,
      y: 0
    });
  }, [opened]);

  const openEnvelope = () => {
    if (animatingRef.current || animating || opened || !rootRef.current) return;

    requestMusicStart();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      animatingRef.current = true;
      onOpened();
      return;
    }

    animatingRef.current = true;
    setAnimating(true);

    const root = rootRef.current;
    const wrap = root.querySelector(".envelope-wrap");
    const scene = root.querySelector(".envelope-scene");
    const envelopePieces = Array.from(
      root.querySelectorAll(
        ".envelope-back, .envelope-lining, .envelope-left, .envelope-right, .envelope-bottom, .envelope-flap"
      )
    );
    const flap = root.querySelector(".envelope-flap");
    const seal = root.querySelector(".wax-seal");
    const sealRing = root.querySelector(".wax-seal-ring");
    const card = root.querySelector(".invite-card");
    const hint = root.querySelector(".open-hint");

    if (!wrap || !scene || !flap || !seal || !sealRing || !card || !hint) {
      animatingRef.current = false;
      setAnimating(false);
      return;
    }

    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        animatingRef.current = false;
        setAnimating(false);
        onOpened();
      }
    });

    // 1. Acknowledge the click.
    tl.to(hint, {
      opacity: 0,
      y: 8,
      duration: 0.18,
      ease: "power1.out"
    })
      .to(
        scene,
        {
          scale: 1.012,
          duration: 0.18,
          ease: "power1.out"
        },
        "<"
      )

      // 2. Break the wax seal.
      .to(seal, {
        scale: 1.08,
        rotate: -4,
        duration: 0.14,
        ease: "power1.out"
      })
      .to(
        sealRing,
        {
          scale: 1.28,
          opacity: 0,
          duration: 0.18,
          ease: "power1.out"
        },
        "<"
      )
      .to(seal, {
        opacity: 0,
        scale: 0.65,
        rotate: 7,
        duration: 0.24,
        ease: "power2.in"
      })

      // 3. Wake the tucked card, then open the flap.
      .set(card, {
        autoAlpha: 1,
        yPercent: -5,
        scale: 0.94,
        zIndex: 24
      })
      .to(flap, {
        rotateX: -176,
        duration: 0.72,
        ease: "power3.inOut"
      }, "-=0.02")

      // 4. Pull the card up while the front folds still mask its lower edge.
      .set(flap, {
        zIndex: 12
      })
      .to(card, {
        yPercent: -66,
        scale: 1,
        duration: 0.92,
        ease: "power3.out"
      }, "-=0.04")
      .set(card, {
        zIndex: 72
      })
      .to(card, {
        yPercent: -92,
        scale: 1.028,
        duration: 0.42,
        ease: "back.out(1.18)"
      })

      // 5. Let the envelope pieces fall away after the card is outside.
      .to(envelopePieces, {
        y: 70,
        autoAlpha: 0,
        duration: 0.46,
        ease: "power2.in"
      }, "-=0.18")

      // 6. Fade the lifted card into the full invitation.
      .to(card, {
        yPercent: -112,
        scale: 1.045,
        autoAlpha: 0,
        duration: 0.42,
        ease: "power2.inOut"
      }, "-=0.08")
      .to(wrap, {
        opacity: 0,
        duration: 0.22,
        ease: "power1.out"
      }, "-=0.18");
  };

  const handleStageKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    openEnvelope();
  };

  return (
    <div
      ref={rootRef}
      className={`envelope-stage ${opened ? "content-open" : ""}`}
      onClick={!opened ? openEnvelope : undefined}
      onKeyDown={!opened ? handleStageKeyDown : undefined}
      role={!opened ? "button" : undefined}
      tabIndex={!opened ? 0 : undefined}
      aria-label={!opened ? "Open wedding invitation" : undefined}
      aria-disabled={!opened && animating ? true : undefined}
    >
      <MusicToggle visible={opened} />

      {!opened && (
        <>
          <div className="ambient-glow" aria-hidden="true" />
          <div className="paper-noise" aria-hidden="true" />
        </>
      )}

      {!opened && (
        <section className="envelope-wrap" aria-label="Wedding invitation envelope">
          <div className="envelope-button" aria-hidden="true">
            <span className="envelope-scene">
              <span className="envelope-body premium-envelope">
                <span className="envelope-back" />
                <span className="envelope-lining" />
                <span className="invite-card premium-card">
                  <span className="card-inner-border" aria-hidden="true" />
                  <span className="mini-symbol">
                    <KodavaSymbol className="envelope-kodava-symbol" alt="" />
                  </span>
                  <span className="mini-copy">Wedding Invitation</span>
                  <span className="mini-names">
                    {wedding.couple.groom.name}
                    <i>&amp;</i>
                    {wedding.couple.bride.name}
                  </span>
                  <span className="mini-place">{wedding.splash.location}</span>
                </span>
                <span className="envelope-flap">
                  <span className="flap-inner" />
                </span>
                <span className="envelope-left" />
                <span className="envelope-right" />
                <span className="envelope-bottom" />

                <span className="wax-seal" aria-hidden="true">
                  <span className="wax-seal-ring" />
                  <span className="wax-seal-monogram text-xl">Open</span>
                </span>
              </span>
            </span>
          </div>

          <div className="open-hint">
            <strong>Tap to open</strong>
            <span className="hint-line" aria-hidden="true" />
          </div>
        </section>
      )}

      {opened && <InvitationContent onReplay={onReplay} />}
    </div>
  );
}
