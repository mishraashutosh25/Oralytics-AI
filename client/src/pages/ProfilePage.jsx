import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { setUserData } from '../redux/userSlice'
import { ServerURL } from '../App'
import {
  BsCameraFill, BsTrashFill, BsCheckCircleFill,
  BsGlobe2, BsLinkedin, BsGithub, BsGeoAltFill,
  BsPencilFill, BsXLg, BsPersonFill, BsBriefcaseFill,
  BsArrowLeft, BsShieldFill, BsCalendar3,
  BsStarFill, BsLightningChargeFill, BsBriefcase,
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'

// ── Avatar Styles (DiceBear) ────────────────────────────────────────────────
const AVATAR_STYLES = [
  { id: 'avataaars',        label: 'Cartoon',    color: 'emerald' },
  { id: 'bottts',           label: 'Robot',      color: 'sky' },
  { id: 'fun-emoji',        label: 'Emoji',      color: 'amber' },
  { id: 'lorelei',          label: 'Artistic',   color: 'violet' },
  { id: 'micah',            label: 'Minimal',    color: 'pink' },
  { id: 'notionists',       label: 'Notion',     color: 'orange' },
  { id: 'open-peeps',       label: 'Peeps',      color: 'teal' },
  { id: 'personas',         label: 'Persona',    color: 'red' },
]

const PRESET_SEEDS = ['Alpha', 'Nova', 'Zeta', 'Luna', 'Rex', 'Sage', 'Pixel', 'Storm', 'Blaze', 'Echo', 'Vex', 'Orbit']

const colorMap = {
  emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
  sky:     'bg-sky-500/10 border-sky-500/25 text-sky-400',
  amber:   'bg-amber-500/10 border-amber-500/25 text-amber-400',
  violet:  'bg-violet-500/10 border-violet-500/25 text-violet-400',
  pink:    'bg-pink-500/10 border-pink-500/25 text-pink-400',
  orange:  'bg-orange-500/10 border-orange-500/25 text-orange-400',
  teal:    'bg-teal-500/10 border-teal-500/25 text-teal-400',
  red:     'bg-red-500/10 border-red-500/25 text-red-400',
}

function avatarUrl(style, seed) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a0a0a`
}

// ── Field Input ───────────────────────────────────────────────────────────────
function Field({ icon, label, value, onChange, placeholder, maxLength, multiline, type = 'text' }) {
  return (
    <div>
      <label className='flex items-center gap-2 text-xs text-white/35 mb-2 font-medium uppercase tracking-wide'>
        <span className='text-white/25'>{icon}</span> {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className='w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.09]
            text-white/80 text-sm outline-none placeholder-white/15
            focus:border-white/20 focus:bg-white/[0.06] transition-all duration-200 resize-none
            leading-relaxed'
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className='w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.09]
            text-white/80 text-sm outline-none placeholder-white/15
            focus:border-white/20 focus:bg-white/[0.06] transition-all duration-200'
        />
      )}
      {maxLength && (
        <p className='text-right text-[10px] text-white/20 mt-1'>
          {value?.length || 0}/{maxLength}
        </p>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { userData } = useSelector(s => s.user)

  // Form state
  const [name,      setName]      = useState(userData?.name      || '')
  const [bio,       setBio]       = useState(userData?.bio       || '')
  const [headline,  setHeadline]  = useState(userData?.headline  || '')
  const [location,  setLocation]  = useState(userData?.location  || '')
  const [website,   setWebsite]   = useState(userData?.website   || '')
  const [linkedIn,  setLinkedIn]  = useState(userData?.linkedIn  || '')
  const [github,    setGithub]    = useState(userData?.github    || '')

  // Avatar state
  const [avatarStyle, setAvatarStyle] = useState(userData?.avatarStyle || 'avataaars')
  const [avatarSeed,  setAvatarSeed]  = useState(userData?.avatarSeed  || userData?.name || 'User')
  const [avatarTab,   setAvatarTab]   = useState('style') // 'style' | 'seed' | 'upload'
  const [showAvatarPanel, setShowAvatarPanel] = useState(false)

  // Photo upload
  const [uploading,    setUploading]    = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [dragOver,     setDragOver]     = useState(false)
  const fileInputRef = useRef(null)

  // Save state
  const [saving,   setSaving]   = useState(false)
  const [saveMsg,  setSaveMsg]  = useState(null) // { type: 'success'|'error', text }

  // ── Photo upload handler (MUST be before any early return) ──
  const handleFileSelect = useCallback(async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setSaveMsg({ type: 'error', text: 'Only image files allowed (JPG, PNG, WEBP)' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveMsg({ type: 'error', text: 'Image must be under 5MB' })
      return
    }
    // Preview
    const reader = new FileReader()
    reader.onload = e => setPhotoPreview(e.target.result)
    reader.readAsDataURL(file)
    // Upload immediately
    setUploading(true)
    try {
      const form = new FormData()
      form.append('photo', file)
      const res = await axios.post(`${ServerURL}/api/user/photo`, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      dispatch(setUserData(res.data.user))
      setSaveMsg({ type: 'success', text: 'Profile photo updated!' })
      setShowAvatarPanel(false)
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed' })
    } finally {
      setUploading(false)
    }
    setTimeout(() => setSaveMsg(null), 4000)
  }, [dispatch])

  const handleDeletePhoto = async () => {
    setUploading(true)
    try {
      const res = await axios.delete(`${ServerURL}/api/user/photo`, { withCredentials: true })
      dispatch(setUserData(res.data.user))
      setPhotoPreview(null)
      setSaveMsg({ type: 'success', text: 'Photo removed.' })
    } catch (err) {
      setSaveMsg({ type: 'error', text: 'Failed to remove photo' })
    } finally {
      setUploading(false)
    }
    setTimeout(() => setSaveMsg(null), 3000)
  }

  // ── Avatar save ──
  const handleSaveAvatar = async () => {
    setSaving(true)
    try {
      const res = await axios.put(`${ServerURL}/api/user/update`,
        { avatarSeed, avatarStyle },
        { withCredentials: true }
      )
      dispatch(setUserData(res.data.user))
      setSaveMsg({ type: 'success', text: 'Avatar saved!' })
      setShowAvatarPanel(false)
    } catch (err) {
      setSaveMsg({ type: 'error', text: 'Save failed' })
    } finally {
      setSaving(false)
    }
    setTimeout(() => setSaveMsg(null), 3000)
  }

  // ── Profile save ──
  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setSaveMsg({ type: 'error', text: 'Name must be at least 2 characters' })
      return
    }
    setSaving(true)
    try {
      const res = await axios.put(`${ServerURL}/api/user/update`, {
        name, bio, headline, location, website, linkedIn, github
      }, { withCredentials: true })
      dispatch(setUserData(res.data.user))
      setSaveMsg({ type: 'success', text: 'Profile saved successfully!' })
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.response?.data?.message || 'Save failed' })
    } finally {
      setSaving(false)
    }
    setTimeout(() => setSaveMsg(null), 4000)
  }

  const memberSince = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '2026'

  // ── Guard: redirect unauthenticated users ──
  if (!userData) {
    navigate('/auth')
    return null
  }

  // ── Current avatar/photo display ──
  const getDisplayAvatar = () => {
    if (photoPreview) return { type: 'photo', url: photoPreview }
    if (userData.profilePhotoUrl) return { type: 'photo', url: `${ServerURL}/${userData.profilePhotoUrl}` }
    if (userData.avatarSeed || avatarSeed) {
      return { type: 'dicebear', url: avatarUrl(avatarStyle, avatarSeed) }
    }
    return { type: 'initials', initials: userData.name?.slice(0, 2).toUpperCase() }
  }

  const display = getDisplayAvatar()

  return (
    <div className='min-h-screen bg-[#050505] text-white' style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');
        .p-title { font-family: 'Sora', sans-serif; }
        .glass-input:focus { box-shadow: 0 0 0 2px rgba(52,211,153,0.15); }
      `}</style>

      <Navbar />

      {/* Background */}
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='absolute w-[600px] h-[600px] bg-emerald-500 opacity-[0.04] blur-[180px] rounded-full -top-40 -right-40' />
        <div className='absolute w-[400px] h-[400px] bg-violet-500 opacity-[0.03] blur-[150px] rounded-full bottom-0 -left-20' />
        <div className='pointer-events-none absolute inset-0'
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <main className='relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-24'>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
          onClick={() => navigate(-1)}
          className='flex items-center gap-2 text-white/30 hover:text-white/60 text-sm mb-8
            transition-all duration-200 cursor-pointer'>
          <BsArrowLeft size={14} /> Back
        </motion.button>

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className='relative mb-8 rounded-3xl overflow-hidden border border-white/[0.08]'>
          {/* Gradient banner */}
          <div className='h-36 bg-gradient-to-br from-emerald-500/20 via-sky-500/10 to-violet-500/15
            relative overflow-hidden'>
            <div className='absolute inset-0'
              style={{ backgroundImage: 'radial-gradient(circle at 70% 50%,rgba(52,211,153,0.2),transparent 60%)' }} />
            <div className='pointer-events-none absolute inset-0'
              style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>

          {/* Avatar + name row */}
          <div className='bg-[#080808] px-8 pb-6'>
            <div className='flex items-end justify-between -mt-14 mb-4'>
              {/* Avatar */}
              <div className='relative group'>
                <div className='w-28 h-28 rounded-2xl overflow-hidden border-4 border-[#080808]
                  bg-[#111] flex items-center justify-center'>
                  {display.type === 'photo' ? (
                    <img src={display.url} alt='profile' className='w-full h-full object-cover' />
                  ) : display.type === 'dicebear' ? (
                    <img src={display.url} alt='avatar' className='w-full h-full object-contain p-1' />
                  ) : (
                    <span className='text-3xl font-bold text-emerald-400'>{display.initials}</span>
                  )}
                </div>
                {/* Edit overlay */}
                <button
                  onClick={() => setShowAvatarPanel(true)}
                  className='absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100
                    transition-all duration-200 flex items-center justify-center cursor-pointer
                    border-4 border-[#080808]'>
                  <div className='flex flex-col items-center gap-1'>
                    <BsCameraFill size={18} className='text-white' />
                    <span className='text-[10px] text-white font-medium'>Change</span>
                  </div>
                </button>
                {uploading && (
                  <div className='absolute inset-0 rounded-2xl bg-black/70 flex items-center justify-center border-4 border-[#080808]'>
                    <div className='w-5 h-5 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin' />
                  </div>
                )}
              </div>

              {/* Quick stats */}
              <div className='flex items-center gap-4 pb-1'>
                {[
                  { icon: <BsLightningChargeFill size={12} />, label: 'Credits', value: userData?.credits || 0, color: 'text-emerald-400' },
                  { icon: <BsCalendar3 size={12} />, label: 'Member since', value: memberSince, color: 'text-sky-400' },
                  { icon: <BsShieldFill size={12} />, label: 'Status', value: 'Active', color: 'text-violet-400' },
                ].map(({ icon, label, value, color }) => (
                  <div key={label} className='text-center px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]'>
                    <div className={`flex items-center justify-center gap-1.5 mb-0.5 ${color}`}>
                      {icon}
                      <span className='text-[10px] font-semibold uppercase tracking-wide'>{label}</span>
                    </div>
                    <p className='text-sm font-bold text-white/75'>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Name + headline preview */}
            <div>
              <h1 className='p-title text-2xl font-bold text-white mb-0.5'>
                {name || 'Your Name'}
              </h1>
              <p className='text-white/40 text-sm'>
                {headline || 'Add a headline to describe yourself'}
              </p>
              <div className='flex items-center gap-3 mt-2 flex-wrap'>
                {location && (
                  <span className='flex items-center gap-1 text-white/25 text-xs'>
                    <BsGeoAltFill size={10} /> {location}
                  </span>
                )}
                {website && (
                  <a href={website} target='_blank' rel='noreferrer'
                    className='flex items-center gap-1 text-sky-400/60 text-xs hover:text-sky-400 transition'>
                    <BsGlobe2 size={10} /> {website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {linkedIn && (
                  <a href={linkedIn} target='_blank' rel='noreferrer'
                    className='flex items-center gap-1 text-sky-400/60 text-xs hover:text-sky-400 transition'>
                    <BsLinkedin size={10} /> LinkedIn
                  </a>
                )}
                {github && (
                  <a href={github} target='_blank' rel='noreferrer'
                    className='flex items-center gap-1 text-white/30 text-xs hover:text-white/60 transition'>
                    <BsGithub size={10} /> GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Save notification toast ── */}
        <AnimatePresence>
          {saveMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className={`mb-6 flex items-center gap-3 px-5 py-3.5 rounded-xl border text-sm font-medium
                ${saveMsg.type === 'success'
                  ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/8 border-red-500/20 text-red-400'}`}>
              {saveMsg.type === 'success' ? <BsCheckCircleFill size={14} /> : <BsXLg size={14} />}
              {saveMsg.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className='grid grid-cols-3 gap-6'>

          {/* ── Left column: form ── */}
          <div className='col-span-2 space-y-5'>

            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className='bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden'>
              <div className='px-6 py-4 border-b border-white/[0.05] flex items-center gap-2'>
                <BsPersonFill size={13} className='text-white/25' />
                <p className='text-sm font-semibold text-white/70'>Basic Information</p>
              </div>
              <div className='p-6 space-y-4'>
                <Field icon={<BsPersonFill size={11} />} label='Display Name *' value={name}
                  onChange={setName} placeholder='Your full name' maxLength={60} />
                <Field icon={<BsBriefcaseFill size={11} />} label='Headline' value={headline}
                  onChange={setHeadline} placeholder='e.g. Full Stack Developer | Competitive Programmer' maxLength={100} />
                <Field icon={<BsPencilFill size={11} />} label='Bio' value={bio}
                  onChange={setBio} placeholder='Tell the world about yourself...' maxLength={250} multiline />
                <Field icon={<BsGeoAltFill size={11} />} label='Location' value={location}
                  onChange={setLocation} placeholder='e.g. Mumbai, India' maxLength={80} />
              </div>
            </motion.div>

            {/* Links */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className='bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden'>
              <div className='px-6 py-4 border-b border-white/[0.05] flex items-center gap-2'>
                <BsGlobe2 size={13} className='text-white/25' />
                <p className='text-sm font-semibold text-white/70'>Social Links</p>
              </div>
              <div className='p-6 space-y-4'>
                <Field icon={<BsGlobe2 size={11} />} label='Website' value={website}
                  onChange={setWebsite} placeholder='https://yoursite.com' type='url' />
                <Field icon={<BsLinkedin size={11} />} label='LinkedIn' value={linkedIn}
                  onChange={setLinkedIn} placeholder='https://linkedin.com/in/yourname' type='url' />
                <Field icon={<BsGithub size={11} />} label='GitHub' value={github}
                  onChange={setGithub} placeholder='https://github.com/yourusername' type='url' />
              </div>
            </motion.div>

            {/* Save */}
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              onClick={handleSave} disabled={saving}
              className='w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl
                bg-emerald-400 text-black font-bold text-sm cursor-pointer
                hover:bg-emerald-300 transition-all duration-300 disabled:opacity-50
                shadow-[0_0_30px_rgba(52,211,153,0.2)] disabled:cursor-not-allowed'>
              {saving ? (
                <><div className='w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin' /> Saving...</>
              ) : (
                <><BsCheckCircleFill size={15} /> Save Profile</>
              )}
            </motion.button>
          </div>

          {/* ── Right column: account info ── */}
          <div className='space-y-4'>

            {/* Avatar quick-change */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className='bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden'>
              <div className='px-5 py-4 border-b border-white/[0.05]'>
                <p className='text-sm font-semibold text-white/70'>Profile Picture</p>
                <p className='text-[11px] text-white/25 mt-0.5'>Photo or AI Avatar</p>
              </div>
              <div className='p-5'>
                {/* Current display */}
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-16 h-16 rounded-xl overflow-hidden bg-[#111] border border-white/[0.08] flex-shrink-0 flex items-center justify-center'>
                    {display.type === 'photo' ? (
                      <img src={display.url} alt='current' className='w-full h-full object-cover' />
                    ) : display.type === 'dicebear' ? (
                      <img src={display.url} alt='avatar' className='w-full h-full object-contain p-1' />
                    ) : (
                      <span className='text-xl font-bold text-emerald-400'>{display.initials}</span>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-medium text-white/60 mb-2 truncate'>
                      {userData?.profilePhotoUrl ? '📷 Photo uploaded' : `🎨 AI Avatar (${avatarStyle})`}
                    </p>
                    <div className='space-y-1.5'>
                      <button onClick={() => setShowAvatarPanel(true)}
                        className='w-full text-[11px] py-1.5 px-3 rounded-lg bg-emerald-500/10
                          border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15
                          transition cursor-pointer font-medium'>
                        Change Avatar
                      </button>
                      {userData?.profilePhotoUrl && (
                        <button onClick={handleDeletePhoto}
                          className='w-full text-[11px] py-1.5 px-3 rounded-lg bg-red-500/8
                            border border-red-500/15 text-red-400/70 hover:text-red-400
                            hover:bg-red-500/12 transition cursor-pointer'>
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className='bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden'>
              <div className='px-5 py-4 border-b border-white/[0.05]'>
                <p className='text-sm font-semibold text-white/70'>Account</p>
              </div>
              <div className='px-5 py-4 divide-y divide-white/[0.04]'>
                {[
                  { label: 'Email',    value: userData?.email || '—' },
                  { label: 'Credits',  value: `${userData?.credits || 0} credits` },
                  { label: 'Plan',     value: 'Free Plan' },
                  { label: 'Joined',   value: memberSince },
                ].map(({ label, value }) => (
                  <div key={label} className='flex items-center justify-between py-2.5'>
                    <span className='text-xs text-white/30'>{label}</span>
                    <span className='text-xs text-white/60 font-medium truncate max-w-[120px] text-right'>{value}</span>
                  </div>
                ))}
              </div>
              <div className='px-5 pb-4'>
                <button onClick={() => navigate('/settings')}
                  className='w-full text-[11px] py-2 rounded-lg bg-white/[0.04] border border-white/[0.08]
                    text-white/35 hover:text-white/60 hover:bg-white/[0.07] transition cursor-pointer'>
                  ⚙️ Go to Settings
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ── Avatar Panel Modal ── */}
      <AnimatePresence>
        {showAvatarPanel && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className='fixed inset-0 z-[999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4'
            onClick={e => { if (e.target === e.currentTarget) setShowAvatarPanel(false) }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className='w-full max-w-2xl bg-[#0a0a0a] border border-white/[0.10] rounded-3xl
                shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden'>

              {/* Modal Header */}
              <div className='flex items-center justify-between px-6 py-5 border-b border-white/[0.07]'>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                    flex items-center justify-center'>
                    <BsCameraFill size={14} className='text-emerald-400' />
                  </div>
                  <div>
                    <p className='p-title font-bold text-white text-base'>Profile Picture</p>
                    <p className='text-white/30 text-xs'>Upload photo or choose an AI avatar</p>
                  </div>
                </div>
                <button onClick={() => setShowAvatarPanel(false)}
                  className='p-2 rounded-xl text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition cursor-pointer'>
                  <BsXLg size={13} />
                </button>
              </div>

              {/* Tabs */}
              <div className='flex border-b border-white/[0.06]'>
                {[
                  { id: 'upload', label: '📷 Upload Photo' },
                  { id: 'style',  label: '🎨 Avatar Style' },
                  { id: 'seed',   label: '🎲 Avatar Seeds' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setAvatarTab(tab.id)}
                    className={`px-5 py-3 text-xs font-semibold transition cursor-pointer
                      ${avatarTab === tab.id
                        ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/[0.04]'
                        : 'text-white/30 hover:text-white/50'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className='p-6'>

                {/* ── Upload Photo Tab ── */}
                {avatarTab === 'upload' && (
                  <div className='space-y-4'>
                    {/* Drop zone */}
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]) }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                        transition-all duration-300
                        ${dragOver ? 'border-emerald-400 bg-emerald-500/[0.06]' : 'border-white/[0.12] hover:border-emerald-500/40 hover:bg-white/[0.02]'}`}>
                      <input ref={fileInputRef} type='file' accept='image/*' className='hidden'
                        onChange={e => handleFileSelect(e.target.files?.[0])} />
                      <div className='w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.10]
                        flex items-center justify-center mx-auto mb-4'>
                        <BsCameraFill size={22} className='text-white/30' />
                      </div>
                      <p className='text-white/50 font-medium text-sm mb-1'>
                        {dragOver ? 'Drop it here!' : 'Click to upload or drag & drop'}
                      </p>
                      <p className='text-white/20 text-xs'>JPG, PNG, WEBP, GIF · Max 5MB</p>
                    </div>

                    {/* Current photo */}
                    {(photoPreview || userData?.profilePhotoUrl) && (
                      <div className='flex items-center gap-4 p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl'>
                        <img
                          src={photoPreview || `${ServerURL}/${userData.profilePhotoUrl}`}
                          alt='preview'
                          className='w-14 h-14 rounded-xl object-cover border border-white/[0.1]'
                        />
                        <div className='flex-1'>
                          <p className='text-xs font-medium text-white/60 mb-1'>Current photo</p>
                          <button onClick={handleDeletePhoto}
                            className='flex items-center gap-1.5 text-[11px] text-red-400/70
                              hover:text-red-400 transition cursor-pointer'>
                            <BsTrashFill size={10} /> Remove photo
                          </button>
                        </div>
                      </div>
                    )}

                    <p className='text-white/20 text-[11px] text-center leading-relaxed'>
                      💡 Upload shows your real photo. Removing it will use your AI avatar instead.
                    </p>
                  </div>
                )}

                {/* ── Avatar Style Tab ── */}
                {avatarTab === 'style' && (
                  <div className='space-y-5'>
                    <div className='grid grid-cols-4 gap-3'>
                      {AVATAR_STYLES.map(style => (
                        <button key={style.id} onClick={() => setAvatarStyle(style.id)}
                          className={`p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer
                            ${avatarStyle === style.id
                              ? colorMap[style.color]
                              : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18]'}`}>
                          <div className='w-12 h-12 rounded-lg bg-[#111] border border-white/[0.08]
                            overflow-hidden mx-auto mb-2'>
                            <img
                              src={avatarUrl(style.id, avatarSeed)}
                              alt={style.label}
                              className='w-full h-full object-contain p-0.5'
                            />
                          </div>
                          <p className={`text-[10px] font-semibold
                            ${avatarStyle === style.id ? '' : 'text-white/40'}`}>
                            {style.label}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Preview */}
                    <div className='flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl'>
                      <div className='w-16 h-16 rounded-xl overflow-hidden bg-[#111] border border-white/[0.1] flex-shrink-0'>
                        <img src={avatarUrl(avatarStyle, avatarSeed)} alt='preview' className='w-full h-full object-contain p-1' />
                      </div>
                      <div>
                        <p className='text-xs text-white/40 mb-0.5'>Preview — {AVATAR_STYLES.find(s => s.id === avatarStyle)?.label}</p>
                        <p className='text-sm font-semibold text-white/70'>{avatarSeed}</p>
                        <p className='text-[10px] text-white/25 mt-0.5'>Switch to "Seeds" tab to change face</p>
                      </div>
                    </div>

                    <button onClick={handleSaveAvatar} disabled={saving}
                      className='w-full py-3 rounded-xl bg-emerald-400 text-black font-bold text-sm
                        cursor-pointer hover:bg-emerald-300 transition disabled:opacity-50'>
                      {saving ? 'Saving...' : '✓ Save Avatar'}
                    </button>
                  </div>
                )}

                {/* ── Seed Tab ── */}
                {avatarTab === 'seed' && (
                  <div className='space-y-5'>
                    <p className='text-xs text-white/30'>Each seed generates a unique face for your chosen style. Pick a preset or type your own.</p>

                    {/* Preset seeds */}
                    <div className='grid grid-cols-4 gap-2'>
                      {PRESET_SEEDS.map(seed => (
                        <button key={seed} onClick={() => setAvatarSeed(seed)}
                          className={`p-2 rounded-xl border text-center transition-all duration-200 cursor-pointer
                            ${avatarSeed === seed
                              ? 'bg-emerald-500/10 border-emerald-500/25'
                              : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18]'}`}>
                          <div className='w-10 h-10 rounded-lg bg-[#111] border border-white/[0.08]
                            overflow-hidden mx-auto mb-1.5'>
                            <img src={avatarUrl(avatarStyle, seed)} alt={seed}
                              className='w-full h-full object-contain p-0.5' />
                          </div>
                          <p className={`text-[9px] font-semibold
                            ${avatarSeed === seed ? 'text-emerald-400' : 'text-white/35'}`}>
                            {seed}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Custom seed */}
                    <div>
                      <label className='block text-xs text-white/30 mb-2'>Or type a custom seed</label>
                      <div className='flex gap-2'>
                        <input
                          value={avatarSeed}
                          onChange={e => setAvatarSeed(e.target.value)}
                          placeholder='Type anything...'
                          className='flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.09]
                            text-white/80 text-sm outline-none placeholder-white/20
                            focus:border-white/20 transition-all duration-200'
                        />
                        <button onClick={() => setAvatarSeed(Math.random().toString(36).slice(2, 8))}
                          className='px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.09]
                            text-white/40 hover:text-white/70 text-xs transition cursor-pointer'>
                          🎲 Random
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className='flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl'>
                      <div className='w-16 h-16 rounded-xl overflow-hidden bg-[#111] border border-white/[0.1] flex-shrink-0'>
                        <img src={avatarUrl(avatarStyle, avatarSeed)} alt='preview' className='w-full h-full object-contain p-1' />
                      </div>
                      <div>
                        <p className='text-xs text-white/40 mb-0.5'>Preview</p>
                        <p className='text-sm font-semibold text-white/70'>Seed: {avatarSeed}</p>
                      </div>
                    </div>

                    <button onClick={handleSaveAvatar} disabled={saving}
                      className='w-full py-3 rounded-xl bg-emerald-400 text-black font-bold text-sm
                        cursor-pointer hover:bg-emerald-300 transition disabled:opacity-50'>
                      {saving ? 'Saving...' : '✓ Save Avatar'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
