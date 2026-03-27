import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { FaRobot } from "react-icons/fa6";
import {
  BsMicFill, BsLightningChargeFill, BsBarChartFill,
  BsShieldCheck,  
  BsStarFill, BsArrowRight, BsCheckCircleFill,
  BsBriefcaseFill, BsCpuFill, BsPersonCheckFill,
  BsShieldFillCheck
} from "react-icons/bs";
import logo from "../assets/logo.png";
import AuthModel from "../components/AuthModel";
import LandingNavbar from "../components/LandingNavbar";
import Footer from "./Footer";

/* ── tiny helpers ── */
const FadeUp = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
    bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wide uppercase">
    {children}
  </span>
);

/* ── data ── */
const features = [
  {
    icon: <BsMicFill size={20} />,
    title: "Voice-Powered Interviews",
    desc: "Speak your answers naturally. Our AI listens, transcribes, and evaluates delivery, tone, and content in real time.",
  },
  {
    icon: <BsLightningChargeFill size={20} />,
    title: "Instant AI Feedback",
    desc: "Get detailed, structured feedback within seconds — not days. Know exactly what to fix before the real interview.",
  },
  {
    icon: <BsBarChartFill size={20} />,
    title: "Performance Analytics",
    desc: "Track confidence score, clarity, pacing, and keyword usage across every session with a personal growth dashboard.",
  },
  {
    icon: <BsShieldFillCheck size={20} />,
    title: "Industry-Specific Questions",
    desc: "Questions tailored for Software, Finance, Marketing, Product, and 20+ other domains from real interview pools.",
  },
  {
    icon: <BsBriefcaseFill size={20} />,
    title: "Resume-Aware Prep",
    desc: "Upload your resume and get custom questions based on your actual experience, skills, and target role.",
  },
  {
    icon: <BsCpuFill size={20} />,
    title: "Powered by Latest AI",
    desc: "Built on frontier language models fine-tuned on thousands of real interviews from top-tier companies.",
  },
];

const steps = [
  {
    num: "01",
    title: "Set Your Role & Level",
    desc: "Choose your target job title, industry, and experience level. We personalise everything from there.",
    icon: <BsPersonCheckFill size={22} />,
  },
  {
    num: "02",
    title: "Start the AI Interview",
    desc: "Answer voice or text questions in a realistic mock session. The AI adapts difficulty based on your responses.",
    icon: <BsMicFill size={22} />,
  },
  {
    num: "03",
    title: "Review Deep Feedback",
    desc: "Receive a scored report: content quality, confidence, structure, filler words, and improvement suggestions.",
    icon: <BsBarChartFill size={22} />,
  },
  {
    num: "04",
    title: "Iterate Until Ready",
    desc: "Practice daily, track your progress, and walk into your real interview knowing you've done the work.",
    icon: <BsLightningChargeFill size={22} />,
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "SDE-2 @ Google",
    text: "I used Oralytics for 3 weeks before my Google interview. The feedback on my system design answers was shockingly accurate. Got the offer.",
    stars: 5,
  },
  {
    name: "Arjun Mehta",
    role: "Product Manager @ Flipkart",
    text: "No other platform gives you this level of personalised feedback. It caught my habit of over-explaining and helped me fix it fast.",
    stars: 5,
  },
  {
    name: "Neha Kapoor",
    role: "Data Analyst @ Razorpay",
    text: "Resume-aware questions were a game changer. It asked me about specific projects from my CV — exactly what the real interviewer did.",
    stars: 5,
  },
  {
    name: "Rohan Gupta",
    role: "Frontend Dev @ Swiggy",
    text: "The analytics dashboard showed me I was using too many filler words. After a week of practice, my clarity score jumped by 40%.",
    stars: 5,
  },
  {
    name: "Sanya Joshi",
    role: "Finance Analyst @ Deloitte",
    text: "Finance-specific questions, behavioural rounds, case prep — all in one place. Oralytics is the only interview tool you need.",
    stars: 5,
  },
  {
    name: "Karthik Rao",
    role: "ML Engineer @ Microsoft",
    text: "The AI doesn't just check keywords — it understands the depth of your answer. That's what separates it from every other tool.",
    stars: 5,
  },
];

const faqs = [
  {
    q: "Is Oralytics AI suitable for freshers?",
    a: "Absolutely. We have tailored question sets and difficulty levels for freshers through senior professionals. Start from zero, grow fast.",
  },
  {
    q: "What types of interviews does it support?",
    a: "Technical, HR, behavioural, case studies, system design, domain-specific (finance, marketing, product, etc.), and leadership rounds.",
  },
  {
    q: "How is the feedback generated?",
    a: "Your answers are evaluated by frontier AI models across dimensions: structure, relevance, confidence signals, depth, and communication quality.",
  },
  {
    q: "Can I practice for a specific company?",
    a: "Yes. Our Pro and Premium plans include company-specific question pools for 50+ companies including Google, Amazon, TCS, Infosys, and more.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The Starter plan gives you 5 full AI interviews per month with basic feedback — no credit card required.",
  },
];

