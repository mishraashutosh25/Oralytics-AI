import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaRobot } from 'react-icons/fa6'
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'
import {
  BsLightningChargeFill, BsBarChartFill,
  BsMicFill, BsShieldFillCheck
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import { motion } from 'framer-motion'
import logo from "../assets/logo.png";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features",       route: "/#features" },
      { label: "How It Works",   route: "/#how" },
      { label: "Pricing",        route: "/#pricing" },
      { label: "Changelog",      route: "/changelog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Interview Guides",     route: "/blog" },
      { label: "Engineering Blog",     route: "/blog" },
      { label: "API Documentation",    route: "/docs" },
      { label: "Help Centre",          route: "/help" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About",          route: "/about" },
      { label: "Careers",        route: "/careers" },
      { label: "Privacy Policy", route: "/privacy" },
      { label: "Terms of Use",   route: "/terms" },
    ],
  },
]

const highlights = [
  { icon: <BsMicFill size={12} />,             text: "Voice Interviews" },
  { icon: <BsLightningChargeFill size={12} />, text: "Instant Feedback" },
  { icon: <BsBarChartFill size={12} />,        text: "Analytics" },
  { icon: <BsShieldFillCheck size={12} />,     text: "Secure & Private" },
]

function Footer() {
  const navigate = useNavigate()

  return (
    <footer
      className="relative bg-[#050505] border-t border-white/[0.06] overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');
        .footer-title { font-family: 'Sora', sans-serif; }
      `}</style>

     

      {/* ── Main Footer Grid ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

          {/* Brand col */}
          <div className="col-span-2">
            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer group mb-4 w-fit"
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

            <p className="text-white/35 text-sm leading-relaxed max-w-xs mb-6">
              AI-powered interview preparation platform designed to improve
              communication skills, technical depth, and professional confidence.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-7">
              {highlights.map(({ icon, text }) => (
                <span key={text}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                    bg-white/[0.04] border border-white/[0.06] text-white/30
                    text-[11px] font-medium">
                  <span className="text-emerald-400">{icon}</span>
                  {text}
                </span>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {[
                { icon: <FaGithub size={16} />,   href: "https://github.com" },
                { icon: <FaLinkedin size={16} />, href: "https://linkedin.com" },
                { icon: <FaTwitter size={16} />,  href: "https://twitter.com" },
              ].map(({ icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.07]
                    flex items-center justify-center text-white/35
                    hover:text-white hover:bg-white/[0.09] hover:border-white/[0.14]
                    transition-all duration-200">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <p className="footer-title text-white/80 text-sm font-semibold mb-5 tracking-tight">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map(({ label, route }) => (
                  <li key={label}>
                    <span
                      onClick={() => navigate(route)}
                      className="text-white/35 text-sm hover:text-white/80
                        transition-colors duration-200 cursor-pointer"
                    >
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative z-10 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row
          items-center justify-between gap-3">
          <p className="text-white/20 text-xs">
            © 2026 Oralytics AI. All rights reserved.
          </p>
          <p className="text-white/15 text-xs">
            Practice smarter · Perform better · Land the offer.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer