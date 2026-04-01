import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { setUserData } from '../redux/userSlice'
import { ServerURL } from '../App'
import {
  BsRocketFill, BsFileEarmarkTextFill,
  BsCheckCircleFill, BsArrowRight, BsArrowLeft,
  BsPersonFill, BsMicFill, BsKeyboardFill,
  BsBuildingFill, BsShieldFill
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import Footer from './Footer'

const roles = [
  { val: 'Software Engineer', icon: '💻', desc: 'DSA, System Design, Coding' },
  { val: 'Frontend Developer', icon: '🎨', desc: 'React, CSS, JavaScript' },
  { val: 'Backend Developer', icon: '⚙️', desc: 'Node.js, APIs, Databases' },
  { val: 'Full Stack Developer', icon: '🔄', desc: 'Both Frontend & Backend' },
  { val: 'Data Analyst', icon: '📊', desc: 'SQL, Python, Analytics' },
  { val: 'ML Engineer', icon: '🤖', desc: 'ML, Deep Learning, Python' },
  { val: 'DevOps Engineer', icon: '🚀', desc: 'CI/CD, Docker, AWS' },
  { val: 'Product Manager', icon: '📋', desc: 'Strategy, Roadmap, Metrics' },
]

const personas = [
  { val: 'google', name: 'Google / FAANG', icon: '🏢', desc: 'Algorithmic, system design, deep technical', color: 'emerald', style: 'Strict & methodical' },
  { val: 'startup', name: 'Startup', icon: '🚀', desc: 'Practical, fast-paced, product-minded', color: 'violet', style: 'Casual & direct' },
  { val: 'hr', name: 'HR Round', icon: '🤝', desc: 'Behavioral, culture fit, soft skills', color: 'sky', style: 'Friendly & exploratory' },
  { val: 'senior', name: 'Senior Engineer', icon: '👨‍💻', desc: 'Deep dive, architecture, trade-offs', color: 'amber', style: 'Challenging & detailed' },
]

const personaColors = {
  emerald: { active: 'bg-emerald-500/10 border-emerald-500/25', text: 'text-emerald-400' },
  violet: { active: 'bg-violet-500/10 border-violet-500/25', text: 'text-violet-400' },
  sky: { active: 'bg-sky-500/10 border-sky-500/25', text: 'text-sky-400' },
  amber: { active: 'bg-amber-500/10 border-amber-500/25', text: 'text-amber-400' },
}

const companies = [
  {
    val: 'none',
    name: 'No Specific Company',
    icon: '🎯',
    desc: 'General interview questions',
    color: 'white',
    focus: 'Balanced mix'
  },
  {
    val: 'google',
    name: 'Google',
    icon: '🟢',
    desc: 'DSA heavy, system design, Googleyness',
    color: 'emerald',
    focus: 'Algorithms + Culture'
  },
  {
    val: 'amazon',
    name: 'Amazon',
    icon: '🟠',
    desc: '14 Leadership Principles focused',
    color: 'amber',
    focus: 'Leadership Principles'
  },
  {
    val: 'microsoft',
    name: 'Microsoft',
    icon: '🔵',
    desc: 'Behavioral + Technical mix',
    color: 'sky',
    focus: 'Growth Mindset'
  },
  {
    val: 'meta',
    name: 'Meta',
    icon: '🔷',
    desc: 'Product sense + coding + design',
    color: 'blue',
    focus: 'Move Fast'
  },
  {
    val: 'flipkart',
    name: 'Flipkart',
    icon: '🟡',
    desc: 'DSA + practical problems',
    color: 'yellow',
    focus: 'Problem Solving'
  },
  {
    val: 'infosys',
    name: 'Infosys / TCS',
    icon: '🏭',
    desc: 'Basic CS, aptitude, HR rounds',
    color: 'violet',
    focus: 'Core CS + HR'
  },
  {
    val: 'startup_generic',
    name: 'Any Startup',
    icon: '⚡',
    desc: 'Practical skills, quick execution',
    color: 'red',
    focus: 'Ship Fast'
  },
]

const companyColors = {
  white: { active: 'bg-white/[0.06] border-white/20', text: 'text-white/70' },
  emerald: { active: 'bg-emerald-500/10 border-emerald-500/25', text: 'text-emerald-400' },
  amber: { active: 'bg-amber-500/10 border-amber-500/25', text: 'text-amber-400' },
  sky: { active: 'bg-sky-500/10 border-sky-500/25', text: 'text-sky-400' },
  blue: { active: 'bg-blue-500/10 border-blue-500/25', text: 'text-blue-400' },
  yellow: { active: 'bg-yellow-500/10 border-yellow-500/25', text: 'text-yellow-400' },
  violet: { active: 'bg-violet-500/10 border-violet-500/25', text: 'text-violet-400' },
  red: { active: 'bg-red-500/10 border-red-500/25', text: 'text-red-400' },
}

export default function Step1SetUp({ onStart }) {
  const { userData } = useSelector(s => s.user)
  const dispatch = useDispatch()

  const [role, setRole] = useState('')
  const [difficulty, setDifficulty] = useState(userData?.interviewPrefs?.difficulty || 'medium')
  const [persona, setPersona] = useState('google')
  const [company, setCompany] = useState('none')
  const [answerMode, setAnswerMode] = useState(userData?.interviewPrefs?.defaultMode || 'text')
  const [useResume, setUseResume] = useState(!!userData?.resumeUrl)
  const [duration, setDuration] = useState(userData?.interviewPrefs?.sessionDuration || '20')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleStart = async () => {
    if (!role) { setError("Please select a role"); return }
    setLoading(true); setError(null)
    try {
      const res = await axios.post(
        ServerURL + '/api/interview/generate-questions',
        { role, difficulty, useResume, sessionDuration: duration, persona, company },
        { withCredentials: true }
      )
      if (res.data.credits !== undefined) {
          dispatch(setUserData({ ...userData, credits: res.data.credits }))
      }
      onStart({
        questions: res.data.questions,
        sessionConfig: {
          ...res.data.sessionConfig,
          persona,
          company,
          mode: answerMode
        }
      })
    } catch (e) {
      if (e.response?.status === 402) {
        setError('PAYWALL')
      } else {
        setError(e.response?.data?.message || "Failed to generate questions. Try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const navigate = useNavigate()

  const selectedCompany = companies.find(c => c.val === company)

  return (
    <div className='relative w-full min-h-screen bg-[#050505] text-white'
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');
        .i-title { font-family: 'Sora', sans-serif; }
      `}</style>

      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='absolute w-[600px] h-[600px] bg-violet-500/10 blur-[150px] rounded-full -top-32 -right-32' />
        <div className='absolute w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -bottom-32 -left-32' />
        <div className='pointer-events-none absolute inset-0'
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* ── Top Nav ── */}
      <div className='relative z-20 flex items-center justify-between px-6 pt-7 max-w-7xl mx-auto'>
        <motion.button onClick={() => navigate('/dashboard')}
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
          className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07]
            text-white/45 hover:text-white/80 hover:bg-white/[0.06] hover:border-white/[0.12]
            transition-all duration-200 cursor-pointer text-sm font-medium group'>
          <BsArrowLeft size={13} className='group-hover:-translate-x-0.5 transition-transform duration-200' />
          Back
        </motion.button>

        <div className='flex items-center gap-2 px-3.5 py-2 rounded-xl
          bg-violet-500/8 border border-violet-500/15 text-violet-400 text-[11px] font-medium'>
          <BsRocketFill size={10} /> Standard Interview Setup
        </div>
      </div>

      <div className='relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-24'>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center mb-12'
        >
          <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-violet-500/10 border border-violet-500/20 text-violet-400
            text-xs font-medium mb-6'>
            <HiSparkles size={12} /> AI Interview Session
          </div>
          <h1 className='i-title text-4xl md:text-5xl font-black text-white tracking-tight mb-3'>
            Set Up Your <span className='text-violet-400'>Interview</span>
          </h1>
          <p className='text-white/35 text-sm'>
            Configure your session and our AI will generate personalized questions
          </p>
        </motion.div>

        <div className='space-y-4'>

          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6'
          >
            <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium mb-4'>
              Target Role *
            </p>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
              {roles.map(r => (
                <button key={r.val}
                  onClick={() => setRole(r.val)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer
                    ${role === r.val
                      ? 'bg-violet-500/10 border-violet-500/25'
                      : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14]'}`}>
                  <span className='text-lg mb-1 block'>{r.icon}</span>
                  <p className={`text-xs font-semibold mb-0.5 ${role === r.val ? 'text-violet-400' : 'text-white/70'}`}>
                    {r.val}
                  </p>
                  <p className='text-[10px] text-white/25 leading-tight'>{r.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Company Specific Mode ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <BsBuildingFill size={13} className='text-white/30' />
                <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>
                  Target Company
                </p>
              </div>
              {company !== 'none' && (
                <div className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1
                  rounded-full border font-medium
                  ${companyColors[selectedCompany?.color]?.active}
                  ${companyColors[selectedCompany?.color]?.text}`}>
                  <span>{selectedCompany?.icon}</span>
                  {selectedCompany?.focus}
                </div>
              )}
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
              {companies.map(c => {
                const cc = companyColors[c.color]
                const isActive = company === c.val
                return (
                  <button key={c.val}
                    onClick={() => setCompany(c.val)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer
                      ${isActive ? cc.active : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14]'}`}>
                    <div className='flex items-center justify-between mb-1.5'>
                      <span className='text-base'>{c.icon}</span>
                      {isActive && <BsCheckCircleFill size={10} className={cc.text} />}
                    </div>
                    <p className={`text-xs font-semibold mb-0.5 ${isActive ? cc.text : 'text-white/65'}`}>
                      {c.name}
                    </p>
                    <p className='text-[10px] text-white/25 leading-tight'>{c.desc}</p>
                  </button>
                )
              })}
            </div>

            {/* Company tip */}
            <AnimatePresence>
              {company !== 'none' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className='mt-4 overflow-hidden'
                >
                  <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border
                    ${companyColors[selectedCompany?.color]?.active}`}>
                    <HiSparkles size={13} className={`${companyColors[selectedCompany?.color]?.text} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className={`text-xs font-semibold mb-1 ${companyColors[selectedCompany?.color]?.text}`}>
                        {selectedCompany?.name} Interview Style
                      </p>
                      <p className='text-[11px] text-white/40 leading-relaxed'>
                        {company === 'google' && "Google focuses on algorithmic problem solving, system design at scale, and cultural fit. Expect 2-3 DSA questions and 1 system design question in each round."}
                        {company === 'amazon' && "Amazon interviews are heavily based on their 14 Leadership Principles. Every answer should use the STAR method and reference specific LP like 'Customer Obsession' or 'Bias for Action'."}
                        {company === 'microsoft' && "Microsoft values growth mindset and collaboration. Expect coding problems, design discussions, and behavioral questions around teamwork and learning from failures."}
                        {company === 'meta' && "Meta focuses on coding, system design, and product sense. They value moving fast and data-driven decisions. Expect questions on scalability and product thinking."}
                        {company === 'flipkart' && "Flipkart focuses on data structures, algorithms, and practical problem solving. Rounds include online assessment, technical interviews, and an HR round."}
                        {company === 'infosys' && "Service companies focus on basic CS fundamentals, verbal communication, aptitude, and HR behavioral questions. Be confident and communicate clearly."}
                        {company === 'startup_generic' && "Startups value practical skills, ability to work independently, and ship fast. Expect questions on past projects, problem solving approach, and culture fit."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Interviewer Persona */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6'
          >
            <div className='flex items-center gap-2 mb-4'>
              <BsPersonFill size={13} className='text-white/30' />
              <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>
                Interviewer Persona
              </p>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              {personas.map(p => {
                const c = personaColors[p.color]
                const isActive = persona === p.val
                return (
                  <button key={p.val}
                    onClick={() => setPersona(p.val)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer
                      ${isActive ? c.active : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14]'}`}>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='text-xl'>{p.icon}</span>
                      {isActive && <BsCheckCircleFill size={12} className={`ml-auto ${c.text}`} />}
                    </div>
                    <p className={`text-xs font-bold mb-0.5 ${isActive ? c.text : 'text-white/65'}`}>
                      {p.name}
                    </p>
                    <p className='text-[10px] text-white/30 leading-tight mb-1'>{p.desc}</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium
                      ${isActive ? `${c.text} bg-white/[0.06]` : 'text-white/20 bg-white/[0.03]'}`}>
                      {p.style}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Difficulty + Duration */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className='grid sm:grid-cols-2 gap-4'
          >
            {/* Difficulty */}
            <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6'>
              <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium mb-4'>
                Difficulty
              </p>
              <div className='space-y-2'>
                {[
                  { val: 'easy', label: 'Easy', desc: 'Basic concepts, fresher level', color: 'emerald' },
                  { val: 'medium', label: 'Medium', desc: '1-3 years experience', color: 'amber' },
                  { val: 'hard', label: 'Hard', desc: 'Senior level, deep dive', color: 'red' },
                ].map(d => (
                  <button key={d.val}
                    onClick={() => setDifficulty(d.val)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left
                      transition-all duration-200 cursor-pointer
                      ${difficulty === d.val
                        ? d.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/25'
                          : d.color === 'amber' ? 'bg-amber-500/10 border-amber-500/25'
                            : 'bg-red-500/10 border-red-500/25'
                        : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14]'}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0
                      ${difficulty === d.val
                        ? d.color === 'emerald' ? 'bg-emerald-400'
                          : d.color === 'amber' ? 'bg-amber-400' : 'bg-red-400'
                        : 'bg-white/20'}`} />
                    <div className='flex-1'>
                      <p className={`text-xs font-semibold
                        ${difficulty === d.val
                          ? d.color === 'emerald' ? 'text-emerald-400'
                            : d.color === 'amber' ? 'text-amber-400' : 'text-red-400'
                          : 'text-white/60'}`}>
                        {d.label}
                      </p>
                      <p className='text-[10px] text-white/25'>{d.desc}</p>
                    </div>
                    {difficulty === d.val && (
                      <BsCheckCircleFill size={12} className={`flex-shrink-0
                        ${d.color === 'emerald' ? 'text-emerald-400'
                          : d.color === 'amber' ? 'text-amber-400' : 'text-red-400'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6'>
              <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium mb-4'>
                Session Duration
              </p>
              <div className='space-y-2'>
                {[
                  { val: '10', label: '10 minutes', desc: '5 questions — Quick practice' },
                  { val: '20', label: '20 minutes', desc: '8 questions — Standard session' },
                  { val: '30', label: '30 minutes', desc: '12 questions — Deep dive' },
                  { val: '45', label: '45 minutes', desc: '15 questions — Full interview' },
                ].map(d => (
                  <button key={d.val}
                    onClick={() => setDuration(d.val)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left
                      transition-all duration-200 cursor-pointer
                      ${duration === d.val
                        ? 'bg-sky-500/10 border-sky-500/25'
                        : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14]'}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0
                      ${duration === d.val ? 'bg-sky-400' : 'bg-white/20'}`} />
                    <div className='flex-1'>
                      <p className={`text-xs font-semibold ${duration === d.val ? 'text-sky-400' : 'text-white/60'}`}>
                        {d.label}
                      </p>
                      <p className='text-[10px] text-white/25'>{d.desc}</p>
                    </div>
                    {duration === d.val && (
                      <BsCheckCircleFill size={12} className='text-sky-400 flex-shrink-0' />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Answer Mode */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6'
          >
            <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium mb-4'>
              Answer Mode
            </p>
            <div className='grid grid-cols-2 gap-3'>
              {[
                { val: 'text', icon: <BsKeyboardFill size={18} />, label: 'Text Mode', desc: 'Type your answers — great for structured responses', color: 'emerald' },
                { val: 'voice', icon: <BsMicFill size={18} />, label: 'Voice Mode', desc: 'Speak your answers — simulates real interview feel', color: 'violet' },
              ].map(m => {
                const isActive = answerMode === m.val
                const activeClass = m.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-violet-500/10 border-violet-500/25'
                const textClass = m.color === 'emerald' ? 'text-emerald-400' : 'text-violet-400'
                const iconClass = m.color === 'emerald' ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' : 'bg-violet-500/15 border-violet-500/20 text-violet-400'
                return (
                  <button key={m.val}
                    onClick={() => setAnswerMode(m.val)}
                    className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer
                      ${isActive ? activeClass : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14]'}`}>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3
                      ${isActive ? iconClass : 'bg-white/[0.04] border-white/[0.08] text-white/30'}`}>
                      {m.icon}
                    </div>
                    <div className='flex items-center gap-2 mb-1'>
                      <p className={`text-sm font-bold ${isActive ? textClass : 'text-white/65'}`}>{m.label}</p>
                      {isActive && <BsCheckCircleFill size={12} className={textClass} />}
                    </div>
                    <p className='text-[11px] text-white/25 leading-relaxed'>{m.desc}</p>
                    {m.val === 'voice' && (
                      <p className='text-[10px] text-white/15 mt-2'>* Chrome browser recommended</p>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Resume Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={`border rounded-2xl p-6 transition-all duration-300
              ${useResume && userData?.resumeUrl
                ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                : 'bg-white/[0.03] border-white/[0.07]'}`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                  ${useResume && userData?.resumeUrl
                    ? 'bg-emerald-500/15 border border-emerald-500/25'
                    : 'bg-white/[0.05] border border-white/[0.08]'}`}>
                  <BsFileEarmarkTextFill size={16}
                    className={useResume && userData?.resumeUrl ? 'text-emerald-400' : 'text-white/30'} />
                </div>
                <div>
                  <p className='text-sm font-semibold text-white/80'>Use My Resume</p>
                  <p className='text-xs text-white/30'>
                    {userData?.resumeUrl
                      ? `${userData.resumeOriginalName || 'resume.pdf'} — AI will ask resume-specific questions`
                      : 'No resume uploaded — Go to Settings to upload'}
                  </p>
                </div>
              </div>
              {userData?.resumeUrl && (
                <button
                  onClick={() => setUseResume(!useResume)}
                  className={`relative w-12 h-6 rounded-full border transition-all duration-300
                    cursor-pointer flex-shrink-0
                    ${useResume ? 'bg-emerald-400/20 border-emerald-500/40' : 'bg-white/[0.05] border-white/[0.1]'}`}>
                  <motion.div
                    animate={{ x: useResume ? 22 : 2 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className={`absolute top-1 w-4 h-4 rounded-full transition-colors duration-300
                      ${useResume ? 'bg-emerald-400' : 'bg-white/30'}`}
                  />
                </button>
              )}
            </div>
          </motion.div>

          {/* Summary */}
          {role && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className='bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-5'
            >
              <p className='text-[11px] text-white/25 uppercase tracking-widest mb-3'>Session Summary</p>
              <div className='grid grid-cols-3 sm:grid-cols-7 gap-2'>
                {[
                  { label: 'Role', value: role.split(' ').slice(0, 2).join(' ') },
                  { label: 'Company', value: companies.find(c => c.val === company)?.name.split(' ')[0] || 'General' },
                  { label: 'Persona', value: personas.find(p => p.val === persona)?.name.split(' ')[0] || persona },
                  { label: 'Difficulty', value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1) },
                  { label: 'Duration', value: `${duration} mins` },
                  { label: 'Mode', value: answerMode === 'voice' ? '🎤 Voice' : '⌨️ Text' },
                  { label: 'Resume', value: useResume && userData?.resumeUrl ? 'Yes ✓' : 'No' },
                ].map(({ label, value }) => (
                  <div key={label} className='text-center'>
                    <p className='text-[10px] text-white/20 mb-1'>{label}</p>
                    <p className='text-xs font-semibold text-white/70 truncate'>{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {error === 'PAYWALL' ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className='bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center'>
              <div className='w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(239,68,68,0.3)]'>
                <BsShieldFill size={20} className='text-red-400' />
              </div>
              <p className='text-white font-bold text-sm mb-1'>Insufficient Credits</p>
              <p className='text-[11px] text-white/50 mb-4 px-4'>You need 25 credits to start a Mock Interview. Upgrade your plan to unlock more practice.</p>
              <button onClick={() => navigate('/credits')}
                className='w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all'>
                Upgrade to Premium
              </button>
            </motion.div>
          ) : error && <p className='text-red-400 text-xs text-center'>{error}</p>}

          {/* Start Button */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            onClick={handleStart}
            disabled={loading || !role}
            className='w-full flex items-center justify-center gap-3 py-4 rounded-2xl
              bg-violet-500 text-white font-bold text-base cursor-pointer
              hover:bg-violet-400 transition-all duration-300
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-[0_0_40px_rgba(139,92,246,0.3)]'
          >
            {loading ? (
              <>
                <div className='w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin' />
                Generating Questions...
              </>
            ) : (
              <>
                <BsRocketFill size={16} />
                Start Interview
                <BsArrowRight size={16} />
              </>
            )}
          </motion.button>

        </div>
      </div>
      <Footer />

    </div>

  )
}