const stats = [
  { number: "10K+", label: "Active Users" },
  { number: "50K+", label: "Interviews Conducted" },
  { number: "95%", label: "Success Rate" },
  { number: "4.9★", label: "Average Rating" },
];

// Companies array update karo
const companies = [
  { name: "Google", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg", careerUrl: "https://careers.google.com" },
  { name: "Amazon", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazon.svg", careerUrl: "https://www.amazon.jobs" },
  { name: "Microsoft", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoft.svg", careerUrl: "https://careers.microsoft.com" },
  { name: "Meta", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/meta.svg", careerUrl: "https://www.metacareers.com" },
  { name: "Swiggy", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/swiggy.svg", careerUrl: "https://careers.swiggy.com" },
  { name: "Razorpay", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/razorpay.svg", careerUrl: "https://razorpay.com/jobs" },
  { name: "Infosys", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/infosys.svg", careerUrl: "https://www.infosys.com/careers" },
  { name: "Adobe", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobe.svg", careerUrl: "https://www.adobe.com/careers.html" },
]
/* ─────────────────────────────── */
function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div
      className="bg-[#050505] text-white min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@400;600;700;800&display=swap');
        .hero-title { font-family: 'Sora', sans-serif; }
        .section-title { font-family: 'Sora', sans-serif; }
        .glow-emerald { box-shadow: 0 0 40px rgba(52,211,153,0.15); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { border-color: rgba(52,211,153,0.3); background: rgba(255,255,255,0.06); transform: translateY(-2px); }
        .marquee { animation: marquee 20s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .faq-open { max-height: 200px; opacity: 1; }
        .faq-closed { max-height: 0; opacity: 0; }
      `}</style>

      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500 opacity-[0.07] blur-[160px] rounded-full -top-40 -left-40" />
        <div className="absolute w-[500px] h-[500px] bg-emerald-400 opacity-[0.05] blur-[160px] rounded-full bottom-0 right-0" />
        <div className="absolute w-[300px] h-[300px] bg-teal-400 opacity-[0.04] blur-[120px] rounded-full top-1/2 left-1/2" />
      </div>

      <LandingNavbar />

      {/* ══════════ HERO ══════════ */}
      <section className="relative flex flex-col items-center text-center pt-44 pb-24 px-6">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge><BsLightningChargeFill /> Now with Voice Intelligence</Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="hero-title text-5xl md:text-7xl font-bold leading-[1.1] max-w-4xl mt-6 tracking-tight"
        >
          Your Personal{" "}
          <span className="text-emerald-400">AI Interview</span>{" "}
          Coach
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 text-white/50 max-w-xl text-lg leading-relaxed"
        >
          Practice real interview questions tailored to your resume and target role.
          Get instant, honest AI feedback and land the job you deserve.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 mt-10"
        >
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-7 py-3.5 bg-emerald-400 text-black font-semibold rounded-xl
              hover:bg-emerald-300 shadow-[0_0_32px_rgba(52,211,153,0.3)] cursor-pointer
              hover:shadow-[0_0_48px_rgba(52,211,153,0.45)] transition-all duration-300 text-sm tracking-wide"
          >
            Start Free — No Card Needed
          </button>
          <button className="px-7 py-3.5 border border-white/10 rounded-xl hover:bg-white/5 cursor-pointer
            transition-all duration-300 text-sm text-white/70 hover:text-white tracking-wide">
            Watch 2-min Demo →
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center gap-3 text-sm text-white/40"
        >
          <div className="flex -space-x-2">
            {["A", "B", "C", "D"].map((l, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-emerald-900 border border-emerald-700
                flex items-center justify-center text-emerald-400 text-[10px] font-bold">
                {l}
              </div>
            ))}
          </div>
          <span>Joined by <strong className="text-white/70">10,000+</strong> job seekers this month</span>
        </motion.div>

        {/* Mock interview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-2xl bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6 text-left glow-emerald"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/40 tracking-wider uppercase">Live Session — Software Engineer Role</span>
          </div>
          <p className="text-white/70 text-sm mb-4">"Tell me about a time you had to debug a critical production issue under pressure."</p>
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
            <p className="text-xs text-emerald-400 font-semibold mb-2 tracking-wide uppercase">AI Feedback</p>
            <div className="space-y-1.5 text-xs text-white/60">
              <p> <strong className="text-white/80">Strong STAR structure</strong> — clear situation and action</p>
              <p> <strong className="text-yellow-400/80">Quantify the impact</strong> — mention downtime reduced or users affected</p>
              <p> <strong className="text-white/80">Confident delivery</strong> — pacing and clarity are excellent</p>
            </div>
            <div className="mt-3 flex gap-3 text-xs">
              {[["Content", "88%"], ["Clarity", "92%"], ["Confidence", "85%"]].map(([k, v]) => (
                <div key={k} className="flex flex-col items-center bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-emerald-400 font-bold text-sm">{v}</span>
                  <span className="text-white/40 mt-0.5">{k}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════ TRUSTED BY ══════════ */}
      <div className="py-14 border-y border-white/[0.05] overflow-hidden">

        <p className="text-center text-[11px] text-white/20 tracking-[0.25em] uppercase mb-8">
          Candidates have landed offers at
        </p>

        <div className="relative flex overflow-hidden group">

          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10
      bg-gradient-to-r from-[#050505] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10
      bg-gradient-to-l from-[#050505] to-transparent" />

          {/* Marquee */}
          <div className="flex gap-14 items-center marquee group-hover:[animation-play-state:paused]">

            {[...companies, ...companies].map((c, i) => (
              <div
                key={i}
                onClick={() => window.open(c.careerUrl, '_blank', 'noopener noreferrer')}
                className="flex items-center gap-3 flex-shrink-0
      opacity-25 hover:opacity-70 transition-all duration-300
      cursor-pointer hover:scale-105 group"
                title={`${c.name} Careers`}
              >
                <img
                  src={c.logo}
                  alt={c.name}
                  className="h-6 w-auto object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                <span className="text-white text-sm font-semibold tracking-wide whitespace-nowrap
      group-hover:text-emerald-400 transition-colors duration-200">
                  {c.name}
                </span>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* ══════════ STATS ══════════ */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <FadeUp key={i} delay={i * 0.08}>
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 text-center card-hover">
                <p className="section-title text-3xl font-bold text-emerald-400">{s.number}</p>
                <p className="text-white/40 text-sm mt-2">{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* --------- FEATURES ---------- */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <FadeUp className="text-center mb-14">
          <Badge>Features</Badge>
          <h2 className="section-title text-4xl md:text-5xl font-bold mt-4 tracking-tight">
            Everything you need to<br />interview with confidence
          </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-base">
            From mock sessions to resume-aware prep — built for serious candidates.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FadeUp key={i} delay={i * 0.07}>
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 card-hover h-full">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                  flex items-center justify-center text-emerald-400 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how" className="py-24 px-6 bg-white/[0.015] border-y border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-14">
            <Badge>How It Works</Badge>
            <h2 className="section-title text-4xl md:text-5xl font-bold mt-4 tracking-tight">
              From signup to offer letter
            </h2>
            <p className="text-white/40 mt-4 max-w-md mx-auto">
              A proven 4-step system used by thousands of successful candidates.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-6 card-hover h-full">
                  <span className="section-title text-5xl font-bold text-white/5 absolute top-4 right-5 select-none">
                    {s.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                    flex items-center justify-center text-emerald-400 mb-5">
                    {s.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-base">{s.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SOCIAL PROOF / TESTIMONIALS ══════════ */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <FadeUp className="text-center mb-14">
          <Badge>Testimonials</Badge>
          <h2 className="section-title text-4xl md:text-5xl font-bold mt-4 tracking-tight">
            Real results, real people
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <FadeUp key={i} delay={i * 0.07}>
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 card-hover h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array(t.stars).fill(0).map((_, j) => (
                    <BsStarFill key={j} size={12} className="text-emerald-400" />
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="mt-5 pt-4 border-t border-white/[0.06]">
                  <p className="text-white font-medium text-sm">{t.name}</p>
                  <p className="text-white/35 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════ PRICING ══════════ */}
      <section id="pricing" className="py-24 px-6 bg-white/[0.015] border-y border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-14">
            <Badge>Pricing</Badge>
            <h2 className="section-title text-4xl md:text-5xl font-bold mt-4 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-white/40 mt-4">Start free. No credit card required.</p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* Starter */}
            <FadeUp delay={0}>
              <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-7  card-hover">
                <p className="text-white/50 text-sm mb-1">Starter</p>
                <p className="section-title text-4xl font-bold">₹0</p>
                <p className="text-white/30 text-xs mt-1">Forever free</p>
                <div className="my-6 border-t border-white/[0.06]" />
                {["5 AI interviews / month", "Basic feedback report", "Text-only mode", "Community access"].map(f => (
                  <div key={f} className="flex items-center gap-2.5 mb-3">
                    <BsCheckCircleFill size={13} className="text-white/25 flex-shrink-0" />
                    <span className="text-white/50 text-sm">{f}</span>
                  </div>
                ))}
                <button onClick={() => setShowAuthModal(true)} className="mt-6 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10
                  transition text-sm text-white/60 hover:text-white cursor-pointer border border-white/[0.07]">
                  Get Started Free
                </button>
              </div>
            </FadeUp>

            {/* Pro */}
            <FadeUp delay={0.1}>
              <div className="relative bg-[#0d0d0d] border border-emerald-500/40 rounded-2xl p-7
                shadow-[0_0_60px_rgba(52,211,153,0.1)] scale-[1.03]">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs bg-emerald-400
                  text-black px-4 py-1 rounded-full font-semibold tracking-wide">
                  Most Popular
                </div>
                <p className="text-emerald-400 text-sm mb-1 font-medium">Pro</p>
                <p className="section-title text-4xl font-bold">₹199</p>
                <p className="text-white/30 text-xs mt-1">per month</p>
                <div className="my-6 border-t border-white/[0.06]" />
                {[
                  "Unlimited AI interviews",
                  "Advanced feedback + scoring",
                  "Voice + text mode",
                  "Performance analytics",
                  "Company-specific questions",
                  "Resume-aware prep",
                ].map(f => (
                  <div key={f} className="flex items-center gap-2.5 mb-3">
                    <BsCheckCircleFill size={13} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-white/70 text-sm">{f}</span>
                  </div>
                ))}
                <button onClick={() => setShowAuthModal(true)}
                  className="mt-6 w-full py-2.5 rounded-xl bg-emerald-400 text-black font-semibold
                  hover:bg-emerald-300 transition cursor-pointer shadow-[0_0_24px_rgba(52,211,153,0.25)] text-sm">
                  Get Pro
                </button>
              </div>
            </FadeUp>

            {/* Premium */}
            <FadeUp delay={0.2}>
              <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-7 card-hover">
                <p className="text-white/50 text-sm mb-1">Premium</p>
                <p className="section-title text-4xl font-bold">₹499</p>
                <p className="text-white/30 text-xs mt-1">per month</p>
                <div className="my-6 border-t border-white/[0.06]" />
                {[
                  "Everything in Pro",
                  "Personalized learning path",
                  "Resume & LinkedIn review",
                  "1-on-1 AI coaching sessions",
                  "Priority support",
                  "Early feature access",
                ].map(f => (
                  <div key={f} className="flex items-center gap-2.5 mb-3">
                    <BsCheckCircleFill size={13} className="text-emerald-400/60 flex-shrink-0" />
                    <span className="text-white/50 text-sm">{f}</span>
                  </div>
                ))}
                <button onClick={() => setShowAuthModal(true)} className="mt-6 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10
                  transition text-sm cursor-pointer text-white/60 hover:text-white border border-white/[0.07]">
                  Go Premium
                </button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <FadeUp className="text-center mb-12">
          <Badge>FAQ</Badge>
          <h2 className="section-title text-4xl font-bold mt-4 tracking-tight">Common questions</h2>
        </FadeUp>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeUp key={i} delay={i * 0.05}>
              <div
                className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden card-hover cursor-pointer"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex justify-between items-center px-5 py-4">
                  <p className="text-sm font-medium text-white/80">{faq.q}</p>
                  <BsArrowRight
                    className={`text-emerald-400 flex-shrink-0 ml-4 transition-transform duration-300 ${openFaq === i ? "rotate-90" : ""}`}
                    size={14}
                  />
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="px-5 pb-5 text-sm text-white/40 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="py-24 px-6">
        <FadeUp>
          <div className="max-w-4xl mx-auto bg-[#0d0d0d] border border-emerald-500/20 rounded-3xl p-12 text-center
            shadow-[0_0_80px_rgba(52,211,153,0.08)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
            <Badge><BsLightningChargeFill /> Limited Early Access</Badge>
            <h2 className="section-title text-4xl md:text-5xl font-bold mt-5 tracking-tight">
              Ready to ace your<br />next interview?
            </h2>
            <p className="text-white/40 mt-4 max-w-md mx-auto">
              Join 10,000+ candidates who are already practising smarter with Oralytics AI.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="mt-8 px-8 py-3.5 bg-emerald-400 text-black font-semibold rounded-xl
                hover:bg-emerald-300 shadow-[0_0_40px_rgba(52,211,153,0.3)]
                hover:shadow-[0_0_60px_rgba(52,211,153,0.45)] transition-all duration-300 cursor-pointer text-sm"
            >
              Start Free Today →
            </button>
            <p className="mt-4 text-white/20 text-xs">No credit card · Cancel anytime · Setup in 60 seconds</p>
          </div>
        </FadeUp>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <Footer />
      {showAuthModal && (
        <AuthModel onclose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

export default Landing;