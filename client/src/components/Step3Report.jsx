import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerURL } from '../App'
import {
  BsCheckCircleFill, BsXCircleFill,
  BsBarChartFill, BsClockFill,
  BsStarFill, BsTrophyFill,
  BsArrowRepeat, BsHouseFill,
  BsPlayFill, BsStopFill,
  BsLightningChargeFill
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import Footer from './Footer'

// ── Spider/Radar Chart ──
function SpiderChart({ data }) {
  const size    = 280
  const cx      = size / 2
  const cy      = size / 2
  const radius  = 100
  const levels  = 4
  const keys    = Object.keys(data)
  const n       = keys.length
  const angleStep = (2 * Math.PI) / n

  const getPoint = (i, r) => {
    const angle = i * angleStep - Math.PI / 2
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    }
  }

  // Grid polygons
  const gridPolygons = Array.from({ length: levels }, (_, l) => {
    const r = (radius / levels) * (l + 1)
    const pts = keys.map((_, i) => getPoint(i, r))
    return pts.map(p => `${p.x},${p.y}`).join(' ')
  })

  // Data polygon
  const dataPoints = keys.map((k, i) => {
    const val = data[k] / 100
    return getPoint(i, radius * val)
  })
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  // Label points
  const labelPoints = keys.map((k, i) => ({
    ...getPoint(i, radius + 24),
    label: k,
    value: data[k]
  }))

  const getColor = (v) => v >= 75 ? '#34d399' : v >= 50 ? '#fbbf24' : '#f87171'

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className='w-full max-w-[280px] mx-auto'>
      {/* Grid rings */}
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts}
          fill='none' stroke='rgba(255,255,255,0.06)' strokeWidth='1' />
      ))}

      {/* Axis lines */}
      {keys.map((_, i) => {
        const end = getPoint(i, radius)
        return (
          <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
            stroke='rgba(255,255,255,0.06)' strokeWidth='1' />
        )
      })}

      {/* Data polygon fill */}
      <polygon points={dataPolygon}
        fill='rgba(52,211,153,0.12)' stroke='rgba(52,211,153,0.5)'
        strokeWidth='1.5' strokeLinejoin='round' />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r='3.5'
          fill={getColor(data[keys[i]])} stroke='#050505' strokeWidth='1.5' />
      ))}

      {/* Labels */}
      {labelPoints.map((pt, i) => (
        <g key={i}>
          <text x={pt.x} y={pt.y}
            textAnchor='middle' dominantBaseline='middle'
            fontSize='9' fill='rgba(255,255,255,0.4)'
            fontFamily='DM Sans, sans-serif'>
            {pt.label}
          </text>
          <text x={pt.x} y={pt.y + 11}
            textAnchor='middle' dominantBaseline='middle'
            fontSize='9' fontWeight='bold'
            fill={getColor(pt.value)}
            fontFamily='Sora, sans-serif'>
            {pt.value}
          </text>
        </g>
      ))}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r='2' fill='rgba(255,255,255,0.1)' />
    </svg>
  )
}

