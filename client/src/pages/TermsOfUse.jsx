import React, { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaRobot } from 'react-icons/fa'
import {
  BsFileTextFill, BsCheckCircleFill, BsXCircleFill,
  BsExclamationTriangleFill, BsEnvelopeFill,
  BsChevronDown, BsPersonFill, BsShieldFillCheck,
  BsCreditCardFill, BsArrowCounterclockwise
} from 'react-icons/bs'
import logo from "../assets/logo.png";
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

const sections = [
  {
    id: 'acceptance',
    icon: <BsCheckCircleFill size={15} />,
    title: 'Acceptance of Terms',
    accent: 'emerald',
    content: [
      {
        subtitle: 'Agreement to Terms',
        text: 'By accessing or using Oralytics AI ("the Platform"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Platform.',
      },
      {
        subtitle: 'Eligibility',
        text: 'You must be at least 13 years of age to use Oralytics AI. By using the Platform, you represent that you meet this requirement.',
      },
      {
        subtitle: 'Changes to Terms',
        text: 'We reserve the right to update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms. We will notify users of significant changes via email.',
      },
    ],
  },
  {
    id: 'account',
    icon: <BsPersonFill size={15} />,
    title: 'Your Account',
    accent: 'sky',
    content: [
      {
        subtitle: 'Account Creation',
        text: 'You may sign up using Google or GitHub OAuth. You are responsible for maintaining the security of your account and for all activities that occur under it.',
      },
      {
        subtitle: 'Accurate Information',
        text: 'You agree to provide accurate information when creating your account and keep it up to date. Impersonating another person or entity is strictly prohibited.',
      },
      {
        subtitle: 'Account Termination',
        text: 'We reserve the right to suspend or terminate accounts that violate these Terms, engage in abusive behaviour, or attempt to misuse the Platform in any way.',
      },
    ],
  },
  {
    id: 'usage',
    icon: <BsShieldFillCheck size={15} />,
    title: 'Acceptable Use',
    accent: 'violet',
    content: [
      {
        subtitle: 'Permitted Use',
        text: 'Oralytics AI is intended solely for personal interview preparation and skill development. You may use the Platform to practise interviews, review feedback, and track your performance.',
      },
      {
        subtitle: 'Prohibited Activities',
        text: 'You may not use the Platform to scrape or harvest data, attempt to reverse-engineer the AI models, distribute or resell access, upload malicious content, or engage in any activity that disrupts the service.',
      },
      {
        subtitle: 'AI-Generated Content',
        text: 'All AI feedback and interview questions are generated for educational purposes only. They should not be treated as professional career advice, legal guidance, or guaranteed interview content.',
      },
    ],
  },
  {
    id: 'credits',
    icon: <BsCreditCardFill size={15} />,
    title: 'Credits & Payments',
    accent: 'amber',
    content: [
      {
        subtitle: 'Credit System',
        text: 'Oralytics AI uses a credit-based system. Credits are consumed when you use paid features such as AI interview sessions, advanced analytics, and resume review.',
      },
      {
        subtitle: 'Purchases',
        text: 'All credit purchases are final. We do not offer refunds for unused credits unless required by applicable law or in cases of technical error on our part.',
      },
      {
        subtitle: 'Free Plan Limits',
        text: 'Free plan users receive 5 credits upon sign-up. We reserve the right to modify free plan limits at any time with reasonable notice to users.',
      },
      {
        subtitle: 'Pricing Changes',
        text: 'We may change credit pricing at any time. Existing purchased credits will not be affected by pricing changes.',
      },
    ],
  },
  {
    id: 'ip',
    icon: <BsFileTextFill size={15} />,
    title: 'Intellectual Property',
    accent: 'emerald',
    content: [
      {
        subtitle: 'Our Content',
        text: 'All content on Oralytics AI — including the AI models, interface design, question banks, and branding — is the intellectual property of Oralytics AI and protected by applicable laws.',
      },
      {
        subtitle: 'Your Content',
        text: 'You retain ownership of content you submit (resume, interview responses). By submitting content, you grant us a limited licence to process it solely for the purpose of providing the service.',
      },
      {
        subtitle: 'Restrictions',
        text: 'You may not copy, reproduce, distribute, or create derivative works from any part of the Platform without our express written permission.',
      },
    ],
  },
  {
    id: 'disclaimer',
    icon: <BsExclamationTriangleFill size={15} />,
    title: 'Disclaimers & Liability',
    accent: 'sky',
    content: [
      {
        subtitle: 'No Guarantee of Results',
        text: 'While Oralytics AI is designed to improve your interview performance, we make no guarantee that use of the Platform will result in a job offer or interview success.',
      },
      {
        subtitle: 'Service Availability',
        text: 'We strive for 99.9% uptime but do not guarantee uninterrupted access. We are not liable for losses caused by service outages, interruptions, or data loss.',
      },
      {
        subtitle: 'Limitation of Liability',
        text: 'To the maximum extent permitted by law, Oralytics AI shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.',
      },
      {
        subtitle: '"As Is" Service',
        text: 'The Platform is provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability or fitness for a particular purpose.',
      },
    ],
  },
  {
    id: 'termination',
    icon: <BsArrowCounterclockwise size={15} />,
    title: 'Termination',
    accent: 'violet',
    content: [
      {
        subtitle: 'By You',
        text: 'You may terminate your account at any time from Settings → Account → Delete Account. Termination does not entitle you to a refund of unused credits.',
      },
      {
        subtitle: 'By Us',
        text: 'We may suspend or permanently terminate your account if you violate these Terms, with or without prior notice depending on the severity of the violation.',
      },
      {
        subtitle: 'Effect of Termination',
        text: 'Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive termination will remain in effect.',
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

function TermsOfUse() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(null)

  return (
    <div className='relative w-full min-h-screen bg-[#050505] text-white overflow-x-hidden'
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');
        .t-title { font-family: 'Sora', sans-serif; }
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
            <BsFileTextFill size={12} /> Clear, honest, no legalese
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className='t-title text-5xl md:text-6xl font-bold leading-[1.1]
              tracking-tight mb-6'>
            Terms of <span className='text-emerald-400'>Use</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className='text-white/40 text-base max-w-xl mx-auto leading-relaxed mb-6'>
            These terms govern your use of Oralytics AI. We've written them
            in plain English — no lawyers required to understand what you're
            agreeing to.
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className='text-white/20 text-xs'>
            Last updated: March 2026 · Effective immediately
          </motion.p>
        </section>

        {/* ══ QUICK SUMMARY ══ */}
        <FadeUp className='mb-14'>
          <div className='relative bg-[#0d0d0d] border border-white/[0.07]
            rounded-3xl p-7 overflow-hidden'>
            <div className='absolute top-0 left-0 right-0 h-px
              bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent' />
            <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04]
              via-transparent to-transparent pointer-events-none' />

            <div className='relative z-10'>
              <div className='flex items-center gap-2 mb-5'>
                <HiSparkles size={14} className='text-emerald-400' />
                <span className='text-[11px] text-emerald-400/70 uppercase
                  tracking-widest font-medium'>
                  TL;DR — The short version
                </span>
              </div>

              <div className='grid sm:grid-cols-2 gap-4'>
                {[
                  { icon: <BsCheckCircleFill size={13} />, color: 'text-emerald-400', text: 'Use the platform for personal interview prep' },
                  { icon: <BsCheckCircleFill size={13} />, color: 'text-emerald-400', text: 'Your content and data belong to you' },
                  { icon: <BsCheckCircleFill size={13} />, color: 'text-emerald-400', text: 'Cancel or delete your account anytime' },
                  { icon: <BsCheckCircleFill size={13} />, color: 'text-emerald-400', text: 'Credits are non-refundable (except errors)' },
                  { icon: <BsXCircleFill size={13} />,     color: 'text-red-400',     text: "Don't scrape, resell or abuse the platform" },
                  { icon: <BsXCircleFill size={13} />,     color: 'text-red-400',     text: "Don't impersonate others or share accounts" },
                  { icon: <BsXCircleFill size={13} />,     color: 'text-red-400',     text: "Don't reverse-engineer our AI models" },
                  { icon: <BsXCircleFill size={13} />,     color: 'text-red-400',     text: 'No guarantee of job offer outcomes' },
                ].map((item, i) => (
                  <div key={i} className='flex items-start gap-2.5'>
                    <span className={`${item.color} flex-shrink-0 mt-0.5`}>{item.icon}</span>
                    <span className='text-white/55 text-sm'>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>

        {/* ══ ACCORDION SECTIONS ══ */}
        <FadeUp className='mb-14'>
          <div className='space-y-3'>
            {sections.map((s, i) => {
              const ac     = accentMap[s.accent]
              const isOpen = open === i
              return (
                <div key={i}
                  className={`bg-white/[0.03] border rounded-2xl overflow-hidden
                    transition-all duration-300
                    ${isOpen ? ac.border : 'border-white/[0.07] hover:border-white/[0.12]'}`}>

                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className='w-full flex items-center justify-between px-6 py-5
                      cursor-pointer text-left'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-8 h-8 rounded-xl ${ac.bg} border ${ac.border}
                        flex items-center justify-center ${ac.text} flex-shrink-0`}>
                        {s.icon}
                      </div>
                      <div>
                        <span className='t-title text-sm font-semibold text-white/85'>
                          {s.title}
                        </span>
                        <span className='ml-3 text-[10px] text-white/20'>
                          {s.content.length} clauses
                        </span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}>
                      <BsChevronDown size={14} className='text-white/30' />
                    </motion.div>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}>
                    <div className='px-6 pb-6 space-y-5 border-t border-white/[0.05] pt-5'>
                      {s.content.map((c, j) => (
                        <div key={j}>
                          <p className='text-sm font-semibold text-white/75 mb-1.5'>
                            {c.subtitle}
                          </p>
                          <p className='text-white/40 text-sm leading-relaxed'>{c.text}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </FadeUp>

        {/* ══ GOVERNING LAW ══ */}
        <FadeUp className='mb-10'>
          <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6
            flex items-start gap-4'>
            <div className='w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08]
              flex items-center justify-center text-white/40 flex-shrink-0'>
              <BsFileTextFill size={14} />
            </div>
            <div>
              <p className='t-title text-sm font-semibold text-white/80 mb-1.5'>
                Governing Law
              </p>
              <p className='text-white/35 text-sm leading-relaxed'>
                These Terms shall be governed by and construed in accordance with
                the laws of India. Any disputes arising from these Terms shall be
                subject to the exclusive jurisdiction of the courts of
                Uttar Pradesh, India.
              </p>
            </div>
          </div>
        </FadeUp>

        {/* ══ CONTACT ══ */}
        <FadeUp>
          <div className='relative bg-[#0d0d0d] border border-white/[0.07]
            rounded-3xl p-8 md:p-10 overflow-hidden'>
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
                    Questions about these terms?
                  </span>
                </div>
                <h3 className='t-title text-xl font-bold text-white mb-2'>
                  We're happy to clarify anything
                </h3>
                <p className='text-white/35 text-sm leading-relaxed max-w-md'>
                  If any part of these Terms is unclear, reach out — we respond
                  to all legal queries within 48 hours.
                </p>
              </div>
              <a href='mailto:legal@oralytics.ai'
                className='flex-shrink-0 flex items-center gap-2 px-6 py-3
                  rounded-xl bg-emerald-400 text-black font-semibold text-sm
                  cursor-pointer hover:bg-emerald-300 transition-all duration-300
                  shadow-[0_0_24px_rgba(52,211,153,0.2)]
                  hover:shadow-[0_0_36px_rgba(52,211,153,0.35)]'>
                <BsEnvelopeFill size={13} />
                legal@oralytics.ai
              </a>
            </div>
          </div>
        </FadeUp>

      </main>
      <Footer />
    </div>
  )
}

export default TermsOfUse