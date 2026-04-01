import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { ServerURL } from '../App'
import {
  BsMicFill, BsMicMuteFill, BsCameraVideoFill,
  BsCameraVideoOffFill, BsTelephoneXFill,
  BsClockFill, BsCheckCircleFill,
  BsArrowRight, BsShieldFill, BsRecordCircleFill,
  BsEyeSlashFill, BsPeopleFill, BsVolumeMuteFill, BsWindowDash,
  BsLightningChargeFill, BsChatSquareTextFill, BsGraphUp, BsGlobe2
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import useProctoring from '../hooks/useProctoring'
import useAnswerAnalytics from '../hooks/useAnswerAnalytics'
import Footer from './Footer'
const AI_AVATARS = [
  { name: 'Alex Carter', seed: 'Alex', title: 'Senior Engineer', company: 'Google' },
  { name: 'Jordan Smith', seed: 'Jordan', title: 'HR Manager', company: 'Microsoft' },
  { name: 'Morgan Lee', seed: 'Morgan', title: 'Tech Lead', company: 'Amazon' },
  { name: 'Taylor Brown', seed: 'Taylor', title: 'Product Manager', company: 'Meta' },
]

export default function LiveVideoInterview() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  const navigate = useNavigate()

  const [phase, setPhase] = useState('setup')
  const [role, setRole] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [setupError, setSetupError] = useState(null)

  const [questions, setQuestions] = useState([])
  const [sessionConfig, setSessionConfig] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(120)
  const [totalTime, setTotalTime] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [report, setReport] = useState(null)

  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [avatar] = useState(AI_AVATARS[Math.floor(Math.random() * AI_AVATARS.length)])

  const MAX_VIOLATIONS = 3

  // Language & JD
  const [language, setLanguage] = useState('en-US')
  const [jdText, setJdText] = useState('')
  const [showJD, setShowJD] = useState(false)
  const [answerStart, setAnswerStart] = useState(null) // timestamp when user started answering

  const userVideoRef = useRef(null)
  const streamRef = useRef(null)
  const hasEndedRef = useRef(false)
  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const totalRef = useRef(null)
  const answersRef = useRef([])

  // ── Cumulative live analytics (accumulated per question) ──
  const liveStatsRef = useRef({
    confidenceSum: 0, wpmSum: 0, eyeSum: 0, fillerSum: 0,
    questionCount: 0, keywords: new Set(), violations: [], emotions: []
  })

  useEffect(() => { answersRef.current = answers }, [answers])

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (userVideoRef.current) userVideoRef.current.srcObject = stream
      setCamOn(true)
    } catch { setCamOn(false) }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null; setCamOn(false)
  }

  const toggleCam = () => {
    if (camOn) { streamRef.current?.getVideoTracks().forEach(t => t.enabled = false); setCamOn(false) }
    else { streamRef.current?.getVideoTracks().forEach(t => t.enabled = true); setCamOn(true) }
  }

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 0.9; u.pitch = 1.05
    u.onstart = () => setIsSpeaking(true)
    u.onend = () => { setIsSpeaking(false); startListening() }
    u.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(u)
  }

  const startListening = () => {
    if (!micOn) return
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    recognitionRef.current = r
    r.continuous = true; r.interimResults = true
    r.lang = language   // ← use selected language
    r.onstart = () => { setIsListening(true); setAnswerStart(Date.now()) }
    r.onresult = (e) => {
      let final = '', interim = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
        else interim += e.results[i][0].transcript
      }
      if (final) setTranscript(prev => prev + final)
      setInterimText(interim)
    }
    r.onend = () => { setIsListening(false); setInterimText('') }
    r.onerror = () => { setIsListening(false); setInterimText('') }
    r.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false); setInterimText('')
  }

  // ── Proctoring ──
  const {
    violations,
    warningVisible: showWarning,
    warningType,
    terminated: proctoringTerminated,
    modelsLoaded: faceModelsLoaded,
    expression,
    eyeContact,
    dismissWarning,
  } = useProctoring({
    videoRef: userVideoRef,
    streamRef,
    enabled: phase === 'interview',
    maxViolations: MAX_VIOLATIONS,
    onViolation: (type, count) => {
      if (count >= MAX_VIOLATIONS) setTimeout(() => endInterview(answersRef.current, count), 3500)
    },
    onTerminate: () => endInterview(answersRef.current, MAX_VIOLATIONS),
  })

  // ── JD keywords parsed ──
  const jdKeywords = jdText
    .split(/[,\n\r]+/)
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 2)

  // ── Real-time answer analytics ──
  const analytics = useAnswerAnalytics({
    transcript,
    interimText,
    startTime: answerStart,
    role,
    jdKeywords,
  })

  useEffect(() => {
    if (phase !== 'interview' || !questions.length) return
    setTimeLeft(questions[currentQ]?.timeLimit || 120)
    setTranscript('')
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmitAnswer(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [currentQ, phase])

  useEffect(() => {
    if (phase !== 'interview') return
    totalRef.current = setInterval(() => setTotalTime(p => p + 1), 1000)
    return () => clearInterval(totalRef.current)
  }, [phase])

  useEffect(() => {
    return () => {
      stopCamera(); stopListening()
      window.speechSynthesis.cancel()
      clearInterval(timerRef.current)
      clearInterval(totalRef.current)
    }
  }, [])

  const handleStart = async () => {
    if (!role) { setSetupError("Please select a role"); return }
    setLoading(true); setSetupError(null)
    try {
      await startCamera()
      const res = await axios.post(ServerURL + '/api/interview/generate-questions',
        { role, difficulty, useResume: false, sessionDuration: '20', persona: 'google', mode: 'video' },
        { withCredentials: true })
      setQuestions(res.data.questions)
      setSessionConfig({ ...res.data.sessionConfig, mode: 'video' })
      setPhase('connecting')
      setTimeout(() => {
        setPhase('interview')
        setTimeout(() => speakText(res.data.questions[0]?.question), 1000)
      }, 2500)
      if (res.data.credits !== undefined) {
        dispatch(setUserData({ ...userData, credits: res.data.credits }))
      }
    } catch (e) {
      if (e.response?.status === 402) {
        setSetupError('PAYWALL')
      } else {
        setSetupError(e.response?.data?.message || "Failed to start. Try again.")
      }
    } finally { setLoading(false) }
  }

  const handleSubmitAnswer = async () => {
    stopListening(); clearInterval(timerRef.current)
    setSubmitting(true)
    const userAnswer = transcript.trim() || '(No answer provided)'
    const question = questions[currentQ]
    try {
      const res = await axios.post(ServerURL + '/api/interview/evaluate-answer', {
        question: question.question, answer: userAnswer,
        role: sessionConfig?.role, difficulty: sessionConfig?.difficulty,
        expectedPoints: question.expectedPoints
      }, { withCredentials: true })

      // ── Accumulate live analytics for this answer ──
      const ls = liveStatsRef.current
      ls.questionCount++
      ls.confidenceSum += analytics.confidence
      ls.wpmSum += analytics.wpm
      ls.eyeSum += eyeContact
      ls.fillerSum += analytics.fillerCount
      analytics.matched.forEach(kw => ls.keywords.add(kw))
      if (expression?.emotion) ls.emotions.push(expression.emotion)

      const newAnswer = {
        questionId: question.id, question: question.question,
        type: question.type, userAnswer,
        evaluation: res.data.evaluation, score: res.data.evaluation.score,
        timeTaken: (question.timeLimit || 120) - timeLeft,
        metrics: res.data.evaluation.metrics,
        isFollowUp: false, voiceUsed: true, hintUsed: false, confidenceScore: analytics.confidence
      }
      const updated = [...answers, newAnswer]
      setAnswers(updated); setTranscript(''); setInterimText('')
      if (currentQ === questions.length - 1) {
        clearInterval(totalRef.current); await endInterview(updated, violations)
      } else {
        setCurrentQ(prev => prev + 1)
        setTimeout(() => speakText(questions[currentQ + 1]?.question), 500)
      }
    } catch { setSubmitting(false) }
    finally { setSubmitting(false) }
  }

  const endInterview = async (allAnswers, violationCount = violations) => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true

    setPhase('report'); window.speechSynthesis.cancel(); stopListening()

    // ── Build live proctoring summary from accumulated metrics ──
    const ls = liveStatsRef.current
    const cnt = Math.max(ls.questionCount, 1)
    const dominantEmotion = ls.emotions.length
      ? Object.entries(
        ls.emotions.reduce((acc, e) => { acc[e] = (acc[e] || 0) + 1; return acc }, {})
      ).sort((a, b) => b[1] - a[1])[0][0]
      : ''

    const liveMetrics = {
      violations: violationCount,
      integrityScore: Math.max(0, 100 - violationCount * 33),
      avgConfidence: Math.round(ls.confidenceSum / cnt),
      avgWPM: Math.round(ls.wpmSum / cnt),
      avgEyeContact: Math.round(ls.eyeSum / cnt),
      dominantEmotion,
      totalFillers: ls.fillerSum,
      keywordsMatched: [...ls.keywords],
      violationTypes: ls.violations,
    }

    const avgScore = allAnswers.length > 0
      ? Math.round(allAnswers.reduce((s, a) => s + a.score, 0) / allAnswers.length) : 0
    
    let finalReport = null
    
    try {
      const reportRes = await axios.post(ServerURL + '/api/interview/generate-report',
        { answers: allAnswers, sessionConfig, totalTime: formatTime(totalTime) },
        { withCredentials: true })
      
      finalReport = {
        ...reportRes.data.report, avgScore,
        totalTime: formatTime(totalTime), answers: allAnswers,
        sessionConfig: { ...sessionConfig, ...liveMetrics }
      }
    } catch {
      finalReport = {
        avgScore, totalTime: formatTime(totalTime), answers: allAnswers,
        sessionConfig: { ...sessionConfig, ...liveMetrics },
        strengths: [], weaknesses: [], improvements: [],
        overallFeedback: 'Live interview completed.',
        recommendation: avgScore >= 70 ? 'Ready' : 'Needs Practice'
      }
    }
    
    setReport(finalReport)

    // Auto-save the session ONLY ONCE
    try {
      await axios.post(ServerURL + '/api/interview/save-session', {
        sessionConfig: { ...sessionConfig, ...liveMetrics, difficulty: sessionConfig.difficulty.toLowerCase() },
        answers: allAnswers,
        report: finalReport,
        proctoringData: liveMetrics
      }, { withCredentials: true })
    } catch (err) {
      console.error("Failed to save session", err)
    }
  }

  const timePercent = questions.length > 0 ? (timeLeft / (questions[currentQ]?.timeLimit || 120)) * 100 : 100
  const timeTextColor = timePercent > 50 ? 'text-emerald-400' : timePercent > 25 ? 'text-amber-400' : 'text-red-400'
  const progress = questions.length > 0 ? ((currentQ) / questions.length) * 100 : 0

  // ════════════════════════════
  // SETUP
  // ════════════════════════════
  if (phase === 'setup') {
    return (
      <div className='min-h-screen bg-[#050505] text-white'
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');
          .v-title { font-family: 'Sora', sans-serif; }
          @keyframes live-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          .live-dot { animation: live-pulse 1.5s ease-in-out infinite; }
        `}</style>

        <div className='pointer-events-none fixed inset-0 overflow-hidden'>
          <div className='absolute w-[600px] h-[600px] bg-emerald-500 opacity-[0.05] blur-[180px] rounded-full -top-40 -right-40' />
          <div className='absolute w-[400px] h-[400px] bg-red-500 opacity-[0.04] blur-[150px] rounded-full -bottom-20 -left-20' />
          <div className='pointer-events-none absolute inset-0'
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.012) 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
        </div>

        {/* ── Navbar ── */}
        <div className='relative z-10 flex items-center justify-between px-6 py-4
          border-b border-white/[0.06]'>
          <button onClick={() => navigate('/dashboard')}
            className='flex items-center gap-2 text-white/30 hover:text-white/60
              text-sm transition cursor-pointer group'>
            <span className='group-hover:-translate-x-1 transition-transform duration-200'>←</span>
            Back
          </button>
          <div className='flex items-center gap-2 px-3 py-1.5 rounded-full
            bg-red-500/10 border border-red-500/20'>
            <span className='w-1.5 h-1.5 rounded-full bg-red-400 live-dot' />
            <span className='text-[11px] text-red-400 font-semibold'>Live Interview Mode</span>
          </div>
        </div>

        <div className='relative z-10 max-w-5xl mx-auto px-6 py-16'>

          {/* ── Hero ── */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} className='text-center mb-14'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-white/[0.04] border border-white/[0.08] text-white/40 text-xs mb-6'>
              <BsCameraVideoFill size={11} className='text-red-400' />
              Industry-grade video interview simulation
            </div>
            <h1 className='v-title text-5xl md:text-6xl font-black text-white mb-4 tracking-tight'>
              Live Video{' '}
              <span style={{
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', backgroundImage: 'linear-gradient(135deg, #f87171, #ef4444)'
              }}>Interview</span>
            </h1>
            <p className='text-white/35 text-lg max-w-lg mx-auto leading-relaxed'>
              Face-to-face with an AI interviewer. Camera on, voice answers,
              real-time evaluation — exactly like the real thing.
            </p>
          </motion.div>

          {/* ── Two column layout ── */}
          <div className='grid md:grid-cols-2 gap-6'>

            {/* LEFT — Config */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='space-y-4'>

              {/* Role */}
              <div className='bg-[#0c0c0c] border border-white/[0.07] rounded-2xl p-5'>
                <p className='text-[10px] text-white/25 uppercase tracking-[0.2em] mb-4'>
                  Target Role
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  {[
                    { val: 'Software Engineer', icon: '💻' },
                    { val: 'Frontend Developer', icon: '🎨' },
                    { val: 'Backend Developer', icon: '⚙️' },
                    { val: 'Full Stack Developer', icon: '🔄' },
                    { val: 'Data Analyst', icon: '📊' },
                    { val: 'Product Manager', icon: '📋' },
                  ].map(r => (
                    <button key={r.val} onClick={() => setRole(r.val)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border
                        text-left transition cursor-pointer text-xs font-medium
                        ${role === r.val
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                          : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:border-white/15 hover:text-white/70'}`}>
                      <span className='text-base'>{r.icon}</span>
                      {r.val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language selector */}
              <div className='bg-[#0c0c0c] border border-white/[0.07] rounded-2xl p-5'>
                <p className='text-[10px] text-white/25 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                  <BsGlobe2 size={10} className='text-sky-400' /> Interview Language
                </p>
                <div className='grid grid-cols-3 gap-2'>
                  {[
                    { val: 'en-US', label: 'English', flag: '🇺🇸', desc: 'US English' },
                    { val: 'hi-IN', label: 'Hindi', flag: '🇮🇳', desc: 'हिंदी' },
                    { val: 'en-IN', label: 'Hinglish', flag: '🔀', desc: 'Mix' },
                  ].map(l => (
                    <button key={l.val} onClick={() => setLanguage(l.val)}
                      className={`py-3 px-2 rounded-xl border text-center transition cursor-pointer
                        ${language === l.val
                          ? 'bg-sky-500/10 border-sky-500/25 text-sky-400'
                          : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/15'}`}>
                      <p className='text-base'>{l.flag}</p>
                      <p className='text-[10px] font-bold mt-1'>{l.label}</p>
                      <p className='text-[9px] opacity-50 mt-0.5'>{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* JD Keywords */}
              <div className='bg-[#0c0c0c] border border-white/[0.07] rounded-2xl p-5'>
                <button onClick={() => setShowJD(!showJD)}
                  className='w-full flex items-center justify-between cursor-pointer text-left'>
                  <p className='text-[10px] text-white/25 uppercase tracking-[0.2em] flex items-center gap-2'>
                    <BsChatSquareTextFill size={10} className='text-emerald-400' />
                    Job Description Keywords <span className='text-white/15 normal-case'>(optional)</span>
                  </p>
                  <span className='text-white/25 text-xs'>{showJD ? '▲' : '▼'}</span>
                </button>
                {showJD && (
                  <div className='mt-3'>
                    <textarea
                      value={jdText}
                      onChange={e => setJdText(e.target.value)}
                      placeholder={'Paste JD or key skills here e.g.\nReact, Node.js, System Design, REST APIs...'}
                      rows={4}
                      className='w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                        text-white/70 text-xs outline-none placeholder-white/15 resize-none
                        focus:border-emerald-500/30 transition'
                    />
                    {jdText && (
                      <p className='text-[10px] text-white/25 mt-1'>
                        {jdText.split(/[,\n\r]+/).filter(k => k.trim().length > 2).length} keywords detected
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Difficulty */}
              <div className='bg-[#0c0c0c] border border-white/[0.07] rounded-2xl p-5'>
                <p className='text-[10px] text-white/25 uppercase tracking-[0.2em] mb-4'>
                  Difficulty
                </p>
                <div className='grid grid-cols-3 gap-2'>
                  {[
                    { val: 'easy', label: 'Easy', desc: 'Fresher level', color: 'emerald' },
                    { val: 'medium', label: 'Medium', desc: '1–3 yrs exp', color: 'amber' },
                    { val: 'hard', label: 'Hard', desc: 'Senior level', color: 'red' },
                  ].map(d => (
                    <button key={d.val} onClick={() => setDifficulty(d.val)}
                      className={`py-3 px-2 rounded-xl border text-center transition cursor-pointer
                        ${difficulty === d.val
                          ? d.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                            : d.color === 'amber' ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                              : 'bg-red-500/10 border-red-500/25 text-red-400'
                          : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/15'}`}>
                      <p className='text-xs font-bold'>{d.label}</p>
                      <p className='text-[10px] opacity-60 mt-0.5'>{d.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {setupError === 'PAYWALL' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className='bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center'>
                  <div className='w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(239,68,68,0.3)]'>
                    <BsShieldFill size={20} className='text-red-400' />
                  </div>
                  <p className='text-white font-bold text-sm mb-1'>Insufficient Credits</p>
                  <p className='text-[11px] text-white/50 mb-4 px-4'>You need 50 credits to start a Live Video Interview. Upgrade your plan to unlock more practice.</p>
                  <button onClick={() => navigate('/credits')}
                    className='w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all'>
                    Upgrade to Premium
                  </button>
                </motion.div>
              ) : setupError && (
                <div className='flex items-center gap-2 px-4 py-3 rounded-xl
                  bg-red-500/5 border border-red-500/20 text-red-400 text-xs'>
                  ⚠️ {setupError}
                </div>
              )}

              <button onClick={handleStart} disabled={loading || !role}
                className='w-full flex items-center justify-center gap-3 py-4 rounded-2xl
                  bg-red-500 text-white font-bold text-base cursor-pointer
                  hover:bg-red-400 transition-all duration-300 disabled:opacity-40
                  disabled:cursor-not-allowed shadow-[0_0_40px_rgba(239,68,68,0.25)]'>
                {loading ? (
                  <><div className='w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin' /> Setting up...</>
                ) : (
                  <><BsCameraVideoFill size={16} /> Start Live Interview</>
                )}
              </button>
            </motion.div>

            {/* RIGHT — Preview + Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='space-y-4'>

              {/* Camera preview */}
              <div className='bg-[#0c0c0c] border border-white/[0.07] rounded-2xl overflow-hidden'>
                <div className='relative h-48 bg-[#0a0a0a] flex items-center justify-center'>
                  <div className='text-center'>
                    <div className='w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08]
                      flex items-center justify-center mx-auto mb-3'>
                      <BsCameraVideoFill size={24} className='text-white/20' />
                    </div>
                    <p className='text-xs text-white/25'>Camera will start when you begin</p>
                  </div>
                  <div className='absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1
                    rounded-full bg-black/60 border border-white/[0.08]'>
                    <span className='w-1.5 h-1.5 rounded-full bg-white/20' />
                    <span className='text-[10px] text-white/30'>Preview</span>
                  </div>
                </div>

                {/* AI interviewer preview */}
                <div className='flex items-center gap-3 p-4 border-t border-white/[0.06]'>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.seed}&backgroundColor=1a1a2e`}
                    alt='AI' className='w-10 h-10 rounded-full border border-white/[0.1]' />
                  <div>
                    <p className='text-sm font-semibold text-white/80'>{avatar.name}</p>
                    <p className='text-xs text-white/35'>{avatar.title} · {avatar.company}</p>
                  </div>
                  <div className='ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400'>
                    <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot' />
                    AI Ready
                  </div>
                </div>
              </div>

              {/* What to expect */}
              <div className='bg-[#0c0c0c] border border-white/[0.07] rounded-2xl p-5'>
                <p className='text-[10px] text-white/25 uppercase tracking-[0.2em] mb-4'>
                  What to expect
                </p>
                <div className='space-y-3'>
                  {[
                    { step: '01', title: 'AI speaks the question', desc: 'Listen carefully, then respond via mic', color: 'text-emerald-400' },
                    { step: '02', title: 'You answer via voice', desc: 'Your speech is transcribed in real-time', color: 'text-sky-400' },
                    { step: '03', title: 'AI evaluates your answer', desc: 'Score + feedback after each question', color: 'text-amber-400' },
                    { step: '04', title: 'Full report at the end', desc: 'Score, integrity, detailed breakdown', color: 'text-violet-400' },
                  ].map(s => (
                    <div key={s.step} className='flex items-start gap-3'>
                      <span className={`text-[10px] font-black ${s.color} flex-shrink-0 mt-0.5`}>
                        {s.step}
                      </span>
                      <div>
                        <p className='text-xs font-semibold text-white/70'>{s.title}</p>
                        <p className='text-[11px] text-white/30 mt-0.5'>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-cheat notice */}
              <div className='bg-amber-500/[0.04] border border-amber-500/15 rounded-xl p-4 space-y-2'>
                <div className='flex items-center gap-2 mb-1'>
                  <BsShieldFill size={11} className='text-amber-400' />
                  <p className='text-[11px] text-amber-400 font-semibold'>AI Proctoring Active</p>
                </div>
                {[
                  { icon: <BsEyeSlashFill size={9} />, text: 'Face must stay in frame throughout' },
                  { icon: <BsPeopleFill size={9} />, text: 'Only 1 person allowed on camera' },
                  { icon: <BsVolumeMuteFill size={9} />, text: 'Only your voice should be audible' },
                  { icon: <BsWindowDash size={9} />, text: 'Do not switch tabs or windows' },
                ].map((r, i) => (
                  <div key={i} className='flex items-center gap-2 text-[11px] text-white/35'>
                    <span className='text-amber-400/60'>{r.icon}</span> {r.text}
                  </div>
                ))}
                <p className='text-[10px] text-white/20 pt-1 border-t border-white/[0.05]'>
                  3 violations = automatic termination + integrity score penalty
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════
  // CONNECTING
  // ════════════════════════════
  if (phase === 'connecting') {
    return (
      <div className='min-h-screen bg-[#050505] flex items-center justify-center'
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&display=swap'); .v-title{font-family:'Sora',sans-serif}`}</style>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className='text-center'>

          {/* Pulsing avatar */}
          <div className='relative w-32 h-32 mx-auto mb-8'>
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className='absolute inset-0 rounded-full bg-emerald-400/20' />
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0, 0.15] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className='absolute inset-0 rounded-full bg-emerald-400/10' />
            <div className='relative w-full h-full rounded-full overflow-hidden
              border-2 border-emerald-500/40 bg-[#0d0d0d]'>
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.seed}&backgroundColor=1a1a2e&clothingColor=65c9ff`}
                alt='AI' className='w-full h-full object-cover'
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
              />
              <div className='w-full h-full items-center justify-center text-4xl hidden'>🤖</div>
            </div>
          </div>

          <p className='v-title text-xl font-bold text-white mb-1'>
            Connecting to {avatar.name}
          </p>
          <p className='text-white/30 text-sm mb-2'>{avatar.title} · {avatar.company}</p>
          <p className='text-white/20 text-xs mb-8'>Setting up your interview session...</p>

          {/* Steps */}
          <div className='flex items-center gap-2 mb-8 justify-center'>
            {['Camera', 'Mic', 'AI Ready'].map((s, i) => (
              <React.Fragment key={s}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.4 }}
                  className='flex items-center gap-1.5 px-3 py-1.5 rounded-full
                    bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]'>
                  <BsCheckCircleFill size={10} />
                  {s}
                </motion.div>
                {i < 2 && <span className='text-white/10 text-xs'>→</span>}
              </React.Fragment>
            ))}
          </div>

          <div className='flex items-center justify-center gap-1.5'>
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className='w-2 h-2 rounded-full bg-emerald-400' />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // ════════════════════════════
  // REPORT
  // ════════════════════════════
  if (phase === 'report') {
    if (!report) {
      return (
        <div className='min-h-screen bg-[#050505] flex items-center justify-center'>
          <div className='text-center'>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className='w-10 h-10 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full mx-auto mb-4' />
            <p className='text-white/50 text-sm' style={{ fontFamily: "'Sora',sans-serif" }}>
              Generating your report...
            </p>
          </div>
        </div>
      )
    }

    const sc = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400'
    const bc = (s) => s >= 80 ? 'bg-emerald-400' : s >= 60 ? 'bg-amber-400' : 'bg-red-400'

    return (
      <div className='min-h-screen bg-[#050505] text-white'
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&display=swap'); .v-title{font-family:'Sora',sans-serif}`}</style>

        <div className='pointer-events-none fixed inset-0'>
          <div className='absolute w-[500px] h-[500px] bg-emerald-500 opacity-[0.05] blur-[180px] rounded-full -top-40 -left-40' />
        </div>

        {/* Top bar */}
        <div className='relative z-10 flex items-center justify-between px-6 py-4
          border-b border-white/[0.06]'>
          <div className='flex items-center gap-2 text-white/30 text-sm'>
            <BsCameraVideoFill size={14} className='text-red-400' />
            Live Interview Report
          </div>
          <div className='text-[11px] text-white/25'>{report.totalTime} · {report.sessionConfig?.role}</div>
        </div>

        <div className='relative z-10 max-w-3xl mx-auto px-6 py-12 space-y-5'>

          {/* Score hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className='relative bg-[#0d0d0d] border border-white/[0.07] rounded-3xl p-8 overflow-hidden'>
            <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent
              ${report.avgScore >= 80 ? 'via-emerald-500/60' : report.avgScore >= 60 ? 'via-amber-500/60' : 'via-red-500/60'}
              to-transparent`} />

            <div className='flex items-start justify-between mb-6'>
              <div>
                <p className='text-[10px] text-white/20 uppercase tracking-[0.2em] mb-2'>Overall Score</p>
                <div className='flex items-end gap-2'>
                  <span className={`v-title text-7xl font-black leading-none ${sc(report.avgScore)}`}>
                    {report.avgScore}
                  </span>
                  <span className='text-white/20 text-2xl mb-2'>/100</span>
                </div>
              </div>
              <div className='text-right space-y-2.5'>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold
                  ${report.recommendation === 'Ready' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : report.recommendation === 'Needs Practice' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {report.recommendation === 'Ready' ? '🎉' : '📚'} {report.recommendation}
                </div>
                <div className={`flex items-center justify-end gap-1.5 text-[11px] font-medium
                  px-3 py-1.5 rounded-xl border
                  ${report.sessionConfig?.violations === 0
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  <BsShieldFill size={10} />
                  Integrity {report.sessionConfig?.integrityScore ?? 100}%
                </div>
                <div className='text-[11px] text-white/25 text-right'>
                  {report.answers?.length || 0} questions · {report.totalTime}
                </div>
              </div>
            </div>

            <div className='h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3'>
              <motion.div initial={{ width: 0 }} animate={{ width: `${report.avgScore}%` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                className={`h-full rounded-full ${bc(report.avgScore)}`} />
            </div>

            {report.overallFeedback && (
              <p className='text-white/35 text-xs leading-relaxed border-t border-white/[0.05] pt-4'>
                {report.overallFeedback}
              </p>
            )}
          </motion.div>

          {/* Strengths + Weaknesses */}
          {(report.strengths?.length > 0 || report.weaknesses?.length > 0) && (
            <div className='grid sm:grid-cols-2 gap-4'>
              {report.strengths?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className='bg-emerald-500/[0.03] border border-emerald-500/15 rounded-2xl p-5'>
                  <p className='text-[10px] text-emerald-400/70 uppercase tracking-widest font-semibold mb-3'>
                    ✅ Strengths
                  </p>
                  <ul className='space-y-2'>
                    {report.strengths.map((s, i) => (
                      <li key={i} className='text-xs text-white/50 leading-relaxed flex items-start gap-2'>
                        <span className='text-emerald-400 flex-shrink-0'>•</span> {s}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {report.weaknesses?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className='bg-red-500/[0.03] border border-red-500/15 rounded-2xl p-5'>
                  <p className='text-[10px] text-red-400/70 uppercase tracking-widest font-semibold mb-3'>
                    ⚠️ Weaknesses
                  </p>
                  <ul className='space-y-2'>
                    {report.weaknesses.map((w, i) => (
                      <li key={i} className='text-xs text-white/50 leading-relaxed flex items-start gap-2'>
                        <span className='text-red-400 flex-shrink-0'>•</span> {w}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          )}

          {/* Q&A Breakdown */}
          {report.answers?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className='bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden'>
              <div className='px-5 py-4 border-b border-white/[0.05]'>
                <p className='text-[10px] text-white/25 uppercase tracking-widest font-medium'>
                  Question Breakdown
                </p>
              </div>
              <div className='divide-y divide-white/[0.04]'>
                {report.answers.map((ans, i) => (
                  <div key={i} className='p-5'>
                    <div className='flex items-start justify-between gap-4 mb-2'>
                      <div className='flex items-center gap-2 flex-shrink-0'>
                        <span className='text-[9px] text-white/25 font-bold'>Q{i + 1}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full
                          ${ans.type === 'Technical' ? 'bg-sky-500/10 text-sky-400'
                            : 'bg-amber-500/10 text-amber-400'}`}>
                          {ans.type}
                        </span>
                      </div>
                      <span className={`v-title text-lg font-black flex-shrink-0 ${sc(ans.score)}`}>
                        {ans.score}
                      </span>
                    </div>
                    <p className='text-xs text-white/60 font-medium mb-1.5 leading-relaxed'>
                      {ans.question}
                    </p>
                    <div className='h-1 bg-white/[0.05] rounded-full overflow-hidden mb-2'>
                      <div className={`h-full rounded-full ${bc(ans.score)}`}
                        style={{ width: `${ans.score}%` }} />
                    </div>
                    {ans.evaluation?.feedback && (
                      <p className='text-[11px] text-white/30 leading-relaxed'>
                        {ans.evaluation.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='grid grid-cols-2 gap-3'>
            <button
              onClick={() => { setPhase('setup'); setAnswers([]); setCurrentQ(0); setReport(null); setViolations(0) }}
              className='flex items-center justify-center gap-2 py-3.5 rounded-2xl
                bg-white/[0.04] border border-white/[0.07] text-white/50 text-sm font-medium
                hover:bg-white/[0.08] hover:text-white/80 transition cursor-pointer'>
              <BsCameraVideoFill size={14} /> New Interview
            </button>
            <button onClick={() => navigate('/dashboard')}
              className='flex items-center justify-center gap-2 py-3.5 rounded-2xl
                bg-emerald-400 text-black font-bold text-sm cursor-pointer
                hover:bg-emerald-300 transition shadow-[0_0_20px_rgba(52,211,153,0.15)]'>
              🏠 Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  // ════════════════════════════
  // INTERVIEW — Full Screen
  // ════════════════════════════
  const question = questions[currentQ]

  // ── Violation type meta ──
  const VIOLATION_META = {
    no_face: { icon: <BsEyeSlashFill size={28} />, color: '#f87171', label: 'Face Not Detected', msg: 'Your face left the camera frame. Please stay visible and centered.' },
    multiple_faces: { icon: <BsPeopleFill size={28} />, color: '#fb923c', label: 'Multiple People Detected', msg: 'More than one person was detected. Only the candidate may be visible on camera.' },
    gaze: { icon: <BsEyeSlashFill size={28} />, color: '#fbbf24', label: 'Gaze Deviation Detected', msg: 'Your eyes moved away from the screen. Please maintain eye contact with the camera.' },
    multi_voice: { icon: <BsVolumeMuteFill size={28} />, color: '#a78bfa', label: 'Multiple Voices Detected', msg: 'Additional audio was detected. Only the candidate may speak during the interview.' },
    tab_switch: { icon: <BsWindowDash size={28} />, color: '#60a5fa', label: 'Window Left / Tab Switched', msg: 'You navigated away from the interview window. Keep this tab focused at all times.' },
  }
  const meta = VIOLATION_META[warningType] || VIOLATION_META.tab_switch
  const isTerminal = violations >= MAX_VIOLATIONS

  return (
    <>
      {/* ── Proctoring Warning Overlay ── */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className='fixed inset-0 z-[999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6'
            style={{ fontFamily: "'DM Sans',sans-serif" }}>

            <motion.div
              initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 24 }} transition={{ duration: 0.3, ease: 'easeOut' }}
              className='w-full max-w-md bg-[#0a0a0a] rounded-3xl overflow-hidden'
              style={{ border: `1px solid ${meta.color}30`, boxShadow: `0 0 80px ${meta.color}18` }}>

              {/* Top accent */}
              <div className='h-1 w-full' style={{ background: `linear-gradient(90deg,transparent,${meta.color}80,transparent)` }} />

              <div className='p-8'>
                {/* Icon */}
                <div className='w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5'
                  style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}25`, color: meta.color }}>
                  {meta.icon}
                </div>

                {/* Title */}
                <p className='text-[10px] uppercase tracking-[0.25em] mb-2 text-center'
                  style={{ color: meta.color }}>Integrity Violation · Warning {violations}/{MAX_VIOLATIONS}</p>
                <h2 className='text-xl font-black text-white text-center mb-3'
                  style={{ fontFamily: "'Sora',sans-serif" }}>
                  {isTerminal ? 'Interview Terminated' : meta.label}
                </h2>
                <p className='text-white/45 text-sm text-center leading-relaxed mb-6'>
                  {isTerminal
                    ? 'You have exceeded the maximum number of integrity violations. Your session has been ended and the report will reflect this.'
                    : meta.msg}
                </p>

                {/* Strikes */}
                <div className='flex justify-center gap-3 mb-6'>
                  {[1, 2, 3].map(i => (
                    <div key={i}
                      className='flex flex-col items-center gap-1.5'>
                      <motion.div
                        animate={i <= violations ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.4 }}
                        className='w-4 h-4 rounded-full transition-all duration-500'
                        style={{ background: i <= violations ? meta.color : 'rgba(255,255,255,0.08)' }} />
                      <span className='text-[9px]' style={{ color: i <= violations ? meta.color : 'rgba(255,255,255,0.2)' }}>
                        {i <= violations ? 'Strike' : `—`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action */}
                {!isTerminal ? (
                  <button onClick={dismissWarning}
                    className='w-full py-3.5 rounded-2xl font-bold text-sm transition cursor-pointer'
                    style={{ background: meta.color, color: '#000' }}>
                    I Understand — Continue Interview
                  </button>
                ) : (
                  <div className='flex items-center justify-center gap-2 py-3 rounded-2xl
                    bg-white/[0.04] border border-white/[0.08]'>
                    <div className='w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin' />
                    <span className='text-white/40 text-sm'>Ending session...</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='fixed inset-0 bg-[#080808] text-white flex flex-col'
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&display=swap');
          .v-title{font-family:'Sora',sans-serif}
          @keyframes live-pulse{0%,100%{opacity:1}50%{opacity:0.4}}
          .live-dot{animation:live-pulse 1.5s ease-in-out infinite}
        `}</style>

        {/* ── Top Bar ── */}
        <div className='flex items-center justify-between px-5 py-3
          border-b border-white/[0.05] bg-[#080808] flex-shrink-0 z-10'>

          <div className='flex items-center gap-3'>
            {/* LIVE badge */}
            <div className='flex items-center gap-2 px-3 py-1.5 rounded-xl
              bg-red-500/10 border border-red-500/20'>
              <BsRecordCircleFill size={10} className='text-red-400 live-dot' />
              <span className='text-[11px] text-red-400 font-bold tracking-wide'>LIVE</span>
            </div>
            <div className='h-4 w-px bg-white/[0.08]' />
            <span className='text-[11px] text-white/35 font-medium'>{sessionConfig?.role}</span>
          </div>

          <div className='flex items-center gap-4'>
            {/* Progress */}
            <div className='flex items-center gap-2'>
              <span className='text-[10px] text-white/25'>
                {currentQ + 1} / {questions.length}
              </span>
              <div className='w-24 h-1 bg-white/[0.06] rounded-full overflow-hidden'>
                <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
                  className='h-full bg-emerald-400 rounded-full' />
              </div>
            </div>

            {/* Integrity */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-medium
              ${violations === 0
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : violations === 1 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <BsShieldFill size={9} />
              {violations === 0
                ? faceModelsLoaded ? '🛡 Proctoring Active' : 'Monitoring'
                : `⚠ ${violations} violation${violations > 1 ? 's' : ''}`}
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-1.5 text-[12px] font-bold v-title ${timeTextColor}`}>
              <BsClockFill size={11} />
              {formatTime(timeLeft)}
            </div>

            {/* Total time */}
            <span className='text-[10px] text-white/20'>{formatTime(totalTime)}</span>
          </div>
        </div>

        {/* ── Main area ── */}
        <div className='flex-1 flex gap-3 p-3 min-h-0'>

          {/* ── AI Panel (large left) ── */}
          <div className='flex-1 relative rounded-2xl overflow-hidden bg-[#0d0d0d] border border-white/[0.05]'>

            {/* Background gradient */}
            <div className='absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none' />

            {/* AI Avatar center */}
            <div className='w-full h-full flex flex-col items-center justify-center gap-6'>
              <div className='relative'>
                {/* Outer rings when speaking */}
                {isSpeaking && (
                  <>
                    <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className='absolute inset-0 rounded-full bg-emerald-400/15' />
                    <motion.div animate={{ scale: [1, 1.45, 1], opacity: [0.15, 0, 0.15] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: 0.25 }}
                      className='absolute inset-0 rounded-full bg-emerald-400/10' />
                  </>
                )}

                <div className={`relative w-44 h-44 rounded-full overflow-hidden border-[3px]
                  transition-all duration-500 bg-[#0d0d0d]
                  ${isSpeaking
                    ? 'border-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.25)]'
                    : 'border-white/[0.08]'}`}>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.seed}&backgroundColor=1a1a2e&clothingColor=65c9ff`}
                    alt='AI' className='w-full h-full object-cover'
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                  />
                  <div className='w-full h-full items-center justify-center text-5xl hidden bg-[#111]'>🤖</div>
                </div>
              </div>

              {/* AI name */}
              <div className='text-center'>
                <p className='text-sm font-semibold text-white/70'>{avatar.name}</p>
                <p className='text-xs text-white/30'>{avatar.title} · {avatar.company}</p>
              </div>

              {/* Speaking waveform */}
              <AnimatePresence>
                {isSpeaking && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className='flex items-center gap-2 px-4 py-2 rounded-full
                      bg-emerald-500/10 border border-emerald-500/20'>
                    <div className='flex items-end gap-0.5 h-4'>
                      {[0, 1, 2, 3, 4].map(i => (
                        <motion.div key={i} animate={{ height: ['3px', '14px', '3px'] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
                          className='w-1 bg-emerald-400 rounded-full' />
                      ))}
                    </div>
                    <span className='text-[11px] text-emerald-400 font-medium'>Speaking...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom left name badge */}
            <div className='absolute bottom-4 left-4'>
              <div className='bg-black/70 backdrop-blur-sm px-3 py-2
                rounded-xl border border-white/[0.08]'>
                <div className='flex items-center gap-2'>
                  <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400' : 'bg-white/20'}`} />
                  <p className='text-xs font-semibold text-white/80'>{avatar.name}</p>
                </div>
                <p className='text-[10px] text-white/35 mt-0.5'>{avatar.title} · AI Interviewer</p>
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className='w-72 flex flex-col gap-3 flex-shrink-0'>

            {/* User camera + Expression Badge */}
            <div className='relative rounded-2xl overflow-hidden bg-[#0d0d0d]
              border border-white/[0.05] flex-shrink-0' style={{ height: '160px' }}>
              {camOn ? (
                <video ref={userVideoRef} autoPlay muted playsInline
                  className='w-full h-full object-cover scale-x-[-1]' />
              ) : (
                <div className='w-full h-full flex flex-col items-center justify-center gap-2'>
                  <BsCameraVideoOffFill size={24} className='text-white/15' />
                  <p className='text-[11px] text-white/20'>Camera Off</p>
                </div>
              )}

              {/* Expression badge */}
              {expression && faceModelsLoaded && (
                <div className='absolute top-2 left-2 px-2 py-1 rounded-lg
                  bg-black/70 backdrop-blur-sm border border-white/[0.08]'
                  style={{ fontSize: '10px' }}>
                  <span className='text-white/50'>
                    {expression.emotion === 'happy' ? '😊' : ''
                      + expression.emotion === 'surprised' ? '😮' : ''
                        + expression.emotion === 'fearful' ? '😰' : ''
                          + expression.emotion === 'neutral' ? '😐' : ''
                            + expression.emotion === 'disgusted' ? '😕' : ''
                              + expression.emotion === 'sad' ? '😟' : ''
                                + expression.emotion === 'angry' ? '😤' : ''}
                    {{
                      happy: '😊', surprised: '😮', fearful: '😰 Nervous',
                      neutral: '😐', disgusted: '😕', sad: '😟', angry: '😤'
                    }[expression.emotion] || '😐'}
                  </span>
                </div>
              )}

              {/* You label */}
              <div className='absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm
                px-2 py-1 rounded-lg border border-white/[0.08]'>
                <div className='flex items-center gap-1.5'>
                  {isListening && <span className='w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse' />}
                  <p className='text-[10px] text-white/50 font-medium'>You</p>
                </div>
              </div>

              {isListening && (
                <div className='absolute top-2 right-2 flex items-center gap-1.5
                  bg-red-500/20 border border-red-500/30 px-2 py-1 rounded-lg'>
                  <span className='w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse' />
                  <span className='text-[9px] text-red-400 font-medium'>REC</span>
                </div>
              )}
            </div>

            {/* Question card + AI Assistant */}
            <div className='flex-1 flex flex-col gap-3 min-h-0'>

              {/* Question card */}
              <div className='flex-1 bg-[#0d0d0d] border border-white/[0.05] rounded-2xl p-4 flex flex-col min-h-0'>
                <div className='flex items-center gap-2 mb-3'>
                  <span className='text-[9px] text-white/20 font-bold uppercase tracking-wider'>
                    Q{currentQ + 1}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full
                    ${question?.type === 'Technical' ? 'bg-sky-500/10 border border-sky-500/15 text-sky-400'
                      : question?.type === 'HR' ? 'bg-violet-500/10 border border-violet-500/15 text-violet-400'
                        : 'bg-amber-500/10 border border-amber-500/15 text-amber-400'}`}>
                    {question?.type}
                  </span>
                </div>

                <p className='text-sm font-semibold text-white/80 leading-relaxed flex-1 overflow-y-auto'>
                  {question?.question}
                </p>

                {/* Transcript */}
                {(transcript || interimText) && (
                  <div className='mt-3 pt-3 border-t border-white/[0.05]'>
                    <p className='text-[9px] text-white/20 uppercase tracking-widest mb-1.5'>
                      Your Answer
                    </p>
                    <p className='text-[11px] text-white/45 leading-relaxed max-h-20 overflow-y-auto'>
                      {transcript}
                      <span className='text-white/20 italic'>{interimText}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* ── AI Assistant Panel ── */}
              <div className='bg-[#0d0d0d] border border-white/[0.05] rounded-2xl p-3 flex-shrink-0'>
                <div className='flex items-center gap-1.5 mb-2.5'>
                  <BsLightningChargeFill size={9} className='text-emerald-400' />
                  <p className='text-[9px] text-white/30 font-semibold uppercase tracking-wider'>Live AI Assistant</p>
                </div>

                {/* Metrics Row */}
                <div className='grid grid-cols-3 gap-2 mb-2.5'>
                  {/* Confidence */}
                  <div className='bg-white/[0.03] rounded-lg p-2 text-center'>
                    <p className='text-[8px] text-white/25 mb-1'>Confidence</p>
                    <p className={`text-sm font-black
                      ${analytics.confidence >= 75 ? 'text-emerald-400'
                        : analytics.confidence >= 50 ? 'text-amber-400'
                          : analytics.wordCount < 5 ? 'text-white/20'
                            : 'text-red-400'}`}>
                      {analytics.wordCount < 5 ? '—' : `${analytics.confidence}%`}
                    </p>
                    <p className='text-[8px] text-white/20 mt-0.5'>{analytics.confidenceLabel}</p>
                  </div>

                  {/* WPM */}
                  <div className='bg-white/[0.03] rounded-lg p-2 text-center'>
                    <p className='text-[8px] text-white/25 mb-1'>Speed</p>
                    <p className={`text-sm font-black
                      ${analytics.wpm === 0 ? 'text-white/20'
                        : analytics.wpm >= 80 && analytics.wpm <= 180 ? 'text-emerald-400'
                          : 'text-amber-400'}`}>
                      {analytics.wpm === 0 ? '—' : analytics.wpm}
                    </p>
                    <p className='text-[8px] text-white/20 mt-0.5'>{analytics.wpm === 0 ? 'WPM' : analytics.wpmLabel}</p>
                  </div>

                  {/* Eye Contact */}
                  <div className='bg-white/[0.03] rounded-lg p-2 text-center'>
                    <p className='text-[8px] text-white/25 mb-1'>Eye Contact</p>
                    <p className={`text-sm font-black
                      ${eyeContact >= 75 ? 'text-emerald-400'
                        : eyeContact >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {faceModelsLoaded ? `${eyeContact}%` : '—'}
                    </p>
                    <p className='text-[8px] text-white/20 mt-0.5'>Gaze</p>
                  </div>
                </div>

                {/* Filler words */}
                {analytics.fillerCount > 0 && (
                  <div className='flex items-center gap-1.5 mb-2 px-2 py-1.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/15'>
                    <span className='text-[9px] text-amber-400'>⚠</span>
                    <p className='text-[9px] text-amber-400/80'>
                      {analytics.fillerCount} filler word{analytics.fillerCount > 1 ? 's' : ''}:
                      <span className='text-amber-400/60 ml-1 italic'>{analytics.fillerInstances.slice(0, 3).join(', ')}</span>
                    </p>
                  </div>
                )}

                {/* Keyword hints */}
                {analytics.missing.length > 0 && isListening && (
                  <div>
                    <p className='text-[8px] text-white/20 mb-1'>💡 Mention these keywords:</p>
                    <div className='flex flex-wrap gap-1'>
                      {analytics.missing.map(kw => (
                        <span key={kw}
                          className='text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/8 border border-emerald-500/15 text-emerald-400/70'>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched keywords */}
                {analytics.matched.length > 0 && (
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {analytics.matched.map(kw => (
                      <span key={kw}
                        className='text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/12 border border-emerald-500/20 text-emerald-400'>
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timer */}
            <div className='bg-[#0d0d0d] border border-white/[0.05] rounded-xl p-3 flex-shrink-0'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-1.5'>
                  <BsClockFill size={10} className={timeTextColor} />
                  <span className='text-[10px] text-white/25'>Time left</span>
                </div>
                <span className={`text-base font-black v-title ${timeTextColor}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className='h-1.5 bg-white/[0.05] rounded-full overflow-hidden'>
                <motion.div animate={{ width: `${timePercent}%` }} transition={{ duration: 0.5 }}
                  className={`h-full rounded-full transition-colors duration-500
                    ${timePercent > 50 ? 'bg-emerald-400' : timePercent > 25 ? 'bg-amber-400' : 'bg-red-400'}`} />
              </div>
              {timeLeft <= 15 && (
                <p className='text-red-400 text-[9px] mt-1 font-semibold animate-pulse'>
                  ⚠ Almost out of time!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Controls ── */}
        <div className='flex items-center justify-between px-8 py-4
          border-t border-white/[0.05] bg-[#080808] flex-shrink-0'>

          {/* Left — mic + cam */}
          <div className='flex items-center gap-2'>
            <button onClick={() => { setMicOn(!micOn); if (micOn) stopListening() }}
              className={`w-11 h-11 rounded-full flex items-center justify-center
                transition-all duration-200 cursor-pointer border
                ${micOn
                  ? 'bg-white/[0.06] border-white/[0.1] hover:bg-white/[0.1]'
                  : 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30'}`}>
              {micOn
                ? <BsMicFill size={16} className='text-white/60' />
                : <BsMicMuteFill size={16} className='text-red-400' />}
            </button>

            <button onClick={toggleCam}
              className={`w-11 h-11 rounded-full flex items-center justify-center
                transition-all duration-200 cursor-pointer border
                ${camOn
                  ? 'bg-white/[0.06] border-white/[0.1] hover:bg-white/[0.1]'
                  : 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30'}`}>
              {camOn
                ? <BsCameraVideoFill size={16} className='text-white/60' />
                : <BsCameraVideoOffFill size={16} className='text-red-400' />}
            </button>

            <div className='text-[10px] text-white/20 ml-1'>
              {micOn ? 'Mic On' : 'Mic Off'} · {camOn ? 'Cam On' : 'Cam Off'}
            </div>
          </div>

          {/* Center — submit */}
          <motion.button
            onClick={handleSubmitAnswer}
            disabled={submitting || (!transcript && !interimText)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className='flex items-center gap-2.5 px-10 py-3.5 rounded-full
              bg-emerald-400 text-black font-bold text-sm cursor-pointer
              hover:bg-emerald-300 transition-all duration-300
              disabled:opacity-30 disabled:cursor-not-allowed
              shadow-[0_0_25px_rgba(52,211,153,0.2)]'>
            {submitting ? (
              <div className='w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin' />
            ) : currentQ === questions.length - 1 ? (
              <><BsCheckCircleFill size={14} /> End Interview</>
            ) : (
              <>Submit & Next <BsArrowRight size={14} /></>
            )}
          </motion.button>

          {/* Right — end call */}
          <button onClick={() => endInterview(answers, violations)}
            className='flex items-center gap-2 px-4 py-2.5 rounded-full
              bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold
              hover:bg-red-500/20 transition cursor-pointer'>
            <BsTelephoneXFill size={13} />
            End Call
          </button>
        </div>
      </div>
      </>
    
  )
}