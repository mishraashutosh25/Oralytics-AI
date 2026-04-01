import React, { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import logo from "../assets/logo.png";
import AuthModel from '../components/AuthModel'
import {
  BsLightningChargeFill, BsBugFill, BsArrowRight,
  BsStarFill,  BsTools, BsShieldFillCheck,
  BsRocketFill, BsChevronDown
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import Footer from '../components/Footer'

const FadeUp = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >{children}</motion.div>
  )
}

const typeMap = {
  new:      { label: 'New',       bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: <BsRocketFill size={10} /> },
  improved: { label: 'Improved',  bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     text: 'text-sky-400',     icon: <BsLightningChargeFill size={10} /> },
  fixed:    { label: 'Fixed',     bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   icon: <BsBugFill size={10} /> },
  security: { label: 'Security',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  text: 'text-violet-400',  icon: <BsShieldFillCheck size={10} /> },
}

const changelog = [
  {
    version: 'v1.4.0',
    date: 'March 15, 2026',
    title: 'Voice Intelligence & Resume Prep',
    highlight: true,
    items: [
      { type: 'new',      text: 'Voice interview mode — speak your answers, AI transcribes and scores in real time.' },
      { type: 'new',      text: 'Resume-aware question generation — upload your CV and get project-specific questions.' },
      { type: 'new',      text: 'Downloadable PDF report after every session with strengths and improvement areas.' },
      { type: 'improved', text: 'AI feedback latency reduced from 8s to under 3s on average.' },
      { type: 'improved', text: 'Dashboard redesigned with performance ring charts and session history.' },
      { type: 'fixed',    text: 'Fixed credit deduction bug that charged 2 credits for single sessions.' },
    ],
  },
  {
    version: 'v1.3.0',
    date: 'February 28, 2026',
    title: 'Analytics Dashboard & Streaks',
    highlight: false,
    items: [
      { type: 'new',      text: 'Full analytics dashboard with topic-wise performance breakdown.' },
      { type: 'new',      text: 'Streak tracking — maintain a daily practice streak for motivation.' },
      { type: 'new',      text: 'Company-specific question pools for Google, Amazon, Flipkart, and 10 more.' },
      { type: 'improved', text: 'Session history page with search, filter, and sort functionality.' },
      { type: 'improved', text: 'Score breakdown now shows Content, Communication, and Confidence separately.' },
      { type: 'fixed',    text: 'GitHub OAuth login failing for users without public email — now fixed.' },
      { type: 'fixed',    text: 'Session timer not pausing correctly on tab switch — resolved.' },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'February 10, 2026',
    title: 'Credits System & Pricing',
    highlight: false,
    items: [
      { type: 'new',      text: 'Credits system launched — buy credits to unlock premium sessions and features.' },
      { type: 'new',      text: 'Pro and Premium subscription plans now available.' },
      { type: 'new',      text: 'Free plan gives 5 credits on sign-up — no card required.' },
      { type: 'improved', text: 'Onboarding flow redesigned — setup time reduced from 3 min to under 60 seconds.' },
      { type: 'security', text: 'Session tokens now rotate on every login for improved account security.' },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'January 22, 2026',
    title: 'Multiple Interview Modes',
    highlight: false,
    items: [
      { type: 'new',      text: 'HR & Behavioural interview mode with STAR-framework scoring.' },
      { type: 'new',      text: 'Technical interview mode with DSA and system design questions.' },
      { type: 'new',      text: 'Confidence detection — tone and pacing analysis added to feedback.' },
      { type: 'improved', text: 'Question difficulty now adapts based on your answer quality in real time.' },
      { type: 'fixed',    text: 'Fixed mobile keyboard pushing UI off-screen during text sessions.' },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'January 5, 2026',
    title: 'Initial Launch ',
    highlight: false,
    items: [
      { type: 'new', text: 'Oralytics AI launched — AI-powered mock interview platform.' },
      { type: 'new', text: 'Google and GitHub OAuth sign-in.' },
      { type: 'new', text: 'Role-based AI interviews for 20+ job titles.' },
      { type: 'new', text: 'Instant AI feedback after every session.' },
      { type: 'new', text: 'Session history and basic performance tracking.' },
    ],
  },
]

function Changelog() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(['v1.4.0'])
  const [showAuthModal, setShowAuthModal] = useState(false)

  const toggle = (v) => setExpanded(e =>
    e.includes(v) ? e.filter(x => x !== v) : [...e, v]
  )

  return (
        <>
    <div className='relative w-full min-h-screen bg-[#050505] text-white overflow-x-hidden'
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');
        .c-title { font-family: 'Sora', sans-serif; }
        @keyframes glow-p { 0%,100%{opacity:0.06} 50%{opacity:0.11} }
        .glow-p { animation: glow-p 5s ease-in-out infinite; }
      `}</style>

      {/* Background */}
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='absolute w-[600px] h-[600px] bg-emerald-500 opacity-[0.07]
          blur-[180px] rounded-full -top-48 -left-48 glow-p' />
        <div className='absolute w-[500px] h-[500px] bg-teal-400 opacity-[0.04]
          blur-[160px] rounded-full -bottom-32 -right-32 glow-p' />
        <div className='pointer-events-none absolute inset-0'
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Nav */}
      <div className='relative z-50 flex items-center justify-between
        max-w-6xl mx-auto px-6 py-6'>
        <div onClick={() => navigate('/')}
          className='flex items-center gap-2.5 cursor-pointer group'>
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
        <button onClick={() => navigate(-1)}
          className='px-5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]
            text-white/60 text-sm hover:text-white hover:bg-white/[0.09]
            transition cursor-pointer'>
          ← Back
        </button>
      </div>

      <main className='relative z-10 max-w-3xl mx-auto px-6 pb-24'>

        {/* ══ HERO ══ */}
        <section className='text-center pt-10 pb-16'>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
              text-xs font-medium tracking-wide mb-7'>
            < BsTools size={11} /> What's new in Oralytics AI
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className='c-title text-5xl md:text-6xl font-bold leading-[1.1]
              tracking-tight mb-5'>
            Changelog
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className='text-white/40 text-base max-w-md mx-auto leading-relaxed'>
            Every update, fix, and new feature — documented here as we ship them.
          </motion.p>

          {/* Type legend */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='flex flex-wrap justify-center gap-2 mt-8'>
            {Object.entries(typeMap).map(([key, val]) => (
              <span key={key}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                  ${val.bg} border ${val.border} ${val.text} text-[11px] font-semibold`}>
                {val.icon} {val.label}
              </span>
            ))}
          </motion.div>
        </section>

        {/* ══ TIMELINE ══ */}
        <div className='relative'>
          {/* Vertical line */}
          <div className='absolute left-[18px] top-2 bottom-2 w-px
            bg-gradient-to-b from-emerald-500/40 via-white/[0.06] to-transparent' />

          <div className='space-y-5'>
            {changelog.map((release, i) => {
              const isOpen = expanded.includes(release.version)
              return (
                <FadeUp key={release.version} delay={i * 0.07}>
                  <div className={`relative ml-10 rounded-2xl border overflow-hidden
                    transition-all duration-300
                    ${release.highlight
                      ? 'bg-[#0d0d0d] border-emerald-500/25'
                      : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.12]'
                    }`}>

                    {/* Top line for latest */}
                    {release.highlight && (
                      <div className='absolute top-0 left-0 right-0 h-px
                        bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent' />
                    )}

                    {/* Timeline dot */}
                    <div className={`absolute -left-[2.85rem] top-6 w-9 h-9 rounded-xl
                      flex items-center justify-center border z-10
                      ${release.highlight
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-[#0c0c0c] border-white/[0.08] text-white/25'
                      }`}>
                      {release.highlight
                        ? <BsStarFill size={14} className='text-emerald-400' />
                        : <div className='w-2 h-2 rounded-full bg-white/20' />
                      }
                    </div>

                    {/* Header — clickable */}
                    <button
                      onClick={() => toggle(release.version)}
                      className='w-full flex items-center justify-between
                        px-6 py-5 cursor-pointer text-left gap-4'
                    >
                      <div className='flex items-center gap-4 flex-wrap'>
                        {/* Version */}
                        <span className={`c-title text-sm font-black px-3 py-1 rounded-xl
                          border ${release.highlight
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-white/[0.05] border-white/[0.08] text-white/50'
                          }`}>
                          {release.version}
                        </span>

                        {/* Title */}
                        <div>
                          <p className='c-title text-sm font-bold text-white/85'>
                            {release.title}
                          </p>
                          <p className='text-[11px] text-white/25 mt-0.5'>{release.date}</p>
                        </div>

                        {release.highlight && (
                          <span className='inline-flex items-center gap-1 px-2.5 py-1
                            rounded-full bg-emerald-500/10 border border-emerald-500/20
                            text-emerald-400 text-[10px] font-bold'>
                            <HiSparkles size={9} /> Latest
                          </span>
                        )}
                      </div>

                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className='flex-shrink-0'>
                        <BsChevronDown size={14} className='text-white/25' />
                      </motion.div>
                    </button>

                    {/* Items */}
                    <motion.div
                      initial={false}
                      animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className='px-6 pb-6 border-t border-white/[0.05] pt-5 space-y-2.5'>
                        {release.items.map((item, j) => {
                          const t = typeMap[item.type]
                          return (
                            <motion.div key={j}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: j * 0.04, duration: 0.3 }}
                              className='flex items-start gap-3'>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5
                                rounded-full ${t.bg} border ${t.border} ${t.text}
                                text-[10px] font-bold flex-shrink-0 mt-0.5`}>
                                {t.icon} {t.label}
                              </span>
                              <p className='text-white/55 text-sm leading-relaxed'>
                                {item.text}
                              </p>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </div>

        {/* ══ FOOTER CTA ══ */}
        <FadeUp className='mt-16'>
          <div className='relative bg-[#0d0d0d] border border-white/[0.07]
            rounded-3xl p-8 text-center overflow-hidden'>
            <div className='absolute top-0 left-0 right-0 h-px
              bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent' />
            <BsRocketFill size={20} className='text-emerald-400 mx-auto mb-4' />
            <h3 className='c-title text-xl font-bold text-white mb-2'>
              More updates shipping soon
            </h3>
            <p className='text-white/30 text-sm max-w-xs mx-auto mb-6'>
              Follow our journey — new features ship every 2 weeks.
            </p>
            <div className='flex justify-center gap-3'>
              <a href='https://x.com/devma25' target='_blank' rel='noreferrer'
                className='flex items-center gap-2 px-5 py-2.5 rounded-xl
                  bg-white/[0.05] border border-white/[0.08] text-white/50
                  text-sm hover:text-white hover:bg-white/[0.09] transition cursor-pointer'>
                Follow on X
              </a>
              <button onClick={() => setShowAuthModal(true)}
                className='flex items-center gap-2 px-5 py-2.5 rounded-xl
                  bg-emerald-400 text-black font-semibold text-sm cursor-pointer
                  hover:bg-emerald-300 transition
                  shadow-[0_0_20px_rgba(52,211,153,0.2)]'>
                Try for free <BsArrowRight size={13} />
              </button>
            </div>
          </div>
        </FadeUp>

      </main>
      <Footer />
    </div>
    {showAuthModal && (
      <AuthModel onclose={() => setShowAuthModal(false)} />
    )}
    </>
  )
}

export default Changelog