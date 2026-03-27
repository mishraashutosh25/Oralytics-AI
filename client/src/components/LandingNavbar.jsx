import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaRobot } from "react-icons/fa6";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthModel from "../components/AuthModel";

function LandingNavbar() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDashboard = () => {
     if (userData) {
    navigate("/dashboard");
  } else {
    setShowAuthModal(true);  
  }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { name: "Dashboard", action: handleDashboard },
    { name: "Features",  action: () => scrollToSection("features") },
    { name: "How it Works", action: () => scrollToSection("how") },
    { name: "Pricing",   action: () => scrollToSection("pricing") },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 pt-5">
      <motion.div
        initial={{ opacity: 0, y: -32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={`w-full max-w-6xl px-5 md:px-8 py-3 flex justify-between items-center rounded-xl transition-all duration-500
          ${scrolled
            ? "bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            : "bg-transparent border border-transparent"
          }`}
      >

        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-[#111] border border-white/10 shadow-inner group-hover:border-emerald-500/40 transition-all duration-300">
            <img 
              src={logo} 
              alt="logo" 
              className="w-7 h-7 object-contain"
            />
            <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-emerald-500/5 transition-opacity duration-300" />
          </div>
          <span className="text-[20px] font-semibold tracking-tight text-white/90 group-hover:text-white transition">
            Oralytics<span className="text-emerald-400 font-bold"> AI</span>
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1 text-[15px]">
          {navLinks.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="relative px-3.5 py-1.5 text-white/40 hover:text-white/90 rounded-lg hover:bg-white/[0.04] transition-all duration-200 cursor-pointer tracking-wide"
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-1.5 rounded-lg text-[15px] text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer tracking-wide"
          >
            Login
          </button>

          <button
            onClick={() => setShowAuthModal(true)}
            className="relative px-4 py-1.5 rounded-lg text-[15px] font-medium cursor-pointer
              text-black bg-emerald-400 hover:bg-emerald-300
              shadow-[0_0_16px_rgba(52,211,153,0.2)] hover:shadow-[0_0_24px_rgba(52,211,153,0.35)]
              transition-all duration-300 tracking-wide"
          >
            Get Started
          </button>
        </div>

      </motion.div>
      {showAuthModal && (
  <AuthModel onclose={() => setShowAuthModal(false)} />
)}
    </div>
  );
}

export default LandingNavbar;