module.exports = [
"[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("styled-jsx/style.js", () => require("styled-jsx/style.js"));

module.exports = mod;
}),
"[project]/pages/index.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/head.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
;
;
;
;
function HomePage() {
    const [statsAnimated, setStatsAnimated] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [isClient, setIsClient] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const observerRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    // Ensure we only run client-side code after hydration
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        setIsClient(true);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        // Only run on client side after hydration
        if (!isClient) return;
        // Trigger counter animations when stats section is in view
        const observer = new IntersectionObserver((entries)=>{
            entries.forEach((entry)=>{
                if (entry.isIntersecting && !statsAnimated) {
                    setStatsAnimated(true);
                    animateCounters();
                }
            });
        }, {
            threshold: 0.5
        });
        observerRef.current = observer;
        const statsSection = document.querySelector('.stats-grid');
        if (statsSection) {
            observer.observe(statsSection);
        }
        return ()=>{
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [
        statsAnimated,
        isClient
    ]);
    const animateCounters = ()=>{
        if (!isClient) return;
        // Add a small delay to ensure hydration is complete
        setTimeout(()=>{
            const counters = document.querySelectorAll('.stat-number[data-target]');
            counters.forEach((counter)=>{
                const target = parseInt(counter.getAttribute('data-target') || '0');
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                const updateCounter = ()=>{
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current).toLocaleString();
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target.toLocaleString();
                    }
                };
                updateCounter();
            });
        }, 100);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("title", {
                        className: "jsx-2904a0fd45e9c015",
                        children: "Beginner Investor Hub - Build Your Financial Future"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "description",
                        content: "Master investing with portfolio simulation, AI-powered coaching, and real-time market insights. Learn risk-free with institutional-grade tools.",
                        className: "jsx-2904a0fd45e9c015"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "viewport",
                        content: "width=device-width, initial-scale=1",
                        className: "jsx-2904a0fd45e9c015"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        type: "image/svg+xml",
                        href: "/favicon.svg",
                        className: "jsx-2904a0fd45e9c015"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        type: "image/x-icon",
                        href: "/favicon.ico",
                        className: "jsx-2904a0fd45e9c015"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
                className: "jsx-2904a0fd45e9c015" + " " + "hero",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "jsx-2904a0fd45e9c015" + " " + "gear-container",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "jsx-2904a0fd45e9c015" + " " + "gear"
                            }, void 0, false, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 86,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "jsx-2904a0fd45e9c015" + " " + "gear"
                            }, void 0, false, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "jsx-2904a0fd45e9c015" + " " + "gear"
                            }, void 0, false, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 88,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "jsx-2904a0fd45e9c015" + " " + "gear"
                            }, void 0, false, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 89,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/index.tsx",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
                        className: "jsx-2904a0fd45e9c015",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "jsx-2904a0fd45e9c015" + " " + "logo",
                                children: "Beginner Investor Hub"
                            }, void 0, false, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "jsx-2904a0fd45e9c015" + " " + "nav-links",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                        href: "#features",
                                        className: "jsx-2904a0fd45e9c015",
                                        children: "Features"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 95,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                        href: "#how-it-works",
                                        className: "jsx-2904a0fd45e9c015",
                                        children: "How It Works"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 96,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                        href: "#architecture",
                                        className: "jsx-2904a0fd45e9c015",
                                        children: "Technology"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 97,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/login",
                                        className: "login-button",
                                        children: "Login"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 98,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/index.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "jsx-2904a0fd45e9c015" + " " + "hero-content",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                                className: "jsx-2904a0fd45e9c015",
                                children: [
                                    "Build Your ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        className: "jsx-2904a0fd45e9c015" + " " + "accent",
                                        children: "Financial Freedom"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 103,
                                        columnNumber: 26
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                className: "jsx-2904a0fd45e9c015" + " " + "hero-subtitle",
                                children: "Master the mechanics of investing through hands-on portfolio simulation, AI-powered guidance, and institutional-grade market insights. Where precision engineering meets financial education."
                            }, void 0, false, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 104,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "jsx-2904a0fd45e9c015" + " " + "cta-buttons",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/signup",
                                        className: "btn btn-primary",
                                        children: "Start Building"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 108,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "#features",
                                        className: "btn btn-secondary",
                                        children: "Explore Demo"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 109,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/index.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "jsx-2904a0fd45e9c015" + " " + "market-ticker",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "jsx-2904a0fd45e9c015" + " " + "ticker-content",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "jsx-2904a0fd45e9c015" + " " + "ticker-item",
                            children: [
                                "S&P 500: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "ticker-value up",
                                    children: "+1.2%"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 117,
                                    columnNumber: 50
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "jsx-2904a0fd45e9c015" + " " + "ticker-item",
                            children: [
                                "NASDAQ: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "ticker-value up",
                                    children: "+0.8%"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 118,
                                    columnNumber: 49
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "jsx-2904a0fd45e9c015" + " " + "ticker-item",
                            children: [
                                "DOW: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "ticker-value down",
                                    children: "-0.3%"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 119,
                                    columnNumber: 46
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 119,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "jsx-2904a0fd45e9c015" + " " + "ticker-item",
                            children: [
                                "Portfolios Created: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "ticker-value",
                                    children: "12,847"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 120,
                                    columnNumber: 61
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 120,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "jsx-2904a0fd45e9c015" + " " + "ticker-item",
                            children: [
                                "Simulations Run: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "ticker-value",
                                    children: "45,392"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 121,
                                    columnNumber: 58
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 121,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "jsx-2904a0fd45e9c015" + " " + "ticker-item",
                            children: [
                                "S&P 500: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "ticker-value up",
                                    children: "+1.2%"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 122,
                                    columnNumber: 50
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 122,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "jsx-2904a0fd45e9c015" + " " + "ticker-item",
                            children: [
                                "NASDAQ: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "ticker-value up",
                                    children: "+0.8%"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 123,
                                    columnNumber: 49
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "jsx-2904a0fd45e9c015" + " " + "ticker-item",
                            children: [
                                "DOW: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "ticker-value down",
                                    children: "-0.3%"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 124,
                                    columnNumber: 46
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 124,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "jsx-2904a0fd45e9c015" + " " + "ticker-item",
                            children: [
                                "Portfolios Created: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "ticker-value",
                                    children: "12,847"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 125,
                                    columnNumber: 61
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 125,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "jsx-2904a0fd45e9c015" + " " + "ticker-item",
                            children: [
                                "Simulations Run: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "ticker-value",
                                    children: "45,392"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 126,
                                    columnNumber: 58
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 126,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 116,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
                id: "features",
                className: "jsx-2904a0fd45e9c015" + " " + "features",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "jsx-2904a0fd45e9c015" + " " + "nyse-container",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "jsx-2904a0fd45e9c015" + " " + "section-header",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "section-title",
                                    children: "Precision-Engineered Learning"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 134,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "section-subtitle",
                                    children: "Every component designed to help you understand the intricate mechanisms of successful investing"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 135,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "jsx-2904a0fd45e9c015" + " " + "features-grid",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "nyse-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "jsx-2904a0fd45e9c015" + " " + "feature-icon",
                                            children: "⚙️"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 140,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Portfolio Simulation Engine"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 141,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Build and test investment strategies in a risk-free environment. Watch how each component works together to generate returns and understand the mechanics behind portfolio performance."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 142,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 139,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "nyse-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "jsx-2904a0fd45e9c015" + " " + "feature-icon",
                                            children: "🧠"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 146,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "AI Behavioral Coach"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 147,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Real-time guidance powered by advanced AI helps you recognize emotional patterns and make rational decisions during market volatility. Learn to master your investor psychology."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 148,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 145,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "nyse-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "jsx-2904a0fd45e9c015" + " " + "feature-icon",
                                            children: "📊"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 152,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Risk Analysis Engine"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 153,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Understand the mathematical foundations of risk with Python-powered analytics that break down complex metrics into clear, actionable insights."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 154,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 151,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "nyse-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "jsx-2904a0fd45e9c015" + " " + "feature-icon",
                                            children: "🎯"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 158,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Market Data Integration"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 159,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Access live market data and historical trends through Alpha Vantage and Finnhub. Make informed decisions with institutional-grade information at your fingertips."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 160,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 157,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "nyse-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "jsx-2904a0fd45e9c015" + " " + "feature-icon",
                                            children: "📈"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 164,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Performance Analytics"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 165,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Monitor simulated portfolios with detailed analytics that reveal the inner workings of your investment strategy. Track every metric that matters."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 166,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 163,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "nyse-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "jsx-2904a0fd45e9c015" + " " + "feature-icon",
                                            children: "🔧"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 170,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Interactive Learning"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 171,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Step-by-step guides and hands-on tutorials demystify investing concepts through practical application. Build knowledge piece by piece."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 172,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 169,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 138,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 132,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
                className: "jsx-2904a0fd45e9c015" + " " + "social-proof",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "jsx-2904a0fd45e9c015" + " " + "wooden-frame",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "jsx-2904a0fd45e9c015" + " " + "wooden-inner",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "jsx-2904a0fd45e9c015" + " " + "section-header",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                        style: {
                                            color: '#6b5538'
                                        },
                                        className: "jsx-2904a0fd45e9c015" + " " + "section-title",
                                        children: "Precision Results"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 183,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: {
                                            color: '#8b6f47'
                                        },
                                        className: "jsx-2904a0fd45e9c015" + " " + "section-subtitle",
                                        children: "Crafted by thousands of investors building their financial futures"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 184,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 182,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "jsx-2904a0fd45e9c015" + " " + "stats-grid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "jsx-2904a0fd45e9c015" + " " + "stat-card",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                "data-target": "12847",
                                                suppressHydrationWarning: true,
                                                className: "jsx-2904a0fd45e9c015" + " " + "stat-number",
                                                children: "0"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 189,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "stat-label",
                                                children: "Portfolios Built"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 190,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 188,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "jsx-2904a0fd45e9c015" + " " + "stat-card",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                "data-target": "45392",
                                                suppressHydrationWarning: true,
                                                className: "jsx-2904a0fd45e9c015" + " " + "stat-number",
                                                children: "0"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 193,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "stat-label",
                                                children: "Simulations Run"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 194,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 192,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "jsx-2904a0fd45e9c015" + " " + "stat-card",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                suppressHydrationWarning: true,
                                                className: "jsx-2904a0fd45e9c015" + " " + "stat-number",
                                                children: "$2.1M+"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 197,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "stat-label",
                                                children: "Simulated Value"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 198,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 196,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "jsx-2904a0fd45e9c015" + " " + "stat-card",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                suppressHydrationWarning: true,
                                                className: "jsx-2904a0fd45e9c015" + " " + "stat-number",
                                                children: "95%"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 201,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "stat-label",
                                                children: "User Satisfaction"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 202,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 200,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 187,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "jsx-2904a0fd45e9c015" + " " + "testimonials",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "jsx-2904a0fd45e9c015" + " " + "testimonial-card",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "testimonial-text",
                                                children: '"The mechanical approach to learning investing finally made everything click. I understand risk in a way I never did before."'
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 208,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "testimonial-author",
                                                children: "Sarah Mitchell"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 209,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "testimonial-role",
                                                children: "First-time Investor"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 210,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 207,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "jsx-2904a0fd45e9c015" + " " + "testimonial-card",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "testimonial-text",
                                                children: '"Being able to simulate different strategies without risking real money gave me the confidence to start investing properly."'
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 213,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "testimonial-author",
                                                children: "James Chen"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 214,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "testimonial-role",
                                                children: "Graduate Student"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 215,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 212,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "jsx-2904a0fd45e9c015" + " " + "testimonial-card",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "testimonial-text",
                                                children: '"The AI behavioral coach caught patterns in my decision-making that I didn\'t even realize existed. Game-changer."'
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 218,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "testimonial-author",
                                                children: "Maria Rodriguez"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 219,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "jsx-2904a0fd45e9c015" + " " + "testimonial-role",
                                                children: "Career Changer"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 220,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 217,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 206,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/index.tsx",
                        lineNumber: 181,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 180,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 179,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
                id: "how-it-works",
                className: "jsx-2904a0fd45e9c015" + " " + "how-it-works",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "jsx-2904a0fd45e9c015" + " " + "nyse-container",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "jsx-2904a0fd45e9c015" + " " + "section-header",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "section-title",
                                    children: "Assembly Instructions"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 231,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "section-subtitle",
                                    children: "Four precision steps to mastering investment fundamentals"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 232,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 230,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "jsx-2904a0fd45e9c015" + " " + "steps",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "step",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "jsx-2904a0fd45e9c015" + " " + "step-number",
                                            children: "1"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 237,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Create Foundation"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 238,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Sign up and complete your investor profile. Establish your risk tolerance and learning objectives to personalize your experience."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 239,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 236,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "step",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "jsx-2904a0fd45e9c015" + " " + "step-number",
                                            children: "2"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 243,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Construct Portfolio"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 244,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Assemble your first simulated portfolio using real market data. Follow guided recommendations or explore independently."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 245,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 242,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "step",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "jsx-2904a0fd45e9c015" + " " + "step-number",
                                            children: "3"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 249,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Test & Refine"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 250,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Receive AI-powered insights as you track performance. Understand market dynamics and adjust your strategy with confidence."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 251,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 248,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-2904a0fd45e9c015" + " " + "step",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "jsx-2904a0fd45e9c015" + " " + "step-number",
                                            children: "4"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 255,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Deploy Knowledge"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 256,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "jsx-2904a0fd45e9c015",
                                            children: "Graduate from simulation to real-world investing with comprehensive understanding and proven strategies."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 257,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 254,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 235,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 229,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 228,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
                className: "jsx-2904a0fd45e9c015" + " " + "cta-section",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "jsx-2904a0fd45e9c015" + " " + "nyse-container",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                            className: "jsx-2904a0fd45e9c015",
                            children: "Ready to Begin Your Journey?"
                        }, void 0, false, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 266,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: "jsx-2904a0fd45e9c015",
                            children: "Join thousands of investors building their financial literacy with precision tools"
                        }, void 0, false, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 267,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/signup",
                            className: "btn btn-primary",
                            children: "Get Started Free"
                        }, void 0, false, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 268,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 265,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 264,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("footer", {
                className: "jsx-2904a0fd45e9c015",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "jsx-2904a0fd45e9c015" + " " + "footer-content",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: "jsx-2904a0fd45e9c015",
                            children: "© 2025 Beginner Investor Hub. Built with institutional-grade technology."
                        }, void 0, false, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 275,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "jsx-2904a0fd45e9c015" + " " + "footer-links",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/privacy",
                                    children: "Privacy Policy"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 277,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/terms",
                                    children: "Terms of Service"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 278,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/contact",
                                    children: "Contact"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.tsx",
                                    lineNumber: 279,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.tsx",
                            lineNumber: 276,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 274,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 273,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__["default"], {
                id: "2904a0fd45e9c015",
                children: '.market-ticker.jsx-2904a0fd45e9c015{background:var(--nyse-color-dark);color:var(--nyse-color-background);padding:var(--nyse-spacing-sm)0;border-bottom:2px solid var(--nyse-color-accent);position:relative;overflow:hidden}.ticker-content.jsx-2904a0fd45e9c015{white-space:nowrap;animation:30s linear infinite scroll;display:flex}.ticker-item.jsx-2904a0fd45e9c015{padding:0 var(--nyse-spacing-xl);align-items:center;font-size:.9rem;font-weight:600;display:inline-flex}.ticker-value.jsx-2904a0fd45e9c015{margin-left:var(--nyse-spacing-xs);font-family:var(--nyse-font-serif)}.ticker-value.up.jsx-2904a0fd45e9c015{color:#0f8}.ticker-value.down.jsx-2904a0fd45e9c015{color:#f44}@keyframes scroll{0%{transform:translate(0)}to{transform:translate(-50%)}}.hero.jsx-2904a0fd45e9c015{background:linear-gradient(135deg,var(--nyse-color-primary)0%,var(--nyse-color-secondary)50%,var(--nyse-color-accent)100%);flex-direction:column;min-height:100vh;display:flex;position:relative;overflow:hidden}.hero.jsx-2904a0fd45e9c015:before{content:"";pointer-events:none;background:repeating-linear-gradient(90deg,#0000,#0000 2px,#ffffff05 2px 4px),repeating-linear-gradient(0deg,#0000,#0000 2px,#ffffff05 2px 4px);position:absolute;inset:0}.gear-container.jsx-2904a0fd45e9c015{opacity:.08;width:100%;height:100%;position:absolute;overflow:hidden}.gear.jsx-2904a0fd45e9c015{border:3px solid #fff6;border-radius:50%;animation:20s linear infinite rotate;position:absolute}.gear.jsx-2904a0fd45e9c015:first-child{width:250px;height:250px;animation-duration:30s;top:15%;left:10%}.gear.jsx-2904a0fd45e9c015:nth-child(2){width:180px;height:180px;animation-duration:22s;animation-direction:reverse;top:55%;right:15%}.gear.jsx-2904a0fd45e9c015:nth-child(3){width:120px;height:120px;animation-duration:18s;bottom:20%;left:35%}.gear.jsx-2904a0fd45e9c015:nth-child(4){width:200px;height:200px;animation-duration:25s;animation-direction:reverse;top:40%;right:40%}@keyframes rotate{0%{transform:rotate(0)}to{transform:rotate(360deg)}}nav.jsx-2904a0fd45e9c015{z-index:100;padding:var(--nyse-spacing-lg)5%;justify-content:center;align-items:center;display:flex;position:relative}.logo.jsx-2904a0fd45e9c015{font-family:var(--nyse-font-serif);color:var(--nyse-color-background);letter-spacing:2px;text-transform:uppercase;text-align:center;flex:1;font-size:1.25rem;font-weight:700}.nav-links.jsx-2904a0fd45e9c015{gap:var(--nyse-spacing-xl);align-items:center;display:flex}.nav-links.jsx-2904a0fd45e9c015 a.jsx-2904a0fd45e9c015{color:var(--nyse-color-background);letter-spacing:.5px;font-size:.95rem;font-weight:600;text-decoration:none;transition:color .3s}.nav-links.jsx-2904a0fd45e9c015 a.jsx-2904a0fd45e9c015:hover{color:var(--nyse-color-accent)}.login-button.jsx-2904a0fd45e9c015{background:var(--nyse-color-accent);padding:var(--nyse-spacing-sm)var(--nyse-spacing-lg);border-radius:4px;font-weight:700}.login-button.jsx-2904a0fd45e9c015:hover{background:var(--nyse-color-background);color:var(--nyse-color-primary)}.hero-content.jsx-2904a0fd45e9c015{z-index:10;text-align:center;flex-direction:column;flex:1;justify-content:center;align-items:center;max-width:1200px;margin:0 auto;padding:0 5%;display:flex;position:relative}.hero.jsx-2904a0fd45e9c015 h1.jsx-2904a0fd45e9c015{color:var(--nyse-color-background);margin-bottom:var(--nyse-spacing-xl);letter-spacing:2px;font-size:max(2.5rem,min(5vw,4.5rem));font-weight:700;animation:1s ease-out fadeInUp}.hero.jsx-2904a0fd45e9c015 h1.jsx-2904a0fd45e9c015 .accent.jsx-2904a0fd45e9c015{color:var(--nyse-color-accent)}.hero-subtitle.jsx-2904a0fd45e9c015{color:#ffffffe6;max-width:750px;margin-bottom:var(--nyse-spacing-xxl);font-size:max(1.1rem,min(2vw,1.4rem));line-height:1.8;animation:1s ease-out .2s both fadeInUp}.cta-buttons.jsx-2904a0fd45e9c015{gap:var(--nyse-spacing-lg);animation:1s ease-out .4s both fadeInUp;display:flex}.btn.jsx-2904a0fd45e9c015{padding:var(--nyse-spacing-md)var(--nyse-spacing-xl);cursor:pointer;letter-spacing:1px;font-size:1rem;font-family:var(--nyse-font-sans);border:none;border-radius:4px;font-weight:600;text-decoration:none;transition:all .3s;display:inline-block}.btn-primary.jsx-2904a0fd45e9c015{background:var(--nyse-color-background);color:var(--nyse-color-primary)}.btn-primary.jsx-2904a0fd45e9c015:hover{background:var(--nyse-color-accent);color:var(--nyse-color-background);transform:translateY(-2px);box-shadow:0 10px 30px #00a0e34d}.btn-secondary.jsx-2904a0fd45e9c015{color:var(--nyse-color-background);border:2px solid var(--nyse-color-background);background:0 0}.btn-secondary.jsx-2904a0fd45e9c015:hover{background:var(--nyse-color-background);color:var(--nyse-color-primary)}@keyframes fadeInUp{0%{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}.nyse-container.jsx-2904a0fd45e9c015{max-width:1200px;padding:0 var(--nyse-spacing-lg);margin:0 auto}.features.jsx-2904a0fd45e9c015{padding:var(--nyse-spacing-xxl)5%;background:var(--nyse-color-background)}.section-header.jsx-2904a0fd45e9c015{text-align:center;margin-bottom:var(--nyse-spacing-xxl)}.section-title.jsx-2904a0fd45e9c015{color:var(--nyse-color-dark);margin-bottom:var(--nyse-spacing-md);font-size:max(2rem,min(4vw,3.5rem))}.section-subtitle.jsx-2904a0fd45e9c015{color:var(--nyse-color-text-light);max-width:700px;margin:0 auto;font-size:1.2rem}.features-grid.jsx-2904a0fd45e9c015{gap:var(--nyse-spacing-xl);margin-top:var(--nyse-spacing-xxl);grid-template-columns:repeat(auto-fit,minmax(320px,1fr));display:grid}.nyse-card.jsx-2904a0fd45e9c015{background:var(--nyse-color-background);border:1px solid var(--nyse-color-border);border-left:4px solid var(--nyse-color-primary);padding:var(--nyse-spacing-xl);border-radius:8px;transition:all .3s}.nyse-card.jsx-2904a0fd45e9c015:hover{border-left-color:var(--nyse-color-accent);transform:translateY(-5px);box-shadow:0 8px 24px #003d7a26}.feature-icon.jsx-2904a0fd45e9c015{margin-bottom:var(--nyse-spacing-lg);font-size:3rem}.nyse-card.jsx-2904a0fd45e9c015 h3.jsx-2904a0fd45e9c015{margin-bottom:var(--nyse-spacing-md);color:var(--nyse-color-primary);font-size:1.5rem}.nyse-card.jsx-2904a0fd45e9c015 p.jsx-2904a0fd45e9c015{color:var(--nyse-color-text);margin:0;line-height:1.7}.social-proof.jsx-2904a0fd45e9c015{padding:var(--nyse-spacing-xxl)5%;background:linear-gradient(#f5f0e8 0%,#e8e0d5 100%);position:relative;overflow:hidden}.social-proof.jsx-2904a0fd45e9c015:before{content:"";pointer-events:none;background:repeating-linear-gradient(90deg,#0000,#0000 20px,#00000005 20px 21px),repeating-linear-gradient(0deg,#0000,#0000 20px,#00000005 20px 21px);position:absolute;inset:0}.wooden-frame.jsx-2904a0fd45e9c015{background:linear-gradient(135deg,#d4a574 0%,#c99157 50%,#d4a574 100%);max-width:1200px;margin:0 auto;padding:3px;position:relative;box-shadow:0 10px 30px #0000004d,inset 0 1px #ffffff4d,inset 0 -1px #0000004d}.wooden-frame.jsx-2904a0fd45e9c015:before,.wooden-frame.jsx-2904a0fd45e9c015:after{content:"";background:radial-gradient(circle,#8b6f47 0%,#6b5538 100%);border-radius:50%;position:absolute;box-shadow:inset 0 2px 4px #00000080}.wooden-frame.jsx-2904a0fd45e9c015:before{width:20px;height:20px;top:10px;left:10px}.wooden-frame.jsx-2904a0fd45e9c015:after{width:20px;height:20px;top:10px;right:10px}.wooden-inner.jsx-2904a0fd45e9c015{padding:var(--nyse-spacing-xxl);background:linear-gradient(135deg,#f5e6d3 0%,#e8d4b8 100%);position:relative;box-shadow:inset 0 2px 10px #0000001a}.wooden-inner.jsx-2904a0fd45e9c015:before,.wooden-inner.jsx-2904a0fd45e9c015:after{content:"";background:radial-gradient(circle,#8b6f47 0%,#6b5538 100%);border-radius:50%;position:absolute;box-shadow:inset 0 2px 4px #00000080}.wooden-inner.jsx-2904a0fd45e9c015:before{width:20px;height:20px;bottom:10px;left:10px}.wooden-inner.jsx-2904a0fd45e9c015:after{width:20px;height:20px;bottom:10px;right:10px}.stats-grid.jsx-2904a0fd45e9c015{gap:var(--nyse-spacing-xl);margin-bottom:var(--nyse-spacing-xxl);grid-template-columns:repeat(auto-fit,minmax(200px,1fr));display:grid}.stat-card.jsx-2904a0fd45e9c015{text-align:center;padding:var(--nyse-spacing-lg);background:#fff9;border:2px solid #8b6f474d;border-radius:8px;position:relative;box-shadow:0 4px 12px #0000001a}.stat-number.jsx-2904a0fd45e9c015{font-family:var(--nyse-font-serif);color:var(--nyse-color-primary);margin-bottom:var(--nyse-spacing-sm);text-shadow:2px 2px #0000001a;font-size:3rem;font-weight:700;line-height:1}.stat-label.jsx-2904a0fd45e9c015{color:#6b5538;text-transform:uppercase;letter-spacing:1px;font-size:.95rem;font-weight:600}.testimonials.jsx-2904a0fd45e9c015{gap:var(--nyse-spacing-lg);grid-template-columns:repeat(auto-fit,minmax(300px,1fr));display:grid}.testimonial-card.jsx-2904a0fd45e9c015{padding:var(--nyse-spacing-xl);background:#fffc;border:2px solid #8b6f474d;border-radius:8px;position:relative;box-shadow:0 4px 12px #0000001a}.testimonial-card.jsx-2904a0fd45e9c015:before{content:"\\"";color:var(--nyse-color-accent);opacity:.3;font-family:Georgia,serif;font-size:4rem;position:absolute;top:-10px;left:20px}.testimonial-text.jsx-2904a0fd45e9c015{color:var(--nyse-color-text);margin-bottom:var(--nyse-spacing-md);font-style:italic;line-height:1.7}.testimonial-author.jsx-2904a0fd45e9c015{color:var(--nyse-color-primary);font-weight:600}.testimonial-role.jsx-2904a0fd45e9c015{color:#6b5538;font-size:.9rem}.how-it-works.jsx-2904a0fd45e9c015{padding:var(--nyse-spacing-xxl)5%;background:var(--nyse-color-background-alt)}.steps.jsx-2904a0fd45e9c015{gap:var(--nyse-spacing-xl);margin-top:var(--nyse-spacing-xxl);grid-template-columns:repeat(auto-fit,minmax(250px,1fr));display:grid}.step.jsx-2904a0fd45e9c015{text-align:center;padding:var(--nyse-spacing-xl);background:var(--nyse-color-background);border:1px solid var(--nyse-color-border);border-radius:8px;transition:all .3s}.step.jsx-2904a0fd45e9c015:hover{box-shadow:0 5px 20px #003d7a1a}.step-number.jsx-2904a0fd45e9c015{background:var(--nyse-color-primary);width:70px;height:70px;color:var(--nyse-color-background);font-size:1.75rem;font-weight:700;font-family:var(--nyse-font-serif);margin:0 auto var(--nyse-spacing-lg);border:4px solid var(--nyse-color-accent);border-radius:50%;justify-content:center;align-items:center;display:flex}.step.jsx-2904a0fd45e9c015 h3.jsx-2904a0fd45e9c015{margin-bottom:var(--nyse-spacing-md);color:var(--nyse-color-dark);font-size:1.5rem}.step.jsx-2904a0fd45e9c015 p.jsx-2904a0fd45e9c015{color:var(--nyse-color-text);margin:0;line-height:1.7}.cta-section.jsx-2904a0fd45e9c015{padding:var(--nyse-spacing-xxl)5%;background:var(--nyse-color-primary);text-align:center;color:var(--nyse-color-background)}.cta-section.jsx-2904a0fd45e9c015 h2.jsx-2904a0fd45e9c015{color:var(--nyse-color-background);margin-bottom:1rem;font-size:max(2rem,min(4vw,3rem))}'
            }, void 0, false, void 0, this)
        ]
    }, void 0, true);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3f4a1ea4._.js.map