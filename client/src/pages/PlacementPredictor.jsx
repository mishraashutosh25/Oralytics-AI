import React, { useState, useRef, useEffect } from "react";
import Footer from "../components/Footer";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import {
  BsArrowRight, BsArrowLeft, BsCheckCircleFill, BsXCircleFill,
  BsLightningChargeFill, BsGraphUp, BsPersonLinesFill,
  BsStarFill, BsExclamationCircleFill,
  BsAwardFill, BsBriefcaseFill, BsBarChartFill,
  BsGenderMale, BsGenderFemale, BsCodeSlash, BsChatDots,
  BsClipboardData, BsPeopleFill, BsFileEarmarkCheck,
  BsShieldCheck, BsCpu,
} from "react-icons/bs";
import { HiSparkles, HiAcademicCap } from "react-icons/hi";
import { MdWork, MdSchool, MdOutlineAnalytics } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEGREES  = ["B.Tech", "MCA", "BCA", "B.Sc"];
const BRANCHES = ["Civil", "CSE", "IT", "ECE", "ME"];

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    const duration = 1200;
    const step = 16;
    const increment = (end / duration) * step;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(parseFloat(start.toFixed(1)));
    }, step);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
}

// ─── Fade Up ──────────────────────────────────────────────────────────────────
const FadeUp = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >{children}</motion.div>
  );
};

// ─── Section Divider ──────────────────────────────────────────────────────────
function SectionTag({ icon, label, step }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-black text-[10px] d-title flex-shrink-0">
        {step}
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-white/35 font-bold uppercase tracking-[0.2em]">
        {icon}{label}
      </div>
      <div className="flex-1 h-px bg-white/[0.04]"/>
    </div>
  );
}

