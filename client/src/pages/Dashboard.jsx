import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiSparkles } from "react-icons/hi";
import AuthModel from "../components/AuthModel";
import {
  BsMicFill, BsClockHistory, BsRobot, BsClock,
  BsMic, BsBarChart, BsFileEarmarkText, BsArrowRight,
  BsCameraVideoFill, BsKeyboardFill, BsShieldFill,
  BsLightningChargeFill, BsCheckCircleFill,
  BsTrophyFill, BsGraphUp, BsPersonLinesFill,
  BsStarFill, BsPlayCircleFill, BsFire
} from "react-icons/bs";
import Footer from "../components/Footer";
import hrImg        from "../assets/HR.png";
import evalImg      from "../assets/AI-ans.png";
import pdfImg       from "../assets/pdf.png";
import resumeImg    from "../assets/resume.png";
import analyticsImg from "../assets/history.png";
import creditImg    from "../assets/credit.png";
import confidenceImg from "../assets/confi.png";
import techImg      from "../assets/tech.png";

const FadeUp = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >{children}</motion.div>
  );
};

const roles = ["Software Engineer", "Product Manager", "Data Analyst", "ML Engineer", "UX Designer"];
function CyclingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % roles.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-flex items-center overflow-hidden"
      style={{ minWidth: "320px", verticalAlign: "bottom" }}>
      <AnimatePresence mode="wait">
        <motion.span key={i}
          initial={{ y: 40, opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -40, opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-emerald-400 whitespace-nowrap">
          {roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const accentMap = {
  emerald: { border: "border-emerald-500/20", bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "0 0 50px rgba(52,211,153,0.15)" },
  sky:     { border: "border-sky-500/20",     bg: "bg-sky-500/10",     text: "text-sky-400",     glow: "0 0 50px rgba(56,189,248,0.15)" },
  amber:   { border: "border-amber-500/20",   bg: "bg-amber-500/10",   text: "text-amber-400",   glow: "0 0 50px rgba(251,191,36,0.15)" },
  violet:  { border: "border-violet-500/20",  bg: "bg-violet-500/10",  text: "text-violet-400",  glow: "0 0 50px rgba(167,139,250,0.15)" },
  rose:    { border: "border-rose-500/20",    bg: "bg-rose-500/10",    text: "text-rose-400",    glow: "0 0 50px rgba(251,113,133,0.15)" },
};

function Dashboard() {
  const navigate = useNavigate();
  const { userData, authLoading } = useSelector((state) => state.user);
  const [showAuthModal,    setShowAuthModal]    = useState(false);
  const [activeCapability, setActiveCapability] = useState(0);
  const firstName = userData?.name?.split(" ")[0];

  const guard = (route) => {
    if (!userData) { setShowAuthModal(true); return; }
    navigate(route);
  };

  // ── Still waiting for /current-user to resolve ──
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030303] gap-4">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-ping" style={{ animationDuration: "1.8s" }}/>
          <svg className="animate-spin w-14 h-14" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(52,211,153,0.08)" strokeWidth="3"/>
            <path d="M 28 6 A 22 22 0 0 1 50 28" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-white/20 text-[13px] font-medium" style={{ fontFamily: "'DM Sans',sans-serif" }}>
          Loading your dashboard…
        </p>
      </div>
    );
  }

  // ── Stats from userData ──
  const totalSessions = userData?.totalSessions || 0;
  const avgScore      = userData?.avgScore      || 0;
  const credits       = userData?.credits       || 0;
  const streak        = userData?.streak        || 0;

  return (
    <>
      <div className="relative w-full min-h-screen bg-[#030303] text-white overflow-x-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800;900&display=swap');
          .d-title { font-family: 'Sora', sans-serif; }
          .clip-text { -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          @keyframes float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-16px) scale(1.04)} }
          .float1 { animation: float 7s ease-in-out infinite; }
          .float2 { animation: float 9s ease-in-out infinite 1s; }
          .float3 { animation: float 6s ease-in-out infinite 2s; }
          @keyframes live-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          .live-pulse { animation: live-pulse 1.5s ease-in-out infinite; }
          @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
          .shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent); animation:shimmer 2.5s infinite; }
        `}</style>

        {/* ── Background ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute w-[700px] h-[700px] bg-emerald-500 opacity-[0.07] blur-[200px] rounded-full -top-60 -left-60 float1" />
          <div className="absolute w-[500px] h-[500px] bg-teal-400 opacity-[0.05] blur-[170px] rounded-full -bottom-32 -right-32 float2" />
          <div className="absolute w-[300px] h-[300px] bg-sky-500 opacity-[0.04] blur-[140px] rounded-full top-1/3 right-1/4 float3" />
          <div className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>

        <Navbar />

        {/* ══ HERO ══ */}
        <section className="relative z-10 flex flex-col items-center text-center
          max-w-6xl mx-auto px-6 pt-36 pb-16">

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-white/[0.05] border border-white/[0.1] text-white/60
              text-xs font-medium tracking-wide mb-10 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <HiSparkles size={12} className="text-emerald-400" />
            AI-Powered Interview Intelligence
          </motion.div>

          {/* Headline */}
          <div className="overflow-hidden mb-3">
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="d-title font-black tracking-tight leading-[0.95]"
              style={{ fontSize: "clamp(3.2rem, 7.5vw, 6.5rem)" }}
            >
              {userData ? (
                <>Hey, <span className="text-emerald-400">{firstName}</span></>
              ) : (
                <>Ace your{" "}
                  <span className="clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
                    interview
                  </span>
                </>
              )}
            </motion.h1>
          </div>

          {!userData && (
            <div className="overflow-hidden mb-8">
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="d-title font-black tracking-tight leading-[0.95]"
                style={{ fontSize: "clamp(3.2rem, 7.5vw, 6.5rem)" }}
              >
                as a <CyclingWord />
              </motion.div>
            </div>
          )}

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55 }}
            className="text-white/40 text-lg md:text-xl leading-relaxed max-w-2xl mb-10 font-light"
          >
            Simulate real-world interviews with role-specific AI, receive
            precise feedback, and track your performance with real-time insights.
          </motion.p>

          {/* ── Primary CTAs ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3 mb-6"
          >
            {/* Start Interview */}
            <motion.button
              onClick={() => guard("/interview")}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex items-center gap-2.5 px-8 py-4 rounded-2xl
                bg-emerald-400 text-black font-bold text-base cursor-pointer overflow-hidden
                shadow-[0_0_40px_rgba(52,211,153,0.3),0_4px_20px_rgba(0,0,0,0.4)]
                hover:shadow-[0_0_60px_rgba(52,211,153,0.5)] hover:bg-emerald-300
                transition-all duration-300 group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0
                via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full
                transition-transform duration-700" />
              <BsMicFill size={15} />
              Start Interview
              <BsArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Go Live */}
            <motion.button
              onClick={() => guard("/live-interview")}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex items-center gap-2.5 px-8 py-4 rounded-2xl
                bg-red-700/15 text-red-500 font-bold text-base cursor-pointer overflow-hidden                
                hover:bg-red-400 hover:shadow-[#D93E32]
                transition-all duration-300 group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0
                via-black to-white/0 -translate-x-full group-hover:translate-x-full
                transition-transform duration-700" />
              <BsCameraVideoFill size={15} />
              Go Live
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full
                bg-white/20+ text-[10px] font-bold">
                <span className="w-1 h-1 rounded-full bg-white live-pulse" />
                LIVE
              </span>
            </motion.button>

            {/* View History */}
            <motion.button
              onClick={() => guard("/my-sessions")}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-7 py-4 rounded-2xl
                border border-white/[0.1] bg-white/[0.03] text-white/55
                cursor-pointer hover:bg-white/[0.07] hover:text-white
                hover:border-white/[0.18] transition-all duration-300 text-base"
            >
              <BsClockHistory size={15} />
              View History
            </motion.button>
          </motion.div>

          {/* ── Quick nav pills ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {[
              { icon: "📊", label: "Placement Predictor", route: "/predictor" },
              { icon: "📝", label: "Resume Analysis",     route: "/settings"  },
              { icon: "🏆", label: "My Progress",         route: "/my-sessions"   },
            ].map((item, i) => (
              <button key={i}
                onClick={() => guard(item.route)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                  bg-white/[0.04] border border-white/[0.07] text-white/35
                  text-xs hover:text-white/60 hover:bg-white/[0.07]
                  transition-all duration-200 cursor-pointer">
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </motion.div>
        </section>

        {/* ══ CHOOSE YOUR INTERVIEW STYLE ══ */}
        <FadeUp className="relative z-10 mb-28 px-6">
          <div className="max-w-6xl mx-auto">

            <div className="text-center mb-12">
              <p className="text-[11px] text-white/20 uppercase tracking-[0.25em] mb-4">
                Pick your mode
              </p>
              <h2 className="d-title text-4xl md:text-5xl font-black text-white tracking-tight">
                Choose Your{" "}
                <span className="clip-text bg-gradient-to-r from-emerald-400 to-red-400">
                  Interview Style
                </span>
              </h2>
              <p className="text-white/30 text-base mt-4 max-w-xl mx-auto">
                Two powerful ways to practice — pick the one that fits your goal today.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              {/* ── Card 1: Standard Interview ── */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-[#0c0c0c] border border-emerald-500/20 rounded-3xl
                  overflow-hidden group cursor-pointer"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 50px rgba(52,211,153,0.12)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.04)"}
              >
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r
                  from-transparent via-emerald-400/50 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04]
                  via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10 p-8 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full
                      bg-emerald-500/10 border border-emerald-500/20">
                      <BsMicFill size={11} className="text-emerald-400" />
                      <span className="text-[11px] text-emerald-400 font-semibold">Standard Mode</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20
                      flex items-center justify-center text-emerald-400">
                      <BsMicFill size={20} />
                    </div>
                  </div>
                  <h3 className="d-title text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
                    Standard Interview
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-7">
                    AI-powered interview with text or voice answers. Choose your role, company,
                    difficulty and persona. Get detailed feedback after every answer.
                  </p>
                  <div className="space-y-2.5 mb-8 flex-1">
                    {[
                      "Text + Voice answer modes",
                      "Company-specific questions (Google, Amazon...)",
                      "Live Answer Coach & Smart Hints",
                      "Coding editor for technical rounds",
                      "Detailed report with Spider Chart",
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <BsCheckCircleFill size={12} className="text-emerald-400 flex-shrink-0" />
                        <span className="text-xs text-white/50">{f}</span>
                      </div>
                    ))}
                  </div>
                  <motion.button
                    onClick={() => guard("/interview")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl
                      bg-emerald-400 text-black font-bold text-sm cursor-pointer
                      hover:bg-emerald-300 transition-all duration-300
                      shadow-[0_0_30px_rgba(52,211,153,0.2)] group/btn"
                  >
                    <BsMicFill size={14} />
                    Start Interview
                    <BsArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </motion.div>

              {/* ── Card 2: Live Video Interview ── */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-[#0c0c0c] border border-red-500/20 rounded-3xl
                  overflow-hidden group cursor-pointer"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 50px rgba(239,68,68,0.1)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.04)"}
              >
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r
                  from-transparent via-red-400/50 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.04]
                  via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-4 right-4 z-20" />

                <div className="relative z-10 p-8 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full
                      bg-red-500/10 border border-red-500/20">
                      <BsCameraVideoFill size={11} className="text-red-400" />
                      <span className="text-[11px] text-red-400 font-semibold">Video Mode</span>
                    </div>
                    <div className="relative w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20
                      flex items-center justify-center text-red-400">
                      <BsCameraVideoFill size={20} />
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full
                        bg-red-500 border-2 border-[#0c0c0c] live-pulse" />
                    </div>
                  </div>
                  <h3 className="d-title text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
                    Live Video Interview
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-7">
                    Full-screen video call experience. AI interviewer speaks questions,
                    you answer via voice — exactly like a real interview call.
                  </p>
                  <div className="space-y-2.5 mb-8 flex-1">
                    {[
                      "Full-screen video call layout",
                      "AI speaks questions via voice",
                      "Your webcam — face-to-face feel",
                      "Anti-cheat tab monitoring",
                      "Integrity score in final report",
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <BsCheckCircleFill size={12} className="text-red-400 flex-shrink-0" />
                        <span className="text-xs text-white/50">{f}</span>
                      </div>
                    ))}
                  </div>
                  <motion.button
                    onClick={() => guard("/live-interview")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl
                      bg-red-500/15 border border-red-500/25 text-red-400 font-bold text-sm
                      cursor-pointer hover:bg-red-500/25 hover:border-red-500/40
                      transition-all duration-300 group/btn"
                  >
                    <BsCameraVideoFill size={14} />
                    Go Live
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5
                      rounded-full bg-red-500/20 border border-red-500/30 font-bold">
                      <span className="w-1 h-1 rounded-full bg-red-400 live-pulse" />
                      LIVE
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Bottom comparison hint */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-6 mt-6 text-white/20 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <BsKeyboardFill size={10} className="text-emerald-400/60" />
                <span>Standard — Text & Voice answers</span>
              </div>
              <div className="w-px h-3 bg-white/[0.1]" />
              <div className="flex items-center gap-1.5">
                <BsCameraVideoFill size={10} className="text-red-400/60" />
                <span>Live — Camera + Voice, real-time</span>
              </div>
              <div className="w-px h-3 bg-white/[0.1]" />
              <div className="flex items-center gap-1.5">
                <BsShieldFill size={10} className="text-white/30" />
                <span>Anti-cheat on both modes</span>
              </div>
            </motion.div>
          </div>
        </FadeUp>

        {/* ══ STEPS ══ */}
        <FadeUp className="relative z-10 mb-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[11px] text-white/20 uppercase tracking-[0.25em] mb-4">How it works</p>
              <h2 className="d-title text-4xl md:text-5xl font-black text-white tracking-tight">
                Three steps to{" "}
                <span className="clip-text bg-gradient-to-r from-emerald-400 to-teal-300">mastery</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5 relative">
              <div className="hidden md:block absolute top-10 left-[34%] right-[34%] h-px
                bg-gradient-to-r from-emerald-500/30 via-sky-500/30 to-violet-500/30" />
              {[
                { icon: <BsRobot size={22} />, step: "01", title: "Role & Experience Selection", desc: "Choose your interview role and experience level to tailor the AI's questioning style and difficulty.", accent: "emerald", tilt: "-1.5deg" },
                { icon: <BsMic size={22} />,   step: "02", title: "Practice with AI",            desc: "Engage in realistic interview simulations and receive instant feedback on your responses.",              accent: "sky",     tilt: "1.5deg"  },
                { icon: <BsClock size={22} />, step: "03", title: "Time Bound Simulations",      desc: "Monitor your improvement over time with detailed analytics and performance insights.",                  accent: "violet",  tilt: "-1deg"   },
              ].map((item, i) => {
                const ac = accentMap[item.accent];
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 40, rotate: item.tilt }}
                    whileInView={{ opacity: 1, y: 0, rotate: item.tilt }}
                    whileHover={{ y: -10, rotate: "0deg" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className={`relative bg-[#0c0c0c] border ${ac.border} rounded-3xl p-7 overflow-hidden cursor-default`}
                    style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
                  >
                    <span className={`d-title absolute -bottom-3 -right-1 text-[7rem]
                      font-black select-none ${ac.text} opacity-[0.05] leading-none`}>
                      {item.step}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl ${ac.bg} border ${ac.border}
                      flex items-center justify-center ${ac.text} mb-6`}>
                      {item.icon}
                    </div>
                    <span className={`text-[10px] ${ac.text} font-bold tracking-[0.22em] uppercase mb-2 block opacity-70`}>
                      Step {item.step}
                    </span>
                    <h3 className="d-title text-base font-bold text-white mb-3 leading-snug">{item.title}</h3>
                    <p className="text-white/35 text-sm leading-relaxed">{item.desc}</p>
                    <div className={`absolute bottom-0 left-6 right-6 h-px ${
                      item.accent === 'emerald' ? 'bg-emerald-500/30' :
                      item.accent === 'sky'     ? 'bg-sky-500/30' : 'bg-violet-500/30'}`} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </FadeUp>

        {/* ══ DSA QUESTION BANK BANNER ══ */}
        <FadeUp className="relative z-10 mb-28 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => guard("/question-bank")}
              className="relative bg-[#0c0c0c] border border-violet-500/20 rounded-3xl overflow-hidden
                cursor-pointer group"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 60px rgba(167,139,250,0.12)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.04)"}
            >
              {/* Top glow line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r
                from-transparent via-violet-400/50 to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04]
                via-transparent to-emerald-500/[0.02] pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-0">
                {/* Left: Visual */}
                <div className="w-full md:w-[38%] flex items-center justify-center p-10
                  bg-violet-500/[0.06] border-b md:border-b-0 md:border-r border-violet-500/10">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="text-7xl mb-4 inline-block"
                    >📚</motion.div>
                    <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                      {['Arrays', 'DP', 'Trees', 'Graphs', 'Strings'].map(t => (
                        <span key={t} className="px-2.5 py-1 rounded-lg bg-violet-500/10
                          border border-violet-500/15 text-violet-400 text-[9px] font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Content */}
                <div className="flex-1 p-8 md:p-10">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                      bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-semibold">
                      <BsStarFill size={9} /> NEW FEATURE
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                      bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
                      <BsFire size={9} /> 200+ Curated Problems
                    </span>
                  </div>
                  <h3 className="d-title text-2xl md:text-3xl font-black text-white mb-3 leading-snug">
                    Questions That Actually{" "}
                    <span className="clip-text bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400">Get Asked in Interviews</span>
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-lg">
                    Stop guessing. Practice the exact DSA problems that Google, Amazon, Meta & Microsoft
                    have asked in real interviews — organized by topic, company, year & difficulty.
                    Bookmark your weak areas, reveal hints, and build unstoppable confidence.
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 px-6 py-3 rounded-2xl
                      bg-violet-400 text-black font-bold text-sm
                      group-hover:bg-violet-300 transition-all duration-300
                      shadow-[0_0_25px_rgba(167,139,250,0.2)]">
                      Start Practicing
                      <BsArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-white/25 text-xs hidden md:block">
                      10 Topics · 20 Companies · Free
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </FadeUp>

        {/* ══ ADVANCED AI CAPABILITIES ══ */}
        <FadeUp className="relative z-10 mb-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[11px] text-white/20 uppercase tracking-[0.25em] mb-4">What you get</p>
              <h2 className="d-title text-4xl md:text-5xl font-black text-white tracking-tight">
                Advanced AI{" "}
                <span className="clip-text bg-gradient-to-r from-emerald-400 to-sky-400">Capabilities</span>
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {[
                { label: "AI Evaluation", accent: "emerald" },
                { label: "Resume Prep",   accent: "sky"     },
                { label: "PDF Report",    accent: "amber"   },
                { label: "Analytics",     accent: "violet"  },
              ].map((tab, i) => {
                const ac = accentMap[tab.accent];
                const isActive = activeCapability === i;
                return (
                  <motion.button key={i}
                    onClick={() => setActiveCapability(i)}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-300 cursor-pointer
                      ${isActive ? `${ac.bg} ${ac.border} ${ac.text}` : "bg-white/[0.03] border-white/[0.07] text-white/35 hover:text-white/60"}`}
                  >
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence mode="wait">
              {[
                { image: evalImg,      icon: <BsBarChart size={18} />,        title: "AI Answer Evaluation",   desc: "Scores communication, technical accuracy and confidence — with actionable improvement points after every answer.",                    accent: "emerald" },
                { image: resumeImg,    icon: <BsFileEarmarkText size={18} />, title: "Resume Based Interview", desc: "Project-specific questions based on your uploaded resume — tailored exactly to your background and target role.",                   accent: "sky"     },
                { image: pdfImg,       icon: <BsFileEarmarkText size={18} />, title: "Download PDF Report",    desc: "Detailed strengths, weaknesses and improvement insights — exported as a professional PDF after every session.",                    accent: "amber"   },
                { image: analyticsImg, icon: <BsBarChart size={18} />,        title: "History & Analytics",    desc: "Track progress with performance graphs, topic-wise analysis, and streak tracking across all your sessions.",                        accent: "violet"  },
              ].filter((_, i) => i === activeCapability).map((item) => {
                const ac = accentMap[item.accent];
                return (
                  <motion.div key={item.title}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className={`relative bg-[#0c0c0c] border ${ac.border} rounded-3xl overflow-hidden`}
                    style={{ boxShadow: ac.glow }}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${
                      item.accent === 'emerald' ? 'via-emerald-400/70' :
                      item.accent === 'sky'     ? 'via-sky-400/70' :
                      item.accent === 'amber'   ? 'via-amber-400/70' : 'via-violet-400/70'
                    } to-transparent`} />
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      item.accent === 'emerald' ? 'from-emerald-500/[0.05]' :
                      item.accent === 'sky'     ? 'from-sky-500/[0.05]' :
                      item.accent === 'amber'   ? 'from-amber-500/[0.05]' : 'from-violet-500/[0.05]'
                    } via-transparent to-transparent pointer-events-none`} />
                    <div className="relative z-10 grid md:grid-cols-2 min-h-[360px]">
                      <div className={`flex items-center justify-center p-10 border-b md:border-b-0 md:border-r ${ac.border} relative overflow-hidden`}>
                        <div className={`absolute w-56 h-56 rounded-full blur-[80px] opacity-[0.12] ${
                          item.accent === 'emerald' ? 'bg-emerald-400' :
                          item.accent === 'sky'     ? 'bg-sky-400' :
                          item.accent === 'amber'   ? 'bg-amber-400' : 'bg-violet-400'}`} />
                        <motion.img src={item.image} alt={item.title}
                          initial={{ scale: 0.88, opacity: 0, y: 16 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                          className="relative z-10 w-full max-h-56 object-contain drop-shadow-2xl" />
                      </div>
                      <div className="p-10 flex flex-col justify-center gap-5">
                        <div className={`w-11 h-11 rounded-2xl ${ac.bg} border ${ac.border} flex items-center justify-center ${ac.text}`}>
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="d-title text-2xl md:text-3xl font-black text-white mb-3">{item.title}</h3>
                          <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => guard("/interview")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer text-black transition-all
                              ${item.accent === 'emerald' ? 'bg-emerald-400 hover:bg-emerald-300' :
                                item.accent === 'sky'     ? 'bg-sky-400 hover:bg-sky-300' :
                                item.accent === 'amber'   ? 'bg-amber-400 hover:bg-amber-300' : 'bg-violet-400 hover:bg-violet-300'}`}>
                            Try it now <BsArrowRight size={12} />
                          </button>
                          <div className="flex gap-1.5">
                            {[0,1,2,3].map(di => (
                              <button key={di} onClick={() => setActiveCapability(di)}
                                className={`rounded-full transition-all duration-300 cursor-pointer
                                  ${di === activeCapability ? `w-5 h-2 ${ac.bg} border ${ac.border}` : "w-2 h-2 bg-white/10"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </FadeUp>

        {/* ══ MULTIPLE INTERVIEW MODES ══ */}
        <FadeUp className="relative z-10 mb-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[11px] text-white/20 uppercase tracking-[0.25em] mb-4">Built for every candidate</p>
              <h2 className="d-title text-4xl md:text-5xl font-black text-white tracking-tight">
                Multiple Interview{" "}
                <span className="clip-text bg-gradient-to-r from-emerald-400 to-violet-400">Modes</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { img: hrImg,         title: "HR Interview Mode",    desc: "Behavioural and communication-based evaluation — practice answering HR questions with confidence and structure.",  accent: "emerald" },
                { img: techImg,       title: "Technical Interview",  desc: "Deep technical questions based on your selected role — DSA, system design, and domain-specific problem solving.", accent: "sky"     },
                { img: confidenceImg, title: "Confidence Detection", desc: "Basic tone and voice analysis insights — understand your pacing, filler words, and confidence signals.",           accent: "amber"   },
                { img: creditImg,     title: "Credits System",       desc: "Unlock premium interview sessions easily — buy credits, track usage, and access advanced AI features.",            accent: "violet"  },
              ].map((mode, i) => {
                const ac = accentMap[mode.accent];
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className={`relative bg-[#0c0c0c] border ${ac.border} rounded-3xl overflow-hidden transition-all duration-300 group`}
                    style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = ac.glow}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.04)"}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${
                      mode.accent === 'emerald' ? 'via-emerald-400/50' :
                      mode.accent === 'sky'     ? 'via-sky-400/50' :
                      mode.accent === 'amber'   ? 'via-amber-400/50' : 'via-violet-400/50'
                    } to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      mode.accent === 'emerald' ? 'from-emerald-500/[0.04]' :
                      mode.accent === 'sky'     ? 'from-sky-500/[0.04]' :
                      mode.accent === 'amber'   ? 'from-amber-500/[0.04]' : 'from-violet-500/[0.04]'
                    } via-transparent to-transparent pointer-events-none`} />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-0">
                      <div className={`w-full md:w-[42%] flex items-center justify-center p-8 ${ac.bg} border-b md:border-b-0 md:border-r ${ac.border}`}>
                        <motion.img src={mode.img} alt={mode.title}
                          className="w-full max-h-44 object-contain group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 p-8 flex flex-col gap-4">
                        <div className={`w-9 h-9 rounded-xl ${ac.bg} border ${ac.border}
                          flex items-center justify-center ${ac.text} text-sm font-bold`}>
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <h3 className="d-title text-xl font-black text-white mb-2">{mode.title}</h3>
                          <p className="text-white/40 text-sm leading-relaxed">{mode.desc}</p>
                        </div>
                        <button onClick={() => guard("/live-interview")}
                          className={`flex items-center gap-1.5 text-xs font-bold ${ac.text} w-fit cursor-pointer hover:gap-3 transition-all duration-200`}>
                          Explore <BsArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </FadeUp>

      </div>

      {showAuthModal && <AuthModel onclose={() => setShowAuthModal(false)} />}
      <Footer />
    </>
  );
}

export default Dashboard;