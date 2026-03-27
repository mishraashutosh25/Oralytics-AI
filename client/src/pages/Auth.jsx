import React, { useState } from "react";
import { FaRobot } from "react-icons/fa6";
import { FaGithub, FaLock, FaShieldAlt } from "react-icons/fa";
import { BsLightningChargeFill, BsBarChartFill, BsMicFill, BsCheckCircleFill } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axios from "axios";
import logo from "../assets/logo.png";
import { ServerURL } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: <BsMicFill size={12} />, text: "Voice-powered mock interviews" },
  { icon: <BsLightningChargeFill size={12} />, text: "Instant AI feedback & scoring" },
  { icon: <BsBarChartFill size={12} />, text: "Performance analytics dashboard" },
  { icon: <HiSparkles size={12} />, text: "Resume-aware question generation" },
];

const socialProof = [
  { initials: "PR", name: "Priya R.", role: "Landed at Google" },
  { initials: "AM", name: "Arjun M.", role: "Landed at Flipkart" },
  { initials: "NK", name: "Neha K.", role: "Landed at Razorpay" },
];

function Auth({ isModel = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleAuth = async () => {
    setLoadingGoogle(true);
    setError(null);
    try {
      const response = await signInWithPopup(auth, provider);
      const { displayName: name, email } = response.user;
      const result = await axios.post(
        ServerURL + "/api/auth/google",
        { name, email },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
      console.error(err);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleGithubAuth = async () => {
    setLoadingGithub(true);
    setError(null);
    const githubProvider = new GithubAuthProvider();
    try {
      const response = await signInWithPopup(auth, githubProvider);
      const user = response.user;
      const name = user.displayName || "GitHub User";
      const email = user.email || user.providerData[0]?.email;
      const result = await axios.post(
        ServerURL + "/api/auth/github",
        { name, email },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError("GitHub sign-in failed. Please try again.");
      console.error(err);
    } finally {
      setLoadingGithub(false);
    }
  };

  const isLoading = loadingGoogle || loadingGithub;

  /* ── Shared auth card ── */
  const AuthCard = (
    <motion.div
      initial={{ opacity: 0, y: isModel ? 0 : 24, scale: isModel ? 0.97 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`relative z-10 w-full flex flex-col lg:flex-row gap-5 items-stretch
        ${isModel ? "max-w-3xl" : "max-w-5xl"}`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');
        .auth-sora { font-family: 'Sora', sans-serif; }
        .auth-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes auth-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .auth-float { animation: auth-float 4s ease-in-out infinite; }
      `}</style>

      {/* ── LEFT panel — hide on modal & mobile ── */}
      {!isModel && (
        <div className="hidden lg:flex flex-col justify-between w-80 flex-shrink-0
          bg-[#0c0c0c] border border-white/[0.07] rounded-3xl p-8
          shadow-[0_0_60px_rgba(0,0,0,0.5)]">

          {/* Logo */}
          <div>
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                flex items-center justify-center">
                <FaRobot size={15} className="text-emerald-400" />
              </div>
              <span className="auth-sora text-base font-bold text-white">
                Oralytics <span className="text-emerald-400">AI</span>
              </span>
            </div>

            <h2 className="auth-sora text-2xl font-bold text-white leading-snug mb-3">
              Land your dream job with AI coaching
            </h2>
            <p className="auth-dm text-white/35 text-sm leading-relaxed mb-8">
              Practice with an AI that knows your resume, adapts to your level,
              and gives feedback like a senior interviewer would.
            </p>

            <div className="space-y-3">
              {features.map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20
                    flex items-center justify-center text-emerald-400 flex-shrink-0">
                    {icon}
                  </div>
                  <span className="auth-dm text-sm text-white/50">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <p className="text-[10px] text-white/20 uppercase tracking-widest mb-4">
              Recent success stories
            </p>
            <div className="space-y-3">
              {socialProof.map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900/40 border border-emerald-700/25
                    flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="auth-dm text-white/70 text-xs font-medium">{p.name}</p>
                    <p className="auth-dm text-white/25 text-[11px]">{p.role}</p>
                  </div>
                  <BsCheckCircleFill size={11} className="text-emerald-400 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>
            <p className="auth-dm flex items-center gap-1.5 mt-5 text-[11px] text-white/20">
              <FaShieldAlt size={9} /> 10,000+ candidates already practising
            </p>
          </div>
        </div>
      )}

      {/* ── RIGHT / Main auth card ── */}
      <div className={`auth-dm flex-1 flex flex-col justify-center
        bg-[#0c0c0c] border border-white/[0.07] rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.5)]
        ${isModel ? "p-8" : "p-8 md:p-10"}`}>

        {/* Logo — always visible */}
        <div className="flex items-center justify-center gap-2.5 mb-7">
          <div className={`w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20
            flex items-center justify-center auth-float`}>
            <img
              src={logo}
              alt="logo"
              className="w-7 h-7 object-contain"
            />
          </div>
          <span className="auth-sora text-xl font-bold text-white">
            Oralytics <span className="text-emerald-400">AI</span>
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="auth-sora text-2xl md:text-3xl font-bold text-white mb-2.5">
            {isModel ? "Sign in to continue" : "Welcome back"}
          </h1>
          <p className="text-white/35 text-sm leading-relaxed max-w-xs mx-auto">
            {isModel
              ? "Sign in to start your AI interview session and track your progress."
              : "Sign in to continue practising. Your sessions, feedback, and progress are waiting."}
          </p>
        </div>

        {/* Free plan badge */}
        <div className="mb-6 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
          bg-emerald-500/5 border border-emerald-500/15 mx-auto w-full max-w-sm">
          <HiSparkles size={13} className="text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-white/45">
            <span className="text-emerald-400 font-semibold">Free plan</span>
            {" "}includes 5 interviews — no credit card needed
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mb-4 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20
                text-red-400 text-xs text-center max-w-sm mx-auto w-full"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">

          {/* Google */}
          <motion.button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.015 } : {}}
            whileTap={!isLoading ? { scale: 0.985 } : {}}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl
              bg-white text-[#111] text-sm font-semibold
              hover:bg-gray-100 transition-all duration-200 cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-[0_2px_20px_rgba(255,255,255,0.06)]"
          >
            {loadingGoogle
              ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              : <FcGoogle size={18} />}
            {loadingGoogle ? "Signing in…" : "Continue with Google"}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-white/20">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* GitHub */}
          <motion.button
            onClick={handleGithubAuth}
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.015 } : {}}
            whileTap={!isLoading ? { scale: 0.985 } : {}}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl
              bg-white/[0.05] border border-white/[0.08] text-white/65
              text-sm font-semibold hover:bg-white/[0.09] hover:text-white
              transition-all duration-200 cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingGithub
              ? <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              : <FaGithub size={17} />}
            {loadingGithub ? "Signing in…" : "Continue with GitHub"}
          </motion.button>
        </div>

        {/* Trust row */}
        <div className="mt-7 flex items-center justify-center gap-3 text-[11px] text-white/20 flex-wrap">
          <span className="flex items-center gap-1.5"><FaLock size={9} /> Secure sign-in</span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5"><FaShieldAlt size={9} /> No password stored</span>
          <span className="w-px h-3 bg-white/10" />
          <span>Cancel anytime</span>
        </div>

        {/* Mobile features grid — only on full page, not modal */}
        {!isModel && (
          <div className="mt-8 pt-6 border-t border-white/[0.06] lg:hidden">
            <p className="text-[10px] text-white/20 uppercase tracking-widest mb-3 text-center">
              What you get
            </p>
            <div className="grid grid-cols-2 gap-2">
              {features.map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-2 text-[11px] text-white/40">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ToS */}
        <p className="mt-6 text-[11px] text-white/20 text-center leading-relaxed">
          By continuing, you agree to our{" "}
          <span className="text-white/35 underline underline-offset-2 cursor-pointer hover:text-white/60 transition">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-white/35 underline underline-offset-2 cursor-pointer hover:text-white/60 transition">
            Privacy Policy
          </span>
        </p>
      </div>
    </motion.div>
  );

  /* ── Full page wrapper ── */
  if (!isModel) {
    return (
      <div className="relative w-full min-h-screen bg-[#050505] flex items-center
        justify-center px-4 py-12 overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute w-[500px] h-[500px] bg-emerald-500 opacity-[0.07]
            blur-[160px] rounded-full -top-32 -left-32" />
          <div className="absolute w-[400px] h-[400px] bg-teal-400 opacity-[0.05]
            blur-[140px] rounded-full -bottom-24 -right-24" />
        </div>

        {/* Dot grid */}
        <div className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />

        {AuthCard}
      </div>
    );
  }

  /* ── Modal wrapper ── */
  return (
    <div className="w-full flex items-center justify-center px-4 py-6"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {AuthCard}
    </div>
  );
}

export default Auth;