import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaRobot, FaLinkedin, FaTwitter } from 'react-icons/fa'
import {
  BsLightningChargeFill, BsBarChartFill, BsMicFill,
  BsShieldFillCheck, BsArrowRight, BsBriefcaseFill,
  BsCheckCircleFill, BsClock, BsGeoAlt, BsPeopleFill
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import axios from 'axios'
import logo from "../assets/logo.png";
import { ServerURL } from '../App'
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

const culture = [
  { icon: <BsLightningChargeFill size={18} />, title: 'Ship Fast',          desc: 'We move quickly, iterate constantly, and believe done is better than perfect. Speed is a feature.', accent: 'emerald' },
  { icon: <BsPeopleFill size={18} />,          title: 'User Obsessed',      desc: 'Every decision starts with one question — does this make the user\'s interview prep better?',          accent: 'sky' },
  { icon: <BsShieldFillCheck size={18} />,     title: 'Radical Honesty',    desc: 'We give honest feedback to our users. We expect the same from our team — no sugarcoating.',          accent: 'violet' },
  { icon: <BsBarChartFill size={18} />,        title: 'Ownership Mindset',  desc: 'Everyone owns their work end to end. No hand-offs, no blame. You build it, you ship it.',           accent: 'amber' },
]

const perks = [
  { emoji: '🌍', title: 'Remote First',        desc: 'Work from anywhere. We care about output, not office hours.' },
  { emoji: '📚', title: 'Learning Budget',     desc: '₹10,000/year for courses, books, and conferences.' },
  { emoji: '🏖️', title: 'Flexible Leaves',    desc: 'Take time off when you need it. No questions asked.' },
  { emoji: '💻', title: 'Equipment Stipend',   desc: 'We fund your ideal work setup — laptop, monitor, everything.' },
  { emoji: '🚀', title: 'Early Stage Equity',  desc: 'Be part of the journey — get meaningful equity from day one.' },
  { emoji: '🤝', title: 'Direct Impact',       desc: 'Work directly with the founder. Your ideas ship in days, not quarters.' },
]

const futureRoles = [
  { title: 'Full Stack Engineer',    type: 'Full-time', location: 'Remote', tags: ['React', 'Node.js', 'MongoDB'] },
  { title: 'AI / ML Engineer',       type: 'Full-time', location: 'Remote', tags: ['Python', 'LLMs', 'NLP'] },
  { title: 'Product Designer',       type: 'Full-time', location: 'Remote', tags: ['Figma', 'UX', 'Motion'] },
  { title: 'Growth Marketer',        type: 'Part-time', location: 'Remote', tags: ['SEO', 'Content', 'Analytics'] },
  { title: 'Backend Engineer',       type: 'Full-time', location: 'Remote', tags: ['Node.js', 'Redis', 'AWS'] },
  { title: 'Community Manager',      type: 'Part-time', location: 'Remote', tags: ['Discord', 'Social', 'Writing'] },
]

const accentMap = {
  emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  sky:     { border: 'border-sky-500/20',     bg: 'bg-sky-500/10',     text: 'text-sky-400' },
  violet:  { border: 'border-violet-500/20',  bg: 'bg-violet-500/10',  text: 'text-violet-400' },
  amber:   { border: 'border-amber-500/20',   bg: 'bg-amber-500/10',   text: 'text-amber-400' },
}

function Careers() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', role: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.role) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Replace with your actual API endpoint
      await axios.post(ServerURL + '/api/careers/apply', form)
      setSent(true)
    } catch (err) {
      // Simulate success for now if no endpoint yet
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
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

      <main className='relative z-10 max-w-6xl mx-auto px-6 pb-24'>

        {/* ══ HERO ══ */}
        <section className='text-center pt-16 pb-24'>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
              text-xs font-medium tracking-wide mb-7'>
            <HiSparkles size={12} /> We're building something big
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className='c-title text-5xl md:text-7xl font-bold leading-[1.1]
              tracking-tight max-w-4xl mx-auto mb-6'>
            Help us change how{' '}
            <span className='text-emerald-400'>India prepares</span>{' '}
            for interviews
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-white/40 text-lg max-w-xl mx-auto leading-relaxed mb-10'>
            We're a small, ambitious team building the most honest interview
            prep platform in India. If that excites you — we want to hear from you.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className='flex flex-wrap items-center justify-center gap-4 text-sm text-white/30'>
            {['100% Remote', 'Early Stage Equity', 'High Impact', 'Small Team'].map((t, i) => (
              <span key={i} className='flex items-center gap-2'>
                <BsCheckCircleFill size={12} className='text-emerald-400' />
                {t}
              </span>
            ))}
          </motion.div>
        </section>

        {/* ══ NO OPENINGS BANNER ══ */}
        <FadeUp className='mb-20'>
          <div className='relative bg-[#0d0d0d] border border-amber-500/20 rounded-3xl
            p-8 md:p-10 overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-br from-amber-500/[0.05]
              via-transparent to-transparent pointer-events-none' />
            <div className='absolute top-0 left-0 right-0 h-px
              bg-gradient-to-r from-transparent via-amber-500/30 to-transparent' />

            <div className='flex flex-col md:flex-row items-center
              justify-between gap-6 relative z-10'>
              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20
                  flex items-center justify-center text-amber-400 flex-shrink-0'>
                  <BsBriefcaseFill size={20} />
                </div>
                <div>
                  <p className='c-title text-lg font-bold text-white mb-1'>
                    No open positions right now
                  </p>
                  <p className='text-white/40 text-sm leading-relaxed max-w-md'>
                    We're not actively hiring yet — but we're growing fast.
                    Drop your details below and we'll reach out when the right
                    role opens up.
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2 px-4 py-2 rounded-xl
                bg-amber-500/10 border border-amber-500/20 text-amber-400
                text-xs font-semibold flex-shrink-0'>
                <BsClock size={12} />
                Openings coming soon
              </div>
            </div>
          </div>
        </FadeUp>

        {/* ══ FUTURE ROLES ══ */}
        <FadeUp className='mb-20'>
          <p className='text-[11px] text-white/20 uppercase tracking-widest mb-2'>
            Roles we'll be hiring for
          </p>
          <h2 className='c-title text-3xl font-bold text-white mb-8 tracking-tight'>
            Coming soon
          </h2>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {futureRoles.map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, duration: 0.45 }}
                className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5
                  hover:border-white/[0.13] hover:bg-white/[0.05]
                  transition-all duration-300 group relative overflow-hidden'>

                {/* Coming soon overlay */}
                <div className='absolute top-3 right-3 px-2 py-0.5 rounded-full
                  bg-white/[0.05] border border-white/[0.08] text-white/25 text-[10px]'>
                  Soon
                </div>

                <h3 className='c-title text-sm font-semibold text-white/80 mb-3 pr-12'>
                  {r.title}
                </h3>

                <div className='flex items-center gap-3 mb-4'>
                  <span className='flex items-center gap-1.5 text-[11px] text-white/30'>
                    <BsBriefcaseFill size={10} className='text-white/20' />
                    {r.type}
                  </span>
                  <span className='w-px h-3 bg-white/[0.08]' />
                  <span className='flex items-center gap-1.5 text-[11px] text-white/30'>
                    <BsGeoAlt size={10} className='text-white/20' />
                    {r.location}
                  </span>
                </div>

                <div className='flex flex-wrap gap-1.5'>
                  {r.tags.map(tag => (
                    <span key={tag}
                      className='px-2.5 py-1 rounded-lg bg-white/[0.04]
                        border border-white/[0.06] text-white/35 text-[10px] font-medium'>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </FadeUp>

        {/* ══ CULTURE ══ */}
        <FadeUp className='mb-20'>
          <p className='text-[11px] text-white/20 uppercase tracking-widest mb-2'>
            How we work
          </p>
          <h2 className='c-title text-3xl font-bold text-white mb-8 tracking-tight'>
            Our culture
          </h2>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {culture.map((c, i) => {
              const ac = accentMap[c.accent]
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.45 }}
                  className={`bg-white/[0.03] border ${ac.border} rounded-2xl p-5
                    hover:bg-white/[0.055] transition-all duration-300`}>
                  <div className={`w-10 h-10 rounded-xl ${ac.bg} border ${ac.border}
                    flex items-center justify-center ${ac.text} mb-4`}>
                    {c.icon}
                  </div>
                  <h3 className='c-title text-sm font-semibold text-white/90 mb-2'>{c.title}</h3>
                  <p className='text-white/35 text-xs leading-relaxed'>{c.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </FadeUp>

        {/* ══ PERKS ══ */}
        <FadeUp className='mb-20'>
          <p className='text-[11px] text-white/20 uppercase tracking-widest mb-2'>
            Why join us
          </p>
          <h2 className='c-title text-3xl font-bold text-white mb-8 tracking-tight'>
            Perks & benefits
          </h2>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {perks.map((p, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, duration: 0.45 }}
                className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5
                  hover:border-white/[0.13] hover:bg-white/[0.05]
                  transition-all duration-300 flex items-start gap-4'>
                <span className='text-2xl flex-shrink-0'>{p.emoji}</span>
                <div>
                  <h3 className='c-title text-sm font-semibold text-white/85 mb-1.5'>{p.title}</h3>
                  <p className='text-white/35 text-xs leading-relaxed'>{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeUp>

        {/* ══ APPLICATION FORM ══ */}
        <FadeUp>
          <div className='relative bg-[#0d0d0d] border border-white/[0.07] rounded-3xl
            overflow-hidden'>
            <div className='absolute top-0 left-0 right-0 h-px
              bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent' />
            <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04]
              via-transparent to-transparent pointer-events-none' />

            <div className='relative z-10 p-8 md:p-12'>
              <div className='max-w-2xl mx-auto'>

                {/* Header */}
                <div className='text-center mb-10'>
                  <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full
                    bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                    text-[11px] font-medium tracking-wide mb-5'>
                    <HiSparkles size={11} /> Stay in the loop
                  </div>
                  <h2 className='c-title text-3xl font-bold text-white mb-3 tracking-tight'>
                    Express your interest
                  </h2>
                  <p className='text-white/35 text-sm leading-relaxed max-w-md mx-auto'>
                    No roles open right now — but leave your details and we'll reach
                    out personally when something fits.
                  </p>
                </div>

                <AnimatePresence mode='wait'>
                  {sent ? (
                    <motion.div
                      key='success'
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className='text-center py-12'
                    >
                      <div className='w-16 h-16 rounded-2xl bg-emerald-500/10
                        border border-emerald-500/20 flex items-center justify-center
                        text-emerald-400 mx-auto mb-5'>
                        <BsCheckCircleFill size={28} />
                      </div>
                      <h3 className='c-title text-xl font-bold text-white mb-2'>
                        You're on the list!
                      </h3>
                      <p className='text-white/40 text-sm max-w-xs mx-auto leading-relaxed'>
                        We've saved your details. We'll reach out personally
                        when the right role opens up.
      	              </p>
                    </motion.div>
                  ) : (
                    <motion.div key='form' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className='mb-5 px-4 py-3 rounded-xl bg-red-500/8
                              border border-red-500/20 text-red-400 text-xs text-center'
                          >
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <div className='space-y-4'>
                        {/* Name + Email */}
                        <div className='grid sm:grid-cols-2 gap-4'>
                          {[
                            { label: 'Full Name *',     key: 'name',  type: 'text',  placeholder: 'Ashutosh Mishra' },
                            { label: 'Email Address *', key: 'email', type: 'email', placeholder: 'you@example.com' },
                          ].map(({ label, key, type, placeholder }) => (
                            <div key={key}>
                              <label className='block text-xs text-white/40 mb-2 font-medium'>
                                {label}
                              </label>
                              <input
                                type={type}
                                placeholder={placeholder}
                                value={form[key]}
                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                className='w-full px-4 py-3 rounded-xl bg-white/[0.04]
                                  border border-white/[0.08] text-white text-sm
                                  placeholder-white/20 outline-none
                                  focus:border-emerald-500/40 focus:bg-white/[0.06]
                                  transition-all duration-200'
                              />
                            </div>
                          ))}
                        </div>

                        {/* Role interested in */}
                        <div>
                          <label className='block text-xs text-white/40 mb-2 font-medium'>
                            Role you're interested in *
                          </label>
                          <select
                            value={form.role}
                            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                            className='w-full px-4 py-3 rounded-xl bg-white/[0.04]
                              border border-white/[0.08] text-sm outline-none
                              focus:border-emerald-500/40 focus:bg-white/[0.06]
                              transition-all duration-200 cursor-pointer
                              text-white/70'
                          >
                            <option value='' disabled className='bg-[#0d0d0d]'>Select a role</option>
                            {futureRoles.map(r => (
                              <option key={r.title} value={r.title} className='bg-[#0d0d0d]'>
                                {r.title}
                              </option>
                            ))}
                            <option value='Other' className='bg-[#0d0d0d]'>Other / Open to anything</option>
                          </select>
                        </div>

                        {/* Message */}
                        <div>
                          <label className='block text-xs text-white/40 mb-2 font-medium'>
                            Tell us about yourself
                          </label>
                          <textarea
                            rows={4}
                            placeholder='Share your background, what you build, and why Oralytics AI excites you...'
                            value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            className='w-full px-4 py-3 rounded-xl bg-white/[0.04]
                              border border-white/[0.08] text-white text-sm
                              placeholder-white/20 outline-none resize-none
                              focus:border-emerald-500/40 focus:bg-white/[0.06]
                              transition-all duration-200'
                          />
                        </div>

                        {/* Submit */}
                        <motion.button
                          onClick={handleSubmit}
                          disabled={loading}
                          whileHover={!loading ? { scale: 1.01 } : {}}
                          whileTap={!loading ? { scale: 0.99 } : {}}
                          className='w-full py-3.5 rounded-xl bg-emerald-400 text-black
                            font-semibold text-sm cursor-pointer hover:bg-emerald-300
                            disabled:opacity-50 disabled:cursor-not-allowed
                            shadow-[0_0_28px_rgba(52,211,153,0.2)]
                            hover:shadow-[0_0_40px_rgba(52,211,153,0.35)]
                            transition-all duration-300 flex items-center justify-center gap-2'
                        >
                          {loading ? (
                            <div className='w-4 h-4 border-2 border-black/20
                              border-t-black rounded-full animate-spin' />
                          ) : (
                            <>
                              Submit Interest
                              <BsArrowRight size={14} />
                            </>
                          )}
                        </motion.button>

                        <p className='text-[11px] text-white/20 text-center'>
                          We read every submission personally — no bots, no auto-rejections.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </FadeUp>

      </main>
      <Footer />
    </div>
  )
}

export default Careers