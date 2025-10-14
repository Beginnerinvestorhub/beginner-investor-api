(()=>{var a={};a.id=841,a.ids=[220,841],a.modules={313:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{app:()=>i,auth:()=>j});var e=c(6551),f=c(6958),g=a([e,f]);[e,f]=g.then?(await g)():g;let h={apiKey:"",authDomain:"",projectId:"",storageBucket:"",messagingSenderId:"",appId:"",measurementId:process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID},i=(0,e.initializeApp)(h),j=(0,f.getAuth)(i);d()}catch(a){d(a)}})},361:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},1180:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>n});var e=c(8732),f=c(2015),g=c.n(f),h=c(9788),i=c.n(h),j=c(9918),k=c.n(j),l=c(5152),m=a([l]);l=(m.then?(await m)():m)[0];let o=[{name:"Portfolio Simulation Engine",icon:"⚙️",description:"Build and test investment strategies in a risk-free environment with virtual capital.",href:"/portfolio-simulation",category:"Core Tools",status:"active",features:["Virtual trading","Historical data","Performance tracking"]},{name:"AI Behavioral Coach",icon:"\uD83E\uDDE0",description:"Get real-time insights on emotional patterns and decision-making biases.",category:"Core Tools",status:"active",features:["Pattern recognition","Nudge alerts","Learning recommendations"]},{name:"Risk Analysis Dashboard",icon:"\uD83D\uDCCA",description:"Understand portfolio risk metrics with advanced analytics powered by Python.",href:"/risk-analysis",category:"Core Tools",status:"active",features:["Sharpe ratio","Beta analysis","Volatility metrics"]},{name:"Market Data Explorer",icon:"\uD83D\uDCC8",description:"Access real-time and historical market data from Alpha Vantage and Finnhub.",href:"/market-data",category:"Research",status:"active",features:["Live quotes","Historical charts","Company fundamentals"]},{name:"Risk Assessment Quiz",icon:"\uD83C\uDFAF",description:"Discover your risk tolerance and get a personalized investment profile.",href:"/risk-assessment",category:"Learning",status:"active",features:["Personality analysis","Goal setting","Custom recommendations"]},{name:"Fractional Share Calculator",icon:"\uD83E\uDDEE",description:"Calculate how much of any stock you can buy with your available capital.",href:"/fractional-calculator",category:"Utilities",status:"active",features:["Real-time prices","Cost breakdown","Multiple stocks"]},{name:"ESG/SRI Screener",icon:"\uD83C\uDF0D",description:"Screen investments for environmental, social, and governance factors.",href:"/esg-screener",category:"Research",status:"coming-soon",features:["ESG ratings","Impact metrics","Sustainable portfolios"]},{name:"Learning Dashboard",icon:"\uD83D\uDCDA",description:"Track your educational progress, achievements, and unlock new features.",href:"/learning",category:"Learning",status:"active",features:["Progress tracking","Achievements","Gamification"]}];function n(){let{user:a}=(0,l.useAuth)(),[b,c]=g().useState("All"),d="All"===b?o:o.filter(a=>a.category===b);return(0,e.jsxs)(e.Fragment,{children:[(0,e.jsxs)(i(),{children:[(0,e.jsx)("title",{children:"Investment Tools | Beginner Investor Hub"}),(0,e.jsx)("meta",{name:"description",content:"Explore our comprehensive suite of investment tools: portfolio simulation, AI coaching, risk analysis, market data, and more."})]}),(0,e.jsxs)("div",{className:"tools-page",children:[(0,e.jsx)("header",{className:"tools-header",children:(0,e.jsxs)("div",{className:"nyse-container",children:[(0,e.jsx)(k(),{href:"/",className:"back-link",children:"← Back to Home"}),(0,e.jsx)("h1",{children:"Investment Tools"}),(0,e.jsx)("p",{className:"header-subtitle",children:"Precision-engineered tools to accelerate your investing mastery"})]})}),(0,e.jsx)("main",{className:"tools-content",children:(0,e.jsxs)("div",{className:"nyse-container",children:[(0,e.jsx)("nav",{className:"category-nav",children:["All","Core Tools","Research","Learning","Utilities"].map(a=>(0,e.jsx)("button",{onClick:()=>c(a),className:`category-button ${b===a?"active":""}`,children:a},a))}),(0,e.jsx)("div",{className:"tools-grid",children:d.map(b=>(0,e.jsxs)("div",{className:"tool-card",children:["coming-soon"===b.status&&(0,e.jsx)("div",{className:"coming-soon-badge",children:"Coming Soon"}),(0,e.jsx)("div",{className:"tool-icon",children:b.icon}),(0,e.jsx)("h3",{className:"tool-name",children:b.name}),(0,e.jsx)("p",{className:"tool-description",children:b.description}),(0,e.jsx)("ul",{className:"tool-features",children:b.features.map((a,b)=>(0,e.jsxs)("li",{children:[(0,e.jsx)("span",{className:"feature-bullet",children:"✓"}),a]},b))}),(0,e.jsx)("div",{className:"tool-footer",children:"active"===b.status?a?(0,e.jsx)(k(),{href:b.href,className:"tool-button",children:"Launch Tool"}):(0,e.jsx)(k(),{href:"/signup",className:"tool-button secondary",children:"Sign Up to Access"}):(0,e.jsx)("button",{className:"tool-button disabled",disabled:!0,children:"Coming Soon"})})]},b.name))}),!a&&(0,e.jsxs)("div",{className:"cta-section",children:[(0,e.jsx)("h2",{children:"Ready to Start Building?"}),(0,e.jsx)("p",{children:"Create a free account to access all our investment tools and start your learning journey."}),(0,e.jsxs)("div",{className:"cta-buttons",children:[(0,e.jsx)(k(),{href:"/signup",className:"cta-button primary",children:"Create Free Account"}),(0,e.jsx)(k(),{href:"/login",className:"cta-button secondary",children:"Sign In"})]})]})]})})]}),(0,e.jsx)("style",{children:`
        .tools-page {
          min-height: 100vh;
          background: var(--nyse-color-background-alt);
        }

        .tools-header {
          background: linear-gradient(
            135deg,
            var(--nyse-color-primary) 0%,
            var(--nyse-color-secondary) 100%
          );
          color: white;
          padding: var(--nyse-spacing-xxl) 0;
          position: relative;
          overflow: hidden;
        }

        .tools-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 30px,
              rgba(255, 255, 255, 0.03) 30px,
              rgba(255, 255, 255, 0.03) 31px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 30px,
              rgba(255, 255, 255, 0.03) 30px,
              rgba(255, 255, 255, 0.03) 31px
            );
          pointer-events: none;
        }

        .back-link {
          display: inline-block;
          color: white;
          text-decoration: none;
          margin-bottom: var(--nyse-spacing-md);
          font-size: 0.95rem;
          opacity: 0.9;
          transition: opacity 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .back-link:hover {
          opacity: 1;
        }

        .tools-header h1 {
          font-family: var(--nyse-font-serif);
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: var(--nyse-spacing-sm);
          color: white;
          position: relative;
          z-index: 1;
        }

        .header-subtitle {
          font-size: 1.1rem;
          opacity: 0.95;
          margin: 0;
          position: relative;
          z-index: 1;
        }

        .tools-content {
          padding: var(--nyse-spacing-xxl) 0;
        }

        .category-nav {
          display: flex;
          gap: var(--nyse-spacing-sm);
          margin-bottom: var(--nyse-spacing-xxl);
          overflow-x: auto;
          padding-bottom: var(--nyse-spacing-sm);
        }

        .category-button {
          padding: var(--nyse-spacing-sm) var(--nyse-spacing-lg);
          background: var(--nyse-color-background);
          border: 2px solid var(--nyse-color-border);
          border-radius: 24px;
          font-family: var(--nyse-font-sans);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--nyse-color-text);
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .category-button:hover {
          border-color: var(--nyse-color-primary);
          background: rgba(0, 61, 122, 0.05);
        }

        .category-button.active {
          background: var(--nyse-color-primary);
          border-color: var(--nyse-color-primary);
          color: white;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--nyse-spacing-xl);
          margin-bottom: var(--nyse-spacing-xxl);
        }

        .tool-card {
          background: var(--nyse-color-background);
          border-radius: 12px;
          border: 1px solid var(--nyse-color-border);
          padding: var(--nyse-spacing-xl);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
        }

        .tool-card:hover {
          border-color: var(--nyse-color-accent);
          box-shadow: 0 8px 24px rgba(0, 61, 122, 0.15);
          transform: translateY(-4px);
        }

        .coming-soon-badge {
          position: absolute;
          top: var(--nyse-spacing-md);
          right: var(--nyse-spacing-md);
          background: #ff9800;
          color: white;
          padding: var(--nyse-spacing-xs) var(--nyse-spacing-sm);
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .tool-icon {
          font-size: 3rem;
          margin-bottom: var(--nyse-spacing-md);
        }

        .tool-name {
          font-family: var(--nyse-font-serif);
          font-size: 1.5rem;
          color: var(--nyse-color-primary);
          margin-bottom: var(--nyse-spacing-sm);
        }

        .tool-description {
          color: var(--nyse-color-text);
          line-height: 1.6;
          margin-bottom: var(--nyse-spacing-lg);
          flex: 1;
        }

        .tool-features {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--nyse-spacing-lg) 0;
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-xs);
        }

        .tool-features li {
          font-size: 0.9rem;
          color: var(--nyse-color-text-light);
          display: flex;
          align-items: center;
          gap: var(--nyse-spacing-sm);
        }

        .feature-bullet {
          color: var(--nyse-color-accent);
          font-weight: 700;
        }

        .tool-footer {
          margin-top: auto;
        }

        .tool-button {
          display: block;
          width: 100%;
          padding: var(--nyse-spacing-md);
          background: var(--nyse-color-primary);
          color: white;
          text-align: center;
          text-decoration: none;
          border-radius: 4px;
          font-family: var(--nyse-font-sans);
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .tool-button:hover:not(.disabled) {
          background: var(--nyse-color-secondary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 61, 122, 0.3);
        }

        .tool-button.secondary {
          background: transparent;
          color: var(--nyse-color-primary);
          border: 2px solid var(--nyse-color-primary);
        }

        .tool-button.secondary:hover {
          background: var(--nyse-color-primary);
          color: white;
        }

        .tool-button.disabled {
          background: var(--nyse-color-background-alt);
          color: var(--nyse-color-text-light);
          cursor: not-allowed;
          opacity: 0.6;
        }

        .cta-section {
          background: linear-gradient(
            135deg,
            var(--nyse-color-primary) 0%,
            var(--nyse-color-secondary) 100%
          );
          color: white;
          padding: var(--nyse-spacing-xxl);
          border-radius: 12px;
          text-align: center;
        }

        .cta-section h2 {
          font-family: var(--nyse-font-serif);
          font-size: 2rem;
          margin-bottom: var(--nyse-spacing-md);
          color: white;
        }

        .cta-section p {
          font-size: 1.1rem;
          margin-bottom: var(--nyse-spacing-xl);
          opacity: 0.95;
        }

        .cta-buttons {
          display: flex;
          gap: var(--nyse-spacing-md);
          justify-content: center;
        }

        .cta-button {
          padding: var(--nyse-spacing-md) var(--nyse-spacing-xxl);
          border-radius: 4px;
          font-family: var(--nyse-font-sans);
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .cta-button.primary {
          background: white;
          color: var(--nyse-color-primary);
        }

        .cta-button.primary:hover {
          background: var(--nyse-color-accent);
          color: white;
          transform: translateY(-2px);
        }

        .cta-button.secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .cta-button.secondary:hover {
          background: white;
          color: var(--nyse-color-primary);
        }

        @media (max-width: 768px) {
          .tools-grid {
            grid-template-columns: 1fr;
          }

          .category-nav {
            justify-content: flex-start;
          }

          .cta-buttons {
            flex-direction: column;
          }

          .cta-button {
            width: 100%;
          }
        }
      `})]})}d()}catch(a){d(a)}})},2015:a=>{"use strict";a.exports=require("react")},2647:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>r,default:()=>n,getServerSideProps:()=>q,getStaticPaths:()=>p,getStaticProps:()=>o,handler:()=>z,reportWebVitals:()=>s,routeModule:()=>y,unstable_getServerProps:()=>w,unstable_getServerSideProps:()=>x,unstable_getStaticParams:()=>v,unstable_getStaticPaths:()=>u,unstable_getStaticProps:()=>t});var e=c(3885),f=c(237),g=c(1413),h=c(3317),i=c.n(h),j=c(9950),k=c(1180),l=c(2289),m=a([k]);k=(m.then?(await m)():m)[0];let n=(0,g.hoist)(k,"default"),o=(0,g.hoist)(k,"getStaticProps"),p=(0,g.hoist)(k,"getStaticPaths"),q=(0,g.hoist)(k,"getServerSideProps"),r=(0,g.hoist)(k,"config"),s=(0,g.hoist)(k,"reportWebVitals"),t=(0,g.hoist)(k,"unstable_getStaticProps"),u=(0,g.hoist)(k,"unstable_getStaticPaths"),v=(0,g.hoist)(k,"unstable_getStaticParams"),w=(0,g.hoist)(k,"unstable_getServerProps"),x=(0,g.hoist)(k,"unstable_getServerSideProps"),y=new e.PagesRouteModule({definition:{kind:f.RouteKind.PAGES,page:"/tools",pathname:"/tools",bundlePath:"",filename:""},distDir:".next",relativeProjectDir:"",components:{App:j.default,Document:i()},userland:k}),z=(0,l.getHandler)({srcPage:"/tools",config:r,userland:k,routeModule:y,getStaticPaths:p,getStaticProps:o,getServerSideProps:q});d()}catch(a){d(a)}})},2768:()=>{},3873:a=>{"use strict";a.exports=require("path")},5152:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{useAuth:()=>i});var e=c(2015),f=c(6958),g=c(313),h=a([f,g]);function i(){let[a,b]=(0,e.useState)(null),[c,d]=(0,e.useState)(null),[h,i]=(0,e.useState)(!0),[j,k]=(0,e.useState)(null),l=(0,e.useCallback)(async(a,b)=>{i(!0),k(null);try{await (0,f.signInWithEmailAndPassword)(g.auth,a,b)}catch(a){k(a)}finally{i(!1)}},[]),m=(0,e.useCallback)(async(a,b)=>{i(!0),k(null);try{await (0,f.createUserWithEmailAndPassword)(g.auth,a,b)}catch(a){k(a)}finally{i(!1)}},[]),n=(0,e.useCallback)(async()=>{i(!0);try{await (0,f.signOut)(g.auth)}finally{i(!1)}},[]);return{user:a,loading:h,role:c,error:j,login:l,signup:m,logout:n}}[f,g]=h.then?(await h)():h,d()}catch(a){d(a)}})},6060:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external.js")},6472:a=>{"use strict";a.exports=require("@opentelemetry/api")},6551:a=>{"use strict";a.exports=import("firebase/app")},6958:a=>{"use strict";a.exports=import("firebase/auth")},8732:a=>{"use strict";a.exports=require("react/jsx-runtime")},9950:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>h});var d=c(8732);let e=require("next-auth/react");var f=c(9788),g=c.n(f);c(2768);let h=function({Component:a,pageProps:{session:b,...c}}){return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsxs)(g(),{children:[(0,d.jsx)("title",{children:"Investment Tools Hub"}),(0,d.jsx)("meta",{name:"description",content:"Your personal investment and financial tools dashboard"}),(0,d.jsx)("link",{rel:"icon",type:"image/svg+xml",href:"/favicon.svg"}),(0,d.jsx)("link",{rel:"icon",type:"image/x-icon",href:"/favicon.ico"}),(0,d.jsx)("meta",{name:"viewport",content:"width=device-width, initial-scale=1"})]}),(0,d.jsx)(e.SessionProvider,{session:b,children:(0,d.jsx)(a,{...c})})]})}}};var b=require("../webpack-runtime.js");b.C(a);var c=b.X(0,[317,720,531,918],()=>b(b.s=2647));module.exports=c})();