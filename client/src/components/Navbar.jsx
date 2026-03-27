import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// import { FaRobot } from "react-icons/fa6"
import logo from "../assets/logo.png";
import { useDispatch, useSelector } from 'react-redux'
import { BsCoin, BsLightningChargeFill, BsBarChartFill, BsGearFill } from "react-icons/bs"
import { FaUserAstronaut, FaHistory, FaSignOutAlt, FaCrown } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerURL } from '../App'
import { setUserData } from '../redux/userSlice'
import NotificationBell from './NotificationBell'

/* ── Avatar URL helper ── */
const dicebearUrl = (style, seed) =>
  `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a0a0a`

/* ── Credit tier helper ── */
const getCreditTier = (credits) => {
  if (credits >= 100) return { label: "Pro", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }
  if (credits >= 30) return { label: "Active", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" }
  return { label: "Low", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" }
}

const popupVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
  exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.13 } },
}

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)

  const [showCreditPopup, setShowCreditPopup] = useState(false)
  const [showUserPopup, setShowUserPopup] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const popupRef = useRef()
  const credits = userData?.credits ?? 0
  const tier = getCreditTier(credits)
  const initials = userData?.name?.slice(0, 2).toUpperCase() || null

  /* ── Compute avatar for profile button ── */
  const profilePhotoUrl = userData?.profilePhotoUrl
    ? `${ServerURL}/${userData.profilePhotoUrl}`
    : null
  const dicebearSrc = (!profilePhotoUrl && (userData?.avatarSeed || userData?.name))
    ? dicebearUrl(userData?.avatarStyle || 'avataaars', userData?.avatarSeed || userData?.name)
    : null

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowCreditPopup(false)
        setShowUserPopup(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await axios.get(ServerURL + "/api/auth/logout", { withCredentials: true })
      dispatch(setUserData(null))
      navigate("/")
    } catch (err) {
      console.error(err)
    } finally {
      setLoggingOut(false)
      setShowUserPopup(false)
    }
  }

  const closeAll = () => {
    setShowCreditPopup(false)
    setShowUserPopup(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&display=swap');
        .nav-logo { font-family: 'Sora', sans-serif; }
      `}</style>

      <div className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 pt-5">
        <motion.nav
          initial={{ opacity: 0, y: -28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-6xl px-5 md:px-7 py-2.5 flex justify-between items-center
            rounded-2xl border border-white/[0.07] bg-[#080808]/90 backdrop-blur-2xl
            shadow-[0_4px_40px_rgba(0,0,0,0.5)]"
        >

          {/* ── Logo ── */}
{/* ── Logo ── */}
<div
  onClick={() => navigate("/dashboard")}
  className="flex items-center gap-2.5 cursor-pointer group"
>
  <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center
    group-hover:ring-1 group-hover:ring-emerald-500/30 transition-all duration-300">
    <img
      src={logo}
      alt="Oralytics logo"
      className="w-full h-full object-contain"
    />
  </div>
  <span className="nav-logo text-[15px] font-semibold text-white/90 tracking-tight
    group-hover:text-white transition">
    Oralytics <span className="text-emerald-400">AI</span>
  </span>
</div>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-2" ref={popupRef}>

            {/* ── Credits button ── */}
            <div className="relative">
              <button
                onClick={() => { setShowCreditPopup(p => !p); setShowUserPopup(false) }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm
                  border transition-all duration-200 cursor-pointer
                  ${showCreditPopup
                    ? "bg-white/[0.07] border-white/15 text-white"
                    : "bg-transparent border-white/[0.07] text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                  }`}
              >
                <BsCoin size={14} className="text-emerald-400 flex-shrink-0" />
                <span className="font-medium tabular-nums">{credits.toLocaleString()}</span>
                <span className={`hidden sm:inline-flex text-[10px] font-semibold px-1.5 py-0.5
                  rounded-md border ${tier.bg} ${tier.color} tracking-wide`}>
                  {tier.label}
                </span>
              </button>

              {/* Credits popup */}
              <AnimatePresence>
                {showCreditPopup && (
                  <motion.div
                    variants={popupVariants}
                    initial="hidden" animate="visible" exit="exit"
                    className="absolute right-0 mt-2.5 w-72 z-50
                      bg-[#0e0e0e] border border-white/[0.08] rounded-2xl
                      shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/40 uppercase tracking-widest">Credit Balance</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tier.bg} ${tier.color}`}>
                          {tier.label}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-white tabular-nums mt-1">
                        {credits.toLocaleString()}
                        <span className="text-sm text-white/25 font-normal ml-1">credits</span>
                      </p>

                      {/* Visual bar */}
                      <div className="mt-3 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((credits / 200) * 100, 100)}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full bg-emerald-400 rounded-full"
                        />
                      </div>
                      <p className="text-[11px] text-white/25 mt-1.5">
                        {credits < 10
                          ? "Running low — top up to continue"
                          : `${credits} credits remaining`}
                      </p>
                    </div>

                    {/* What credits do */}
                    <div className="px-5 py-4 space-y-2.5">
                      {[
                        { icon: <BsLightningChargeFill size={11} />, text: "1 credit = 1 AI interview session" },
                        { icon: <BsBarChartFill size={11} />, text: "Advanced analytics use 2 credits" },
                        { icon: <HiSparkles size={11} />, text: "Resume review uses 3 credits" },
                      ].map(({ icon, text }) => (
                        <div key={text} className="flex items-center gap-2.5 text-[12px] text-white/35">
                          <span className="text-emerald-400/70">{icon}</span>
                          {text}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => { navigate('/credits'); closeAll() }}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold
                          bg-emerald-400 text-black hover:bg-emerald-300
                          shadow-[0_0_20px_rgba(52,211,153,0.2)]
                          hover:shadow-[0_0_28px_rgba(52,211,153,0.35)]
                          transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <FaCrown size={12} />
                        Buy More Credits
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Notification Bell ── */}
            <NotificationBell />

            {/* ── Profile button ── */}
            <div className="relative">
              <button
                onClick={() => { setShowUserPopup(p => !p); setShowCreditPopup(false) }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer
                  text-sm font-bold transition-all duration-200 border overflow-hidden
                  ${showUserPopup
                    ? "ring-2 ring-emerald-500/40 border-emerald-500/30"
                    : "border-white/[0.08] hover:border-white/[0.20]"}`}
              >
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt='avatar' className='w-full h-full object-cover' />
                ) : dicebearSrc ? (
                  <img src={dicebearSrc} alt='avatar' className='w-full h-full object-contain bg-[#0a0a0a] p-0.5' />
                ) : (
                  <span className={`w-full h-full flex items-center justify-center
                    ${showUserPopup ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.09] hover:text-white'}`}>
                    {initials ?? <FaUserAstronaut size={15} />}
                  </span>
                )}
              </button>

              {/* Profile popup */}
              <AnimatePresence>
                {showUserPopup && (
                  <motion.div
                    variants={popupVariants}
                    initial="hidden" animate="visible" exit="exit"
                    className="absolute right-0 mt-2.5 w-52 z-50
                      bg-[#0e0e0e] border border-white/[0.08] rounded-2xl
                      shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden"
                  >
                    {/* User info */}
                    <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl border border-white/[0.10] flex-shrink-0 overflow-hidden">
                          {profilePhotoUrl ? (
                            <img src={profilePhotoUrl} alt='avatar' className='w-full h-full object-cover' />
                          ) : dicebearSrc ? (
                            <img src={dicebearSrc} alt='avatar' className='w-full h-full object-contain bg-[#0a0a0a] p-0.5' />
                          ) : (
                            <div className="w-full h-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 text-sm font-bold">
                              {initials ?? <FaUserAstronaut size={14} />}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{userData?.name || "User"}</p>
                          <p className="text-[11px] text-white/30 truncate">{userData?.email || ""}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
                      {[
                        { icon: <FaUserAstronaut size={13} />, label: "My Profile",  action: () => { navigate("/profile"); closeAll() } },
                        { icon: <FaHistory size={13} />,       label: "My Sessions", action: () => { navigate("/history"); closeAll() } },
                        { icon: <BsBarChartFill size={13} />,  label: "Analytics",   action: () => { navigate("/analytics"); closeAll() } },
                        { icon: <BsGearFill size={13} />,      label: "Settings",    action: () => { navigate("/settings"); closeAll() } },
                      ].map(item => (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            text-sm text-white/50 hover:text-white hover:bg-white/[0.05]
                            transition-all duration-150 cursor-pointer"
                        >
                          <span className="text-white/30">{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="p-2 pt-0 border-t border-white/[0.06] mt-1">
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                          text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.08]
                          transition-all duration-150 cursor-pointer disabled:opacity-50"
                      >
                        <FaSignOutAlt size={13} />
                        {loggingOut ? "Signing out..." : "Sign Out"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.nav>
      </div>
    </>
  )
}

export default Navbar