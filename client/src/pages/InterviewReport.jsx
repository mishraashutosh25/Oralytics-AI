import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerURL } from '../App'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, Award, Target, Zap, AlertTriangle, 
  CheckCircle2, MessageSquare, Clock, Download, 
  Activity, ShieldCheck, Eye, Keyboard
} from 'lucide-react'

// Helper component for small progress bars
const MetricBar = ({ label, score, colorClass }) => (
  <div className="flex-1 min-w-[120px]">
    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
      <span>{label}</span>
      <span>{score}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: `${score}%` }} 
        transition={{ duration: 1, delay: 0.5 }}
        className={`h-full ${colorClass}`} 
      />
    </div>
  </div>
)

function InterviewReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`${ServerURL}/api/interview/session/${id}`, {
          withCredentials: true
        })
        setSession(res.data.session)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [id])

  if (loading) {
    return (
      <div className="bg-[#0b0c10] min-h-screen text-slate-300 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="bg-[#0b0c10] min-h-screen text-slate-300">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-32 px-4 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <button 
            onClick={() => navigate('/my-sessions')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    )
  }

  const { report, questions, proctoringData } = session
  const score = report?.avgScore || 0
  
  const getScoreColor = (s) => {
    if (s >= 80) return "text-emerald-400"
    if (s >= 60) return "text-amber-400"
    return "text-rose-400"
  }

  const getScoreBg = (s) => {
    if (s >= 80) return "bg-emerald-400"
    if (s >= 60) return "bg-amber-400"
    return "bg-rose-400"
  }

  return (
    <div className="bg-[#030303] min-h-screen text-slate-300 flex flex-col font-sans selection:bg-indigo-500/30">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-border { border: 1px solid #e2e8f0; }
          .print-bg-dark { background: #f8fafc !important; color: #0f172a !important; }
          .print-text-dark { color: #0f172a !important; }
          * { box-shadow: none !important; }
        }
      `}</style>
      
      <div className="no-print">
        <Navbar />
      </div>
      
      {/* Background ambient glow */}
      <div className='pointer-events-none fixed inset-0 overflow-hidden z-0 no-print'>
        <div className='absolute w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full top-[-20%] left-[-10%]' />
      </div>

      <main className="relative z-10 flex-grow pt-28 pb-16 px-4 md:px-8 max-w-6xl mx-auto w-full">
        
        {/* Navigation & Actions */}
        <div className="flex justify-between items-center mb-8 no-print">
          <button 
            onClick={() => navigate('/my-sessions')}
            className="flex items-center text-slate-400 hover:text-white transition-colors group text-sm font-semibold"
          >
            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Sessions
          </button>
          
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white rounded-lg transition-all text-sm font-bold"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold uppercase tracking-wider text-white/70 print-bg-dark">
                ID: {session._id.slice(-6).toUpperCase()}
              </span>
              <span className="flex items-center text-[12px] font-medium text-slate-400 print-text-dark">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(session.completedAt || session.createdAt).toLocaleString()}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight print-text-dark">
              Premium Performance Report
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 font-bold capitalize print-bg-dark">
                {session.role}
              </span>
              <span className="px-4 py-1.5 bg-slate-800 rounded-lg text-slate-300 font-medium capitalize print-bg-dark">
                {session.difficulty} Level
              </span>
              <span className="px-4 py-1.5 bg-slate-800 rounded-lg text-slate-300 font-medium capitalize print-bg-dark">
                {session.mode} Interview
              </span>
            </div>
          </div>
          
          {/* Main Score UI */}
          <div className="flex items-center bg-[#0f0f0f] px-8 py-6 rounded-3xl border border-white/5 shadow-2xl print-border print-bg-dark">
            <div className="mr-8">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Overall Score</p>
              <p className={`text-6xl font-black ${getScoreColor(score)}`}>
                {score}<span className="text-2xl text-slate-600 font-bold">/100</span>
              </p>
              <p className="text-sm font-medium text-slate-400 mt-2">
                Verdict: <span className="text-white print-text-dark">{report?.recommendation || "Needs evaluation"}</span>
              </p>
            </div>
            <div className="h-24 w-24 relative hidden sm:block">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={getScoreColor(score).replace('text-', 'stroke-')}
                  strokeDasharray={`${score}, 100`} strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Executive Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-lg lg:col-span-2 print-border print-bg-dark"
          >
             <h3 className="text-xl font-bold text-white mb-6 flex items-center print-text-dark">
               <Award className="w-6 h-6 mr-3 text-indigo-400" /> Executive AI Summary
             </h3>
             <p className="text-slate-300 leading-relaxed text-lg print-text-dark">
               {report?.overallFeedback || "No summary available."}
             </p>
          </motion.div>

          {/* Proctoring & Integrity (if available) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-indigo-950/20 border border-indigo-500/20 rounded-3xl p-8 shadow-lg print-border print-bg-dark"
          >
            <h3 className="text-lg font-bold text-indigo-300 mb-6 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-3" /> Behavioral & Integrity
            </h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-300 mb-1 print-text-dark">
                  <span>Integrity Score</span>
                  <span className={proctoringData?.integrityScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}>
                    {proctoringData?.integrityScore || 100}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${proctoringData?.integrityScore >= 90 ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${proctoringData?.integrityScore || 100}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-indigo-500/10">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Warnings</div>
                  <div className="text-2xl font-black text-slate-200 print-text-dark flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-rose-500" />
                    {proctoringData?.violations || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Confidence</div>
                  <div className="text-2xl font-black text-slate-200 print-text-dark flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-indigo-400" />
                    {Math.round(proctoringData?.avgConfidence || 0)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Typing Speed</div>
                  <div className="text-xl font-bold text-slate-300 print-text-dark flex items-center">
                    <Keyboard className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    {Math.round(proctoringData?.avgWPM || 0)} <span className="text-[10px] ml-1">WPM</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Eye Contact</div>
                  <div className="text-xl font-bold text-slate-300 print-text-dark flex items-center">
                    <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    {Math.round(proctoringData?.avgEyeContact || 100)}%
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Strengths */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-emerald-950/10 border border-emerald-500/20 rounded-3xl p-8 shadow-lg lg:col-span-1.5 print-border print-bg-dark"
          >
            <h3 className="text-lg font-bold text-emerald-400 mb-5 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-3" /> Core Strengths
            </h3>
            <ul className="space-y-4">
              {report?.strengths?.length > 0 ? report.strengths.map((str, i) => (
                <li key={i} className="flex items-start text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-3 mt-2 flex-shrink-0" />
                  <span className="text-slate-300 leading-relaxed print-text-dark">{str}</span>
                </li>
              )) : <li className="text-slate-500 text-sm">No specific strengths recorded.</li>}
            </ul>
          </motion.div>

          {/* Weaknesses / Improvements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-rose-950/10 border border-rose-500/20 rounded-3xl p-8 shadow-lg lg:col-span-1.5 print-border print-bg-dark"
          >
            <h3 className="text-lg font-bold text-rose-400 mb-5 flex items-center">
              <Zap className="w-5 h-5 mr-3" /> Actionable Improvements
            </h3>
            <ul className="space-y-4">
              {report?.improvements?.length > 0 ? report.improvements.map((imp, i) => (
                <li key={i} className="flex items-start text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-3 mt-2 flex-shrink-0" />
                  <span className="text-slate-300 leading-relaxed print-text-dark">{imp}</span>
                </li>
              )) : (report?.weaknesses?.length > 0 ? report.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-3 mt-2 flex-shrink-0" />
                  <span className="text-slate-300 leading-relaxed print-text-dark">{w}</span>
                </li>
              )) : <li className="text-slate-500 text-sm">No specific improvements recorded.</li>)}
            </ul>
          </motion.div>
        </div>

        {/* Detailed Q&A Transcript */}
        <h2 className="text-2xl font-black text-white mb-8 mt-16 flex items-center print-text-dark">
          <MessageSquare className="w-6 h-6 mr-3 text-indigo-400" /> Question-by-Question Analysis
        </h2>
        
        <div className="space-y-8">
          {questions?.map((q, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + (idx * 0.1) }}
              className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-sm hover:border-white/10 transition-colors print-border print-bg-dark"
            >
              {/* Question Header */}
              <div className="bg-white/[0.02] p-6 border-b border-white/5 flex flex-col md:flex-row justify-between gap-6 print-bg-dark">
                <div className="font-medium text-slate-100 flex-grow text-lg print-text-dark">
                  <span className="text-indigo-400 font-black mr-2">Q{idx + 1}.</span> 
                  {q.question}
                </div>
                
                {/* Individual Score & Metrics */}
                <div className="flex-shrink-0 min-w-[200px]">
                  <div className={`text-2xl font-black mb-3 text-right ${getScoreColor(q.score)}`}>
                    {q.score}<span className="text-sm text-slate-500">/100</span>
                  </div>
                  {q.metrics && (
                    <div className="flex gap-3 mt-2">
                       <MetricBar label="Content" score={q.metrics.content} colorClass={getScoreBg(q.metrics.content)} />
                       <MetricBar label="Clarity" score={q.metrics.clarity} colorClass={getScoreBg(q.metrics.clarity)} />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Transcript Bodies */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Your Answer</h4>
                  <div className="bg-[#0f0f0f] p-5 rounded-2xl text-slate-300 text-base leading-relaxed whitespace-pre-wrap border border-white/5 print-bg-dark print-text-dark print-border">
                    {q.userAnswer === '(Skipped)' ? <span className="text-slate-500 italic">No answer provided / Skipped</span> : q.userAnswer}
                  </div>
                </div>
                
                {q.userAnswer !== '(Skipped)' && (
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-indigo-400/70 font-bold mb-3 flex items-center">
                      <Target className="w-3.5 h-3.5 mr-1.5" /> Direct AI Feedback
                    </h4>
                    <div className="bg-indigo-950/20 p-5 rounded-2xl text-indigo-200/90 text-base leading-relaxed whitespace-pre-wrap border border-indigo-500/20 print-bg-dark print-text-dark print-border">
                      {q.aiFeedback || "No detailed feedback generated for this response."}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {(!questions || questions.length === 0) && (
             <div className="text-center p-12 bg-white/5 rounded-3xl text-slate-500 border border-white/5">
               No interview transcript data available for this session.
             </div>
          )}
        </div>
        
      </main>
      
      <div className="no-print">
        <Footer />
      </div>
    </div>
  )
}

export default InterviewReport