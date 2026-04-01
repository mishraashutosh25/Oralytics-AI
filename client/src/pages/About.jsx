import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaRobot, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'
import {
        BsMicFill, BsBarChartFill, BsLightningChargeFill,
        BsShieldFillCheck, BsArrowRight, BsPeopleFill
} from 'react-icons/bs'
import logo from "../assets/logo.png";
import ashutoshImg from '../assets/ashutosh.png'
import { HiSparkles } from 'react-icons/hi'
import Footer from '../components/Footer'

const FadeUp = ({ children, delay = 0, className = '' }) => {
        const ref = useRef(null)
        const inView = useInView(ref, { once: true, margin: '-60px' })
        return (
                <motion.div ref={ref}
                        initial={{ opacity: 0, y: 22 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay, ease: 'easeOut' }}
                        className={className}
                >{children}</motion.div>
        )
}

const values = [
        { icon: <BsMicFill size={18} />, title: 'Authentic Practice', desc: 'We simulate real interview pressure so your actual interview feels familiar, not frightening.', accent: 'emerald' },
        { icon: <BsLightningChargeFill size={18} />, title: 'Instant Clarity', desc: 'Feedback should arrive in seconds, not days. We built our AI to be brutally fast and honest.', accent: 'sky' },
        { icon: <BsShieldFillCheck size={18} />, title: 'Privacy First', desc: 'Your sessions, answers, and resume data are yours. We never sell or share your personal data.', accent: 'violet' },
        { icon: <BsBarChartFill size={18} />, title: 'Data-Driven Growth', desc: 'Every metric we show you is tied to a specific improvement action — not vanity numbers.', accent: 'amber' },
]

const team = [
        {
                name: 'Ashutosh Mishra',
                role: 'Lead Developer',
                image: ashutoshImg,
                bio: 'Built Oralytics AI from scratch. Passionate about creating tools that give every student a fair shot at their dream job.',
                linkedin: 'https://www.linkedin.com/in/ashutoshmishradev12/',
                twitter: 'https://x.com/devma25',
        },
        // ...baaki team members
]


