import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerURL } from '../App'
import Footer from '../components/Footer'
import {
  BsArrowLeft, BsCalendarCheck, BsTrophyFill, BsLightningChargeFill,
  BsClockHistory, BsRecordCircle, BsCheckCircleFill, BsRocketTakeoffFill, BsStars,
  BsCameraVideoFill, BsKeyboardFill, BsMicFill, BsTrashFill
} from 'react-icons/bs'
import { PiSealCheckFill } from 'react-icons/pi'

export default function MySessions() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await axios.get(`${ServerURL}/api/interview/my-sessions`, { withCredentials: true })
        if (data.success) {
          setSessions(data.sessions)
        }
      } catch (err) {
        console.error('Failed to fetch sessions', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-red-400 bg-red-500/10 border-red-500/20'
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session history forever?")) return
    setDeletingId(id)
    try {
      const { data } = await axios.delete(`${ServerURL}/api/interview/session/${id}`, { withCredentials: true })
      if (data.success) {
        setSessions(prev => prev.filter(s => s._id !== id))
      }
    } catch (err) {
      console.error('Delete error', err)
      alert(err.response?.data?.message || 'Failed to delete session')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className='min-h-screen bg-[#030303] text-white flex flex-col font-sans'>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap');
        .s-title { font-family: 'Sora', sans-serif; }
        .num-font { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      {/* Background glow */}
      <div className='pointer-events-none fixed inset-0 overflow-hidden z-0'>
        <div className='absolute w-[600px] h-[600px] bg-violet-600/5 blur-[150px] rounded-full top-[-10%] left-[-10%]' />
        <div className='absolute w-[500px] h-[500px] bg-sky-600/5 blur-[120px] rounded-full bottom-[-10%] right-[-5%]' />
        <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")] opacity-[0.015]' />
      </div>

      {/* Nav */}
      <div className='relative z-20 flex items-center justify-between px-6 pt-7 pb-4 max-w-7xl mx-auto w-full'>
        <motion.button onClick={() => navigate('/dashboard')}
          whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
          className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]
            text-white/50 hover:text-white transition-all cursor-pointer text-sm font-medium'>
          <BsArrowLeft size={14} /> Back
        </motion.button>
      </div>

      <div className='relative z-10 flex-1 max-w-5xl mx-auto w-full px-6 py-8'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mb-10'>
          <h1 className='s-title text-4xl md:text-5xl font-black text-white mb-3'>Interview History</h1>
          <p className='text-white/40 text-sm'>Review your past interview subsmissions, scores, and performance feedback.</p>
        </motion.div>

        {loading ? (
          <div className='grid gap-4'>
            {[1, 2, 3].map(i => (
              <div key={i} className='h-32 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse' />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className='flex flex-col items-center justify-center text-center py-24 px-6 bg-[#0a0a0a] border border-white/[0.05] rounded-3xl'>
            <div className='w-20 h-20 bg-white/[0.03] border border-white/[0.08] rounded-full flex items-center justify-center mb-6'>
              <BsRocketTakeoffFill size={30} className='text-white/20' />
            </div>
            <h3 className='s-title text-2xl font-bold text-white mb-2'>No Interviews Yet</h3>
            <p className='text-white/40 text-sm max-w-md mx-auto mb-8'>
              You haven't completed any interviews. Start an AI interview to generate your first technical report and score.
            </p>
            <button onClick={() => navigate('/dashboard')}
              className='flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-400 transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)]'>
              <BsStars size={16} /> Start New Interview
            </button>
          </motion.div>
        ) : (
          <div className='grid gap-4'>
            <AnimatePresence>
              {sessions.map((session, i) => {
                const sDate = new Date(session.completedAt || session.createdAt)
                const isPerfectScore = session.report.avgScore >= 80

                return (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className={`group relative bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 transition-all duration-300 hover:bg-[#0f0f0f] hover:border-white/[0.12] ${deletingId === session._id ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className='absolute top-0 right-10 w-32 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                    
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-0 mt-2 md:mt-0'>
                      
                      {/* Left: Role & Date */}
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <div className='px-2.5 py-1 rounded-md bg-white/[0.05] text-[10px] text-white/50 uppercase tracking-wider font-bold border border-white/[0.08]'>
                            {session.difficulty}
                          </div>
                          
                          {/* Interview Mode Badge */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border
                            ${session.mode === 'video' 
                              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                              : session.mode === 'voice'
                                ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                            }`}>
                            {session.mode === 'video' ? <BsCameraVideoFill size={10} /> 
                             : session.mode === 'voice' ? <BsMicFill size={10} />
                             : <BsKeyboardFill size={10} />}
                            {session.mode === 'video' ? 'Live Video' : session.mode === 'voice' ? 'Voice Check' : 'Standard Mock'}
                          </div>

                          {isPerfectScore && (
                            <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-bold uppercase tracking-wider'>
                              <BsTrophyFill size={10} /> Top Performer
                            </div>
                          )}
                        </div>
                        <h3 className='text-xl font-bold text-white mb-1.5 capitalize'>{session.role} Interview</h3>
                        <div className='flex items-center gap-4 text-xs text-white/30'>
                          <span className='flex items-center gap-1.5'><BsCalendarCheck size={12} /> {sDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className='flex items-center gap-1.5'><BsClockHistory size={12} /> {sDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className='flex items-center gap-1.5'><BsRecordCircle size={12} /> {session.report.answered}/{session.report.totalQuestions} Answered</span>
                        </div>
                      </div>

                      {/* Right: Score & Status */}
                      <div className='flex items-center gap-6'>
                        
                        {/* Status / Feedback Snippet */}
                        <div className='hidden md:block max-w-[180px] text-right'>
                          <p className='text-[10px] text-white/30 uppercase tracking-widest mb-1'>Feedback</p>
                          <p className='text-xs text-white/60 line-clamp-2 leading-relaxed'>
                            {session.report.recommendation !== 'N/A' ? session.report.recommendation : 'Completed successfully'}
                          </p>
                        </div>

                        {/* Big Score Badge */}
                        <div className={`flex items-center justify-center flex-col min-w-[80px] h-[80px] rounded-2xl border ${getScoreColor(session.report.avgScore)}`}>
                          <p className='text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5'>Score</p>
                          <p className='num-font text-3xl font-bold leading-none'>
                            {session.report.avgScore}
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Card Footer */}
                    <div className='mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between'>
                      <span className='text-[10px] text-white/30 uppercase tracking-widest font-semibold flex items-center gap-2'>
                        Ref #{session._id.slice(-6).toUpperCase()}
                      </span>
                      
                      <div className='flex items-center gap-3'>
                        <button onClick={() => navigate(`/report/${session._id}`)}
                          className='flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all cursor-pointer text-[11px] font-bold uppercase tracking-wider'>
                          View Full Report
                        </button>
                        
                        <button onClick={() => handleDelete(session._id)} disabled={deletingId === session._id}
                          className='flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer text-[11px] font-bold uppercase tracking-wider'
                        >
                          {deletingId === session._id ? (
                            <div className='w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin' />
                          ) : (
                            <BsTrashFill size={12} />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>

                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