// ── Interview Replay ──
function InterviewReplay({ answers, onClose }) {
  const [current,     setCurrent]     = useState(0)
  const [isSpeaking,  setIsSpeaking]  = useState(false)
  const [replayMode,  setReplayMode]  = useState('browse') // browse | auto

  const ans = answers[current]

  const scoreColor = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400'
  const barColor   = (s) => s >= 80 ? 'bg-emerald-400'  : s >= 60 ? 'bg-amber-400'  : 'bg-red-400'

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 0.9
    u.onstart = () => setIsSpeaking(true)
    u.onend   = () => setIsSpeaking(false)
    window.speechSynthesis.speak(u)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  useEffect(() => {
    return () => window.speechSynthesis.cancel()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4'
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className='w-full max-w-2xl bg-[#0a0a0a] border border-white/[0.08] rounded-3xl overflow-hidden'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-white/[0.06]'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25
              flex items-center justify-center'>
              <BsPlayFill size={13} className='text-violet-400' />
            </div>
            <div>
              <p className='text-sm font-semibold text-white/80'>Interview Replay</p>
              <p className='text-[10px] text-white/30'>
                Q{current+1} of {answers.length}
              </p>
            </div>
          </div>
          <button onClick={() => { stopSpeaking(); onClose() }}
            className='text-white/30 hover:text-white/70 transition cursor-pointer text-lg'>
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className='h-0.5 bg-white/[0.04]'>
          <motion.div
            animate={{ width: `${((current+1) / answers.length) * 100}%` }}
            transition={{ duration: 0.3 }}
            className='h-full bg-violet-400'
          />
        </div>

        <div className='p-6 space-y-4 max-h-[70vh] overflow-y-auto'>

          {/* Question */}
          <div className='bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                  ${ans.isFollowUp ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
                    : ans.type === 'Technical' ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
                    : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
                  {ans.isFollowUp ? 'Follow-up' : ans.type}
                </span>
              </div>
              <button
                onClick={isSpeaking ? stopSpeaking : () => speakText(ans.question)}
                className={`text-[11px] px-3 py-1 rounded-full border transition cursor-pointer
                  ${isSpeaking
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-white/[0.04] border-white/[0.07] text-white/30 hover:text-white/60'}`}>
                {isSpeaking ? '⏹ Stop' : '▶ Listen'}
              </button>
            </div>
            <p className='text-sm font-semibold text-white/80 leading-relaxed'>
              {ans.question}
            </p>
          </div>

          {/* Your Answer vs Ideal */}
          <div className='grid sm:grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <p className='text-[10px] text-white/20 uppercase tracking-widest'>Your Answer</p>
              <div className={`p-4 rounded-xl border text-xs leading-relaxed
                ${ans.userAnswer === '(Skipped)'
                  ? 'bg-red-500/5 border-red-500/15 text-red-400/60'
                  : 'bg-white/[0.02] border-white/[0.05] text-white/50'}`}>
                {ans.userAnswer}
              </div>
            </div>
            {ans.evaluation?.idealAnswer && (
              <div className='space-y-2'>
                <p className='text-[10px] text-emerald-400/60 uppercase tracking-widest'>
                  Ideal Answer
                </p>
                <div className='p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15
                  text-xs text-white/50 leading-relaxed'>
                  {ans.evaluation.idealAnswer}
                </div>
              </div>
            )}
          </div>

          {/* Score + Metrics */}
          <div className='flex items-center gap-3'>
            <div className={`flex-shrink-0 w-16 h-16 rounded-2xl border flex flex-col
              items-center justify-center
              ${ans.score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20'
                : ans.score >= 60 ? 'bg-amber-500/10 border-amber-500/20'
                : 'bg-red-500/10 border-red-500/20'}`}>
              <span className={`text-xl font-black ${scoreColor(ans.score)}`}
                style={{ fontFamily: 'Sora, sans-serif' }}>
                {ans.score}
              </span>
              <span className='text-[9px] text-white/25'>/100</span>
            </div>
            {ans.metrics && (
              <div className='flex-1 grid grid-cols-3 gap-2'>
                {Object.entries(ans.metrics).map(([key, val]) => (
                  <div key={key} className='text-center bg-white/[0.02]
                    border border-white/[0.04] rounded-xl p-2'>
                    <p className={`text-sm font-black ${scoreColor(val)}`}
                      style={{ fontFamily: 'Sora, sans-serif' }}>{val}</p>
                    <p className='text-[9px] text-white/20 capitalize'>{key}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Feedback */}
          {ans.evaluation?.feedback && (
            <div className='bg-white/[0.02] border border-white/[0.05] rounded-xl p-4'>
              <p className='text-[10px] text-white/20 uppercase tracking-widest mb-2'>AI Feedback</p>
              <p className='text-xs text-white/50 leading-relaxed'>{ans.evaluation.feedback}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className='flex items-center justify-between px-6 py-4 border-t border-white/[0.06]'>
          <button
            onClick={() => { stopSpeaking(); setCurrent(Math.max(0, current-1)) }}
            disabled={current === 0}
            className='px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]
              text-white/40 text-sm hover:text-white/70 hover:bg-white/[0.07]
              transition cursor-pointer disabled:opacity-30'>
            ← Previous
          </button>

          {/* Dot indicators */}
          <div className='flex items-center gap-1.5'>
            {answers.map((_, i) => (
              <button key={i} onClick={() => { stopSpeaking(); setCurrent(i) }}
                className={`rounded-full transition-all duration-200 cursor-pointer
                  ${i === current ? 'w-4 h-1.5 bg-violet-400' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`} />
            ))}
          </div>

          <button
            onClick={() => { stopSpeaking(); setCurrent(Math.min(answers.length-1, current+1)) }}
            disabled={current === answers.length-1}
            className='px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]
              text-white/40 text-sm hover:text-white/70 hover:bg-white/[0.07]
              transition cursor-pointer disabled:opacity-30'>
            Next →
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Component ──
export default function Step3Report({ report, onRestart }) {
  const navigate = useNavigate()
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [activeQ,     setActiveQ]     = useState(null)
  const [showReplay,  setShowReplay]  = useState(false)
  const [streakDays,  setStreakDays]  = useState(0)

  const {
    avgScore, totalTime, answers, sessionConfig,
    strengths, weaknesses, improvements,
    overallFeedback, recommendation, topicsToStudy, nextSteps
  } = report

  // ── Compute Spider Chart Data ──
  const spiderData = (() => {
    if (!answers?.length) return null
    const validAnswers = answers.filter(a => a.score > 0)
    if (!validAnswers.length) return null

    const technical    = Math.round(validAnswers.filter(a => a.type === 'Technical').reduce((s, a) => s + a.score, 0) / Math.max(validAnswers.filter(a => a.type === 'Technical').length, 1))
    const communication = Math.round(validAnswers.reduce((s, a) => s + (a.metrics?.clarity || a.score * 0.8), 0) / validAnswers.length)
    const problemSolving = Math.round(validAnswers.reduce((s, a) => s + (a.metrics?.content || a.score * 0.9), 0) / validAnswers.length)
    const confidence    = Math.round(validAnswers.reduce((s, a) => s + (a.confidenceScore || a.score * 0.7), 0) / validAnswers.length)
    const structure     = Math.round(validAnswers.reduce((s, a) => s + (a.metrics?.relevance || a.score * 0.85), 0) / validAnswers.length)

    return {
      Technical:     Math.min(100, technical || avgScore),
      Communication: Math.min(100, communication || avgScore),
      'Problem Solving': Math.min(100, problemSolving || avgScore),
      Confidence:    Math.min(100, confidence || avgScore),
      Structure:     Math.min(100, structure || avgScore),
    }
  })()

  // ── Streak from localStorage ──
  useEffect(() => {
    const today    = new Date().toDateString()
    const lastDate = localStorage.getItem('oralytics_last_session')
    const streak   = parseInt(localStorage.getItem('oralytics_streak') || '0')

    if (lastDate === today) {
      setStreakDays(streak)
    } else {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const newStreak = lastDate === yesterday.toDateString() ? streak + 1 : 1
      localStorage.setItem('oralytics_streak', newStreak)
      localStorage.setItem('oralytics_last_session', today)
      setStreakDays(newStreak)
    }
  }, [])

  const scoreColor = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400'
  const barColor   = (s) => s >= 80 ? 'bg-emerald-400'  : s >= 60 ? 'bg-amber-400'  : 'bg-red-400'

  const recColor = recommendation === 'Ready'
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : recommendation === 'Needs Practice'
    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20'

  const recEmoji = recommendation === 'Ready' ? '🎉'
    : recommendation === 'Needs Practice' ? '📚' : '💪'

  const handleSave = async () => {
    setSaving(true)
    try {
      const sc = sessionConfig || {}
      await axios.post(
        ServerURL + '/api/interview/save-session',
        {
          sessionConfig,
          answers: answers.map(a => ({
            questionId:  a.questionId,
            question:    a.question,
            type:        a.type,
            userAnswer:  a.userAnswer,
            aiFeedback:  a.evaluation?.feedback || '',
            score:       a.score,
            timeTaken:   a.timeTaken,
            metrics:     a.metrics,
            evaluation:  a.evaluation,
          })),
          report: {
            totalScore:      avgScore,
            avgScore,
            timeTaken:       totalTime,
            strengths:       strengths       || [],
            weaknesses:      weaknesses      || [],
            improvements:    improvements    || [],
            overallFeedback: overallFeedback || '',
            recommendation:  recommendation  || 'Needs Practice'
          },
          // ── Live proctoring + AI assistant data ──
          proctoringData: {
            violations:      sc.violations      || 0,
            integrityScore:  sc.integrityScore  || 100,
            avgConfidence:   sc.avgConfidence   || 0,
            avgWPM:          sc.avgWPM          || 0,
            avgEyeContact:   sc.avgEyeContact   || 0,
            dominantEmotion: sc.dominantEmotion || '',
            totalFillers:    sc.totalFillers    || 0,
            keywordsMatched: sc.keywordsMatched || [],
            violationTypes:  sc.violationTypes  || [],
          }
        },
        { withCredentials: true }
      )
      setSaved(true)
    } catch (e) {
      console.error('Save error:', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className='relative min-h-screen bg-[#050505] text-white'
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');
          .r-title { font-family: 'Sora', sans-serif; }
        `}</style>

        <div className='pointer-events-none fixed inset-0 overflow-hidden'>
          <div className='absolute w-[500px] h-[500px] bg-emerald-500 opacity-[0.06] blur-[160px] rounded-full -top-32 -left-32' />
          <div className='absolute w-[400px] h-[400px] bg-violet-500 opacity-[0.04] blur-[140px] rounded-full -bottom-32 -right-32' />
          <div className='pointer-events-none absolute inset-0'
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className='relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-24'>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='text-center mb-10'
          >
            <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
              text-xs font-medium mb-5'>
              <HiSparkles size={12} /> Interview Complete
            </div>
            <h1 className='r-title text-4xl font-bold text-white mb-2'>
              Your Interview Report
            </h1>
            <p className='text-white/35 text-sm'>
              {sessionConfig?.role}
              {sessionConfig?.company && sessionConfig.company !== 'none' && ` · ${sessionConfig.company}`}
              {' · '}{sessionConfig?.difficulty}
              {' · '}{totalTime}
            </p>

            {/* Streak badge */}
            {streakDays > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                  bg-amber-500/10 border border-amber-500/20 text-amber-400
                  text-xs font-medium mt-3'>
                🔥 {streakDays} Day{streakDays > 1 ? 's' : ''} Streak!
              </motion.div>
            )}
          </motion.div>

          <div className='space-y-4'>

            {/* ── Score Hero ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-7 overflow-hidden'
            >
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent
                ${avgScore >= 80 ? 'via-emerald-500/60'
                  : avgScore >= 60 ? 'via-amber-500/60' : 'via-red-500/60'}
                to-transparent`} />

              <div className='flex items-center justify-between mb-6'>
                <div>
                  <p className='text-[10px] text-white/25 uppercase tracking-[0.2em] mb-2'>Overall Score</p>
                  <div className='flex items-end gap-2'>
                    <span className={`r-title text-7xl font-black leading-none ${scoreColor(avgScore)}`}>
                      {avgScore}
                    </span>
                    <span className='text-white/20 text-2xl mb-2'>/100</span>
                  </div>
                </div>
                <div className='text-right space-y-3'>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${recColor}`}>
                    <span>{recEmoji}</span>
                    {recommendation}
                  </div>
                  <div className='flex items-center gap-2 text-white/30 text-xs justify-end'>
                    <BsClockFill size={11} />
                    <span>{totalTime}</span>
                  </div>
                </div>
              </div>

              <div className='h-2 bg-white/[0.06] rounded-full overflow-hidden mb-4'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${avgScore}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                  className={`h-full rounded-full ${barColor(avgScore)}`}
                />
              </div>

              <div className='grid grid-cols-3 gap-3'>
                {[
                  { label: 'Questions', value: answers?.length || 0, color: 'text-white/60' },
                  { label: 'Answered',  value: answers?.filter(a => a.userAnswer !== '(Skipped)').length || 0, color: 'text-emerald-400' },
                  { label: 'Skipped',   value: answers?.filter(a => a.userAnswer === '(Skipped)').length || 0, color: 'text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className='text-center bg-white/[0.03] border border-white/[0.05] rounded-xl p-3'>
                    <p className={`r-title text-2xl font-black ${color}`}>{value}</p>
                    <p className='text-[10px] text-white/25 mt-0.5'>{label}</p>
                  </div>
                ))}
              </div>

              {overallFeedback && (
                <p className='text-white/40 text-xs leading-relaxed border-t border-white/[0.05] pt-4 mt-4'>
                  {overallFeedback}
                </p>
              )}
            </motion.div>

            {/* ── Spider Chart ── */}
            {spiderData && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className='bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6'
              >
                <div className='flex items-center gap-2 mb-5'>
                  <BsStarFill size={12} className='text-violet-400' />
                  <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>
                    Performance Radar
                  </p>
                </div>

                <div className='flex flex-col sm:flex-row items-center gap-6'>
                  {/* Chart */}
                  <div className='flex-shrink-0 w-full sm:w-auto'>
                    <SpiderChart data={spiderData} />
                  </div>

                  {/* Legend */}
                  <div className='flex-1 space-y-3 w-full'>
                    {Object.entries(spiderData).map(([key, val]) => (
                      <div key={key}>
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-xs text-white/50'>{key}</span>
                          <span className={`text-xs font-bold ${scoreColor(val)}`}>{val}</span>
                        </div>
                        <div className='h-1.5 bg-white/[0.05] rounded-full overflow-hidden'>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                            className={`h-full rounded-full ${barColor(val)}`}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Weakest area */}
                    <div className='mt-3 pt-3 border-t border-white/[0.05]'>
                      <p className='text-[10px] text-white/25 mb-1'>Focus area</p>
                      <p className='text-xs text-amber-400 font-medium'>
                        {Object.entries(spiderData).sort((a,b) => a[1]-b[1])[0][0]} needs most improvement
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Strengths & Weaknesses ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className='grid sm:grid-cols-2 gap-4'
            >
              {strengths?.length > 0 && (
                <div className='bg-emerald-500/[0.03] border border-emerald-500/15 rounded-2xl p-5'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='w-1.5 h-1.5 rounded-full bg-emerald-400' />
                    <p className='text-[11px] text-emerald-400/80 uppercase tracking-widest font-medium'>Strengths</p>
                  </div>
                  <ul className='space-y-2'>
                    {strengths.map((s, i) => (
                      <li key={i} className='flex items-start gap-2.5 text-xs text-white/55'>
                        <BsCheckCircleFill size={11} className='text-emerald-400 flex-shrink-0 mt-0.5' />
                        <span className='leading-relaxed'>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {weaknesses?.length > 0 && (
                <div className='bg-red-500/[0.03] border border-red-500/15 rounded-2xl p-5'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='w-1.5 h-1.5 rounded-full bg-red-400' />
                    <p className='text-[11px] text-red-400/80 uppercase tracking-widest font-medium'>Weaknesses</p>
                  </div>
                  <ul className='space-y-2'>
                    {weaknesses.map((w, i) => (
                      <li key={i} className='flex items-start gap-2.5 text-xs text-white/55'>
                        <BsXCircleFill size={11} className='text-red-400 flex-shrink-0 mt-0.5' />
                        <span className='leading-relaxed'>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* ── Improvements ── */}
            {improvements?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className='bg-amber-500/[0.03] border border-amber-500/15 rounded-2xl p-5'
              >
                <div className='flex items-center gap-2 mb-4'>
                  <BsStarFill size={12} className='text-amber-400' />
                  <p className='text-[11px] text-amber-400/80 uppercase tracking-widest font-medium'>How to Improve</p>
                </div>
                <ul className='space-y-2'>
                  {improvements.map((imp, i) => (
                    <li key={i} className='flex items-start gap-2.5 text-xs text-white/55'>
                      <span className='text-amber-400 font-bold flex-shrink-0'>{i+1}.</span>
                      <span className='leading-relaxed'>{imp}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* ── Topics to Study ── */}
            {topicsToStudy?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className='bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5'
              >
                <div className='flex items-center gap-2 mb-4'>
                  <BsTrophyFill size={12} className='text-violet-400' />
                  <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Topics to Study</p>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {topicsToStudy.map((topic, i) => (
                    <span key={i} className='px-3 py-1.5 rounded-xl bg-violet-500/10
                      border border-violet-500/20 text-violet-400 text-xs font-medium'>
                      {topic}
                    </span>
                  ))}
                </div>
                {nextSteps && (
                  <p className='text-white/35 text-xs leading-relaxed mt-4 pt-4 border-t border-white/[0.05]'>
                    💡 {nextSteps}
                  </p>
                )}
              </motion.div>
            )}

            {/* ── Question Breakdown ── */}
            {answers?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className='bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden'
              >
                <div className='px-5 py-4 border-b border-white/[0.05] flex items-center justify-between'>
                  <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>
                    Question Breakdown
                  </p>
                  <button
                    onClick={() => setShowReplay(true)}
                    className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                      bg-violet-500/10 border border-violet-500/20 text-violet-400
                      text-[11px] font-medium hover:bg-violet-500/15 transition cursor-pointer'>
                    <BsPlayFill size={10} /> Replay Interview
                  </button>
                </div>
                <div className='divide-y divide-white/[0.04]'>
                  {answers.map((ans, i) => (
                    <div key={i}>
                      <button
                        onClick={() => setActiveQ(activeQ === i ? null : i)}
                        className='w-full px-5 py-4 hover:bg-white/[0.02] transition-colors
                          flex items-center gap-4 text-left cursor-pointer'>
                        <span className='text-[10px] font-bold px-2 py-0.5 rounded-full
                          bg-white/[0.05] text-white/30 flex-shrink-0'>
                          {ans.isFollowUp ? 'FU' : `Q${i+1}`}
                        </span>
                        <p className='flex-1 text-xs text-white/60 leading-relaxed line-clamp-1'>
                          {ans.question}
                        </p>
                        <div className='flex items-center gap-3 flex-shrink-0'>
                          <div className='w-16 h-1.5 bg-white/[0.05] rounded-full overflow-hidden'>
                            <div className={`h-full rounded-full ${barColor(ans.score)}`}
                              style={{ width: `${ans.score}%` }} />
                          </div>
                          <span className={`text-xs font-bold w-8 text-right ${scoreColor(ans.score)}`}>
                            {ans.score}
                          </span>
                          <span className={`text-[10px] transition-transform duration-200
                            ${activeQ === i ? 'rotate-180' : ''} text-white/20`}>▼</span>
                        </div>
                      </button>

                      <AnimatePresence>
                        {activeQ === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className='overflow-hidden'
                          >
                            <div className='px-5 pb-5 space-y-4 bg-white/[0.01]'>
                              <div>
                                <p className='text-[10px] text-white/20 uppercase tracking-widest mb-2'>Your Answer</p>
                                <p className={`text-xs leading-relaxed p-3 rounded-xl border
                                  ${ans.userAnswer === '(Skipped)'
                                    ? 'text-red-400/60 bg-red-500/5 border-red-500/15'
                                    : 'text-white/50 bg-white/[0.02] border-white/[0.05]'}`}>
                                  {ans.userAnswer}
                                </p>
                              </div>
                              {ans.evaluation?.feedback && (
                                <div>
                                  <p className='text-[10px] text-white/20 uppercase tracking-widest mb-2'>AI Feedback</p>
                                  <p className='text-xs text-white/50 leading-relaxed p-3
                                    rounded-xl bg-white/[0.02] border border-white/[0.05]'>
                                    {ans.evaluation.feedback}
                                  </p>
                                </div>
                              )}
                              {ans.metrics && (
                                <div className='grid grid-cols-3 gap-2'>
                                  {Object.entries(ans.metrics).map(([key, val]) => (
                                    <div key={key} className='text-center bg-white/[0.02]
                                      border border-white/[0.05] rounded-xl p-2.5'>
                                      <p className={`r-title text-lg font-black ${scoreColor(val)}`}>{val}</p>
                                      <p className='text-[9px] text-white/20 capitalize mt-0.5'>{key}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {ans.evaluation?.idealAnswer && (
                                <div>
                                  <p className='text-[10px] text-emerald-400/60 uppercase tracking-widest mb-2'>
                                    Ideal Answer Includes
                                  </p>
                                  <p className='text-xs text-white/40 leading-relaxed p-3
                                    rounded-xl bg-emerald-500/[0.03] border border-emerald-500/15'>
                                    {ans.evaluation.idealAnswer}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Action Buttons ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className='space-y-3'
            >
              {!saved ? (
                <button onClick={handleSave} disabled={saving}
                  className='w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                    bg-emerald-400 text-black font-bold text-sm cursor-pointer
                    hover:bg-emerald-300 transition-all duration-300
                    disabled:opacity-50 shadow-[0_0_30px_rgba(52,211,153,0.2)]'>
                  {saving
                    ? <><div className='w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin' /> Saving...</>
                    : <><BsBarChartFill size={14} /> Save to History</>}
                </button>
              ) : (
                <div className='w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                  bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold'>
                  <BsCheckCircleFill size={14} /> Saved to History!
                </div>
              )}

              <div className='grid grid-cols-3 gap-3'>
                <button onClick={() => setShowReplay(true)}
                  className='flex items-center justify-center gap-2 py-3 rounded-xl
                    bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm
                    hover:bg-violet-500/15 transition-all duration-200 cursor-pointer'>
                  <BsPlayFill size={13} /> Replay
                </button>
                <button onClick={onRestart}
                  className='flex items-center justify-center gap-2 py-3 rounded-xl
                    bg-white/[0.04] border border-white/[0.07] text-white/50 text-sm
                    hover:bg-white/[0.08] hover:text-white/80 transition-all duration-200 cursor-pointer'>
                  <BsArrowRepeat size={14} /> New
                </button>
                <button onClick={() => navigate('/dashboard')}
                  className='flex items-center justify-center gap-2 py-3 rounded-xl
                    bg-white/[0.04] border border-white/[0.07] text-white/50 text-sm
                    hover:bg-white/[0.08] hover:text-white/80 transition-all duration-200 cursor-pointer'>
                  <BsHouseFill size={13} /> Home
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ── Interview Replay Modal ── */}
      <AnimatePresence>
        {showReplay && (
          <InterviewReplay
            answers={answers}
            onClose={() => setShowReplay(false)}
          />
        )}
      </AnimatePresence>
      <Footer/>
          
    </>
  )
}