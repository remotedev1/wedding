"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { wedding } from "@/data/wedding";
import { InvitationContent } from "./InvitationContent";
import { KodavaSymbol } from "./CulturalImage";

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
  const [animating, setAnimating] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const wrap = root.querySelector(".envelope-wrap");
    const scene = root.querySelector(".envelope-scene");
    const body = root.querySelector(".envelope-body");
    const flap = root.querySelector(".envelope-flap");
    const seal = root.querySelector(".wax-seal");
    const sealRing = root.querySelector(".wax-seal-ring");
    const card = root.querySelector(".invite-card");
    const hint = root.querySelector(".open-hint");

    if (opened) {
      gsap.set(wrap, { opacity: 0, pointerEvents: "none" });
      return;
    }

    gsap.killTweensOf([wrap, scene, body, flap, seal, sealRing, card, hint]);

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
      opacity: 1,
      yPercent: 24,
      scale: 0.965,
      rotateX: 0,
      zIndex: 20
    });

    gsap.set(hint, {
      opacity: 1,
      y: 0
    });
  }, [opened]);

  const openEnvelope = () => {
    if (animating || opened || !rootRef.current) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      onOpened();
      return;
    }

    setAnimating(true);

    const root = rootRef.current;
    const wrap = root.querySelector(".envelope-wrap");
    const scene = root.querySelector(".envelope-scene");
    const body = root.querySelector(".envelope-body");
    const flap = root.querySelector(".envelope-flap");
    const seal = root.querySelector(".wax-seal");
    const sealRing = root.querySelector(".wax-seal-ring");
    const card = root.querySelector(".invite-card");
    const hint = root.querySelector(".open-hint");

    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
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

      // 3. Open the flap while it is still above the card.
      .to(flap, {
        rotateX: -176,
        duration: 0.72,
        ease: "power3.inOut"
      }, "-=0.02")

      // 4. As soon as it is fully open, move flap behind the card.
      .set(flap, {
        zIndex: 12
      })
      .set(card, {
        zIndex: 70
      })

      // 5. Lift card out while front folds remain beneath it.
      .to(card, {
        yPercent: 0,
        scale: 1,
        duration: 0.26,
        ease: "power2.out"
      }, "-=0.02")
      .to(card, {
        yPercent: -76,
        scale: 1.018,
        duration: 0.72,
        ease: "power3.out"
      })

      // 6. Drop the envelope body away.
      .to(body, {
        y: 92,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in"
      }, "-=0.2")

      // 7. Card exits toward the viewer, then full page takes over.
      .to(card, {
        yPercent: -118,
        scale: 1.05,
        opacity: 0,
        duration: 0.46,
        ease: "power2.inOut"
      }, "-=0.08")
      .to(wrap, {
        opacity: 0,
        duration: 0.22,
        ease: "power1.out"
      }, "-=0.18");
  };

  return (
    <div ref={rootRef} className={`envelope-stage ${opened ? "content-open" : ""}`}>
      {!opened && (
        <>
          <div className="ambient-glow" aria-hidden="true" />
          <div className="paper-noise" aria-hidden="true" />
        </>
      )}

      {!opened && (
        <section className="envelope-wrap" aria-label="Wedding invitation envelope">
          <button
            className="envelope-button"
            type="button"
            onClick={openEnvelope}
            disabled={animating}
            aria-label="Open wedding invitation"
          >
            <span className="envelope-scene">
              <span className="invite-card premium-card">
                <span className="card-inner-border" aria-hidden="true" />
                <span className="mini-symbol">
                  <KodavaSymbol className="envelope-kodava-symbol" alt="" />
                </span>
                <span className="mini-copy">Wedding Invitation</span>
                <span className="mini-names">
                  {wedding.couple.bride.name}
                  <i>&amp;</i>
                  {wedding.couple.groom.name}
                </span>
                <span className="mini-place">{wedding.splash.location}</span>
              </span>

              <span className="envelope-body premium-envelope">
                <span className="envelope-back" />
                <span className="envelope-lining" />
                <span className="envelope-flap">
                  <span className="flap-inner" />
                </span>
                <span className="envelope-left" />
                <span className="envelope-right" />
                <span className="envelope-bottom" />

                <span className="wax-seal" aria-hidden="true">
                  <span className="wax-seal-ring" />
                  <span className="wax-seal-monogram">K</span>
                </span>
              </span>
            </span>
          </button>

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