const accentMap = {
        emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
        sky: { border: 'border-sky-500/20', bg: 'bg-sky-500/10', text: 'text-sky-400' },
        violet: { border: 'border-violet-500/20', bg: 'bg-violet-500/10', text: 'text-violet-400' },
        amber: { border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400' },
}

function About() {
        const navigate = useNavigate()

        return (
                <div className='relative w-full min-h-screen bg-[#050505] text-white overflow-x-hidden'
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');
        .a-title { font-family: 'Sora', sans-serif; }
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

                        {/* Minimal top nav */}
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

                        <main className='relative z-10 max-w-6xl mx-auto px-6 pb-24'>

                                {/* ── HERO ── */}
                                <section className='text-center pt-16 pb-24'>
                                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
              text-xs font-medium tracking-wide mb-7'>
                                                <HiSparkles size={12} /> Our Story
                                        </motion.div>

                                        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, delay: 0.08 }}
                                                className='a-title text-5xl md:text-7xl font-bold leading-[1.1]
              tracking-tight max-w-4xl mx-auto mb-6'>
                                                Built for the{' '}
                                                <span className='text-emerald-400'>underdog</span>{' '}
                                                who prepares harder
                                        </motion.h1>

                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                transition={{ duration: 0.6, delay: 0.2 }}
                                                className='text-white/40 text-lg max-w-2xl mx-auto leading-relaxed'>
                                                Oralytics AI was born from a simple frustration — existing interview prep tools
                                                were either too generic, too expensive, or gave feedback that felt useless.
                                                We decided to fix that.
                                        </motion.p>
                                </section>

                                {/* ── MISSION ── */}
                                <FadeUp className='mb-24'>
                                        <div className='relative bg-[#0d0d0d] border border-emerald-500/20 rounded-3xl
            p-10 md:p-14 text-center overflow-hidden
            shadow-[0_0_80px_rgba(52,211,153,0.07)]'>
                                                <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5
              via-transparent to-transparent pointer-events-none' />
                                                <p className='text-[11px] text-emerald-400/60 uppercase tracking-[0.2em] mb-5'>
                                                        Our Mission
                                                </p>
                                                <h2 className='a-title text-3xl md:text-4xl font-bold text-white
              max-w-3xl mx-auto leading-snug tracking-tight'>
                                                        "To make world-class interview preparation accessible to every
                                                        candidate — regardless of college, city, or connections."
                                                </h2>
                                        </div>
                                </FadeUp>

                                {/* ── STATS ── */}
                                <FadeUp className='mb-24'>
                                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                                {[
                                                        { value: '10K+', label: 'Active Users', color: 'text-emerald-400' },
                                                        { value: '50K+', label: 'Interviews Conducted', color: 'text-sky-400' },
                                                        { value: '95%', label: 'Success Rate', color: 'text-amber-400' },
                                                        { value: '4.9★', label: 'Average Rating', color: 'text-violet-400' },
                                                ].map((s, i) => (
                                                        <motion.div key={i}
                                                                initial={{ opacity: 0, y: 16 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.1 + i * 0.07, duration: 0.45 }}
                                                                className='bg-white/[0.03] border border-white/[0.07] rounded-2xl
                  p-6 text-center hover:border-white/[0.13] transition-all duration-300'>
                                                                <p className={`a-title text-3xl font-bold mb-1 ${s.color}`}>{s.value}</p>
                                                                <p className='text-white/35 text-xs'>{s.label}</p>
                                                        </motion.div>
                                                ))}
                                        </div>
                                </FadeUp>

                                {/* ── VALUES ── */}
                                <FadeUp className='mb-24'>
                                        <p className='text-[11px] text-white/20 uppercase tracking-widest mb-2'>What we stand for</p>
                                        <h2 className='a-title text-3xl font-bold text-white mb-8 tracking-tight'>Our values</h2>
                                        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                                                {values.map((v, i) => {
                                                        const ac = accentMap[v.accent]
                                                        return (
                                                                <motion.div key={i}
                                                                        initial={{ opacity: 0, y: 16 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ delay: 0.1 + i * 0.07, duration: 0.45 }}
                                                                        className={`bg-white/[0.03] border ${ac.border} rounded-2xl p-5
                    hover:bg-white/[0.055] transition-all duration-300`}>
                                                                        <div className={`w-10 h-10 rounded-xl ${ac.bg} border ${ac.border}
                    flex items-center justify-center ${ac.text} mb-4`}>
                                                                                {v.icon}
                                                                        </div>
                                                                        <h3 className='a-title text-sm font-semibold text-white/90 mb-2'>{v.title}</h3>
                                                                        <p className='text-white/35 text-xs leading-relaxed'>{v.desc}</p>
                                                                </motion.div>
                                                        )
                                                })}
                                        </div>
                                </FadeUp>


                                {/* ── BUILT BY ── */}
                                <FadeUp className='mb-24'>
                                        <div className='flex items-center gap-2 mb-2'>
                                                <BsPeopleFill size={14} className='text-white/30' />
                                                <p className='text-[11px] text-white/20 uppercase tracking-widest'>The Builder</p>
                                        </div>
                                        <h2 className='a-title text-3xl font-bold text-white mb-10 tracking-tight'>
                                                Built by one person, for everyone
                                        </h2>

                                        <div className='flex flex-col lg:flex-row gap-8 items-center lg:items-start
    bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 md:p-10
    hover:border-white/[0.12] transition-all duration-300'>

                                                {/* Photo */}
                                                <div className='flex-shrink-0'>
                                                        <div className='relative'>
                                                                <div className='w-28 h-28 rounded-3xl overflow-hidden border
          border-white/[0.1] shadow-[0_0_40px_rgba(52,211,153,0.1)]'>
                                                                        <img
                                                                                src={ashutoshImg}
                                                                                alt='Ashutosh Mishra'
                                                                                className='w-full h-full object-cover object-top'
                                                                        />
                                                                </div>
                                                                <div className='absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0d0d0d]' />
                                                        </div>
                                                </div>

                                                {/* Info */}
                                                <div className='flex-1 text-center lg:text-left'>
                                                        <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
        text-[11px] font-medium tracking-wide mb-4'>
                                                                <HiSparkles size={11} />
                                                                Founder & Lead Developer
                                                        </div>

                                                        <h3 className='a-title text-2xl font-bold text-white mb-1'>
                                                                Ashutosh Mishra
                                                        </h3>
                                                        <p className='text-emerald-400/70 text-sm font-medium mb-4'>
                                                                @devma25
                                                        </p>

                                                        <p className='text-white/45 text-sm leading-relaxed max-w-xl mb-6'>
                                                                I built Oralytics AI solo — every line of code, every design decision,
                                                                every feature. Started because I was frustrated with how bad existing
                                                                interview prep tools were. No generic feedback, no fluff — just honest
                                                                AI that helps you actually improve. Still building, still shipping.
                                                        </p>

                                                        {/* Skill tags */}
                                                        <div className='flex flex-wrap justify-center lg:justify-start gap-2 mb-6'>
                                                                {['React', 'Node.js', 'AI/ML', 'Full Stack', 'Solo Builder'].map(tag => (
                                                                        <span key={tag}
                                                                                className='px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/40 text-[11px] font-medium'>
                                                                                {tag}
                                                                        </span>
                                                                ))}
                                                        </div>

                                                        {/* Social links */}
                                                        <div className='flex gap-3 justify-center lg:justify-start'>
                                                                <a href='https://www.linkedin.com/in/ashutoshmishradev12/'
                                                                        target='_blank' rel='noreferrer'
                                                                        className='flex items-center gap-2 px-4 py-2 rounded-xl
            bg-sky-500/10 border border-sky-500/20 text-sky-400
            text-xs font-semibold hover:bg-sky-500/15
            transition-all duration-200 cursor-pointer'>
                                                                        <FaLinkedin size={13} />
                                                                        LinkedIn
                                                                </a>
                                                                <a href='https://x.com/devma25'
                                                                        target='_blank' rel='noreferrer'
                                                                        className='flex items-center gap-2 px-4 py-2 rounded-xl
            bg-white/[0.04] border border-white/[0.07] text-white/50
            text-xs font-semibold hover:bg-white/[0.08] hover:text-white
            transition-all duration-200 cursor-pointer'>
                                                                        <FaTwitter size={13} />
                                                                        Twitter / X
                                                                </a>
                                                        </div>
                                                </div>


                                        </div>


                                </FadeUp>

                        </main>
                        <Footer />
                </div>
        )
}

export default About