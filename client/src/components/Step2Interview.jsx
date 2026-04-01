// Step2Interview.jsx — Camera removed + Anti-cheat added
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import Editor from '@monaco-editor/react'
import { ServerURL } from '../App'
import {
  BsArrowRight, BsClockFill, BsCheckCircleFill,
  BsExclamationCircleFill, BsLightningChargeFill,
  BsStarFill, BsMicFill, BsKeyboardFill, BsStopFill,
  BsChatDotsFill, BsCodeSlash, BsShieldFill
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import Footer from './Footer'

const STAR_TEMPLATE = `Situation: [Describe the context/background]

Task: [What was your responsibility?]

Action: [What specific steps did you take?]

Result: [What was the outcome? Add metrics if possible]`

const TEMPLATES = {
  HR:         { label: 'STAR Method',   content: STAR_TEMPLATE },
  Behavioral: { label: 'STAR Method',   content: STAR_TEMPLATE },
  Technical:  { label: 'Tech Template', content: `Approach:\n\nTime Complexity:\n\nSpace Complexity:\n\nEdge Cases:` },
  default:    { label: 'Structure',     content: `Main Point:\n\nExplanation:\n\nExample:\n\nConclusion:` },
}

const AI_AVATARS = [
  { name: 'Alex',   seed: 'Alex' },
  { name: 'Jordan', seed: 'Jordan' },
  { name: 'Morgan', seed: 'Morgan' },
  { name: 'Taylor', seed: 'Taylor' },
]

const getCoachTips = (answer, questionType) => {
  const tips = []
  const words = answer.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  if (wordCount < 20 && answer.length > 0)
    tips.push({ type: 'warn', msg: 'Answer too short — add more detail' })
  if (wordCount > 20 && !answer.match(/\d+/))
    tips.push({ type: 'info', msg: 'Add numbers/metrics to strengthen your answer' })
  if ((questionType === 'HR' || questionType === 'Behavioral') &&
      !answer.toLowerCase().includes('situation') &&
      !answer.toLowerCase().includes('i was') && wordCount > 10)
    tips.push({ type: 'info', msg: 'Try STAR method: Situation → Task → Action → Result' })
  if (answer.toLowerCase().includes('i think') || answer.toLowerCase().includes('i guess'))
    tips.push({ type: 'warn', msg: 'Avoid "I think/guess" — speak with confidence' })
  if (wordCount > 30 && (answer.includes('because') || answer.includes('therefore')))
    tips.push({ type: 'good', msg: "Good reasoning! You're explaining the why ✓" })
  if (answer.match(/\d+%/) || answer.match(/\d+ (users|customers|people|times|hours)/i))
    tips.push({ type: 'good', msg: 'Great use of metrics! Interviewers love numbers ✓' })
  if (wordCount > 15 && questionType === 'Technical' &&
      !answer.toLowerCase().match(/o\(|complexity|algorithm|approach/))
    tips.push({ type: 'info', msg: 'Mention time/space complexity for technical answers' })
  if (wordCount > 100)
    tips.push({ type: 'warn', msg: 'Answer getting long — wrap up with a clear conclusion' })
  if (wordCount >= 40 && wordCount <= 100 && tips.filter(t => t.type === 'warn').length === 0)
    tips.push({ type: 'good', msg: 'Good answer length! Clear and detailed ✓' })
  return tips.slice(0, 3)
}

export default function Step2Interview({ interviewData, onComplete }) {
  const { questions, sessionConfig } = interviewData

  const [currentQ,        setCurrentQ]        = useState(0)
  const [answer,          setAnswer]          = useState('')
  const [answers,         setAnswers]         = useState([])
  const [submitting,      setSubmitting]      = useState(false)
  const [timeLeft,        setTimeLeft]        = useState(questions[0]?.timeLimit || 120)
  const [totalTime,       setTotalTime]       = useState(0)
  const [ending,          setEnding]          = useState(false)
  const [error,           setError]           = useState(null)
  const [showHint,        setShowHint]        = useState(false)
  const [hintUsed,        setHintUsed]        = useState(false)
  const [showTemplate,    setShowTemplate]    = useState(false)
  const [confidence,      setConfidence]      = useState(0)
  const [followUpMode,    setFollowUpMode]    = useState(false)
  const [followUpQ,       setFollowUpQ]       = useState('')
  const [loadingFollowUp, setLoadingFollowUp] = useState(false)
  const [hintText,        setHintText]        = useState('')
  const [loadingHint,     setLoadingHint]     = useState(false)
  const [idleSeconds,     setIdleSeconds]     = useState(0)
  const [voiceMode,       setVoiceMode]       = useState(sessionConfig?.mode === 'voice')
  const [isListening,     setIsListening]     = useState(false)
  const [voiceError,      setVoiceError]      = useState(null)
  const [interimText,     setInterimText]     = useState('')
  const [isSpeaking,      setIsSpeaking]      = useState(false)
  const [autoSpeak,       setAutoSpeak]       = useState(sessionConfig?.mode === 'voice')
  const [coachTips,       setCoachTips]       = useState([])
  const [showCoach,       setShowCoach]       = useState(true)
  const [coachVisible,    setCoachVisible]    = useState(false)
  const [codeAnswer,      setCodeAnswer]      = useState('// Write your code here\n\n')
  const [codeLang,        setCodeLang]        = useState('javascript')
  const [answerMode,      setAnswerMode]      = useState('text')
  const [avatar]                              = useState(AI_AVATARS[Math.floor(Math.random() * AI_AVATARS.length)])

  // ── Anti-Cheat States ──
  const [warningCount,   setWarningCount]   = useState(0)
  const [showWarning,    setShowWarning]    = useState(false)
  const [warningMsg,     setWarningMsg]     = useState('')
  const [terminated,     setTerminated]     = useState(false)

  const timerRef       = useRef(null)
  const totalRef       = useRef(null)
  const idleRef        = useRef(null)
  const textareaRef    = useRef(null)
  const lastAnswerRef  = useRef('')
  const recognitionRef = useRef(null)
  const speechRef      = useRef(null)
  const coachTimerRef  = useRef(null)
  const answersRef     = useRef([])

  // Keep answersRef in sync
  useEffect(() => { answersRef.current = answers }, [answers])

  const question    = followUpMode
    ? { ...questions[currentQ], question: followUpQ, type: 'Follow-up', hint: null }
    : questions[currentQ]
  const isTechnical = question?.type === 'Technical'
  const progress    = ((currentQ) / questions.length) * 100
  const MAX_VIOLATIONS = 3

  // ── Anti-Cheat System ──
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount(prev => {
          const newCount = prev + 1
          if (newCount >= MAX_VIOLATIONS) {
            setWarningMsg('🚨 Maximum violations reached! Interview is being terminated automatically.')
            setShowWarning(true)
            setTerminated(true)
            setTimeout(() => {
              clearInterval(timerRef.current)
              clearInterval(totalRef.current)
              const currentAnswers = answersRef.current
              const avgScore = currentAnswers.length > 0
                ? Math.round(currentAnswers.reduce((s, a) => s + a.score, 0) / currentAnswers.length)
                : 0
              onComplete({
                avgScore,
                totalTime: formatTime(totalTime),
                answers:   currentAnswers,
                sessionConfig: { ...sessionConfig, violations: newCount, integrityScore: 0 },
                strengths: [], weaknesses: [],
                improvements: ['Complete the interview without switching tabs'],
                overallFeedback: 'Interview terminated due to integrity violations.',
                recommendation: 'Not Ready'
              })
            }, 3000)
          } else {
            setWarningMsg(
              `⚠️ Tab switch detected! Warning ${newCount}/${MAX_VIOLATIONS}.
              Interview will auto-terminate after ${MAX_VIOLATIONS} violations.`
            )
            setShowWarning(true)
          }
          return newCount
        })
      }
    }

    const handleWindowBlur = () => {
      setWarningCount(prev => {
        if (prev < MAX_VIOLATIONS) {
          setWarningMsg('⚠️ You left the interview window! Please stay focused.')
          setShowWarning(true)
        }
        return prev
      })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [])

  // ── Auto code editor for Technical ──
  useEffect(() => {
    setAnswerMode(isTechnical && !followUpMode ? 'code' : 'text')
  }, [currentQ, followUpMode])

  // ── Confidence ──
  useEffect(() => {
    const src   = answerMode === 'code' ? codeAnswer : answer
    const words = src.trim().split(/\s+/).filter(Boolean).length
    const score = Math.min(100, Math.round(
      (words / 80) * 60 +
      (src.includes('because') || src.includes('therefore') ? 10 : 0) +
      (src.match(/\d+%?/g) ? 15 : 0) +
      (src.length > 200 ? 15 : 0)
    ))
    setConfidence(score)
  }, [answer, codeAnswer, answerMode])

  // ── Live Coach ──
  useEffect(() => {
    clearTimeout(coachTimerRef.current)
    const src = answerMode === 'code' ? codeAnswer : answer
    if (src.length < 10) { setCoachTips([]); setCoachVisible(false); return }
    coachTimerRef.current = setTimeout(() => {
      const tips = getCoachTips(src, question.type)
      setCoachTips(tips); setCoachVisible(tips.length > 0)
    }, 800)
    return () => clearTimeout(coachTimerRef.current)
  }, [answer, codeAnswer, answerMode, question.type])

  // ── Per question timer ──
  useEffect(() => {
    if (followUpMode) return
    setTimeLeft(questions[currentQ]?.timeLimit || 120)
    setShowHint(false); setHintUsed(false); setHintText('')
    setIdleSeconds(0); setCoachTips([]); setCoachVisible(false)
    setAnswer(''); setCodeAnswer('// Write your code here\n\n')
    stopListening()
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmitAnswer(true); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [currentQ, followUpMode])

  // ── Total timer ──
  useEffect(() => {
    totalRef.current = setInterval(() => setTotalTime(p => p + 1), 1000)
    return () => clearInterval(totalRef.current)
  }, [])

  // ── Idle ──
  useEffect(() => {
    const src = answerMode === 'code' ? codeAnswer : answer
    if (src === lastAnswerRef.current) {
      idleRef.current = setInterval(() => {
        setIdleSeconds(p => {
          if (p >= 30 && !hintUsed && !showHint) setShowHint(true)
          return p + 1
        })
      }, 1000)
    } else {
      lastAnswerRef.current = src; setIdleSeconds(0); clearInterval(idleRef.current)
    }
    return () => clearInterval(idleRef.current)
  }, [answer, codeAnswer, answerMode])

  // ── Auto-speak ──
  useEffect(() => {
    if (autoSpeak && question?.question) setTimeout(() => speakQuestion(question.question), 400)
    return () => stopSpeaking()
  }, [currentQ, followUpMode])

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      stopSpeaking()
      clearInterval(timerRef.current)
      clearInterval(totalRef.current)
      clearInterval(idleRef.current)
      clearTimeout(coachTimerRef.current)
    }
  }, [])

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 0.9; u.pitch = 1
    u.onstart = () => setIsSpeaking(true)
    u.onend   = () => setIsSpeaking(false)
    u.onerror = () => setIsSpeaking(false)
    speechRef.current = u
    window.speechSynthesis.speak(u)
  }
  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false) }

  const startListening = () => {
    setVoiceError(null)
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setVoiceError("Voice not supported. Please use Chrome."); return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r  = new SR()
    recognitionRef.current = r
    r.continuous = true; r.interimResults = true; r.lang = 'en-US'
    r.onstart  = () => { setIsListening(true); setVoiceError(null) }
    r.onresult = (e) => {
      let final = '', interim = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final   += e.results[i][0].transcript + ' '
        else                      interim += e.results[i][0].transcript
      }
      if (final) setAnswer(final.trim())
      setInterimText(interim)
    }
    r.onerror = (e) => {
      setIsListening(false); setInterimText('')
      if (e.error === 'no-speech')        setVoiceError("No speech detected.")
      else if (e.error === 'not-allowed') setVoiceError("Mic access denied.")
      else                                setVoiceError("Voice error. Try again.")
    }
    r.onend = () => { setIsListening(false); setInterimText('') }
    r.start()
  }
  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); setInterimText('') }
  const toggleVoice   = () => isListening ? stopListening() : startListening()
  const clearAnswer   = () => { setAnswer(''); setInterimText(''); stopListening() }

  const fetchHint = async () => {
    if (hintUsed || loadingHint) return
    setLoadingHint(true)
    try {
      const res = await axios.post(ServerURL + '/api/interview/get-hint',
        { question: question.question, role: sessionConfig.role, partialAnswer: answer },
        { withCredentials: true })
      setHintText(res.data.hint); setHintUsed(true)
    } catch {
      setHintText(question.hint || "Think about the key concepts."); setHintUsed(true)
    } finally { setLoadingHint(false) }
  }

  const applyTemplate = () => {
    const t = TEMPLATES[question.type] || TEMPLATES.default
    setAnswer(t.content); setShowTemplate(false)
    textareaRef.current?.focus()
  }

  const handleSubmitAnswer = async (autoSubmit = false) => {
    stopListening(); stopSpeaking()
    clearInterval(timerRef.current)
    setSubmitting(true); setError(null); setShowHint(false); setCoachVisible(false)
    const userAnswer = answerMode === 'code' ? `[Code Answer]\n${codeAnswer}` : answer || "(No answer provided)"
    try {
      const res = await axios.post(ServerURL + '/api/interview/evaluate-answer', {
        question: question.question, answer: userAnswer,
        role: sessionConfig.role, difficulty: sessionConfig.difficulty,
        expectedPoints: question.expectedPoints, isFollowUp: followUpMode
      }, { withCredentials: true })
      const newAnswer = {
        questionId:      followUpMode ? `${questions[currentQ].id}-followup` : question.id,
        question:        question.question, type: question.type,
        userAnswer,      evaluation: res.data.evaluation,
        score:           res.data.evaluation.score,
        timeTaken:       (question.timeLimit || 120) - timeLeft,
        metrics:         res.data.evaluation.metrics,
        hintUsed,        confidenceScore: confidence,
        isFollowUp:      followUpMode,    voiceUsed: voiceMode
      }
      const updatedAnswers = [...answers, newAnswer]
      setAnswers(updatedAnswers)
      setAnswer(''); setInterimText(''); setCodeAnswer('// Write your code here\n\n')
      setFollowUpMode(false); setFollowUpQ('')
      const shouldFollowUp = !followUpMode && !autoSubmit
        && res.data.evaluation.score < 70 && currentQ < questions.length - 1
      if (shouldFollowUp && sessionConfig.persona !== 'hr') {
        await askFollowUp(question.question, userAnswer, updatedAnswers)
      } else if (currentQ === questions.length - 1) {
        clearInterval(totalRef.current); await finishInterview(updatedAnswers)
      } else {
        setCurrentQ(prev => prev + 1)
      }
    } catch { setError("Failed to evaluate. Please try again.") }
    finally  { setSubmitting(false) }
  }

  const askFollowUp = async (prevQ, prevA, currentAnswers) => {
    setLoadingFollowUp(true)
    try {
      const res = await axios.post(ServerURL + '/api/interview/follow-up',
        { question: prevQ, answer: prevA, role: sessionConfig.role },
        { withCredentials: true })
      setFollowUpQ(res.data.followUp); setFollowUpMode(true); setTimeLeft(90)
    } catch {
      if (currentQ === questions.length - 1) { clearInterval(totalRef.current); await finishInterview(currentAnswers) }
      else setCurrentQ(prev => prev + 1)
    } finally { setLoadingFollowUp(false) }
  }

  const handleSkip = () => {
    stopListening(); stopSpeaking(); clearInterval(timerRef.current)
    if (followUpMode) {
      setFollowUpMode(false); setFollowUpQ('')
      if (currentQ === questions.length - 1) { clearInterval(totalRef.current); finishInterview(answers) }
      else setCurrentQ(prev => prev + 1)
      return
    }
    const skipped = {
      questionId: question.id, question: question.question, type: question.type,
      userAnswer: "(Skipped)",
      evaluation: { score: 0, feedback: "Skipped", strengths: [], improvements: [], metrics: { content: 0, clarity: 0, relevance: 0 } },
      score: 0, timeTaken: 0, metrics: { content: 0, clarity: 0, relevance: 0 },
      hintUsed: false, confidenceScore: 0, isFollowUp: false, voiceUsed: voiceMode
    }
    const updated = [...answers, skipped]
    setAnswers(updated); setAnswer('')
    if (currentQ === questions.length - 1) { clearInterval(totalRef.current); finishInterview(updated) }
    else setCurrentQ(prev => prev + 1)
  }

  const finishInterview = async (allAnswers) => {
    setEnding(true)
    try {
      const avgScore = Math.round(allAnswers.reduce((s, a) => s + a.score, 0) / allAnswers.length)
      const reportRes = await axios.post(ServerURL + '/api/interview/generate-report',
        { answers: allAnswers, sessionConfig, totalTime: formatTime(totalTime) },
        { withCredentials: true })
      onComplete({
        ...reportRes.data.report, avgScore,
        totalTime: formatTime(totalTime), answers: allAnswers,
        sessionConfig: {
          ...sessionConfig,
          violations:     warningCount,
          integrityScore: Math.max(0, 100 - (warningCount * 33))
        }
      })
    } catch {
      const avgScore = Math.round(allAnswers.reduce((s, a) => s + a.score, 0) / allAnswers.length)
      onComplete({
        avgScore, totalTime: formatTime(totalTime), answers: allAnswers,
        sessionConfig: { ...sessionConfig, violations: warningCount, integrityScore: Math.max(0, 100 - (warningCount * 33)) },
        strengths: [], weaknesses: [], improvements: [],
        overallFeedback: "Interview completed.",
        recommendation: avgScore >= 70 ? "Ready" : avgScore >= 50 ? "Needs Practice" : "Not Ready"
      })
    }
  }

  const timePercent   = (timeLeft / (question?.timeLimit || 120)) * 100
  const timeColor     = timePercent > 50 ? 'bg-emerald-400' : timePercent > 25 ? 'bg-amber-400' : 'bg-red-400'
  const timeTextColor = timePercent > 50 ? 'text-emerald-400' : timePercent > 25 ? 'text-amber-400' : 'text-red-400'
  const confColor     = confidence >= 70 ? 'text-emerald-400' : confidence >= 40 ? 'text-amber-400' : 'text-white/30'
  const confBar       = confidence >= 70 ? 'bg-emerald-400' : confidence >= 40 ? 'bg-amber-400' : 'bg-white/20'
  const personaLabel  = { google: '🏢 Google / FAANG', startup: '🚀 Startup', hr: '🤝 HR Round', senior: '👨‍💻 Senior Engineer' }[sessionConfig?.persona] || '🤖 AI Interviewer'
  const currentAnswer = answerMode === 'code' ? codeAnswer : answer

  if (ending || loadingFollowUp) {
    return (
      <div className='min-h-screen bg-[#050505] flex items-center justify-center'>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='text-center'>
          <div className='w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20
            flex items-center justify-center text-emerald-400 mx-auto mb-4'>
            <HiSparkles size={28} />
          </div>
          <h2 className='text-white text-xl font-bold mb-2' style={{ fontFamily: "'Sora',sans-serif" }}>
            {loadingFollowUp ? 'Preparing Follow-up...' : 'Generating Your Report...'}
          </h2>
          <p className='text-white/30 text-sm mb-6'>
            {loadingFollowUp ? 'AI is crafting a follow-up question' : 'AI is analyzing your answers'}
          </p>
          <div className='flex items-center justify-center gap-1.5'>
            {[0,1,2].map(i => (
              <motion.div key={i} animate={{ opacity: [0.3,1,0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className='w-2 h-2 rounded-full bg-emerald-400' />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      {/* ── Anti-Cheat Warning Modal ── */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl
              flex items-center justify-center p-6'
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className='w-full max-w-md bg-[#0a0a0a] border border-red-500/30
                rounded-3xl p-8 text-center shadow-[0_0_60px_rgba(239,68,68,0.15)]'
            >
              <div className='w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20
                flex items-center justify-center mx-auto mb-5'>
                <span className='text-4xl'>{warningCount >= MAX_VIOLATIONS ? '🚨' : '⚠️'}</span>
              </div>

              <h2 className='text-xl font-bold mb-3'
                style={{ fontFamily: "'Sora',sans-serif",
                  color: warningCount >= MAX_VIOLATIONS ? '#f87171' : '#fbbf24' }}>
                {warningCount >= MAX_VIOLATIONS ? 'Interview Terminated' : 'Integrity Warning'}
              </h2>

              <p className='text-white/55 text-sm leading-relaxed mb-5'>{warningMsg}</p>

              {/* Violation dots */}
              <div className='flex items-center justify-center gap-2 mb-5'>
                {[1,2,3].map(i => (
                  <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300
                    ${i <= warningCount ? 'bg-red-400 scale-110' : 'bg-white/10'}`} />
                ))}
              </div>

              {warningCount < MAX_VIOLATIONS ? (
                <>
                  <p className='text-white/25 text-xs mb-5 leading-relaxed'>
                    This interview monitors tab switching and window focus.
                    Please keep this tab active at all times.
                  </p>
                  <button
                    onClick={() => setShowWarning(false)}
                    className='w-full py-3.5 rounded-xl bg-red-500/80 text-white font-bold text-sm
                      hover:bg-red-500 transition cursor-pointer'>
                    I Understand — Resume Interview
                  </button>
                </>
              ) : (
                <p className='text-white/30 text-xs leading-relaxed'>
                  Your interview is being submitted automatically...
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='relative min-h-screen bg-[#050505] text-white'
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');
          .i-title { font-family: 'Sora', sans-serif; }
          @keyframes pulse-ring {
            0%   { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          .pulse-ring { animation: pulse-ring 1.2s ease-out infinite; }
        `}</style>

        <div className='pointer-events-none fixed inset-0 overflow-hidden'>
          <div className='absolute w-[600px] h-[600px] bg-violet-600 opacity-[0.05] blur-[180px] rounded-full top-[-10%] right-[-10%]' />
          <div className='absolute w-[500px] h-[500px] bg-cyan-600 opacity-[0.05] blur-[150px] rounded-full bottom-[-10%] left-[-10%]' />
          <div className='pointer-events-none absolute inset-0'
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.012) 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
        </div>

        {/* ── AI Avatar — Fixed Top Right ── */}
        <div className='fixed top-20 right-4 z-40'>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className='relative'
          >
            <div className='w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/30
              shadow-[0_0_20px_rgba(52,211,153,0.15)] bg-[#0d0d0d]'>
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.seed}&backgroundColor=1a1a2e&clothingColor=65c9ff`}
                alt='AI Interviewer'
                className='w-full h-full object-cover'
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
              />
              <div className='w-full h-full items-center justify-center text-2xl hidden'>🤖</div>
            </div>
            {isSpeaking && (
              <div className='absolute -bottom-1 -right-1 w-4 h-4 rounded-full
                bg-emerald-400 border-2 border-[#050505] flex items-center justify-center'>
                <motion.div animate={{ scale: [1,1.3,1] }} transition={{ duration: 0.6, repeat: Infinity }}
                  className='w-1.5 h-1.5 rounded-full bg-white' />
              </div>
            )}
            <div className='absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap'>
              <span className='text-[9px] text-white/25'>{avatar.name} · AI</span>
            </div>
            <div className='absolute -top-2 -right-2 bg-[#0d0d0d] border border-white/[0.1] rounded-lg px-1.5 py-0.5'>
              <span className={`text-[10px] font-bold ${timeTextColor}`}>{formatTime(timeLeft)}</span>
            </div>
          </motion.div>
        </div>

        {/* ── Integrity Badge — Top Left ── */}
        <div className='fixed top-20 left-6 z-40 hidden md:block'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[11px] font-bold tracking-wide backdrop-blur-md shadow-2xl
              ${warningCount === 0
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5'
                : warningCount === 1 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-amber-500/5'
                : 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-500/5'}`}
          >
            <BsShieldFill size={12} />
            {warningCount === 0 ? 'INTEGRITY: 100%' : `VIOLATIONS: ${warningCount}/${MAX_VIOLATIONS}`}
          </motion.div>
        </div>

        {/* ── Top Bar ── */}
        <div className='fixed top-0 inset-x-0 z-50 bg-[#050505]/80 backdrop-blur-2xl
          border-b border-white/[0.04] px-6 py-4'>
          <div className='max-w-4xl mx-auto flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2 px-3 py-1.5 rounded-xl
                bg-white/[0.03] border border-white/[0.05] shadow-sm'>
                <HiSparkles size={13} className='text-violet-400' />
                <span className='text-[12px] text-white/50 font-bold tracking-wide hidden sm:block'>{personaLabel}</span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border
                text-[10px] uppercase font-bold tracking-widest
                ${voiceMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  : 'bg-white/[0.04] border-white/[0.05] text-white/40'}`}>
                {voiceMode ? <><BsMicFill size={11} /> Voice</> : <><BsKeyboardFill size={11} /> Text</>}
              </div>
            </div>

            <div className='flex-1 max-w-[300px] hidden md:block'>
              <div className='flex items-center justify-between mb-1.5'>
                <span className='text-[10px] text-white/30 uppercase tracking-widest font-semibold'>
                  {followUpMode ? `Q${currentQ+1} Follow-up` : `Question ${currentQ+1} of ${questions.length}`}
                </span>
                <span className='text-[10px] text-white/30 font-bold'>{Math.round(progress)}%</span>
              </div>
              <div className='h-1.5 bg-white/[0.04] rounded-full overflow-hidden'>
                <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
                  className='h-full bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]' />
              </div>
            </div>

            <div className='flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]'>
              <div className='w-2 h-2 rounded-full bg-emerald-400 pulse-ring' />
              <div className='flex items-center gap-1.5 text-white/60 text-[12px] font-mono font-medium'>
                <span>{formatTime(totalTime)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='relative z-10 max-w-3xl mx-auto px-4 pt-28 pb-32'>
          <AnimatePresence mode='wait'>
            <motion.div key={`${currentQ}-${followUpMode}`}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
              className='space-y-4'
            >
              {/* ── Question Card ── */}
              <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6'>
                <div className='flex items-start justify-between gap-3 mb-4'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/[0.06] text-white/40'>
                      {followUpMode ? 'Follow-up' : `Q${currentQ+1}`}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                      ${followUpMode ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
                        : question.type === 'Technical' ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
                        : question.type === 'HR' ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
                      {followUpMode ? '🔁 Follow-up' : question.type}
                    </span>
                    {isTechnical && !followUpMode && (
                      <span className='text-[10px] text-sky-400/60 bg-sky-500/5 border border-sky-500/15 px-2 py-0.5 rounded-full'>
                        💻 Code editor available
                      </span>
                    )}
                    {followUpMode && (
                      <span className='text-[10px] text-violet-400/60 bg-violet-500/5 border border-violet-500/15 px-2 py-0.5 rounded-full'>
                        AI noticed a gap — clarify your answer
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    <button onClick={() => { setAutoSpeak(!autoSpeak); if (isSpeaking) stopSpeaking() }}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition cursor-pointer
                        ${autoSpeak ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-white/[0.04] border-white/[0.07] text-white/25 hover:text-white/50'}`}>
                      {autoSpeak ? '🔊 Auto On' : '🔇 Auto Off'}
                    </button>
                    <button onClick={isSpeaking ? stopSpeaking : () => speakQuestion(question.question)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border
                        text-[11px] transition cursor-pointer font-medium
                        ${isSpeaking ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-white/[0.04] border-white/[0.07] text-white/40 hover:text-white/70'}`}>
                      {isSpeaking ? '⏹ Stop' : '▶ Listen'}
                    </button>
                  </div>
                </div>
                <h2 className='i-title text-xl font-bold text-white leading-relaxed'>{question.question}</h2>
                <AnimatePresence>
                  {isSpeaking && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                      className='flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.05]'>
                      <div className='flex items-end gap-0.5 h-5'>
                        {[0,1,2,3,4].map(i => (
                          <motion.div key={i} animate={{ height: ['3px','16px','3px'] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i*0.1, ease: 'easeInOut' }}
                            className='w-1 bg-emerald-400/70 rounded-full' />
                        ))}
                      </div>
                      <p className='text-[11px] text-emerald-400/60'>AI is reading the question...</p>
                      <button onClick={stopSpeaking} className='ml-auto text-[10px] text-white/20 hover:text-white/50 cursor-pointer'>Stop ✕</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Timer + Confidence ── */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-1.5'>
                      <BsClockFill size={11} className={timeTextColor} />
                      <span className='text-[10px] text-white/30'>Time left</span>
                    </div>
                    <span className={`i-title text-xl font-black ${timeTextColor}`}>{formatTime(timeLeft)}</span>
                  </div>
                  <div className='h-1.5 bg-white/[0.06] rounded-full overflow-hidden'>
                    <motion.div animate={{ width: `${timePercent}%` }} transition={{ duration: 0.5 }}
                      className={`h-full rounded-full transition-colors duration-500 ${timeColor}`} />
                  </div>
                  {timeLeft <= 15 && <p className='text-red-400 text-[10px] mt-1.5 font-semibold animate-pulse'>⚠ Almost out of time!</p>}
                </div>
                <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-1.5'>
                      <BsStarFill size={11} className={confColor} />
                      <span className='text-[10px] text-white/30'>Answer strength</span>
                    </div>
                    <span className={`i-title text-xl font-black ${confColor}`}>{confidence}%</span>
                  </div>
                  <div className='h-1.5 bg-white/[0.06] rounded-full overflow-hidden'>
                    <motion.div animate={{ width: `${confidence}%` }} transition={{ duration: 0.3 }}
                      className={`h-full rounded-full transition-colors duration-300 ${confBar}`} />
                  </div>
                  <p className='text-[10px] text-white/20 mt-1.5'>
                    {confidence < 30 ? 'Add more detail' : confidence < 60 ? 'Good start — add examples'
                      : confidence < 80 ? 'Strong answer!' : 'Excellent answer! 🎉'}
                  </p>
                </div>
              </div>

              {/* ── Smart Hint ── */}
              <AnimatePresence>
                {showHint && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
                    className='bg-amber-500/[0.04] border border-amber-500/20 rounded-2xl p-4'>
                    <div className='flex items-start gap-3'>
                      <BsLightningChargeFill size={13} className='text-amber-400 flex-shrink-0 mt-0.5' />
                      <div className='flex-1'>
                        <div className='flex items-center justify-between mb-2'>
                          <p className='text-xs font-semibold text-amber-400'>Smart Hint</p>
                          <button onClick={() => setShowHint(false)} className='text-white/20 hover:text-white/50 text-xs cursor-pointer'>✕</button>
                        </div>
                        {hintText ? (
                          <p className='text-xs text-white/50 leading-relaxed'>{hintText}</p>
                        ) : (
                          <button onClick={fetchHint} disabled={loadingHint}
                            className='text-xs text-amber-400/70 hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5'>
                            {loadingHint
                              ? <><div className='w-3 h-3 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin' /> Loading hint...</>
                              : '💡 Get AI hint for this question'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Answer Area ── */}
              <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden'>
                {/* Toolbar */}
                <div className='flex items-center gap-2 px-4 py-3 border-b border-white/[0.05] flex-wrap'>
                  <p className='text-[10px] text-white/25 uppercase tracking-widest flex-1'>Your Answer</p>
                  {isTechnical && !followUpMode && (
                    <div className='flex items-center rounded-lg border border-white/[0.08] overflow-hidden'>
                      <button onClick={() => setAnswerMode('text')}
                        className={`flex items-center gap-1 px-3 py-1.5 text-[11px] transition cursor-pointer
                          ${answerMode === 'text' ? 'bg-white/[0.08] text-white/70' : 'text-white/30 hover:text-white/50'}`}>
                        <BsKeyboardFill size={9} /> Text
                      </button>
                      <button onClick={() => setAnswerMode('code')}
                        className={`flex items-center gap-1 px-3 py-1.5 text-[11px] transition cursor-pointer
                          ${answerMode === 'code' ? 'bg-sky-500/15 text-sky-400' : 'text-white/30 hover:text-white/50'}`}>
                        <BsCodeSlash size={9} /> Code
                      </button>
                    </div>
                  )}
                  {answerMode === 'text' && (
                    <button onClick={() => { if (voiceMode && isListening) stopListening(); setVoiceMode(!voiceMode); setVoiceError(null) }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] border transition cursor-pointer
                        ${voiceMode ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                          : 'bg-white/[0.04] border-white/[0.07] text-white/40 hover:text-white/70'}`}>
                      {voiceMode ? <><BsMicFill size={10} /> Voice</> : <><BsKeyboardFill size={10} /> Text</>}
                    </button>
                  )}
                  <button onClick={() => setShowCoach(!showCoach)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] border transition cursor-pointer
                      ${showCoach ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                        : 'bg-white/[0.04] border-white/[0.07] text-white/40 hover:text-white/70'}`}>
                    <BsChatDotsFill size={10} /> Coach
                  </button>
                  {answerMode === 'text' && !voiceMode && (
                    <div className='relative'>
                      <button onClick={() => setShowTemplate(!showTemplate)}
                        className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04]
                          border border-white/[0.07] text-white/40 text-[11px] hover:text-white/70
                          hover:bg-white/[0.07] transition cursor-pointer'>
                        📝 Template
                      </button>
                      <AnimatePresence>
                        {showTemplate && (
                          <motion.div initial={{ opacity: 0, y: 4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.97 }} transition={{ duration: 0.15 }}
                            className='absolute right-0 top-8 z-20 bg-[#111] border border-white/[0.1] rounded-xl p-3 w-52 shadow-xl'>
                            <p className='text-[10px] text-white/25 mb-2 uppercase tracking-widest'>Apply Template</p>
                            <button onClick={applyTemplate}
                              className='w-full text-left px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition cursor-pointer'>
                              <p className='text-xs font-semibold text-white/70'>{(TEMPLATES[question.type] || TEMPLATES.default).label}</p>
                              <p className='text-[10px] text-white/30 mt-0.5'>Structured format</p>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  {!hintUsed && !showHint && (
                    <button onClick={() => { setShowHint(true); fetchHint() }}
                      className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/[0.06]
                        border border-amber-500/20 text-amber-400/70 text-[11px]
                        hover:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer'>
                      💡 Hint
                    </button>
                  )}
                </div>

                {/* Code Editor */}
                {answerMode === 'code' ? (
                  <div>
                    <div className='flex items-center gap-2 px-4 py-2 border-b border-white/[0.04] bg-[#0d0d0d]'>
                      <span className='text-[10px] text-white/25 uppercase tracking-widest'>Language</span>
                      <div className='flex gap-1 ml-2'>
                        {['javascript','python','java','cpp','typescript'].map(lang => (
                          <button key={lang} onClick={() => setCodeLang(lang)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer
                              ${codeLang === lang ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                                : 'text-white/25 hover:text-white/50 border border-transparent'}`}>
                            {lang === 'cpp' ? 'C++' : lang === 'typescript' ? 'TS' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setCodeAnswer('// Write your code here\n\n')}
                        className='ml-auto text-[10px] text-white/20 hover:text-white/50 transition cursor-pointer'>
                        Reset ↺
                      </button>
                    </div>
                    <div className='h-64'>
                      <Editor height='100%' language={codeLang} value={codeAnswer}
                        onChange={val => setCodeAnswer(val || '')} theme='vs-dark'
                        options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false,
                          lineNumbers: 'on', padding: { top: 12, bottom: 12 },
                          fontFamily: "'JetBrains Mono', monospace", wordWrap: 'on' }} />
                    </div>
                  </div>
                ) : voiceMode ? (
                  <div className='p-6'>
                    <div className='flex flex-col items-center gap-5 py-4'>
                      <div className='relative'>
                        {isListening && (
                          <>
                            <div className='pulse-ring absolute inset-0 rounded-full bg-red-500/20' />
                            <div className='pulse-ring absolute inset-0 rounded-full bg-red-500/10' style={{ animationDelay: '0.4s' }} />
                          </>
                        )}
                        <button onClick={toggleVoice} disabled={submitting}
                          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center
                            transition-all duration-300 cursor-pointer disabled:opacity-40
                            ${isListening
                              ? 'bg-red-500/20 border-2 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.25)]'
                              : 'bg-violet-500/10 border-2 border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/15'}`}>
                          {isListening ? <BsStopFill size={28} className='text-red-400' /> : <BsMicFill size={26} className='text-violet-400' />}
                        </button>
                      </div>
                      <div className='text-center'>
                        <p className={`text-sm font-semibold ${isListening ? 'text-red-400' : 'text-white/50'}`}>
                          {isListening ? 'Listening... Click to stop' : 'Click mic to start speaking'}
                        </p>
                        {isListening && (
                          <motion.p animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1, repeat: Infinity }}
                            className='text-[11px] text-red-400/60 mt-1'>🔴 Recording in progress</motion.p>
                        )}
                      </div>
                    </div>
                    {isListening && interimText && (
                      <div className='mb-3 px-4 py-3 rounded-xl bg-violet-500/[0.04] border border-violet-500/15'>
                        <p className='text-[10px] text-violet-400/50 uppercase tracking-widest mb-1'>Listening...</p>
                        <p className='text-xs text-white/30 italic leading-relaxed'>{interimText}</p>
                      </div>
                    )}
                    {answer && (
                      <div className='rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden'>
                        <div className='flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]'>
                          <p className='text-[10px] text-white/25 uppercase tracking-widest'>Transcript</p>
                          <button onClick={clearAnswer} className='text-[11px] text-red-400/60 hover:text-red-400 transition cursor-pointer'>Clear ✕</button>
                        </div>
                        <p className='text-sm text-white/60 leading-relaxed px-4 py-3'>{answer}</p>
                      </div>
                    )}
                    {voiceError && (
                      <div className='mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs'>
                        <BsExclamationCircleFill size={12} /> {voiceError}
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea ref={textareaRef} value={answer} onChange={e => setAnswer(e.target.value)}
                    placeholder='Type your answer here...' rows={8} disabled={submitting}
                    className='w-full bg-transparent text-white text-sm placeholder-white/15
                      outline-none resize-none leading-relaxed px-5 py-4 disabled:opacity-50' />
                )}

                {/* Live Coach */}
                <AnimatePresence>
                  {showCoach && coachVisible && coachTips.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                      className='overflow-hidden border-t border-sky-500/15 bg-sky-500/[0.03]'>
                      <div className='px-4 py-3'>
                        <div className='flex items-center gap-1.5 mb-2'>
                          <BsChatDotsFill size={11} className='text-sky-400' />
                          <p className='text-[10px] text-sky-400/80 font-semibold uppercase tracking-wide'>Live Coach</p>
                        </div>
                        <div className='space-y-1.5'>
                          {coachTips.map((tip, i) => (
                            <motion.div key={`${tip.msg}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08 }} className='flex items-start gap-2'>
                              <span className='flex-shrink-0 mt-0.5'>
                                {tip.type === 'good' ? '✅' : tip.type === 'warn' ? '⚠️' : '💡'}
                              </span>
                              <p className={`text-[11px] leading-relaxed
                                ${tip.type === 'good' ? 'text-emerald-400/80'
                                  : tip.type === 'warn' ? 'text-amber-400/80' : 'text-sky-400/80'}`}>
                                {tip.msg}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className='flex items-center justify-between px-4 py-3 border-t border-white/[0.05]'>
                  <span className='text-[10px] text-white/20'>
                    {answerMode === 'code' ? `${codeAnswer.split('\n').length} lines` : `${answer.split(/\s+/).filter(Boolean).length} words`}
                  </span>
                  <span className='text-[10px] text-white/20'>
                    {answerMode === 'code' ? codeLang : `${answer.length} chars`}
                  </span>
                </div>
              </div>

              {error && (
                <div className='flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs'>
                  <BsExclamationCircleFill size={13} /> {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex gap-3'>
                <button onClick={handleSkip} disabled={submitting}
                  className='px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]
                    text-white/40 text-sm hover:bg-white/[0.07] hover:text-white/70
                    transition-all duration-200 cursor-pointer disabled:opacity-30 flex-shrink-0'>
                  Skip →
                </button>
                <button onClick={() => handleSubmitAnswer(false)}
                  disabled={submitting || currentAnswer.trim().length === 0 || currentAnswer === '// Write your code here\n\n'}
                  className='flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                    bg-emerald-400 text-black font-bold text-sm cursor-pointer
                    hover:bg-emerald-300 transition-all duration-300
                    disabled:opacity-40 disabled:cursor-not-allowed
                    shadow-[0_0_20px_rgba(52,211,153,0.15)]'>
                  {submitting ? (
                    <><div className='w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin' /> Evaluating...</>
                  ) : currentQ === questions.length - 1 && !followUpMode ? (
                    <><BsCheckCircleFill size={14} /> Finish Interview</>
                  ) : (
                    <>Submit Answer <BsArrowRight size={14} /></>
                  )}
                </button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Footer/>
    
    </>
  )
}