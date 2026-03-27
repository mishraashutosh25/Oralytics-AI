import React, { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
// import { FaRobot } from 'react-icons/fa'
import {
  BsSearch, BsChevronDown, BsEnvelopeFill,
  BsChatDotsFill, BsBookFill, BsCreditCardFill,
  BsPersonFill, BsGearFill, BsShieldFillCheck,
  BsMicFill, BsBarChartFill, BsArrowRight,
  BsCheckCircleFill, BsLightningChargeFill
} from 'react-icons/bs'
import logo from "../assets/logo.png";
import { HiSparkles } from 'react-icons/hi'

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

/* ── Data ── */
// Ye replace karo apna categories array
const categories = [
  { icon: <BsMicFill size={18} />,         label: 'Interviews', accent: 'emerald', count: 8,  route: null           },
  { icon: <BsCreditCardFill size={18} />,  label: 'Credits',    accent: 'sky',     count: 5,  route: null           },
  { icon: <BsPersonFill size={18} />,      label: 'Account',    accent: 'violet',  count: 6,  route: null           },
  { icon: <BsBarChartFill size={18} />,    label: 'Analytics',  accent: 'amber',   count: 4,  route: null           },
  { icon: <BsShieldFillCheck size={18} />, label: 'Privacy',    accent: 'emerald', count: 3,  route: '/privacy'     },
  { icon: <BsGearFill size={18} />,        label: 'Settings',   accent: 'sky',     count: 4,  route: '/settings'    },
]

const faqs = [
  {
    category: 'Interviews',
    icon: <BsMicFill size={14} />,
    accent: 'emerald',
    questions: [
      {
        q: 'How do I start an AI interview session?',
        a: 'Go to your Dashboard and click "Start Interview". Select your target role, experience level, and interview type (technical, HR, case study). The AI will begin the session immediately.',
      },
      {
        q: 'Can I pause or retake an interview?',
        a: 'Yes — you can pause a session at any time. However, once you submit your final answer, the session is marked complete and cannot be restarted. You can always start a new session for the same role.',
      },
      {
        q: 'How is my interview scored?',
        a: 'Your response is evaluated across three dimensions: Content Quality (relevance and depth), Communication Clarity (structure and language), and Confidence Signals (pacing, filler words). Each is scored 0–100.',
      },
      {
        q: 'What types of interviews are available?',
        a: 'We support Technical (DSA, System Design), HR & Behavioural, Case Study, Domain-Specific (Finance, Marketing, Product), and Leadership rounds across 20+ industries.',
      },
      {
        q: 'Does Oralytics AI use my resume for questions?',
        a: 'Yes — if you upload your resume in Settings, our AI generates questions tailored to your specific experience, projects, and skills. This is available on Pro and Premium plans.',
      },
      {
        q: 'Can I practice for a specific company?',
        a: 'Company-specific question pools (Google, Amazon, Flipkart, etc.) are available on Pro and Premium plans. Go to Start Interview → Company Mode to select your target company.',
      },
      {
        q: 'Is voice mode available?',
        a: 'Yes. Voice mode is available on Pro and Premium plans. Click the microphone icon when starting a session. Your browser will request microphone permission — please allow it.',
      },
      {
        q: 'Why is my feedback taking longer than usual?',
        a: 'AI feedback is typically generated within 3–5 seconds. During peak hours, this may take up to 15 seconds. If feedback doesn\'t appear after 30 seconds, refresh the page — your session data is saved.',
      },
    ],
  },
  {
    category: 'Credits',
    icon: <BsCreditCardFill size={14} />,
    accent: 'sky',
    questions: [
      {
        q: 'How do credits work?',
        a: '1 credit = 1 AI interview session. Advanced analytics reports cost 2 credits. Resume review costs 3 credits. Credits never expire and roll over month to month.',
      },
      {
        q: 'How many free credits do I get?',
        a: 'All new accounts receive 5 free credits on sign-up — no credit card required. These are enough to complete 5 full AI interview sessions.',
      },
      {
        q: 'Can I get a refund for unused credits?',
        a: 'Credit purchases are generally non-refundable. Exceptions are made in cases of technical errors on our end. Contact support@oralytics.ai within 7 days if you believe you were charged incorrectly.',
      },
      {
        q: 'Why was I charged more credits than expected?',
        a: 'Advanced features like resume-aware prep, company-specific modes, and detailed analytics reports consume additional credits. The credit cost is always shown before you start a session.',
      },
      {
        q: 'Do credits expire?',
        a: 'No — purchased credits never expire. Free credits received on sign-up also do not expire. Your balance is yours until you use it.',
      },
    ],
  },
  {
    category: 'Account',
    icon: <BsPersonFill size={14} />,
    accent: 'violet',
    questions: [
      {
        q: 'How do I sign up?',
        a: 'Click "Get Started" on the homepage and sign in with Google or GitHub. No password needed — we use secure OAuth authentication.',
      },
      {
        q: 'Can I change my name or email?',
        a: 'Your name can be updated in Settings → Profile. Your email is tied to your OAuth provider (Google/GitHub) and cannot be changed directly — update it with your provider first.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Settings → Account → Delete Account. Deletion is permanent and all associated data (sessions, credits, resume) will be removed within 7 business days.',
      },
      {
        q: 'Can I have multiple accounts?',
        a: 'No — one account per person. Multiple accounts for the same person violate our Terms of Use and may result in all associated accounts being suspended.',
      },
      {
        q: 'I can\'t log in — what do I do?',
        a: 'Make sure you\'re using the same Google or GitHub account you signed up with. Clear your browser cache and try again. If the issue persists, email support@oralytics.ai.',
      },
      {
        q: 'Is my account data backed up?',
        a: 'Yes — all session data, performance history, and credits are stored securely with automatic daily backups. You will not lose your progress.',
      },
    ],
  },
  {
    category: 'Analytics',
    icon: <BsBarChartFill size={14} />,
    accent: 'amber',
    questions: [
      {
        q: 'Where can I see my performance history?',
        a: 'Go to Dashboard → Analytics or click "View History" in the navbar. You\'ll see all past sessions with scores, feedback summaries, and improvement trends.',
      },
      {
        q: 'What does the performance snapshot show?',
        a: 'The snapshot shows your average Content Quality, Communication Clarity, and Confidence scores across your last 7 sessions — displayed as animated ring charts.',
      },
      {
        q: 'How is my streak calculated?',
        a: 'Your streak increases by 1 for every consecutive day you complete at least one interview session. Missing a day resets the streak to 0.',
      },
      {
        q: 'Can I export my performance data?',
        a: 'Data export (PDF report) is available on Premium plan. Go to Analytics → Export Report. Free and Pro users can view data on-screen but cannot export.',
      },
    ],
  },
  {
    category: 'Privacy',
    icon: <BsShieldFillCheck size={14} />,
    accent: 'emerald',
    questions: [
      {
        q: 'What personal data does Oralytics AI collect?',
        a: 'We collect your name and email (via Google/GitHub OAuth), interview session data, performance scores, and optionally your resume if you upload it. We never collect passwords.',
      },
      {
        q: 'Is my resume data safe?',
        a: 'Yes — your resume is stored securely and used only to generate personalised interview questions. It is never shared with third parties or used for any other purpose.',
      },
      {
        q: 'Can I request deletion of all my data?',
        a: 'Yes. Go to Settings → Account → Delete Account to permanently delete all your data. Alternatively, email privacy@oralytics.ai and we\'ll process it within 7 business days.',
      },
      {
        q: 'Does Oralytics AI share data with advertisers?',
        a: 'Never. We do not sell, rent, or share your personal data with advertisers or any third-party marketers. Read our full Privacy Policy for details.',
      },
    ],
  },
  {
    category: 'Settings',
    icon: <BsGearFill size={14} />,
    accent: 'sky',
    questions: [
      {
        q: 'How do I update my profile name?',
        a: 'Go to Settings → Profile → Edit Name. Changes are saved immediately and reflected across the platform.',
      },
      {
        q: 'How do I upload or update my resume?',
        a: 'Go to Settings → Resume → Upload Resume. Supported formats are PDF and DOCX (max 5MB). Your resume is used to generate personalised interview questions on Pro and Premium plans.',
      },
      {
        q: 'How do I change my notification preferences?',
        a: 'Go to Settings → Notifications. You can toggle email notifications for session reminders, weekly progress reports, and product updates independently.',
      },
      {
        q: 'How do I switch between voice and text mode?',
        a: 'Go to Settings → Interview Preferences → Default Mode. You can set voice or text as your default. This can also be changed at the start of each individual session.',
      },
    ],
  },
]

const accentMap = {
  emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  sky:     { border: 'border-sky-500/20',     bg: 'bg-sky-500/10',     text: 'text-sky-400' },
  violet:  { border: 'border-violet-500/20',  bg: 'bg-violet-500/10',  text: 'text-violet-400' },
  amber:   { border: 'border-amber-500/20',   bg: 'bg-amber-500/10',   text: 'text-amber-400' },
}

function HelpCentre() {
  const navigate  = useNavigate()
  const [search, setSearch]   = useState('')
  const [openQ, setOpenQ]     = useState(null)   // "catIdx-qIdx"
  const [activeTab, setActiveTab] = useState(0)

  /* filter by search */
  const filtered = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q => !search || q.q.toLowerCase().includes(search.toLowerCase())
           || q.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.questions.length > 0)

  const displayFaqs = search ? filtered : [faqs[activeTab]]

  return (
    <div className='relative w-full min-h-screen bg-[#050505] text-white overflow-x-hidden'
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');
        .h-title { font-family: 'Sora', sans-serif; }
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

      <main className='relative z-10 max-w-5xl mx-auto px-6 pb-24'>

        {/* ══ HERO ══ */}
        <section className='text-center pt-12 pb-14'>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
              text-xs font-medium tracking-wide mb-7'>
            <BsChatDotsFill size={12} /> We're here to help
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className='h-title text-5xl md:text-6xl font-bold leading-[1.1]
              tracking-tight mb-6'>
            Help <span className='text-emerald-400'>Centre</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className='text-white/40 text-base max-w-lg mx-auto leading-relaxed mb-10'>
            Find answers to common questions, or reach out to us directly.
            We respond to every message personally.
          </motion.p>

          {/* ── Search bar ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className='relative max-w-xl mx-auto'>
            <BsSearch size={15} className='absolute left-4 top-1/2 -translate-y-1/2
              text-white/25 pointer-events-none' />
            <input
              type='text'
              placeholder='Search — e.g. "how do credits work" or "delete account"'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-full pl-11 pr-5 py-4 rounded-2xl bg-white/[0.04]
                border border-white/[0.08] text-white text-sm
                placeholder-white/20 outline-none
                focus:border-emerald-500/40 focus:bg-white/[0.06]
                transition-all duration-200'
            />
            {search && (
              <button onClick={() => setSearch('')}
                className='absolute right-4 top-1/2 -translate-y-1/2
                  text-white/25 hover:text-white/60 transition cursor-pointer text-lg'>
                ×
              </button>
            )}
          </motion.div>

          {/* Search result count */}
          <AnimatePresence>
            {search && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className='mt-3 text-xs text-white/25'>
                {filtered.reduce((a, c) => a + c.questions.length, 0)} results for "{search}"
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* ══ CATEGORY CARDS ══ */}
        {!search && (
          <FadeUp className='mb-10'>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
              {categories.map((c, i) => {
                const ac      = accentMap[c.accent]
                const isActive = activeTab === i
                return (
                  <motion.button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.4 }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border
                      transition-all duration-200 cursor-pointer
                      ${isActive
                        ? `${ac.bg} ${ac.border} ${ac.text}`
                        : 'bg-white/[0.03] border-white/[0.07] text-white/40 hover:bg-white/[0.06] hover:text-white/70'
                      }`}
                  >
                    <span className={isActive ? ac.text : 'text-white/30'}>{c.icon}</span>
                    <span className='text-xs font-semibold'>{c.label}</span>
                    <span className={`text-[10px] ${isActive ? ac.text : 'text-white/20'}`}>
                      {c.count} articles
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </FadeUp>
        )}

        {/* ══ FAQ ACCORDION ══ */}
        <FadeUp className='mb-16'>
          <div className='space-y-8'>
            {displayFaqs.map((cat, ci) => {
              const ac = accentMap[cat.accent]
              return (
                <div key={ci}>
                  {/* Category header */}
                  <div className='flex items-center gap-3 mb-4'>
                    <div className={`w-8 h-8 rounded-xl ${ac.bg} border ${ac.border}
                      flex items-center justify-center ${ac.text} flex-shrink-0`}>
                      {cat.icon}
                    </div>
                    <h2 className='h-title text-lg font-bold text-white/85'>
                      {cat.category}
                    </h2>
                    <span className='text-[11px] text-white/20 ml-1'>
                      {cat.questions.length} questions
                    </span>
                  </div>

                  {/* Questions */}
                  <div className='space-y-2'>
                    {cat.questions.map((item, qi) => {
                      const key    = `${ci}-${qi}`
                      const isOpen = openQ === key
                      return (
                        <div key={qi}
                          className={`bg-white/[0.03] border rounded-2xl overflow-hidden
                            transition-all duration-300
                            ${isOpen ? ac.border : 'border-white/[0.07] hover:border-white/[0.12]'}`}>
                          <button
                            onClick={() => setOpenQ(isOpen ? null : key)}
                            className='w-full flex items-center justify-between
                              px-5 py-4 cursor-pointer text-left gap-4'>
                            <span className='text-sm font-medium text-white/80
                              group-hover:text-white'>
                              {item.q}
                            </span>
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.25 }}
                              className='flex-shrink-0'>
                              <BsChevronDown size={13} className='text-white/25' />
                            </motion.div>
                          </button>

                          <motion.div
                            initial={false}
                            animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                            transition={{ duration: 0.28, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}>
                            <div className='px-5 pb-5 border-t border-white/[0.05] pt-4'>
                              <p className='text-white/45 text-sm leading-relaxed'>{item.a}</p>
                            </div>
                          </motion.div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* No results */}
            {search && filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className='text-center py-16'>
                <p className='text-white/20 text-sm'>
                  No results for "<span className='text-white/40'>{search}</span>"
                </p>
                <p className='text-white/15 text-xs mt-2'>
                  Try different keywords or contact us below
                </p>
              </motion.div>
            )}
          </div>
        </FadeUp>

        {/* ══ QUICK LINKS ══ */}
        <FadeUp className='mb-12'>
          <p className='text-[11px] text-white/20 uppercase tracking-widest mb-5'>
            Popular articles
          </p>
          <div className='grid sm:grid-cols-2 gap-3'>
            {[
              { title: 'How to start your first AI interview',  cat: 'Interviews', accent: 'emerald' },
              { title: 'Understanding your performance scores', cat: 'Analytics',  accent: 'amber' },
              { title: 'How credits work and how to buy more',  cat: 'Credits',    accent: 'sky' },
              { title: 'Uploading your resume for smart prep',  cat: 'Interviews', accent: 'emerald' },
              { title: 'Deleting your account and data',        cat: 'Account',    accent: 'violet' },
              { title: 'Enabling voice mode for interviews',    cat: 'Interviews', accent: 'emerald' },
            ].map((l, i) => {
              const ac = accentMap[l.accent]
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.06, duration: 0.4 }}
                  className='flex items-center justify-between gap-3 px-4 py-3.5
                    bg-white/[0.03] border border-white/[0.07] rounded-xl
                    hover:border-white/[0.13] hover:bg-white/[0.05]
                    transition-all duration-200 cursor-pointer group'>
                  <div className='flex items-center gap-3 min-w-0'>
                    <BsBookFill size={12} className={`${ac.text} flex-shrink-0`} />
                    <span className='text-sm text-white/60 group-hover:text-white/85
                      transition truncate'>
                      {l.title}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    <span className={`text-[10px] ${ac.text} ${ac.bg} ${ac.border}
                      border px-2 py-0.5 rounded-full font-medium`}>
                      {l.cat}
                    </span>
                    <BsArrowRight size={11}
                      className='text-white/20 group-hover:text-white/50
                        group-hover:translate-x-0.5 transition-all' />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </FadeUp>

        {/* ══ CONTACT SUPPORT ══ */}
        <FadeUp>
          <div className='relative bg-[#0d0d0d] border border-white/[0.07]
            rounded-3xl overflow-hidden'>
            <div className='absolute top-0 left-0 right-0 h-px
              bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent' />
            <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04]
              via-transparent to-transparent pointer-events-none' />

            <div className='relative z-10 p-8 md:p-10'>
              <div className='text-center mb-8'>
                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full
                  bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                  text-[11px] font-medium tracking-wide mb-5'>
                  <HiSparkles size={11} /> Still need help?
                </div>
                <h2 className='h-title text-2xl font-bold text-white mb-2 tracking-tight'>
                  Contact our support team
                </h2>
                <p className='text-white/35 text-sm max-w-sm mx-auto leading-relaxed'>
                  We read every message personally and respond within 24 hours —
                  usually much faster.
                </p>
              </div>

              <div className='grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto'>
                {[
                  {
                    icon: <BsEnvelopeFill size={18} />,
                    title: 'Email Support',
                    desc: 'For account, billing & general questions',
                    action: 'support@oralytics.ai',
                    href: 'mailto:support@oralytics.ai',
                    accent: 'emerald',
                  },
                  {
                    icon: <BsShieldFillCheck size={18} />,
                    title: 'Privacy Queries',
                    desc: 'Data requests, deletion & GDPR',
                    action: 'privacy@oralytics.ai',
                    href: 'mailto:privacy@oralytics.ai',
                    accent: 'sky',
                  },
                  {
                    icon: <BsLightningChargeFill size={18} />,
                    title: 'Bug Reports',
                    desc: 'Technical issues & platform bugs',
                    action: 'bugs@oralytics.ai',
                    href: 'mailto:bugs@oralytics.ai',
                    accent: 'violet',
                  },
                ].map((c, i) => {
                  const ac = accentMap[c.accent]
                  return (
                    <a key={i} href={c.href}
                      className={`flex flex-col items-center text-center p-5 rounded-2xl
                        bg-white/[0.03] border ${ac.border} hover:${ac.bg}
                        transition-all duration-200 cursor-pointer group`}>
                      <div className={`w-11 h-11 rounded-xl ${ac.bg} border ${ac.border}
                        flex items-center justify-center ${ac.text} mb-3
                        group-hover:scale-105 transition-transform`}>
                        {c.icon}
                      </div>
                      <p className='h-title text-sm font-semibold text-white/85 mb-1'>
                        {c.title}
                      </p>
                      <p className='text-white/30 text-[11px] leading-relaxed mb-3'>
                        {c.desc}
                      </p>
                      <span className={`text-xs ${ac.text} font-medium`}>{c.action}</span>
                    </a>
                  )
                })}
              </div>

              <div className='flex items-center justify-center gap-2 mt-6
                text-[11px] text-white/20'>
                <BsCheckCircleFill size={10} className='text-emerald-400/50' />
                Average response time: under 4 hours during business days
              </div>
            </div>
          </div>
        </FadeUp>

      </main>
    </div>
  )
}

export default HelpCentre