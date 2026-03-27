import React, { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaRobot } from 'react-icons/fa'
import {
  BsShieldFillCheck, BsLockFill, BsEyeFill,
  BsTrashFill, BsPersonFill, BsGlobe,
  BsEnvelopeFill, BsChevronDown
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

const sections = [
  {
    id: 'information',
    icon: <BsPersonFill size={16} />,
    title: 'Information We Collect',
    accent: 'emerald',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you sign up via Google or GitHub, we collect your name and email address. We do not collect passwords — authentication is handled entirely by the OAuth provider.',
      },
      {
        subtitle: 'Interview Session Data',
        text: 'We store your interview responses, AI feedback, and performance scores to power your analytics dashboard and track your improvement over time.',
      },
      {
        subtitle: 'Resume Data',
        text: 'If you upload your resume for personalised prep, we process its content to generate tailored questions. Your resume is never shared with third parties.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We collect anonymised usage data (pages visited, features used, session duration) to improve the product. This data cannot be linked back to you personally.',
      },
    ],
  },
  {
    id: 'usage',
    icon: <BsEyeFill size={16} />,
    title: 'How We Use Your Data',
    accent: 'sky',
    content: [
      {
        subtitle: 'To Power the Product',
        text: 'Your session data is used to generate feedback, calculate performance scores, and show you your progress over time on the analytics dashboard.',
      },
      {
        subtitle: 'To Personalise Your Experience',
        text: 'We use your role preferences, resume content, and past sessions to tailor interview questions specifically to your background and target job.',
      },
      {
        subtitle: 'To Improve Oralytics AI',
        text: 'Anonymised, aggregated data helps us improve our AI models and identify common areas where candidates need more support.',
      },
      {
        subtitle: 'To Communicate With You',
        text: 'We may send you product updates, tips, and important notices via email. You can unsubscribe from marketing emails at any time.',
      },
    ],
  },
  {
    id: 'sharing',
    icon: <BsGlobe size={16} />,
    title: 'Data Sharing & Third Parties',
    accent: 'violet',
    content: [
      {
        subtitle: 'We Never Sell Your Data',
        text: 'Your personal information is never sold, rented, or shared with advertisers or third-party marketers. Full stop.',
      },
      {
        subtitle: 'Service Providers',
        text: 'We use a small number of trusted service providers (e.g. cloud hosting, analytics) who process data on our behalf under strict confidentiality agreements.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose data if required by law or to protect the rights, safety, or property of Oralytics AI, our users, or the public.',
      },
    ],
  },
  {
    id: 'security',
    icon: <BsLockFill size={16} />,
    title: 'Data Security',
    accent: 'amber',
    content: [
      {
        subtitle: 'Encryption',
        text: 'All data is encrypted in transit using TLS/HTTPS and encrypted at rest. Your session data and resume content are stored securely on protected servers.',
      },
      {
        subtitle: 'Access Controls',
        text: 'Only authorised team members have access to production data, and only when required to resolve a support issue. All access is logged.',
      },
      {
        subtitle: 'No Password Storage',
        text: 'We use OAuth (Google / GitHub) exclusively — which means we never store your password. Your authentication credentials stay entirely with the provider.',
      },
    ],
  },
  {
    id: 'rights',
    icon: <BsShieldFillCheck size={16} />,
    title: 'Your Rights',
    accent: 'emerald',
    content: [
      {
        subtitle: 'Access Your Data',
        text: 'You can request a full export of all personal data we hold about you at any time by emailing us at privacy@oralytics.ai.',
      },
      {
        subtitle: 'Delete Your Account',
        text: 'You can delete your account and all associated data from Settings → Account → Delete Account. Deletion is permanent and processed within 7 days.',
      },
      {
        subtitle: 'Correct Your Data',
        text: 'If any information we hold is inaccurate, you can update it directly in your profile settings or contact us to correct it.',
      },
      {
        subtitle: 'Opt Out',
        text: 'You can opt out of marketing emails at any time using the unsubscribe link in any email. You cannot opt out of essential service communications.',
      },
    ],
  },
  {
    id: 'deletion',
    icon: <BsTrashFill size={16} />,
    title: 'Data Retention & Deletion',
    accent: 'sky',
    content: [
      {
        subtitle: 'Active Accounts',
        text: 'We retain your data for as long as your account is active. Session data older than 12 months is automatically archived.',
      },
      {
        subtitle: 'Deleted Accounts',
        text: 'When you delete your account, all personal data is permanently removed from our systems within 7 business days. Anonymised aggregate data may be retained.',
      },
      {
        subtitle: 'Backups',
        text: 'Data may persist in encrypted backups for up to 30 days after deletion before being permanently purged from all systems.',
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

function PrivacyPolicy() {
  const navigate  = useNavigate()
  const [open, setOpen] = useState(null)

  return (
    <div className='relative w-full min-h-screen bg-[#050505] text-white overflow-x-hidden'
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');
        .p-title { font-family: 'Sora', sans-serif; }
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

      <main className='relative z-10 max-w-4xl mx-auto px-6 pb-24'>

        {/* ══ HERO ══ */}
        <section className='text-center pt-12 pb-16'>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
              text-xs font-medium tracking-wide mb-7'>
            <BsShieldFillCheck size={12} /> Your privacy is our priority
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className='p-title text-5xl md:text-6xl font-bold leading-[1.1]
              tracking-tight mb-6'>
            Privacy <span className='text-emerald-400'>Policy</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className='text-white/40 text-base max-w-xl mx-auto leading-relaxed mb-6'>
            We believe privacy policies should be readable by actual humans.
            Here's exactly what we collect, why we collect it, and what you
            can do about it — in plain English.
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className='text-white/20 text-xs'>
            Last updated: March 2026 · Effective immediately
          </motion.p>
        </section>

        {/* ══ TRUST BADGES ══ */}
        <FadeUp className='mb-14'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            {[
              { icon: <BsLockFill size={14} />,         label: 'Encrypted',        sub: 'All data TLS encrypted',    accent: 'emerald' },
              { icon: <BsShieldFillCheck size={14} />,  label: 'Never Sold',        sub: 'Your data is not for sale', accent: 'sky' },
              { icon: <BsTrashFill size={14} />,        label: 'Deletable',         sub: 'Delete anytime, fully',     accent: 'violet' },
              { icon: <BsPersonFill size={14} />,       label: 'You Own It',        sub: 'Your data, your rights',    accent: 'amber' },
            ].map((b, i) => {
              const ac = accentMap[b.accent]
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                  className={`bg-white/[0.03] border ${ac.border} rounded-2xl p-4 text-center`}>
                  <div className={`w-8 h-8 rounded-xl ${ac.bg} border ${ac.border}
                    flex items-center justify-center ${ac.text} mx-auto mb-3`}>
                    {b.icon}
                  </div>
                  <p className={`p-title text-xs font-bold ${ac.text} mb-1`}>{b.label}</p>
                  <p className='text-white/25 text-[10px] leading-tight'>{b.sub}</p>
                </motion.div>
              )
            })}
          </div>
        </FadeUp>

        {/* ══ ACCORDION SECTIONS ══ */}
        <FadeUp className='mb-14'>
          <div className='space-y-3'>
            {sections.map((s, i) => {
              const ac  = accentMap[s.accent]
              const isOpen = open === i
              return (
                <div key={i}
                  className={`bg-white/[0.03] border rounded-2xl overflow-hidden
                    transition-all duration-300
                    ${isOpen ? `${ac.border}` : 'border-white/[0.07] hover:border-white/[0.12]'}`}>

                  {/* Header */}
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className='w-full flex items-center justify-between px-6 py-5
                      cursor-pointer text-left'
                  >
                    <div className='flex items-center gap-3'>
                      <div className={`w-8 h-8 rounded-xl ${ac.bg} border ${ac.border}
                        flex items-center justify-center ${ac.text} flex-shrink-0`}>
                        {s.icon}
                      </div>
                      <span className='p-title text-sm font-semibold text-white/85'>
                        {s.title}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <BsChevronDown size={14} className='text-white/30' />
                    </motion.div>
                  </button>

                  {/* Content */}
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className='px-6 pb-6 space-y-5 border-t border-white/[0.05] pt-5'>
                      {s.content.map((c, j) => (
                        <div key={j}>
                          <p className='text-sm font-semibold text-white/75 mb-1.5'>
                            {c.subtitle}
                          </p>
                          <p className='text-white/40 text-sm leading-relaxed'>
                            {c.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </FadeUp>

        {/* ══ CONTACT ══ */}
        <FadeUp>
          <div className='relative bg-[#0d0d0d] border border-white/[0.07] rounded-3xl
            p-8 md:p-10 overflow-hidden'>
            <div className='absolute top-0 left-0 right-0 h-px
              bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent' />
            <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04]
              via-transparent to-transparent pointer-events-none' />

            <div className='relative z-10 flex flex-col md:flex-row
              items-center justify-between gap-6'>
              <div>
                <div className='flex items-center gap-2 mb-3'>
                  <BsEnvelopeFill size={14} className='text-emerald-400' />
                  <span className='text-[11px] text-emerald-400/70 uppercase
                    tracking-widest font-medium'>
                    Privacy Questions
                  </span>
                </div>
                <h3 className='p-title text-xl font-bold text-white mb-2'>
                  Have a question about your data?
                </h3>
                <p className='text-white/35 text-sm leading-relaxed max-w-md'>
                  We respond to all privacy-related queries within 48 hours.
                  For deletion or data export requests, email us directly.
                </p>
              </div>
              <a href='mailto:privacy@oralytics.ai'
                className='flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl
                  bg-emerald-400 text-black font-semibold text-sm cursor-pointer
                  hover:bg-emerald-300 transition-all duration-300
                  shadow-[0_0_24px_rgba(52,211,153,0.2)]
                  hover:shadow-[0_0_36px_rgba(52,211,153,0.35)]'>
                <BsEnvelopeFill size={13} />
                privacy@oralytics.ai
              </a>
            </div>
          </div>
        </FadeUp>

      </main>
    </div>
  )
}

export default PrivacyPolicy