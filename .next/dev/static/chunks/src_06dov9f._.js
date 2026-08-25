(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/wedding/Countdown.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Countdown",
    ()=>Countdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/wedding.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function difference(target) {
    const total = Math.max(0, target - Date.now());
    return {
        days: Math.floor(total / 86400000),
        hours: Math.floor(total / 3600000 % 24),
        minutes: Math.floor(total / 60000 % 60),
        seconds: Math.floor(total / 1000 % 60)
    };
}
function Countdown() {
    _s();
    const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Countdown.useMemo[target]": ()=>new Date(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].weddingDate).getTime()
    }["Countdown.useMemo[target]"], []);
    const [time, setTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Countdown.useState": ()=>difference(target)
    }["Countdown.useState"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Countdown.useEffect": ()=>{
            const timer = window.setInterval({
                "Countdown.useEffect.timer": ()=>setTime(difference(target))
            }["Countdown.useEffect.timer"], 1000);
            return ({
                "Countdown.useEffect": ()=>window.clearInterval(timer)
            })["Countdown.useEffect"];
        }
    }["Countdown.useEffect"], [
        target
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "countdown",
        "aria-label": "Countdown to the wedding",
        children: [
            [
                "Days",
                time.days
            ],
            [
                "Hours",
                time.hours
            ],
            [
                "Minutes",
                time.minutes
            ],
            [
                "Seconds",
                time.seconds
            ]
        ].map(([label, value])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "countdown-cell",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: String(value).padStart(2, "0")
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/Countdown.tsx",
                        lineNumber: 34,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/Countdown.tsx",
                        lineNumber: 35,
                        columnNumber: 11
                    }, this)
                ]
            }, label, true, {
                fileName: "[project]/src/components/wedding/Countdown.tsx",
                lineNumber: 33,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/wedding/Countdown.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_s(Countdown, "fxyJiG+JMVdMEDoETRnmbinQ5+k=");
_c = Countdown;
var _c;
__turbopack_context__.k.register(_c, "Countdown");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/wedding/CulturalImage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KodavaSymbol",
    ()=>KodavaSymbol,
    "ThumBolicha",
    ()=>ThumBolicha
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/wedding.ts [app-client] (ecmascript)");
;
;
function KodavaSymbol({ className = "", alt = "Kodava symbol" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
        className: className,
        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].assets.kodavaSymbol,
        alt: alt,
        loading: "eager",
        decoding: "async",
        referrerPolicy: "no-referrer"
    }, void 0, false, {
        fileName: "[project]/src/components/wedding/CulturalImage.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_c = KodavaSymbol;
function ThumBolicha({ className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
        className: className,
        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].assets.thumBolicha,
        alt: "Thum Bolicha",
        loading: "lazy",
        decoding: "async",
        referrerPolicy: "no-referrer"
    }, void 0, false, {
        fileName: "[project]/src/components/wedding/CulturalImage.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_c1 = ThumBolicha;
var _c, _c1;
__turbopack_context__.k.register(_c, "KodavaSymbol");
__turbopack_context__.k.register(_c1, "ThumBolicha");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/wedding/EnvelopeStage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EnvelopeStage",
    ()=>EnvelopeStage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/wedding.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$InvitationContent$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/wedding/InvitationContent.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$CulturalImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/wedding/CulturalImage.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function EnvelopeStage({ opened, onOpened, onReplay }) {
    _s();
    const rootRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [animating, setAnimating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "EnvelopeStage.useLayoutEffect": ()=>{
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
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(wrap, {
                    opacity: 0,
                    pointerEvents: "none"
                });
                return;
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].killTweensOf([
                wrap,
                scene,
                body,
                flap,
                seal,
                sealRing,
                card,
                hint
            ]);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(wrap, {
                opacity: 1,
                pointerEvents: "auto"
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(scene, {
                scale: 1,
                rotateX: 0,
                rotateY: 0
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(body, {
                opacity: 1,
                y: 0
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(flap, {
                rotateX: 0,
                zIndex: 60,
                transformOrigin: "top center"
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(seal, {
                opacity: 1,
                scale: 1,
                rotate: 0,
                zIndex: 80
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(sealRing, {
                opacity: 1,
                scale: 1
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(card, {
                opacity: 1,
                yPercent: 24,
                scale: 0.965,
                rotateX: 0,
                zIndex: 20
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(hint, {
                opacity: 1,
                y: 0
            });
        }
    }["EnvelopeStage.useLayoutEffect"], [
        opened
    ]);
    const openEnvelope = ()=>{
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
        const tl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].timeline({
            defaults: {
                overwrite: "auto"
            },
            onComplete: ()=>{
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
        }).to(scene, {
            scale: 1.012,
            duration: 0.18,
            ease: "power1.out"
        }, "<")// 2. Break the wax seal.
        .to(seal, {
            scale: 1.08,
            rotate: -4,
            duration: 0.14,
            ease: "power1.out"
        }).to(sealRing, {
            scale: 1.28,
            opacity: 0,
            duration: 0.18,
            ease: "power1.out"
        }, "<").to(seal, {
            opacity: 0,
            scale: 0.65,
            rotate: 7,
            duration: 0.24,
            ease: "power2.in"
        })// 3. Open the flap while it is still above the card.
        .to(flap, {
            rotateX: -176,
            duration: 0.72,
            ease: "power3.inOut"
        }, "-=0.02")// 4. As soon as it is fully open, move flap behind the card.
        .set(flap, {
            zIndex: 12
        }).set(card, {
            zIndex: 70
        })// 5. Lift card out while front folds remain beneath it.
        .to(card, {
            yPercent: 0,
            scale: 1,
            duration: 0.26,
            ease: "power2.out"
        }, "-=0.02").to(card, {
            yPercent: -76,
            scale: 1.018,
            duration: 0.72,
            ease: "power3.out"
        })// 6. Drop the envelope body away.
        .to(body, {
            y: 92,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in"
        }, "-=0.2")// 7. Card exits toward the viewer, then full page takes over.
        .to(card, {
            yPercent: -118,
            scale: 1.05,
            opacity: 0,
            duration: 0.46,
            ease: "power2.inOut"
        }, "-=0.08").to(wrap, {
            opacity: 0,
            duration: 0.22,
            ease: "power1.out"
        }, "-=0.18");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: rootRef,
        className: `envelope-stage ${opened ? "content-open" : ""}`,
        children: [
            !opened && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ambient-glow",
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                        lineNumber: 218,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "paper-noise",
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                        lineNumber: 219,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                lineNumber: 217,
                columnNumber: 9
            }, this),
            !opened && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "envelope-wrap",
                "aria-label": "Wedding invitation envelope",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "envelope-button",
                        type: "button",
                        onClick: openEnvelope,
                        disabled: animating,
                        "aria-label": "Open wedding invitation",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "envelope-scene",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "invite-card premium-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "card-inner-border",
                                            "aria-hidden": "true"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                            lineNumber: 234,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "mini-symbol",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$CulturalImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KodavaSymbol"], {
                                                className: "envelope-kodava-symbol",
                                                alt: ""
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                                lineNumber: 236,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                            lineNumber: 235,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "mini-copy",
                                            children: "Wedding Invitation"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                            lineNumber: 238,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "mini-names",
                                            children: [
                                                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couple.bride.name,
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                    children: "&"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                                    lineNumber: 241,
                                                    columnNumber: 19
                                                }, this),
                                                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couple.groom.name
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                            lineNumber: 239,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "mini-place",
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].splash.location
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                            lineNumber: 244,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                    lineNumber: 233,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "envelope-body premium-envelope",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "envelope-back"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                            lineNumber: 248,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "envelope-lining"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                            lineNumber: 249,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "envelope-flap",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flap-inner"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                                lineNumber: 251,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                            lineNumber: 250,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "envelope-left"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                            lineNumber: 253,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "envelope-right"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                            lineNumber: 254,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "envelope-bottom"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                            lineNumber: 255,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "wax-seal",
                                            "aria-hidden": "true",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "wax-seal-ring"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                                    lineNumber: 258,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "wax-seal-monogram",
                                                    children: "K"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                                    lineNumber: 259,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                            lineNumber: 257,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                    lineNumber: 247,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                            lineNumber: 232,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                        lineNumber: 225,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "open-hint",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hint-eyebrow",
                                children: "Private Invitation"
                            }, void 0, false, {
                                fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                lineNumber: 266,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Tap to open"
                            }, void 0, false, {
                                fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                lineNumber: 267,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hint-line",
                                "aria-hidden": "true"
                            }, void 0, false, {
                                fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                                lineNumber: 268,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                        lineNumber: 265,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                lineNumber: 224,
                columnNumber: 9
            }, this),
            opened && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$InvitationContent$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InvitationContent"], {
                onReplay: onReplay
            }, void 0, false, {
                fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
                lineNumber: 273,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/wedding/EnvelopeStage.tsx",
        lineNumber: 215,
        columnNumber: 5
    }, this);
}
_s(EnvelopeStage, "W4+sY69J0WvcDzTbFVCkJA5V/7E=");
_c = EnvelopeStage;
var _c;
__turbopack_context__.k.register(_c, "EnvelopeStage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/wedding/GuestActions.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GuestActions",
    ()=>GuestActions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/wedding.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/calendar.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function invitationUrl() {
    if ("TURBOPACK compile-time truthy", 1) {
        return window.location.href;
    }
    //TURBOPACK unreachable
    ;
}
function whatsappUrl() {
    const text = `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].sharing.message}\n\n${invitationUrl()}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
function GuestActions() {
    _s();
    const calendarData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GuestActions.useMemo[calendarData]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$calendar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createCalendarData"])({
                title: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couple.bride.name} & ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couple.groom.name} Wedding`,
                description: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].invitation.message,
                location: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].venue.name}, ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].venue.place}`,
                start: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].weddingDate,
                end: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].weddingEndDate
            })
    }["GuestActions.useMemo[calendarData]"], []);
    const downloadCalendar = ()=>{
        const blob = new Blob([
            calendarData
        ], {
            type: "text/calendar;charset=utf-8"
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "wedding-invitation.ics";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    };
    const nativeShare = async ()=>{
        if (!navigator.share) {
            window.open(whatsappUrl(), "_blank", "noopener,noreferrer");
            return;
        }
        try {
            await navigator.share({
                title: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].site.title,
                text: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].sharing.message,
                url: invitationUrl()
            });
        } catch  {
        // A cancelled share dialog is expected and needs no UI error.
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "guest-actions w-full mx-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            type: "button",
            onClick: downloadCalendar,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    "aria-hidden": "true",
                    children: "＋"
                }, void 0, false, {
                    fileName: "[project]/src/components/wedding/GuestActions.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this),
                "Add to calendar"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/wedding/GuestActions.tsx",
            lineNumber: 69,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/wedding/GuestActions.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_s(GuestActions, "KWuRo9SM0aXyX2GegErjEuzqD0g=");
_c = GuestActions;
var _c;
__turbopack_context__.k.register(_c, "GuestActions");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/wedding/InvitationContent.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InvitationContent",
    ()=>InvitationContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/wedding.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$Countdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/wedding/Countdown.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$GuestActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/wedding/GuestActions.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$MusicToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/wedding/MusicToggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$RsvpSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/wedding/RsvpSection.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$ScrollReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/wedding/ScrollReveal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$CulturalImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/wedding/CulturalImage.tsx [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
function InvitationContent({ onReplay }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "full-invitation",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$MusicToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MusicToggle"], {}, void 0, false, {
                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "invite-hero section-shell",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "botanical botanical-left",
                        "aria-hidden": "true",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            src: "/images/coffee-branch.svg",
                            alt: "",
                            width: 240,
                            height: 320
                        }, void 0, false, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 17,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "invite-hero-inner",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$CulturalImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KodavaSymbol"], {
                                className: "hero-symbol cultural-symbol mx-auto"
                            }, void 0, false, {
                                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                lineNumber: 21,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "hero-message host-message",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].invitation.message
                            }, void 0, false, {
                                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                lineNumber: 22,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "hero-names",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couple.bride.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                        lineNumber: 24,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                        children: "&"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                        lineNumber: 25,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couple.groom.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                        lineNumber: 26,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                lineNumber: 23,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "fine-ornament",
                                "aria-hidden": "true",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                        lineNumber: 28,
                                        columnNumber: 61
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: "✦"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                        lineNumber: 28,
                                        columnNumber: 69
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                        lineNumber: 28,
                                        columnNumber: 77
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                lineNumber: 28,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "wedding-with",
                                children: "with"
                            }, void 0, false, {
                                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                lineNumber: 29,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hero-date",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].invitation.date
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                        lineNumber: 31,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].invitation.time
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                        lineNumber: 32,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].invitation.venue
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                        lineNumber: 33,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                lineNumber: 30,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                className: "text-link",
                                href: "#details",
                                children: "View celebration details"
                            }, void 0, false, {
                                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                lineNumber: 35,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "story-section section-shell",
                id: "details",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$ScrollReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollReveal"], {
                    className: "story-card",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "section-eyebrow",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].story.eyebrow
                        }, void 0, false, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].story.title
                        }, void 0, false, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 42,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].story.body
                        }, void 0, false, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 43,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                    lineNumber: 40,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couplePhoto.enabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "couple-photo-section section-shell",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$ScrollReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollReveal"], {
                    className: "couple-photo-card",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "couple-photo-frame",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couplePhoto.src,
                                alt: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couplePhoto.alt,
                                width: 900,
                                height: 1100,
                                sizes: "(max-width: 760px) 92vw, 44vw"
                            }, void 0, false, {
                                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                lineNumber: 51,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 50,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "couple-photo-copy",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "section-eyebrow",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couplePhoto.eyebrow
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 54,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couplePhoto.title
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 55,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couplePhoto.body
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 56,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 53,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                    lineNumber: 49,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "family-section section-shell",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$ScrollReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollReveal"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "section-heading",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "section-eyebrow",
                                    children: "OUR FAMILIES"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 65,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    children: "Together with our families"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 66,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "family-grid",
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couple.bride,
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couple.groom
                        ].map((person, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$ScrollReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollReveal"], {
                                delay: index * 0.08,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                    className: "family-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: person.familyLabel
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 73,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            children: person.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 74,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: person.parents
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 75,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                            children: person.place
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 76,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 72,
                                    columnNumber: 15
                                }, this)
                            }, person.name, false, {
                                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                lineNumber: 71,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "countdown-section section-shell",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$ScrollReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollReveal"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "section-heading compact",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "section-eyebrow",
                                    children: "COUNTING DOWN"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 86,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    children: "Until we celebrate together"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 87,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 85,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$Countdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Countdown"], {}, void 0, false, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "events-section section-shell",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$ScrollReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollReveal"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "section-heading",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "section-eyebrow",
                                    children: "THE CELEBRATION"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 96,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    children: "Wedding day"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "event-grid",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].events.map((event, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$ScrollReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollReveal"], {
                                delay: index * 0.08,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                    className: "event-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "event-number",
                                            children: [
                                                "0",
                                                index + 1
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 104,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            children: event.title
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 105,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: event.date
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 106,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: event?.time
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 107,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 103,
                                    columnNumber: 15
                                }, this)
                            }, event.title, false, {
                                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                lineNumber: 102,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "venue-section section-shell",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$ScrollReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollReveal"], {
                    className: "venue-card",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "venue-bolicha-panel",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "venue-bolicha-frame",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$CulturalImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThumBolicha"], {
                                        className: "venue-bolicha-image"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                        lineNumber: 118,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 117,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "venue-bolicha-caption",
                                    children: "Thum Bolicha"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 120,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "venue-content",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "section-eyebrow",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].venue.eyebrow
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 124,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].venue.name
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 125,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "venue-place",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].venue.place
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "venue-divider",
                                    "aria-hidden": "true",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 129,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                            children: "✦"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 131,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 128,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "venue-address",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].venue.address
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 134,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "venue-description",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].venue.description
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 135,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    className: "venue-map-button",
                                    href: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].venue.mapUrl,
                                    target: "_blank",
                                    rel: "noreferrer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "View location"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 143,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            "aria-hidden": "true",
                                            children: "↗"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                            lineNumber: 144,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 137,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                    lineNumber: 115,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "actions-section section-shell",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$ScrollReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollReveal"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "section-heading compact",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "section-eyebrow",
                                    children: "KEEP IT CLOSE"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 153,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    children: "Save and share the invitation"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 154,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 152,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$GuestActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GuestActions"], {}, void 0, false, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 156,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                    lineNumber: 151,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                lineNumber: 150,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$RsvpSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RsvpSection"], {}, void 0, false, {
                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "closing-section section-shell",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$ScrollReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollReveal"], {
                    className: "closing-inner",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "section-eyebrow",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].closing.eyebrow
                        }, void 0, false, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 164,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].closing.note
                        }, void 0, false, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 165,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "closing-names",
                            children: [
                                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couple.bride.name,
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "&"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                                    lineNumber: 167,
                                    columnNumber: 41
                                }, this),
                                " ",
                                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couple.groom.name
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 166,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "replay-button",
                            type: "button",
                            onClick: onReplay,
                            children: "Replay invitation"
                        }, void 0, false, {
                            fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                            lineNumber: 169,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                    lineNumber: 163,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/wedding/InvitationContent.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/wedding/InvitationContent.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = InvitationContent;
var _c;
__turbopack_context__.k.register(_c, "InvitationContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/wedding/MusicToggle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MusicToggle",
    ()=>MusicToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/wedding.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function MusicToggle() {
    _s();
    const audioRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [playing, setPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [available, setAvailable] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MusicToggle.useEffect": ()=>{
            const audio = audioRef.current;
            if (!audio) return;
            const handleError = {
                "MusicToggle.useEffect.handleError": ()=>setAvailable(false)
            }["MusicToggle.useEffect.handleError"];
            audio.addEventListener("error", handleError);
            return ({
                "MusicToggle.useEffect": ()=>audio.removeEventListener("error", handleError)
            })["MusicToggle.useEffect"];
        }
    }["MusicToggle.useEffect"], []);
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].audio.enabled || !available) return null;
    const toggle = async ()=>{
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
        } catch  {
            setAvailable(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                ref: audioRef,
                loop: true,
                preload: "none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].audio.src,
                    type: "audio/mpeg"
                }, void 0, false, {
                    fileName: "[project]/src/components/wedding/MusicToggle.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/wedding/MusicToggle.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: `music-toggle ${playing ? "is-playing" : ""}`,
                type: "button",
                onClick: toggle,
                "aria-label": playing ? "Pause background music" : "Play background music",
                "aria-pressed": playing,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "music-bars",
                        "aria-hidden": "true",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                                fileName: "[project]/src/components/wedding/MusicToggle.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                                fileName: "[project]/src/components/wedding/MusicToggle.tsx",
                                lineNumber: 54,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                                fileName: "[project]/src/components/wedding/MusicToggle.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/wedding/MusicToggle.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: playing ? "Pause" : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].audio.label
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/MusicToggle.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/wedding/MusicToggle.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/wedding/MusicToggle.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_s(MusicToggle, "fCJl81xxgU6MOq+7ArtA2hgsvio=");
_c = MusicToggle;
var _c;
__turbopack_context__.k.register(_c, "MusicToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/wedding/RsvpSection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RsvpSection",
    ()=>RsvpSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/wedding.ts [app-client] (ecmascript)");
;
;
function telHref(phone) {
    return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
function whatsappHref(phone, name) {
    const clean = phone.replace(/[^\d]/g, "");
    const message = `Hello ${name}, I am confirming my presence for the wedding of ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couple.bride.name} and ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].couple.groom.name}.`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
function RsvpSection() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].rsvp.enabled) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "rsvp-section section-shell",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "section-heading",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "section-eyebrow",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].rsvp.eyebrow
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/RsvpSection.tsx",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].rsvp.title
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/RsvpSection.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "section-copy",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].rsvp.message
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/RsvpSection.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/wedding/RsvpSection.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rsvp-grid",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].rsvp.contacts.map((contact)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        className: "rsvp-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: contact.label
                            }, void 0, false, {
                                fileName: "[project]/src/components/wedding/RsvpSection.tsx",
                                lineNumber: 27,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                children: contact.name
                            }, void 0, false, {
                                fileName: "[project]/src/components/wedding/RsvpSection.tsx",
                                lineNumber: 28,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: contact.phone
                            }, void 0, false, {
                                fileName: "[project]/src/components/wedding/RsvpSection.tsx",
                                lineNumber: 29,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rsvp-actions",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: telHref(contact.phone),
                                        children: "Call"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/wedding/RsvpSection.tsx",
                                        lineNumber: 32,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: whatsappHref(contact.phone, contact.name),
                                        target: "_blank",
                                        rel: "noreferrer",
                                        children: "WhatsApp"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/wedding/RsvpSection.tsx",
                                        lineNumber: 33,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/wedding/RsvpSection.tsx",
                                lineNumber: 31,
                                columnNumber: 13
                            }, this)
                        ]
                    }, `${contact.label}-${contact.phone}`, true, {
                        fileName: "[project]/src/components/wedding/RsvpSection.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/wedding/RsvpSection.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/wedding/RsvpSection.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = RsvpSection;
var _c;
__turbopack_context__.k.register(_c, "RsvpSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/wedding/ScrollReveal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScrollReveal",
    ()=>ScrollReveal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ScrollReveal({ children, className = "", delay = 0 }) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "ScrollReveal.useLayoutEffect": ()=>{
            const element = ref.current;
            if (!element) return;
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (reduced) return;
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(element, {
                opacity: 0,
                y: 26
            });
            const observer = new IntersectionObserver({
                "ScrollReveal.useLayoutEffect": ([entry])=>{
                    if (!entry.isIntersecting) return;
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(element, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        delay,
                        ease: "power2.out",
                        clearProps: "transform"
                    });
                    observer.disconnect();
                }
            }["ScrollReveal.useLayoutEffect"], {
                threshold: 0.14,
                rootMargin: "0px 0px -6% 0px"
            });
            observer.observe(element);
            return ({
                "ScrollReveal.useLayoutEffect": ()=>observer.disconnect()
            })["ScrollReveal.useLayoutEffect"];
        }
    }["ScrollReveal.useLayoutEffect"], [
        delay
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: className,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/wedding/ScrollReveal.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
_s(ScrollReveal, "JkctLsMDw5W2MbVlMaFRM76c/8g=");
_c = ScrollReveal;
var _c;
__turbopack_context__.k.register(_c, "ScrollReveal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/wedding/SplashScreen.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SplashScreen",
    ()=>SplashScreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/wedding.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$CulturalImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/wedding/CulturalImage.tsx [app-client] (ecmascript)");
;
;
;
function SplashScreen() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "splash-screen",
        "aria-label": "Wedding invitation introduction",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "splash-inner",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "splash-symbol",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$CulturalImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KodavaSymbol"], {
                        className: "splash-kodava-symbol"
                    }, void 0, false, {
                        fileName: "[project]/src/components/wedding/SplashScreen.tsx",
                        lineNumber: 9,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/wedding/SplashScreen.tsx",
                    lineNumber: 8,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "splash-location",
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].splash.location
                }, void 0, false, {
                    fileName: "[project]/src/components/wedding/SplashScreen.tsx",
                    lineNumber: 12,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "splash-line",
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].splash.line
                }, void 0, false, {
                    fileName: "[project]/src/components/wedding/SplashScreen.tsx",
                    lineNumber: 13,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/wedding/SplashScreen.tsx",
            lineNumber: 7,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/wedding/SplashScreen.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, this);
}
_c = SplashScreen;
var _c;
__turbopack_context__.k.register(_c, "SplashScreen");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/wedding/WeddingExperience.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WeddingExperience",
    ()=>WeddingExperience
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/wedding.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$EnvelopeStage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/wedding/EnvelopeStage.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$SplashScreen$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/wedding/SplashScreen.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function WeddingExperience() {
    _s();
    const [stage, setStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("splash");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WeddingExperience.useEffect": ()=>{
            const timer = window.setTimeout({
                "WeddingExperience.useEffect.timer": ()=>setStage("envelope")
            }["WeddingExperience.useEffect.timer"], __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$wedding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wedding"].splash.durationMs);
            return ({
                "WeddingExperience.useEffect": ()=>window.clearTimeout(timer)
            })["WeddingExperience.useEffect"];
        }
    }["WeddingExperience.useEffect"], []);
    const handleOpened = ()=>{
        setStage("invitation");
        window.scrollTo({
            top: 0,
            behavior: "auto"
        });
    };
    const replay = ()=>{
        setStage("envelope");
        window.scrollTo({
            top: 0,
            behavior: "auto"
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "wedding-shell",
        children: [
            stage === "splash" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$SplashScreen$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SplashScreen"], {}, void 0, false, {
                fileName: "[project]/src/components/wedding/WeddingExperience.tsx",
                lineNumber: 34,
                columnNumber: 30
            }, this),
            (stage === "envelope" || stage === "invitation") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$wedding$2f$EnvelopeStage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EnvelopeStage"], {
                opened: stage === "invitation",
                onOpened: handleOpened,
                onReplay: replay
            }, void 0, false, {
                fileName: "[project]/src/components/wedding/WeddingExperience.tsx",
                lineNumber: 37,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/wedding/WeddingExperience.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_s(WeddingExperience, "mA+5XFH5vv+ww3TxET+JSwpfBfY=");
_c = WeddingExperience;
var _c;
__turbopack_context__.k.register(_c, "WeddingExperience");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/data/wedding.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "wedding",
    ()=>wedding
]);
const wedding = {
    assets: {
        kodavaSymbol: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStRU5nH8Vvm4uzpG4YLiIqaAj-Xum79oOkMGclnDA6N99_CGikeAPgR48l&s=10",
        thumBolicha: "https://kodavaclan.com/kodaguheritage/wp-content/uploads/2019/02/bolcha.jpg"
    },
    site: {
        title: "Tharun & Ashwitha | Wedding Invitation",
        description: "You are warmly invited to celebrate the wedding of Tharun Chinnappa and Ashwitha Accamma in Ponnampet, Kodagu.",
        url: "https://your-wedding-domain.com",
        locale: "en_IN"
    },
    splash: {
        durationMs: 3000,
        location: "KODAGU • COORG",
        line: "A Kodava wedding celebration"
    },
    couple: {
        bride: {
            name: "Ashwitha Accamma",
            honorific: "Sou.",
            familyLabel: "Bride's Family",
            parents: "Daughter of Mr. Nellira Poonacha Manu & Mrs. Surekha",
            place: "Parakatageri"
        },
        groom: {
            name: "Tharun Chinnappa",
            honorific: "Chi.",
            familyLabel: "Groom's Family",
            parents: "Son of Late Mr. Konganda Nanjappa & Mrs. Nalini Nanjappa",
            place: "Kodagu"
        }
    },
    invitation: {
        message: "We cordially invites you to celebrate the wedding of her son",
        date: "THURSDAY • 5 NOVEMBER 2026",
        time: "Dampathi Muhurtham • 10:30 AM",
        venue: "Kodava Samaja, Ponnampet"
    },
    weddingDate: "2026-11-05T10:30:00+05:30",
    weddingEndDate: "2026-11-05T14:30:00+05:30",
    story: {
        eyebrow: "WITH THE BLESSINGS OF OUR FAMILIES",
        title: "Tharun & Ashwitha",
        body: "With joy and the blessings of our families, we invite you to join us in Ponnampet as we celebrate our wedding."
    },
    events: [
        {
            title: "Oorkuduvo",
            date: "Thursday, 4 November 2026"
        },
        {
            title: "Dampathi Muhurtham",
            date: "Thursday, 5 November 2026",
            time: "10:30 AM"
        }
    ],
    venue: {
        eyebrow: "THE VENUE",
        name: "Kodava Samaja",
        place: "Ponnampet, Kodagu",
        address: "Kodava Samaja, Ponnampet, Kodagu, Karnataka",
        description: "We look forward to welcoming our family, relatives and friends to celebrate this special day with us.",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Kodava+Samaja+Ponnampet"
    },
    couplePhoto: {
        enabled: true,
        src: "/images/couple-placeholder.svg",
        alt: "Tharun Chinnappa and Ashwitha Accamma",
        eyebrow: "OUR WEDDING",
        title: "A new chapter begins.",
        body: "Replace this placeholder with the couple's final photograph when available."
    },
    gallery: [
        {
            src: "/images/kodagu-landscape.svg",
            alt: "Kodagu landscape"
        },
        {
            src: "/images/coffee-branch.svg",
            alt: "Coffee branch illustration"
        }
    ],
    compliments: {
        eyebrow: "WITH BEST COMPLIMENTS",
        primary: "Konganda Teena Muthamma",
        secondary: "Family Members, Relatives and Friends"
    },
    rsvp: {
        enabled: false,
        eyebrow: "RSVP",
        title: "We would love to celebrate with you.",
        message: "Please confirm your presence with our family.",
        contacts: []
    },
    sharing: {
        message: "You are warmly invited to celebrate the wedding of Tharun Chinnappa and Ashwitha Accamma on Thursday, 5 November 2026 at Kodava Samaja, Ponnampet. Dampathi Muhurtham at 10:30 AM."
    },
    closing: {
        eyebrow: "WITH BEST COMPLIMENTS",
        note: "Family Members, Relatives and Friends"
    },
    audio: {
        enabled: false,
        src: "/audio/wedding-theme.mp3",
        label: "Music"
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/calendar.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createCalendarData",
    ()=>createCalendarData
]);
function formatIcsDate(input) {
    return new Date(input).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
function createCalendarData({ title, description, location, start, end }) {
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Kodagu Wedding Invitation//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `DTSTART:${formatIcsDate(start)}`,
        `DTEND:${formatIcsDate(end)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
        `LOCATION:${location}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ];
    return lines.join("\r\n");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_06dov9f._.js.map