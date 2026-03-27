import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Navbar from '../components/Navbar'
import axios from 'axios'
import { ServerURL } from '../App'
import { setUserData } from '../redux/userSlice'
import JDMatcherCard from '../components/JDMatcherCard'
import {
  BsPersonFill, BsFileEarmarkTextFill, BsBellFill,
  BsMicFill, BsShieldFill, BsCheckCircleFill,
  BsUpload, BsTrashFill, BsChevronRight,
  BsExclamationTriangleFill, BsCameraFill, BsSave,
  BsBarChartFill, BsLightningChargeFill, BsArrowLeft
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import Footer from '../components/Footer'

const FadeUp = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null)
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >{children}</motion.div>
  )
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: <BsPersonFill size={15} /> },
  { id: 'resume', label: 'Resume', icon: <BsFileEarmarkTextFill size={15} /> },
  { id: 'notifications', label: 'Notifications', icon: <BsBellFill size={15} /> },
  { id: 'interview', label: 'Interview Prefs', icon: <BsMicFill size={15} /> },
  { id: 'account', label: 'Account & Security', icon: <BsShieldFill size={15} /> },
]

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full border transition-all duration-300
        cursor-pointer flex-shrink-0
        ${value ? 'bg-emerald-400/20 border-emerald-500/40' : 'bg-white/[0.05] border-white/[0.1]'}`}>
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`absolute top-1 w-4 h-4 rounded-full transition-colors duration-300
          ${value ? 'bg-emerald-400' : 'bg-white/30'}`}
      />
    </button>
  )
}

function ResumeAnalysisTabs({ analysis, scoreColor, barColor }) {
  const [tab, setTab] = React.useState('sections')
  const subTabs = [
    { id: 'sections', label: 'Sections' },
    { id: 'keywords', label: 'Keywords' },
    { id: 'improvements', label: 'Improvements' },
    { id: 'profile', label: 'Profile' },
  ]
  return (
    <div className='bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden'>
      {/* Sub-tab bar */}
      <div className='flex border-b border-white/[0.05]'>
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer
              ${tab === t.id ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/[0.04]'
                : 'text-white/25 hover:text-white/50'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className='p-5'>
        {/* Sections */}
        {tab === 'sections' && analysis.sections && (
          <div className='space-y-3'>
            {Object.entries(analysis.sections).map(([key, val]) => (
              <div key={key} className='flex items-center gap-4'>
                <p className='text-xs text-white/40 capitalize font-medium w-24 flex-shrink-0'>{key}</p>
                <div className='flex-1'>
                  <div className='h-1.5 bg-white/[0.05] rounded-full overflow-hidden'>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${val.score}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className={`h-full rounded-full ${barColor(val.score)}`} />
                  </div>
                  {val.feedback && <p className='text-[11px] text-white/25 mt-1 leading-relaxed'>{val.feedback}</p>}
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold
                    ${val.status === 'good' ? 'bg-emerald-500/10 text-emerald-400'
                      : val.status === 'average' ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'}`}>{val.status}</span>
                  <span className={`text-sm font-bold w-7 text-right ${scoreColor(val.score)}`}>{val.score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Keywords */}
        {tab === 'keywords' && analysis.keywordAnalysis && (
          <div className='space-y-4'>
            {analysis.keywordAnalysis.foundKeywords?.length > 0 && (
              <div>
                <p className='text-[10px] text-emerald-400/70 font-semibold uppercase tracking-wider mb-2'>Found ({analysis.keywordAnalysis.foundKeywords.length})</p>
                <div className='flex flex-wrap gap-1.5'>
                  {analysis.keywordAnalysis.foundKeywords.map(k => <span key={k} className='px-2.5 py-1 rounded-lg bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium'>{k}</span>)}
                </div>
              </div>
            )}
            {analysis.keywordAnalysis.missingHighValue?.length > 0 && (
              <div>
                <p className='text-[10px] text-red-400/70 font-semibold uppercase tracking-wider mb-2'>Missing ({analysis.keywordAnalysis.missingHighValue.length})</p>
                <div className='flex flex-wrap gap-1.5'>
                  {analysis.keywordAnalysis.missingHighValue.map(k => <span key={k} className='px-2.5 py-1 rounded-lg bg-red-500/8 border border-red-500/20 text-red-400 text-[11px] font-medium'>{k}</span>)}
                </div>
              </div>
            )}
            {analysis.keywordAnalysis.recommendedReplacements?.length > 0 && (
              <div>
                <p className='text-[10px] text-amber-400/70 font-semibold uppercase tracking-wider mb-2'>Word Upgrades</p>
                <div className='grid sm:grid-cols-2 gap-2'>
                  {analysis.keywordAnalysis.recommendedReplacements.map((r, i) => (
                    <div key={i} className='flex items-center gap-2 bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5'>
                      <span className='text-red-400/60 line-through text-[11px]'>{r.avoid}</span>
                      <span className='text-white/20 text-[10px]'>→</span>
                      <span className='text-emerald-400 text-[11px] font-medium'>{r.use}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Improvements */}
        {tab === 'improvements' && analysis.improvements?.length > 0 && (
          <div className='space-y-3'>
            {analysis.improvements.map((imp, i) => (
              <div key={i} className='flex items-start gap-3 p-3 hover:bg-white/[0.02] rounded-xl transition-colors'>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5
                  ${imp.priority === 'high' ? 'bg-red-500/15 text-red-400'
                    : imp.priority === 'medium' ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-white/[0.07] text-white/30'}`}>{imp.priority}</span>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-semibold text-white/70 mb-1'>{imp.section}</p>
                  {imp.current && <p className='text-[11px] text-red-400/50 line-through mb-1 leading-relaxed'>{imp.current}</p>}
                  <p className='text-[11px] text-white/50 leading-relaxed mb-1'>{imp.suggestion}</p>
                  {imp.impact && <p className='text-[10px] text-emerald-400/60 font-medium'>{imp.impact}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Profile */}
        {tab === 'profile' && analysis.extractedInfo && (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-2'>
              {[['Name', analysis.extractedInfo.name], ['Role', analysis.extractedInfo.currentRole],
              ['Experience', analysis.extractedInfo.totalExperience], ['Education', analysis.extractedInfo.education],
              ['Location', analysis.extractedInfo.location], ['Email', analysis.extractedInfo.email],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className='bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5'>
                  <p className='text-[9px] text-white/20 uppercase tracking-widest mb-0.5'>{label}</p>
                  <p className='text-xs text-white/60 font-medium truncate'>{value}</p>
                </div>
              ))}
            </div>
            {analysis.extractedInfo.topSkills?.length > 0 && (
              <div>
                <p className='text-[10px] text-white/20 uppercase tracking-widest mb-2'>Top Skills</p>
                <div className='flex flex-wrap gap-1.5'>
                  {analysis.extractedInfo.topSkills.map(s => <span key={s} className='px-2.5 py-1 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-emerald-400/80 text-[11px] font-medium'>{s}</span>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Settings() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userData } = useSelector(s => s.user)

  const [activeTab, setActiveTab] = useState('profile')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [analyzeError, setAnalyzeError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeDragging, setResumeDragging] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
  })
  const [notifications, setNotifications] = useState({
    sessionReminders: userData?.notifications?.sessionReminders ?? true,
    weeklyReport: userData?.notifications?.weeklyReport ?? true,
    productUpdates: userData?.notifications?.productUpdates ?? false,
    tipsNewsletter: userData?.notifications?.tipsNewsletter ?? true,
  })
  const [interviewPrefs, setInterviewPrefs] = useState({
    defaultMode: userData?.interviewPrefs?.defaultMode || 'text',
    difficulty: userData?.interviewPrefs?.difficulty || 'medium',
    sessionDuration: userData?.interviewPrefs?.sessionDuration || '20',
    autoFeedback: userData?.interviewPrefs?.autoFeedback ?? true,
    voiceTranscript: userData?.interviewPrefs?.voiceTranscript ?? true,
  })

  const initials = userData?.name?.slice(0, 2).toUpperCase() || '??'
  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await axios.put(ServerURL + '/api/user/update',
        { name: profile.name, notifications, interviewPrefs },
        { withCredentials: true })
      dispatch(setUserData(res.data.user))
      showSaved()
    } catch (e) { console.error(e.response?.data) }
    finally { setSaving(false) }
  }

  const handleResumeUpload = async () => {
    if (!resumeFile) return
    setSaving(true); setUploadError(null); setAnalysis(null); setAnalyzeError(null)
    try {
      const fd = new FormData()
      fd.append('resume', resumeFile)
      const res = await axios.post(ServerURL + '/api/user/resume', fd,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } })
      dispatch(setUserData(res.data.user))
      setResumeFile(null); showSaved()
    } catch (e) { setUploadError("Upload failed. Please try again.") }
    finally { setSaving(false) }
  }

  const handleResumeDrop = (e) => {
    e.preventDefault(); setResumeDragging(false); setUploadError(null)
    const file = e.dataTransfer?.files[0] || e.target?.files[0]
    if (!file) return
    if (file.type === 'application/pdf' || file.name.endsWith('.docx')) setResumeFile(file)
    else setUploadError("Only PDF or DOCX files are allowed.")
  }

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') return
    setDeleting(true)
    try {
      await axios.delete(ServerURL + '/api/user/account', { withCredentials: true })
      dispatch(setUserData(null)); navigate('/')
    } catch (e) { console.error(e.response?.data) }
    finally { setDeleting(false) }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true); setAnalyzeError(null); setAnalysis(null)
    try {
      const res = await axios.post(ServerURL + '/api/interview/analyze-resume', {}, { withCredentials: true })
      setAnalysis(res.data.analysis)
    } catch (e) { setAnalyzeError(e.response?.data?.message || "Analysis failed. Try again.") }
    finally { setAnalyzing(false) }
  }

  const handleResetAnalysis = () => {
    setAnalysis(null)
    setAnalyzeError(null)
  }

  const SaveBtn = ({ onClick }) => (
    <button onClick={onClick} disabled={saving}
      className='flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-400 text-black
        font-semibold text-sm cursor-pointer hover:bg-emerald-300 transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(52,211,153,0.2)]'>
      {saving ? <div className='w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin' />
        : saved ? <><BsCheckCircleFill size={14} /> Saved!</>
          : <><BsSave size={14} /> Save Changes</>}
    </button>
  )

  const scoreColor = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400'
  const barColor = (s) => s >= 80 ? 'bg-emerald-400' : s >= 60 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className='relative w-full min-h-screen bg-[#050505] text-white overflow-x-hidden'
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');
        .s-title { font-family: 'Sora', sans-serif; }
        @keyframes glow-p { 0%,100%{opacity:0.06} 50%{opacity:0.11} }
        .glow-p { animation: glow-p 5s ease-in-out infinite; }
      `}</style>

      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='absolute w-[600px] h-[600px] bg-emerald-500 opacity-[0.07] blur-[180px] rounded-full -top-48 -left-48 glow-p' />
        <div className='absolute w-[500px] h-[500px] bg-teal-400 opacity-[0.04] blur-[160px] rounded-full -bottom-32 -right-32 glow-p' />
        <div className='pointer-events-none absolute inset-0'
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
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
          bg-white/[0.04] border border-white/[0.07] text-white/35 text-[11px] font-medium'>
          ⚙️ Settings
        </div>
      </div>

      <main className='relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-8 pb-24'>

        <FadeUp className='mb-10'>
          <p className='text-white/25 text-xs uppercase tracking-widest mb-2'>Your account</p>
          <h1 className='s-title text-3xl md:text-4xl font-bold text-white tracking-tight'>Settings</h1>
        </FadeUp>

        <div className='flex flex-col lg:flex-row gap-6'>

          {/* Sidebar */}
          <FadeUp delay={0.05} className='lg:w-56 flex-shrink-0'>
            <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-2
              flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible'>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-200 cursor-pointer whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'}`}>
                  <span className={activeTab === tab.id ? 'text-emerald-400' : 'text-white/25'}>{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.id && <BsChevronRight size={11} className='ml-auto text-emerald-400/60' />}
                </button>
              ))}
            </div>
          </FadeUp>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <AnimatePresence mode='wait'>

              {/* ════ PROFILE ════ */}
              {activeTab === 'profile' && (
                <motion.div key='profile'
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}
                  className='space-y-4'>

                  {/* Profile summary banner */}
                  <div className='relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl overflow-hidden'>
                    <div className='absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent' />
                    {/* Mini banner */}
                    <div className='h-20 bg-gradient-to-br from-emerald-500/15 via-sky-500/8 to-violet-500/10 relative'>
                      <div className='absolute inset-0'
                        style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '16px 16px' }} />
                    </div>
                    <div className='px-6 pb-5'>
                      <div className='flex items-end justify-between -mt-9 mb-4'>
                        {/* Avatar */}
                        <div className='w-16 h-16 rounded-xl border-3 border-[#0a0a0a] bg-[#111]
                          overflow-hidden flex items-center justify-center border-2'>
                          {userData?.profilePhotoUrl ? (
                            <img src={`http://localhost:8080/${userData.profilePhotoUrl}`}
                              alt='profile' className='w-full h-full object-cover' />
                          ) : userData?.avatarSeed ? (
                            <img
                              src={`https://api.dicebear.com/9.x/${userData?.avatarStyle || 'avataaars'}/svg?seed=${userData.avatarSeed}&backgroundColor=0a0a0a`}
                              alt='avatar' className='w-full h-full object-contain p-0.5' />
                          ) : (
                            <span className='text-xl font-bold text-emerald-400'>
                              {initials}
                            </span>
                          )}
                        </div>
                        <button onClick={() => navigate('/profile')}
                          className='flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400 text-black
                            text-xs font-bold cursor-pointer hover:bg-emerald-300 transition-all duration-200
                            shadow-[0_0_20px_rgba(52,211,153,0.25)]'>
                          <BsCameraFill size={11} /> Edit Profile
                        </button>
                      </div>
                      <h3 className='s-title font-bold text-white text-lg mb-0.5'>{userData?.name}</h3>
                      {userData?.headline && (
                        <p className='text-white/40 text-xs mb-1'>{userData.headline}</p>
                      )}
                      <p className='text-white/25 text-xs'>{userData?.email}</p>
                      {userData?.bio && (
                        <p className='text-white/30 text-xs leading-relaxed mt-2 line-clamp-2'>{userData.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* CTA card */}
                  <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6'>
                    <div className='flex items-start gap-4'>
                      <div className='w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                        flex items-center justify-center flex-shrink-0'>
                        <BsPersonFill size={16} className='text-emerald-400' />
                      </div>
                      <div className='flex-1'>
                        <p className='font-semibold text-white/80 text-sm mb-1'>Your Profile Page</p>
                        <p className='text-white/30 text-xs leading-relaxed mb-4'>
                          Edit your name, bio, headline, location, social links, and profile photo / AI avatar — all in one place.
                        </p>
                        <div className='grid grid-cols-2 gap-2 mb-4'>
                          {[
                            { label: 'Photo Upload', check: !!userData?.profilePhotoUrl },
                            { label: 'AI Avatar', check: !!userData?.avatarSeed },
                            { label: 'Bio', check: !!userData?.bio },
                            { label: 'Social Links', check: !!(userData?.linkedIn || userData?.github || userData?.website) },
                          ].map(({ label, check }) => (
                            <div key={label} className={`flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg border
                              ${check ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400'
                                : 'bg-white/[0.02] border-white/[0.06] text-white/25'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${check ? 'bg-emerald-400' : 'bg-white/15'}`} />
                              {label}
                            </div>
                          ))}
                        </div>
                        <button onClick={() => navigate('/profile')}
                          className='w-full py-3 rounded-xl bg-white/[0.05] border border-white/[0.10]
                            text-white/50 text-sm font-semibold flex items-center justify-center gap-2
                            hover:bg-emerald-500/8 hover:border-emerald-500/20 hover:text-emerald-400
                            transition-all duration-300 cursor-pointer'>
                          Go to My Profile →
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* ════ RESUME ════ */}
              {activeTab === 'resume' && (
                <motion.div key='resume'
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}
                  className='space-y-4'>

                  {/* ── Upload Card ── */}
                  <div className='relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl overflow-hidden'>
                    <div className='absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent' />
                    <div className='p-7'>
                      <div className='flex items-center justify-between mb-5'>
                        <div>
                          <h2 className='s-title text-lg font-bold text-white mb-1'>Resume</h2>
                          <p className='text-white/30 text-xs'>Upload PDF or DOCX · Max 10 MB</p>
                        </div>
                        {userData?.resumeUrl && !resumeFile && (
                          <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/20'>
                            <div className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
                            <span className='text-[11px] text-emerald-400 font-semibold'>Active Resume</span>
                          </div>
                        )}
                      </div>

                      {/* Current file pill */}
                      <AnimatePresence>
                        {userData?.resumeUrl && !resumeFile && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                            className='flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4'>
                            <div className='w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0'>
                              <BsFileEarmarkTextFill size={15} className='text-emerald-400' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='text-white/70 text-xs font-semibold truncate'>{userData?.resumeOriginalName || 'resume.pdf'}</p>
                              <p className='text-white/25 text-[11px] mt-0.5'>Uploaded · Used for AI questions</p>
                            </div>
                            <BsCheckCircleFill size={13} className='text-emerald-400 flex-shrink-0' />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Drop zone */}
                      <div
                        onDrop={handleResumeDrop}
                        onDragOver={e => { e.preventDefault(); setResumeDragging(true) }}
                        onDragLeave={() => setResumeDragging(false)}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center
                          justify-center cursor-pointer transition-all duration-300 text-center group
                          ${resumeDragging ? 'border-emerald-500/70 bg-emerald-500/5 scale-[1.01]'
                            : resumeFile ? 'border-emerald-500/40 bg-emerald-500/[0.04]'
                              : 'border-white/[0.07] hover:border-emerald-500/30 hover:bg-white/[0.02]'}`}>
                        <input ref={fileInputRef} type='file' accept='.pdf,.docx' className='hidden' onChange={handleResumeDrop} />

                        <AnimatePresence mode='wait'>
                          {resumeFile ? (
                            <motion.div key='file' initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                              className='flex flex-col items-center'>
                              <div className='w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-3'>
                                <BsFileEarmarkTextFill size={22} className='text-emerald-400' />
                              </div>
                              <p className='text-white font-semibold text-sm mb-1'>{resumeFile.name}</p>
                              <p className='text-white/30 text-xs mb-1'>{(resumeFile.size / 1024).toFixed(1)} KB</p>
                              <span className='px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold uppercase mb-4'>
                                {resumeFile.name.endsWith('.docx') ? 'DOCX' : 'PDF'}
                              </span>
                              <button onClick={e => { e.stopPropagation(); setResumeFile(null); setUploadError(null) }}
                                className='text-xs text-red-400/60 hover:text-red-400 transition cursor-pointer'>
                                ✕ Remove
                              </button>
                            </motion.div>
                          ) : (
                            <motion.div key='empty' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className='flex flex-col items-center'>
                              <div className='w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4
                                group-hover:bg-emerald-500/8 group-hover:border-emerald-500/20 transition-all duration-300'>
                                <BsUpload size={20} className='text-white/25 group-hover:text-emerald-400 transition-colors duration-300' />
                              </div>
                              <p className='text-white/50 font-medium text-sm mb-1'>Drop your resume here</p>
                              <p className='text-white/20 text-xs'>or click to browse · PDF or DOCX</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <AnimatePresence>
                        {uploadError && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className='mt-3 text-red-400 text-xs flex items-center gap-1.5'>
                            <BsExclamationTriangleFill size={11} /> {uploadError}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {resumeFile && (
                          <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            onClick={handleResumeUpload} disabled={saving}
                            className='mt-4 relative flex items-center gap-2 px-6 py-3 rounded-xl overflow-hidden
                              bg-emerald-400 text-black font-bold text-sm cursor-pointer transition-all duration-300
                              hover:bg-emerald-300 disabled:opacity-50 shadow-[0_0_24px_rgba(52,211,153,0.25)] group/btn'>
                            <span className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0
                              -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700' />
                            {saving
                              ? <><div className='w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin' /> Uploading…</>
                              : <><BsUpload size={13} /> Upload Resume</>}
                          </motion.button>
                        )}
                      </AnimatePresence>

                      <div className='mt-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/12'>
                        <HiSparkles size={13} className='text-emerald-400 flex-shrink-0 mt-0.5' />
                        <p className='text-white/30 text-xs leading-relaxed'>
                          <span className='text-emerald-400/80 font-semibold'>How it works — </span>
                          Our AI reads your resume and generates interview questions specifically about your projects, skills, and experiences.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── ATS Analysis Card ── */}
                  {userData?.resumeUrl && (
                    <div className='relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl overflow-hidden'>
                      <div className='absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent' />
                      <div className='p-7'>

                        {/* Header */}
                        <div className='flex items-center justify-between mb-6'>
                          <div>
                            <div className='flex items-center gap-2 mb-1'>
                              <BsBarChartFill size={13} className='text-sky-400' />
                              <h2 className='s-title text-lg font-bold text-white'>ATS Analysis</h2>
                            </div>
                            <p className='text-white/25 text-xs'>AI-powered resume scoring · Instant feedback</p>
                          </div>
                          <div className='flex items-center gap-2'>
                            {analysis && (
                              <button onClick={handleResetAnalysis}
                                className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04]
                                  border border-white/[0.07] text-white/35 text-xs hover:text-white/60
                                  hover:bg-white/[0.07] transition-all cursor-pointer'>
                                ↺ Reset
                              </button>
                            )}
                            <button onClick={handleAnalyze} disabled={analyzing}
                              className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white
                                font-semibold text-sm cursor-pointer hover:bg-sky-400 transition-all duration-300
                                disabled:opacity-50 shadow-[0_0_20px_rgba(56,189,248,0.2)]'>
                              {analyzing
                                ? <><div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' /> Analyzing…</>
                                : <><BsBarChartFill size={12} /> {analysis ? 'Re-run' : 'Analyze Resume'}</>}
                            </button>
                          </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                          {analyzeError && (
                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className='flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-500/5
                                border border-red-500/20 text-red-400 text-xs mb-5'>
                              <BsExclamationTriangleFill size={13} className='flex-shrink-0 mt-0.5' />
                              <span>{analyzeError}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Skeleton loader */}
                        {analyzing && !analysis && (
                          <div className='space-y-3'>
                            <div className='h-28 bg-white/[0.03] rounded-2xl animate-pulse' />
                            <div className='grid grid-cols-3 gap-3'>
                              {[1, 2, 3].map(i => <div key={i} className='h-20 bg-white/[0.02] rounded-xl animate-pulse' />)}
                            </div>
                            <div className='h-40 bg-white/[0.02] rounded-2xl animate-pulse' />
                          </div>
                        )}

                        {/* ── Results ── */}
                        {analysis && (
                          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45 }} className='space-y-4'>

                            {/* Score hero */}
                            <div className='relative rounded-2xl border border-white/[0.07] overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent'>
                              <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent
                                ${analysis.atsScore >= 80 ? 'via-emerald-500/70' : analysis.atsScore >= 60 ? 'via-amber-500/70' : 'via-red-500/70'}
                                to-transparent`} />
                              <div className='p-6 flex items-center gap-8'>
                                {/* Ring */}
                                <div className='relative flex-shrink-0 w-24 h-24'>
                                  <svg className='w-full h-full -rotate-90' viewBox='0 0 96 96'>
                                    <circle cx='48' cy='48' r='38' fill='none' stroke='rgba(255,255,255,0.05)' strokeWidth='7' />
                                    <motion.circle cx='48' cy='48' r='38' fill='none'
                                      stroke={analysis.atsScore >= 80 ? '#34d399' : analysis.atsScore >= 60 ? '#fbbf24' : '#f87171'}
                                      strokeWidth='7' strokeLinecap='round'
                                      strokeDasharray={2 * Math.PI * 38}
                                      initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                                      animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - analysis.atsScore / 100) }}
                                      transition={{ duration: 1.4, ease: 'easeOut' }} />
                                  </svg>
                                  <div className='absolute inset-0 flex flex-col items-center justify-center'>
                                    <span className={`s-title text-2xl font-black leading-none
                                      ${analysis.atsScore >= 80 ? 'text-emerald-400' : analysis.atsScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                      {analysis.atsScore}
                                    </span>
                                    <span className='text-white/20 text-[10px]'>/100</span>
                                  </div>
                                </div>
                                {/* Labels */}
                                <div className='flex-1 min-w-0'>
                                  <p className='text-[10px] text-white/25 uppercase tracking-widest mb-1'>Overall ATS Score</p>
                                  <p className={`s-title text-xl font-bold mb-2
                                    ${analysis.atsScore >= 80 ? 'text-emerald-400' : analysis.atsScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {analysis.atsScore >= 80 ? 'Excellent' : analysis.atsScore >= 60 ? 'Good' : 'Needs Work'}
                                  </p>
                                  <div className='h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2 max-w-xs'>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.atsScore}%` }}
                                      transition={{ duration: 1.4, ease: 'easeOut' }}
                                      className={`h-full rounded-full ${analysis.atsScore >= 80 ? 'bg-emerald-400' : analysis.atsScore >= 60 ? 'bg-amber-400' : 'bg-red-400'}`} />
                                  </div>
                                  {analysis.overview && <p className='text-white/35 text-xs leading-relaxed'>{analysis.overview}</p>}
                                </div>
                                {/* Mini benchmarks */}
                                {(analysis.industryBenchmark || analysis.estimatedImprovementScore) && (
                                  <div className='flex flex-col gap-2 flex-shrink-0'>
                                    {analysis.industryBenchmark && (
                                      <div className='text-center bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-2.5'>
                                        <p className='text-[9px] text-white/20 uppercase tracking-widest mb-1'>Industry Avg</p>
                                        <p className='s-title text-lg font-black text-white/45'>{analysis.industryBenchmark.avgAtsScore}</p>
                                        <p className={`text-[9px] font-bold mt-0.5 ${analysis.atsScore >= analysis.industryBenchmark.avgAtsScore ? 'text-emerald-400' : 'text-red-400'}`}>
                                          {analysis.atsScore >= analysis.industryBenchmark.avgAtsScore
                                            ? `+${analysis.atsScore - analysis.industryBenchmark.avgAtsScore} above`
                                            : `${analysis.atsScore - analysis.industryBenchmark.avgAtsScore} below`}
                                        </p>
                                      </div>
                                    )}
                                    {analysis.estimatedImprovementScore && (
                                      <div className='text-center bg-emerald-500/[0.05] border border-emerald-500/20 rounded-xl px-4 py-2.5'>
                                        <p className='text-[9px] text-emerald-400/50 uppercase tracking-widest mb-1'>After Fixes</p>
                                        <p className='s-title text-lg font-black text-emerald-400'>~{analysis.estimatedImprovementScore}</p>
                                        <p className='text-[9px] text-emerald-400/40 mt-0.5'>potential</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 3 mini stats */}
                            <div className='grid grid-cols-3 gap-3'>
                              {[
                                {
                                  label: 'ATS Ready', value: analysis.atsCompatibility?.passesATS ? 'Yes ✓' : 'No ✗',
                                  color: analysis.atsCompatibility?.passesATS ? 'text-emerald-400' : 'text-red-400',
                                  bg: analysis.atsCompatibility?.passesATS ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'
                                },
                                {
                                  label: 'Keywords Found', value: analysis.keywordAnalysis?.foundKeywords?.length || 0,
                                  color: 'text-sky-400', bg: 'bg-sky-500/5 border-sky-500/15',
                                  sub: `${analysis.keywordAnalysis?.missingHighValue?.length || 0} missing`
                                },
                                {
                                  label: 'Quick Fixes', value: analysis.quickWins?.length || 0,
                                  color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/15',
                                  sub: 'easy wins'
                                },
                              ].map(({ label, value, color, bg, sub }) => (
                                <div key={label} className={`${bg} border rounded-xl p-4 text-center`}>
                                  <p className='text-[10px] text-white/20 uppercase tracking-widest mb-1'>{label}</p>
                                  <p className={`s-title text-xl font-black ${color}`}>{value}</p>
                                  {sub && <p className='text-[10px] text-white/25 mt-0.5'>{sub}</p>}
                                </div>
                              ))}
                            </div>

                            {/* Tabbed detail sections */}
                            <ResumeAnalysisTabs analysis={analysis} scoreColor={scoreColor} barColor={barColor} />

                            {/* Quick Wins */}
                            {analysis.quickWins?.length > 0 && (
                              <div className='bg-emerald-500/[0.04] border border-emerald-500/15 rounded-2xl p-5'>
                                <div className='flex items-center gap-2 mb-3'>
                                  <BsLightningChargeFill size={12} className='text-emerald-400' />
                                  <p className='text-xs font-bold text-emerald-400 uppercase tracking-wider'>Quick Wins</p>
                                  <span className='ml-auto text-[10px] text-emerald-400/50'>{analysis.quickWins.length} actions</span>
                                </div>
                                <ul className='space-y-2'>
                                  {analysis.quickWins.map((win, i) => (
                                    <li key={i} className='flex items-start gap-2.5 text-xs text-white/45'>
                                      <span className='text-emerald-400 font-bold flex-shrink-0 w-4'>{i + 1}.</span>
                                      <span className='leading-relaxed'>{win}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <button onClick={handleResetAnalysis}
                              className='w-full flex items-center justify-center gap-2 py-3 rounded-xl
                                bg-white/[0.03] border border-white/[0.06] text-white/30 text-sm
                                hover:bg-white/[0.06] hover:text-white/60 transition-all cursor-pointer'>
                              ↺ Run Fresh Analysis
                            </button>
                          </motion.div>
                        )}

                        {/* Empty state */}
                        {!analyzing && !analysis && !analyzeError && (
                          <div className='flex flex-col items-center justify-center py-14 text-center'>
                            <div className='w-16 h-16 rounded-2xl bg-sky-500/8 border border-sky-500/15
                              flex items-center justify-center mb-4'>
                              <BsBarChartFill size={24} className='text-sky-400/50' />
                            </div>
                            <p className='text-white/40 font-medium text-sm mb-1'>Ready to analyze</p>
                            <p className='text-white/20 text-xs max-w-xs'>Click "Analyze Resume" to get ATS score, keyword gaps, and personalized improvement suggestions.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* JD Matcher */}
                  {userData?.resumeUrl && <JDMatcherCard />}
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div key='notifications'
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}
                  className='space-y-4'>

                  {/* How it works card */}
                  <div className='relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl overflow-hidden'>
                    <div className='absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent' />
                    <div className='p-6 flex items-start gap-4'>
                      <div className='w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                        flex items-center justify-center flex-shrink-0'>
                        <HiSparkles size={16} className='text-emerald-400' />
                      </div>
                      <div>
                        <p className='text-white/80 font-semibold text-sm mb-1'>Smart In-App Notifications</p>
                        <p className='text-white/30 text-xs leading-relaxed'>
                          Oralytics AI monitors your practice patterns and sends intelligent in-app nudges —
                          no email required. You'll see alerts in the <span className='text-emerald-400 font-medium'>🔔 bell icon</span> in the navbar.
                          Toggle below to control what you receive.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden'>
                    <div className='px-6 py-4 border-b border-white/[0.05]'>
                      <h2 className='s-title text-base font-bold text-white'>Notification Preferences</h2>
                      <p className='text-white/30 text-xs mt-0.5'>Changes are saved immediately when you click Save.</p>
                    </div>
                    <div className='divide-y divide-white/[0.04]'>
                      {[
                        {
                          key: 'sessionReminders',
                          label: 'Practice Reminders',
                          desc: "Get a nudge if you haven't practiced in 2+ days. Auto-escalates to high priority after 5 days.",
                          trigger: 'Triggered: After 2 days of no practice sessions',
                          icon: '🎯',
                          color: 'text-sky-400',
                          bg: 'bg-sky-500/5 border-sky-500/15',
                        },
                        {
                          key: 'weeklyReport',
                          label: 'Weekly Progress Report',
                          desc: 'Every Monday, get a summary notification linking to your Analytics dashboard.',
                          trigger: 'Triggered: Every Monday automatically',
                          icon: '📊',
                          color: 'text-violet-400',
                          bg: 'bg-violet-500/5 border-violet-500/15',
                        },
                        {
                          key: 'productUpdates',
                          label: 'Product Updates',
                          desc: 'New features, improvements, and important platform announcements.',
                          trigger: 'Triggered: When new features are released',
                          icon: '📣',
                          color: 'text-pink-400',
                          bg: 'bg-pink-500/5 border-pink-500/15',
                        },
                        {
                          key: 'tipsNewsletter',
                          label: 'Interview Tips',
                          desc: 'Smart career coaching tips — STAR method, resume hacks, and more.',
                          trigger: 'Triggered: On first login and periodically',
                          icon: '💡',
                          color: 'text-amber-400',
                          bg: 'bg-amber-500/5 border-amber-500/15',
                        },
                      ].map(({ key, label, desc, trigger, icon, color, bg }) => (
                        <div key={key} className='p-5 hover:bg-white/[0.02] transition-all duration-200'>
                          <div className='flex items-start gap-4'>
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center
                              flex-shrink-0 text-lg ${bg}`}>
                              {icon}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-start justify-between gap-3 mb-1'>
                                <div>
                                  <p className='text-sm font-semibold text-white/80'>{label}</p>
                                  <p className='text-xs text-white/30 leading-relaxed mt-0.5'>{desc}</p>
                                </div>
                                <Toggle
                                  value={notifications[key]}
                                  onChange={v => setNotifications(n => ({ ...n, [key]: v }))}
                                />
                              </div>
                              <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1
                                rounded-lg text-[10px] font-medium border ${bg} ${color}`}>
                                <div className={`w-1 h-1 rounded-full ${notifications[key] ? 'bg-current opacity-100' : 'opacity-30 bg-white'}`} />
                                {notifications[key] ? trigger : 'Disabled — no notifications of this type'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className='px-5 py-4 border-t border-white/[0.05] bg-white/[0.01]'>
                      <SaveBtn onClick={handleSave} />
                    </div>
                  </div>

                  {/* Info: where notifications appear */}
                  <div className='grid grid-cols-3 gap-3'>
                    {[
                      { label: 'In-App Bell', desc: 'Real-time alerts in the navbar', icon: '🔔', active: true },
                      { label: 'Auto-Dismissed', desc: 'Expire after 2–30 days', icon: '⏱️', active: true },
                      { label: 'Email', desc: 'Not enabled (coming soon)', icon: '📧', active: false },
                    ].map(({ label, desc, icon, active }) => (
                      <div key={label} className={`rounded-xl border p-4 text-center
                        ${active ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white/[0.01] border-white/[0.04] opacity-40'}`}>
                        <p className='text-xl mb-1'>{icon}</p>
                        <p className='text-xs font-semibold text-white/60 mb-0.5'>{label}</p>
                        <p className='text-[10px] text-white/25 leading-relaxed'>{desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}


              {/* ════ INTERVIEW PREFS ════ */}
              {activeTab === 'interview' && (
                <motion.div key='interview'
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}
                  className='space-y-4'>

                  {/* How it works banner */}
                  <div className='relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl overflow-hidden'>
                    <div className='absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent' />
                    <div className='p-5 flex items-start gap-4'>
                      <div className='w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20
                        flex items-center justify-center flex-shrink-0 text-lg'>🎙️</div>
                      <div>
                        <p className='text-white/80 font-semibold text-sm mb-1'>How Interview Preferences Work</p>
                        <p className='text-white/30 text-xs leading-relaxed'>
                          These are your <span className='text-sky-400 font-medium'>default settings</span> — they pre-fill the setup screen every time you start a new interview.
                          You can always change them during session setup. Changes take effect on the <em>next</em> session you start.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main prefs card */}
                  <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden'>
                    <div className='px-6 py-4 border-b border-white/[0.05]'>
                      <h2 className='s-title text-base font-bold text-white'>Session Defaults</h2>
                      <p className='text-white/25 text-xs mt-0.5'>Pre-filled whenever you start a new interview session.</p>
                    </div>

                    <div className='divide-y divide-white/[0.04]'>

                      {/* Default Mode */}
                      <div className='p-5'>
                        <div className='flex items-start gap-3 mb-3'>
                          <div className='w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                            flex items-center justify-center text-base flex-shrink-0'>⌨️</div>
                          <div>
                            <p className='text-sm font-semibold text-white/80'>Answer Mode</p>
                            <p className='text-[11px] text-white/30 leading-relaxed'>
                              <strong className='text-emerald-400'>Text Mode</strong> — Type your answers in a textarea. Best for structured, detailed responses.
                              <strong className='text-violet-400 ml-1'>Voice Mode</strong> — Speak using your mic; AI transcribes in real-time. Simulates actual interviews.
                            </p>
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-3 ml-11'>
                          {[
                            { val: 'text', icon: '⌨️', label: 'Text Mode', desc: 'Type answers', color: 'emerald' },
                            { val: 'voice', icon: '🎤', label: 'Voice Mode', desc: '* Chrome recommended', color: 'violet' },
                          ].map(opt => (
                            <button key={opt.val}
                              onClick={() => setInterviewPrefs(p => ({ ...p, defaultMode: opt.val }))}
                              className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer
                                ${interviewPrefs.defaultMode === opt.val
                                  ? opt.color === 'emerald'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                                  : 'bg-white/[0.02] border-white/[0.07] text-white/40 hover:border-white/[0.14]'}`}>
                              <p className='text-base mb-1'>{opt.icon}</p>
                              <p className='font-semibold text-xs mb-0.5'>{opt.label}</p>
                              <p className='text-[10px] opacity-60'>{opt.desc}</p>
                              {interviewPrefs.defaultMode === opt.val && (
                                <p className={`text-[9px] mt-1.5 font-bold uppercase tracking-wide
                                  ${opt.color === 'emerald' ? 'text-emerald-400' : 'text-violet-400'}`}>
                                  ✓ Current Default
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty */}
                      <div className='p-5'>
                        <div className='flex items-start gap-3 mb-3'>
                          <div className='w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20
                            flex items-center justify-center text-base flex-shrink-0'>🎯</div>
                          <div>
                            <p className='text-sm font-semibold text-white/80'>Default Difficulty</p>
                            <p className='text-[11px] text-white/30 leading-relaxed'>
                              Controls the complexity of AI-generated questions.
                              <span className='text-emerald-400 mx-1'>Easy</span> = fresher/basic.
                              <span className='text-amber-400 mx-1'>Medium</span> = 1–3 yrs experience.
                              <span className='text-red-400 mx-1'>Hard</span> = senior-level deep dives.
                            </p>
                          </div>
                        </div>
                        <div className='grid grid-cols-3 gap-3 ml-11'>
                          {[
                            { val: 'easy', label: 'Easy', icon: '🟢', desc: 'Fresher level', act: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
                            { val: 'medium', label: 'Medium', icon: '🟡', desc: '1–3 yrs exp', act: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
                            { val: 'hard', label: 'Hard', icon: '🔴', desc: 'Senior level', act: 'bg-red-500/10 border-red-500/30 text-red-400' },
                          ].map(opt => (
                            <button key={opt.val}
                              onClick={() => setInterviewPrefs(p => ({ ...p, difficulty: opt.val }))}
                              className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer
                                ${interviewPrefs.difficulty === opt.val ? opt.act
                                  : 'bg-white/[0.02] border-white/[0.07] text-white/40 hover:border-white/[0.14]'}`}>
                              <p className='text-base mb-1'>{opt.icon}</p>
                              <p className='font-semibold text-xs mb-0.5'>{opt.label}</p>
                              <p className='text-[10px] opacity-60'>{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className='p-5'>
                        <div className='flex items-start gap-3 mb-3'>
                          <div className='w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20
                            flex items-center justify-center text-base flex-shrink-0'>⏱️</div>
                          <div>
                            <p className='text-sm font-semibold text-white/80'>Session Duration</p>
                            <p className='text-[11px] text-white/30 leading-relaxed'>
                              Determines how many questions are generated.
                              10 min → 5 Qs · 20 min → 8 Qs · 30 min → 12 Qs · 45 min → 15 Qs.
                            </p>
                          </div>
                        </div>
                        <div className='grid grid-cols-4 gap-2 ml-11'>
                          {[
                            { val: '10', qs: '5 Qs' },
                            { val: '20', qs: '8 Qs' },
                            { val: '30', qs: '12 Qs' },
                            { val: '45', qs: '15 Qs' },
                          ].map(({ val, qs }) => (
                            <button key={val}
                              onClick={() => setInterviewPrefs(p => ({ ...p, sessionDuration: val }))}
                              className={`p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer
                                ${interviewPrefs.sessionDuration === val
                                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                                  : 'bg-white/[0.02] border-white/[0.07] text-white/40 hover:border-white/[0.14]'}`}>
                              <p className='font-bold text-sm'>{val}m</p>
                              <p className='text-[10px] opacity-60 mt-0.5'>{qs}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className='divide-y divide-white/[0.03]'>
                        {[
                          {
                            key: 'autoFeedback',
                            icon: '⚡',
                            label: 'Auto Feedback',
                            desc: 'When ON — AI evaluates your answer immediately after you submit each question and shows score, strengths, and improvement tips inline. When OFF — feedback is only shown in the final report.',
                            color: 'emerald',
                          },
                          {
                            key: 'voiceTranscript',
                            icon: '📝',
                            label: 'Voice Transcript',
                            desc: 'When ON — during voice sessions, your spoken words are displayed as live text below the mic button so you can verify what was captured before submitting.',
                            color: 'violet',
                          },
                        ].map(({ key, icon, label, desc, color }) => (
                          <div key={key} className='flex items-start gap-4 p-5 hover:bg-white/[0.02] transition-all duration-200'>
                            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-base flex-shrink-0 mt-0.5
                              ${color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-violet-500/10 border-violet-500/20'}`}>
                              {icon}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-start justify-between gap-3 mb-1.5'>
                                <p className='text-sm font-semibold text-white/80'>{label}</p>
                                <Toggle
                                  value={interviewPrefs[key]}
                                  onChange={v => setInterviewPrefs(p => ({ ...p, [key]: v }))}
                                />
                              </div>
                              <p className='text-[11px] text-white/30 leading-relaxed'>{desc}</p>
                              <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-md text-[10px] font-medium
                                ${interviewPrefs[key]
                                  ? color === 'emerald' ? 'bg-emerald-500/5 border border-emerald-500/15 text-emerald-400'
                                    : 'bg-violet-500/5 border border-violet-500/15 text-violet-400'
                                  : 'bg-white/[0.03] border border-white/[0.06] text-white/25'}`}>
                                <div className={`w-1 h-1 rounded-full ${interviewPrefs[key] ? 'bg-current' : 'bg-white/20'}`} />
                                {interviewPrefs[key] ? 'Enabled — active in all sessions' : 'Disabled'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='px-5 py-4 border-t border-white/[0.05] bg-white/[0.01]'>
                      <SaveBtn onClick={handleSave} />
                    </div>
                  </div>

                  {/* Quick preview */}
                  <div className='bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5'>
                    <p className='text-[10px] text-white/25 uppercase tracking-widest mb-3'>Your Current Default Session</p>
                    <div className='grid grid-cols-4 gap-3'>
                      {[
                        { label: 'Mode', value: interviewPrefs.defaultMode === 'voice' ? '🎤 Voice' : '⌨️ Text' },
                        { label: 'Difficulty', value: interviewPrefs.difficulty?.charAt(0).toUpperCase() + interviewPrefs.difficulty?.slice(1) },
                        { label: 'Duration', value: `${interviewPrefs.sessionDuration}m` },
                        { label: 'Questions', value: interviewPrefs.sessionDuration === '10' ? '5' : interviewPrefs.sessionDuration === '20' ? '8' : interviewPrefs.sessionDuration === '30' ? '12' : '15' },
                      ].map(({ label, value }) => (
                        <div key={label} className='text-center bg-white/[0.03] border border-white/[0.06] rounded-xl p-3'>
                          <p className='text-[10px] text-white/20 mb-1'>{label}</p>
                          <p className='text-sm font-bold text-white/65'>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ════ ACCOUNT & SECURITY ════ */}
              {activeTab === 'account' && (
                <motion.div key='account'
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}
                  className='space-y-5'>
                  <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7'>
                    <h2 className='s-title text-lg font-bold text-white mb-5'>Account Information</h2>
                    <div className='divide-y divide-white/[0.04]'>
                      {[
                        { label: 'Auth Provider', value: 'Google / GitHub OAuth' },
                        { label: 'Account Type', value: userData?.plan || 'Free Plan' },
                        { label: 'Member Since', value: new Date(userData?.createdAt).getFullYear() || '2026' },
                        { label: 'User ID', value: userData?._id?.slice(0, 16) + '...' || '—' },
                        { label: 'Credits', value: `${userData?.credits || 0} credits` },
                      ].map(({ label, value }) => (
                        <div key={label} className='flex items-center justify-between py-3'>
                          <span className='text-sm text-white/35'>{label}</span>
                          <span className='text-sm text-white/65 font-medium'>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className='bg-red-500/[0.04] border border-red-500/20 rounded-2xl p-7'>
                    <div className='flex items-center gap-3 mb-5'>
                      <div className='w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20
                        flex items-center justify-center text-red-400'>
                        <BsExclamationTriangleFill size={16} />
                      </div>
                      <div>
                        <h2 className='s-title text-lg font-bold text-red-400'>Danger Zone</h2>
                        <p className='text-white/30 text-xs'>These actions are irreversible.</p>
                      </div>
                    </div>
                    <div className='bg-black/20 rounded-2xl p-6 border border-red-500/10'>
                      <p className='text-white/70 text-sm font-semibold mb-1'>Delete your account</p>
                      <p className='text-white/30 text-xs leading-relaxed mb-5'>
                        Permanently delete your account, all sessions, credits, and data. This cannot be undone.
                      </p>
                      <div className='mb-4'>
                        <label className='block text-xs text-white/30 mb-2'>
                          Type <span className='text-red-400 font-bold'>DELETE</span> to confirm
                        </label>
                        <input type='text' value={deleteConfirm}
                          onChange={e => setDeleteConfirm(e.target.value)}
                          placeholder='Type DELETE here'
                          className='w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-red-500/20
                            text-white text-sm outline-none placeholder-white/15
                            focus:border-red-500/40 transition-all duration-200' />
                      </div>
                      <button onClick={handleDelete}
                        disabled={deleteConfirm !== 'DELETE' || deleting}
                        className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/80 text-white
                          font-semibold text-sm cursor-pointer hover:bg-red-500 transition-all duration-200
                          disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(239,68,68,0.2)]'>
                        {deleting
                          ? <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin' />
                          : <><BsTrashFill size={13} /> Delete My Account</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />

    </div>

  )
}

export default Settings