// ─── Probability Ring ─────────────────────────────────────────────────────────
function ProbabilityRing({ value, placed }) {
  const radius = 60;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const color  = placed ? "#34d399" : "#f87171";
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse ring */}
      <div className="absolute w-[152px] h-[152px] rounded-full animate-pulse"
        style={{ background: `radial-gradient(circle, ${color}08 0%, transparent 70%)` }}/>
      <svg width="148" height="148" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx="74" cy="74" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8"/>
        {/* Glow layer */}
        <motion.circle cx="74" cy="74" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} opacity="0.15"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={{ filter: `blur(4px)` }}
        />
        {/* Main arc */}
        <motion.circle cx="74" cy="74" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center gap-0.5">
        <motion.span
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 180, damping: 14 }}
          className="text-[2.2rem] font-black leading-none d-title"
          style={{ color }}
        >
          <AnimatedNumber value={value} suffix="%" />
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="text-[9px] text-white/25 font-semibold tracking-widest uppercase"
        >chance</motion.span>
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, icon, error, hint, children }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[10.5px] text-white/35 font-semibold uppercase tracking-[0.16em]">
          {icon}{label}
        </label>
        {hint && <span className="text-[10px] text-white/20 font-medium">{hint}</span>}
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-[11px] text-red-400 flex items-center gap-1">
            <BsExclamationCircleFill size={10}/>{error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Styled inputs ────────────────────────────────────────────────────────────
const inputCls = `w-full bg-[#0d0d0d] border border-white/[0.07] rounded-xl px-4 py-3.5
  text-white text-sm placeholder-white/[0.12] outline-none
  focus:border-emerald-500/50 focus:bg-white/[0.03]
  hover:border-white/[0.12] transition-all duration-200`;

// ─── Gender Selector ──────────────────────────────────────────────────────────
function GenderSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { val: "Male",   label: "Male",   icon: <BsGenderMale size={17}/> },
        { val: "Female", label: "Female", icon: <BsGenderFemale size={17}/> },
      ].map(({ val, label, icon }) => {
        const active = value === val;
        return (
          <motion.button type="button" key={val} onClick={() => onChange(val)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className={`relative flex items-center gap-3 px-5 py-4 rounded-xl border
              transition-all duration-200 cursor-pointer overflow-hidden text-left
              ${active
                ? "border-emerald-500/40 text-emerald-400"
                : "bg-[#0d0d0d] border-white/[0.07] text-white/30 hover:border-white/[0.13] hover:text-white/50"}`}
            style={active ? { background: "linear-gradient(135deg,rgba(52,211,153,0.08),rgba(52,211,153,0.03))" } : {}}
          >
            {active && (
              <motion.div layoutId="gender-bg"
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg,rgba(52,211,153,0.08),transparent)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}/>
            )}
            <span className={`relative z-10 ${active ? "text-emerald-400" : "text-white/25"}`}>{icon}</span>
            <span className={`relative z-10 text-sm font-bold ${active ? "text-emerald-400" : "text-white/35"}`}>{label}</span>
            {active && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                className="absolute right-3 w-4 h-4 rounded-full bg-emerald-400/20 border border-emerald-400/50 flex items-center justify-center ml-auto">
                <div className="w-2 h-2 rounded-full bg-emerald-400"/>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Step Selector ────────────────────────────────────────────────────────────
function StepSelector({ value, onChange, options, layoutId }) {
  return (
    <div className="flex gap-2" style={{ display: "grid", gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map(({ val, label, sub }) => {
        const active = String(value) === String(val);
        return (
          <motion.button type="button" key={val} onClick={() => onChange(val)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            className={`relative flex flex-col items-center gap-0.5 py-3.5 px-2 rounded-xl border
              transition-all duration-200 cursor-pointer overflow-hidden
              ${active
                ? "border-emerald-500/40"
                : "bg-[#0d0d0d] border-white/[0.07] hover:border-white/[0.13]"}`}
            style={active ? { background: "linear-gradient(135deg,rgba(52,211,153,0.1),rgba(52,211,153,0.03))" } : {}}
          >
            {active && (
              <motion.div layoutId={layoutId}
                className="absolute inset-0 rounded-xl"
                style={{ background: "linear-gradient(135deg,rgba(52,211,153,0.08),transparent)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}/>
            )}
            <span className={`relative z-10 text-lg font-black d-title leading-none
              ${active ? "text-emerald-400" : "text-white/20"}`}>{label}</span>
            {sub && <span className={`relative z-10 text-[9px] font-semibold ${active ? "text-emerald-400/60" : "text-white/15"}`}>{sub}</span>}
            {active && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Skill Slider ─────────────────────────────────────────────────────────────
function SkillSlider({ value, onChange, color, label }) {
  const pct = ((value - 1) / 9) * 100;
  const label_ = value <= 3 ? "Beginner" : value <= 5 ? "Average" : value <= 7 ? "Good" : value <= 9 ? "Strong" : "Expert";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.span key={value}
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black d-title" style={{ color }}>{value}</motion.span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>{label_}</span>
        </div>
        <span className="text-[10px] text-white/15">out of 10</span>
      </div>
      <div className="relative h-2 rounded-full overflow-visible" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color}40,${color})` }}/>
        <input type="range" min={1} max={10} value={value} onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full border-2 pointer-events-none"
          style={{
            width: 18, height: 18,
            left: `calc(${pct}% - 9px)`,
            backgroundColor: color,
            borderColor: "#030303",
            boxShadow: `0 0 0 4px ${color}20, 0 0 14px ${color}50`,
          }}
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-white/12 font-medium">
        <span>1 · Beginner</span><span>5 · Average</span><span>10 · Expert</span>
      </div>
    </div>
  );
}

// ─── Score Slider (for Aptitude) ──────────────────────────────────────────────
function ScoreSlider({ value, onChange, min, max, color }) {
  const pct = ((value - min) / (max - min)) * 100;
  const band = pct < 33 ? "Low" : pct < 66 ? "Moderate" : "High";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.span key={value}
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black d-title" style={{ color }}>{value}</motion.span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>{band}</span>
        </div>
        <span className="text-[10px] text-white/15">{min}–{max}</span>
      </div>
      <div className="relative h-2 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color}40,${color})` }}/>
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
        <div className="absolute top-1/2 -translate-y-1/2 rounded-full border-2 pointer-events-none transition-all duration-100"
          style={{
            width: 18, height: 18,
            left: `calc(${pct}% - 9px)`,
            backgroundColor: color,
            borderColor: "#030303",
            boxShadow: `0 0 0 4px ${color}20, 0 0 14px ${color}50`,
          }}/>
      </div>
      <div className="flex justify-between text-[9px] text-white/12 font-medium">
        <span>{min} · Low</span><span>{Math.round((min + max) / 2)} · Avg</span><span>{max} · High</span>
      </div>
    </div>
  );
}

// ─── Select dropdown ──────────────────────────────────────────────────────────
function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`${inputCls} cursor-pointer appearance-none pr-10`}
        style={{ colorScheme: "dark" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
        <svg width="11" height="7" viewBox="0 0 11 7" fill="none">
          <path d="M1 1l4.5 4.5L10 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

// ─── Confidence Badge ─────────────────────────────────────────────────────────
const CONFIDENCE_CONFIG = {
  "Very High": { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)", label: "Very High ↑↑" },
  "High":      { color: "#34d399", bg: "rgba(52,211,153,0.07)", border: "rgba(52,211,153,0.2)", label: "High ↑" },
  "Moderate":  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)", label: "Moderate →" },
  "Low":       { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", label: "Low ↓" },
};

// ════════════════════════════════════════════════════════════════════════════════
export default function PlacementPredictor() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((s) => s.user);

  const [form, setForm] = useState({
    age: "", gender: "Male", degree: "B.Tech", branch: "CSE",
    cgpa: "", internships: "0", projects: "2",
    codingSkills: 6, communicationSkills: 6, softSkills: 6,
    aptitude: 70, certifications: "1", backlogs: "0",
  });

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [apiErr,  setApiErr]  = useState("");
  const resultRef = useRef(null);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e    = {};
    const age  = Number(form.age);
    const cgpa = parseFloat(form.cgpa);
    if (!form.age  || isNaN(age)  || age  < 18 || age  > 35)  e.age  = "Age must be 18–35";
    if (!form.cgpa || isNaN(cgpa) || cgpa < 4.0 || cgpa > 10) e.cgpa = "CGPA must be 4.0–10.0";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErr("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setResult(null);

    try {
      const BASE = import.meta.env.VITE_API_URL || "https://oralytics-backend.onrender.com";
      const res  = await fetch(`${BASE}/api/placement/predict`, {
        method:  "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age:                  Number(form.age),
          gender:               form.gender,
          degree:               form.degree,
          branch:               form.branch,
          cgpa:                 parseFloat(form.cgpa),
          internships:          Number(form.internships),
          projects:             Number(form.projects),
          codingSkills:         Number(form.codingSkills),
          communicationSkills:  Number(form.communicationSkills),
          aptitude:             Number(form.aptitude),
          softSkills:           Number(form.softSkills),
          certifications:       Number(form.certifications),
          backlogs:             Number(form.backlogs),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (res.status === 402) return setApiErr("PAYWALL");
        if (res.status === 401) return navigate("/auth");
        throw new Error(json.message || "Prediction failed");
      }
      setResult(json.data);
      if (json.credits !== undefined && userData) {
         dispatch(setUserData({ ...userData, credits: json.credits }));
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
    } catch (err) {
      setApiErr(err.message || "Could not reach the server. Make sure Node.js and FastAPI are both running.");
    } finally {
      setLoading(false);
    }
  };

  const placed = result?.prediction === 1;
  const conf   = result ? CONFIDENCE_CONFIG[result.confidence] ?? CONFIDENCE_CONFIG["Moderate"] : null;

  return (
    <>
      <div className="relative w-full min-h-screen bg-[#030303] text-white overflow-x-hidden"
        style={{ fontFamily: "'DM Sans',sans-serif" }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Sora:wght@600;700;800;900&display=swap');
          .d-title{font-family:'Sora',sans-serif}
          .clip-text{-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
          @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
          @keyframes floatSlow{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-10px) rotate(3deg)}}
          .float1{animation:float 9s ease-in-out infinite}
          .float2{animation:float 12s ease-in-out infinite 2s}
          .float3{animation:floatSlow 15s ease-in-out infinite 1s}
          input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:0;height:0}
          input[type=range]::-moz-range-thumb{width:0;height:0;border:none}
          ::-webkit-scrollbar{width:4px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:9px}
          select option{background:#111;color:#fff}
        `}</style>

        {/* ── Background Scene ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          {/* Orbs */}
          <div className="absolute w-[700px] h-[700px] rounded-full -top-80 -left-80 float1"
            style={{ background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)" }}/>
          <div className="absolute w-[500px] h-[500px] rounded-full -bottom-48 -right-48 float2"
            style={{ background: "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)" }}/>
          <div className="absolute w-[300px] h-[300px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 float3"
            style={{ background: "radial-gradient(circle, rgba(167,139,250,0.03) 0%, transparent 70%)" }}/>
          {/* Grid */}
          <div className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.012) 1px,transparent 1px)", backgroundSize: "36px 36px" }}/>
          {/* Vignette */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(3,3,3,0.6) 100%)" }}/>
        </div>

        {/* ── Top Nav ── */}
        <div className="relative z-20 flex items-center justify-between px-6 pt-7 max-w-7xl mx-auto">
          <motion.button onClick={() => navigate("/dashboard")}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07]
              text-white/45 hover:text-white/80 hover:bg-white/[0.06] hover:border-white/[0.12]
              transition-all duration-200 cursor-pointer text-sm font-medium group">
            <BsArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-200"/>
            Back
          </motion.button>          
        </div>

        {/* ── Hero ── */}
        <section className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto px-6 pt-12 pb-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-medium tracking-wide"
            style={{ background: "linear-gradient(135deg,rgba(52,211,153,0.1),rgba(56,189,248,0.05))", border: "1px solid rgba(52,211,153,0.2)", color: "rgba(52,211,153,0.8)" }}>
            <HiSparkles size={11}/>
            AI-Powered Placement Intelligence
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="d-title font-black tracking-tight leading-[0.95] mb-5"
            style={{ fontSize: "clamp(3rem,6vw,5.2rem)" }}>
            Predict Your{" "}
            <span className="relative inline-block">
              <span className="clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">Placement</span>
              <motion.div
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-1 left-0 right-0 h-px origin-left"
                style={{ background: "linear-gradient(90deg,#34d399,#38bdf8,transparent)" }}/>
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-white/30 text-[1.05rem] leading-relaxed max-w-lg">
            Enter your academic profile below and get an ML-powered probability
            score with personalised career tips in seconds.
          </motion.p>

          {/* Hero stat pills */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { label: "50K+ Records", icon: <BsAwardFill size={10}/> },
              { label: "89.4% Accuracy", icon: <BsGraphUp size={10}/> },
              { label: "13 Features", icon: <BsShieldCheck size={10}/> },
            ].map(({ label, icon }) => (
              <div key={label}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] text-white/40 font-medium"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-emerald-400/60">{icon}</span>{label}
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── Main Content ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-28">
          <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-5 items-start">

            {/* ─────────────────── FORM ─────────────────── */}
            <FadeUp>
              <div className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}>

                {/* Form header */}
                <div className="px-8 pt-7 pb-6"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-emerald-400"
                        style={{ background: "linear-gradient(135deg,rgba(52,211,153,0.15),rgba(52,211,153,0.05))", border: "1px solid rgba(52,211,153,0.2)" }}>
                        <RiRobot2Line size={17}/>
                      </div>
                      <div>
                        <h2 className="d-title text-[15px] font-bold text-white/90 leading-none">Academic Profile</h2>
                        <p className="text-[11px] text-white/25 mt-1">13 inputs · ML-ready format</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-400/70 font-semibold">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                      Model Ready
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pt-7 pb-8 space-y-8">

                  {/* ── S1: Personal ── */}
                  <div>
                    <SectionTag step="1" icon={<BsPersonLinesFill size={9}/>} label="Personal Info"/>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Age" icon={<BsPersonLinesFill size={10}/>} error={errors.age}>
                        <input type="number" placeholder="e.g. 21" value={form.age}
                          onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                          className={inputCls} min={18} max={35}/>
                      </Field>
                      <Field label="CGPA" icon={<HiAcademicCap size={10}/>} error={errors.cgpa} hint="4.0 – 10.0">
                        <input type="number" placeholder="e.g. 7.8" step="0.01" value={form.cgpa}
                          onChange={e => setForm(f => ({ ...f, cgpa: e.target.value }))}
                          className={inputCls} min={4} max={10}/>
                      </Field>
                    </div>
                    <div className="mt-4">
                      <Field label="Gender" icon={<BsPersonLinesFill size={10}/>}>
                        <GenderSelector value={form.gender} onChange={set("gender")}/>
                      </Field>
                    </div>
                  </div>

                  {/* ── S2: Academic ── */}
                  <div>
                    <SectionTag step="2" icon={<HiAcademicCap size={9}/>} label="Academic Details"/>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Degree" icon={<MdSchool size={11}/>}>
                        <Select value={form.degree} onChange={set("degree")} options={DEGREES}/>
                      </Field>
                      <Field label="Branch" icon={<MdSchool size={11}/>}>
                        <Select value={form.branch} onChange={set("branch")} options={BRANCHES}/>
                      </Field>
                    </div>
                    <div className="mt-4">
                      <Field label="Active Backlogs" icon={<BsExclamationCircleFill size={10}/>} hint="failed subjects">
                        <StepSelector value={form.backlogs} onChange={set("backlogs")} layoutId="backlogs"
                          options={[
                            { val: "0", label: "0", sub: "Clear" },
                            { val: "1", label: "1", sub: "Minor" },
                            { val: "2", label: "2", sub: "Risk" },
                            { val: "3", label: "3+", sub: "High" },
                          ]}/>
                      </Field>
                    </div>
                  </div>

                  {/* ── S3: Experience ── */}
                  <div>
                    <SectionTag step="3" icon={<BsBriefcaseFill size={9}/>} label="Experience"/>
                    <div className="space-y-4">
                      <Field label="Internships" icon={<MdWork size={11}/>} hint="completed">
                        <StepSelector value={form.internships} onChange={set("internships")} layoutId="intern"
                          options={[
                            { val: "0", label: "0", sub: "None" },
                            { val: "1", label: "1", sub: "One" },
                            { val: "2", label: "2", sub: "Two" },
                            { val: "3", label: "3+", sub: "Many" },
                          ]}/>
                      </Field>
                      <Field label="Projects" icon={<BsClipboardData size={10}/>} hint="built">
                        <StepSelector value={form.projects} onChange={set("projects")} layoutId="projects"
                          options={[
                            { val: "1", label: "1" }, { val: "2", label: "2" },
                            { val: "3", label: "3" }, { val: "4", label: "4" },
                            { val: "5", label: "5" }, { val: "6", label: "6+" },
                          ]}/>
                      </Field>
                      <Field label="Certifications" icon={<BsFileEarmarkCheck size={10}/>} hint="completed">
                        <StepSelector value={form.certifications} onChange={set("certifications")} layoutId="certs"
                          options={[
                            { val: "0", label: "0", sub: "None" },
                            { val: "1", label: "1", sub: "One" },
                            { val: "2", label: "2", sub: "Two" },
                            { val: "3", label: "3+", sub: "Many" },
                          ]}/>
                      </Field>
                    </div>
                  </div>

                  {/* ── S4: Skills ── */}
                  <div>
                    <SectionTag step="4" icon={<BsCodeSlash size={9}/>} label="Skills & Assessment"/>
                    <div className="space-y-6">
                      <Field label="Coding Skills" icon={<BsCodeSlash size={10}/>}>
                        <SkillSlider value={form.codingSkills} onChange={set("codingSkills")} color="#34d399"/>
                      </Field>
                      <Field label="Communication Skills" icon={<BsChatDots size={10}/>}>
                        <SkillSlider value={form.communicationSkills} onChange={set("communicationSkills")} color="#38bdf8"/>
                      </Field>
                      <Field label="Soft Skills" icon={<BsPeopleFill size={10}/>}>
                        <SkillSlider value={form.softSkills} onChange={set("softSkills")} color="#a78bfa"/>
                      </Field>
                      <Field label="Aptitude Score" icon={<MdOutlineAnalytics size={11}/>}>
                        <ScoreSlider value={form.aptitude} onChange={set("aptitude")} min={30} max={100} color="#fbbf24"/>
                      </Field>
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {apiErr === 'PAYWALL' ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className='bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center mt-6'>
                        <div className='w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(239,68,68,0.3)]'>
                          <BsShieldCheck size={20} className='text-red-400' />
                        </div>
                        <p className='text-white font-bold text-sm mb-1'>Insufficient Credits</p>
                        <p className='text-[11px] text-white/50 mb-4 px-4'>You need 15 credits for a Placement Prediction. Upgrade your plan to unlock more predictions.</p>
                        <button onClick={() => navigate('/credits')} type="button"
                          className='w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all'>
                          Upgrade to Premium
                        </button>
                      </motion.div>
                    ) : apiErr && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-start gap-3 p-4 rounded-xl text-sm text-red-400 mt-6"
                        style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)" }}>
                        <BsExclamationCircleFill size={14} className="mt-0.5 flex-shrink-0"/>
                        {apiErr}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button type="submit" disabled={loading}
                    whileHover={!loading ? { scale: 1.012, y: -1 } : {}}
                    whileTap={!loading ? { scale: 0.975 } : {}}
                    className="relative w-full flex items-center justify-center gap-2.5 py-4 rounded-xl
                      font-bold text-[15px] overflow-hidden cursor-pointer transition-all duration-300"
                    style={!loading ? {
                      background: "linear-gradient(135deg,#34d399 0%,#2dd4bf 50%,#38bdf8 100%)",
                      color: "#000",
                      boxShadow: "0 0 40px rgba(52,211,153,0.3), 0 0 80px rgba(52,211,153,0.1)",
                    } : {
                      background: "rgba(52,211,153,0.08)",
                      color: "rgba(52,211,153,0.35)",
                      cursor: "not-allowed",
                    }}>
                    {/* Shimmer */}
                    {!loading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]"
                        style={{ animation: "shimmer 2.5s infinite" }}/>
                    )}
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-emerald-400/50 border-t-emerald-400 rounded-full animate-spin"/>
                        Analysing profile…
                      </>
                    ) : (
                      <>
                        <BsLightningChargeFill size={15}/>
                        Predict My Placement
                        <BsArrowRight size={14}/>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </FadeUp>

            {/* ─────────────────── RESULT PANEL ─────────────────── */}
            <div ref={resultRef} className="lg:sticky lg:top-6 space-y-4">
              <AnimatePresence mode="wait">

                {/* Placeholder */}
                {!result && !loading && (
                  <motion.div key="placeholder"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                    className="rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[500px] gap-7"
                    style={{
                      background: "linear-gradient(145deg,rgba(255,255,255,0.025) 0%,rgba(255,255,255,0.008) 100%)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}>
                    {/* Icon */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,rgba(52,211,153,0.08),rgba(52,211,153,0.02))", border: "1px solid rgba(52,211,153,0.12)" }}>
                        <BsBarChartFill size={38} className="text-emerald-400/20"/>
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}>
                        <HiSparkles size={13} className="text-emerald-400/60"/>
                      </div>
                    </div>
                    <div>
                      <p className="d-title text-[1.15rem] font-bold text-white/20 mb-1.5">Result appears here</p>
                      <p className="text-[13px] text-white/10 max-w-[220px] leading-relaxed">
                        Fill all 13 fields and click Predict My Placement.
                      </p>
                    </div>
                    {/* Mini stats */}
                    <div className="grid grid-cols-3 gap-2.5 w-full">
                      {[
                        { label: "Dataset",  value: "50K+" },
                        { label: "Accuracy", value: "89%" },
                        { label: "AUC",      value: "0.90" },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl p-3.5 text-center"
                          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <p className="d-title text-[15px] font-black text-white/15">{value}</p>
                          <p className="text-[10px] text-white/10 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                    {/* Decorative preview bars */}
                    <div className="w-full space-y-2 opacity-20">
                      {[80, 55, 35].map((w, i) => (
                        <div key={i} className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-white/20" style={{ width: `${w}%` }}/>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Loading */}
                {loading && (
                  <motion.div key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="rounded-2xl flex flex-col items-center justify-center min-h-[500px] gap-8"
                    style={{
                      background: "linear-gradient(145deg,rgba(255,255,255,0.025) 0%,rgba(255,255,255,0.008) 100%)",
                      border: "1px solid rgba(52,211,153,0.12)",
                    }}>
                    {/* Rings */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-ping" style={{ animationDuration: "1.8s" }}/>
                      <div className="absolute inset-4 rounded-full border border-emerald-500/15 animate-pulse"/>
                      <svg className="animate-spin" width="56" height="56" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(52,211,153,0.12)" strokeWidth="3"/>
                        <path d="M 28 6 A 22 22 0 0 1 50 28" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      <RiRobot2Line size={20} className="absolute text-emerald-400/50"/>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="d-title text-[17px] font-bold text-white/50">Running inference…</p>
                      <p className="text-sm text-white/15">Processing 13 features through ML pipeline</p>
                    </div>
                    {/* Animated "thinking" dots */}
                    <div className="flex gap-1.5">
                      {[0, 0.2, 0.4].map((d, i) => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400/30"
                          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 1.2, delay: d, repeat: Infinity }}/>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Result */}
                {result && (
                  <motion.div key="result"
                    initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>

                    {/* Main result card */}
                    <div className="rounded-2xl overflow-hidden"
                      style={{
                        background: placed
                          ? "linear-gradient(145deg,rgba(52,211,153,0.07) 0%,rgba(255,255,255,0.015) 100%)"
                          : "linear-gradient(145deg,rgba(248,113,113,0.07) 0%,rgba(255,255,255,0.015) 100%)",
                        border: placed ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(248,113,113,0.25)",
                        boxShadow: placed
                          ? "0 0 60px rgba(52,211,153,0.08), inset 0 1px 0 rgba(52,211,153,0.12)"
                          : "0 0 60px rgba(248,113,113,0.08), inset 0 1px 0 rgba(248,113,113,0.12)",
                      }}>

                      {/* Top shimmer line */}
                      <div className="h-px w-full"
                        style={{ background: placed ? "linear-gradient(90deg,transparent,rgba(52,211,153,0.6),transparent)" : "linear-gradient(90deg,transparent,rgba(248,113,113,0.6),transparent)" }}/>

                      <div className="p-7 space-y-6">

                        {/* Verdict row */}
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={placed ? { background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.25)" }
                                              : { background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.25)" }}>
                                {placed
                                  ? <BsCheckCircleFill size={19} className="text-emerald-400"/>
                                  : <BsXCircleFill size={19} className="text-red-400"/>}
                              </div>
                              <div>
                                <p className={`d-title text-[17px] font-black leading-tight ${placed ? "text-emerald-400" : "text-red-400"}`}>
                                  {placed ? "Strong Placement Profile" : "Placement at Risk"}
                                </p>
                                <p className="text-[11px] text-white/25 mt-0.5">{result.label}</p>
                              </div>
                            </div>
                            {/* Confidence badge */}
                            {conf && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
                                className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                                style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
                                {conf.label}
                              </motion.div>
                            )}
                          </div>
                        </motion.div>

                        {/* Ring + bars */}
                        <div className="flex items-center gap-6">
                          <ProbabilityRing value={result.placed_probability} placed={placed}/>
                          <div className="flex-1 space-y-4">
                            {[
                              { label: "Placed",     val: result.placed_probability,     color: "#34d399" },
                              { label: "Not Placed", val: result.not_placed_probability, color: "#f87171" },
                            ].map(({ label, val, color }, i) => (
                              <div key={label}>
                                <div className="flex justify-between text-[11px] mb-1.5">
                                  <span className="text-white/30">{label}</span>
                                  <span className="font-bold" style={{ color }}>{val}%</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                                  <motion.div className="h-full rounded-full"
                                    style={{ background: `linear-gradient(90deg,${color}50,${color})` }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${val}%` }}
                                    transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.25 + i * 0.15 }}/>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }}/>

                        {/* Tips */}
                        {result.tips?.length > 0 && (
                          <div className="space-y-2.5">
                            <p className="text-[9px] text-white/20 uppercase tracking-[0.25em] font-bold">
                              ✦ Personalised Recommendations
                            </p>
                            {result.tips.map((tip, i) => (
                              <motion.div key={i}
                                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.12, duration: 0.4 }}
                                className="flex items-start gap-3 p-3.5 rounded-xl text-[13px] text-white/50 leading-relaxed"
                                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <BsStarFill size={8} className="text-amber-400/80 mt-1.5 flex-shrink-0"/>
                                {tip}
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Re-predict */}
                        <motion.button
                          onClick={() => { setResult(null); setApiErr(""); }}
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                          className="w-full py-3 rounded-xl text-[13px] text-white/20 transition-all duration-200 cursor-pointer hover:text-white/40"
                          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          ↺ Predict Again
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Footer stats strip ── */}
          <FadeUp delay={0.15} className="mt-10">
            <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-3 py-5 px-6 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {[
                { icon: <BsAwardFill size={11}/>,     text: "Trained on 50,000+ student records" },
                { icon: <BsGraphUp size={11}/>,       text: "89.4% cross-val accuracy · AUC 0.90" },
                { icon: <BsBriefcaseFill size={11}/>, text: "Logistic Regression · scikit-learn" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-[11px] text-white/20">
                  <span className="text-emerald-400/40">{icon}</span>{text}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
      <Footer/>
    </>
  );
}
