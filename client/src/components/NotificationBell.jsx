import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerURL } from '../App'
import {
  BsBellFill, BsCheckAll, BsTrashFill, BsXLg,
  BsCalendarCheck, BsBarChartFill, BsTrophyFill,
  BsLightbulbFill, BsMegaphoneFill, BsGearFill,
  BsChevronRight,
} from 'react-icons/bs'

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_META = {
  session_reminder: {
    icon: <BsCalendarCheck size={14} />,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
    dot: 'bg-sky-400',
  },
  weekly_report: {
    icon: <BsBarChartFill size={14} />,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    dot: 'bg-violet-400',
  },
  achievement: {
    icon: <BsTrophyFill size={14} />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  tip: {
    icon: <BsLightbulbFill size={14} />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  product_update: {
    icon: <BsMegaphoneFill size={14} />,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    dot: 'bg-pink-400',
  },
  system: {
    icon: <BsGearFill size={14} />,
    color: 'text-white/40',
    bg: 'bg-white/[0.05] border-white/[0.1]',
    dot: 'bg-white/40',
  },
}

const PRIORITY_BORDER = {
  high:   'border-l-red-400/60',
  medium: 'border-l-amber-400/40',
  low:    'border-l-white/10',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const { userData } = useSelector(s => s.user)
  const navigate = useNavigate()
  const [open, setOpen]                   = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(false)
  const [filter, setFilter]               = useState('all') // all | unread
  const panelRef = useRef(null)
  const bellRef  = useRef(null)

  // ── Fetch ──
  const fetchNotifications = useCallback(async () => {
    if (!userData) return
    try {
      setLoading(true)
      const res = await axios.get(`${ServerURL}/api/notifications`, { withCredentials: true })
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (e) {
      console.error('fetch notifications failed', e.message)
    } finally {
      setLoading(false)
    }
  }, [userData])

  // ── Check reminders on mount ──
  useEffect(() => {
    if (!userData) return
    axios.post(`${ServerURL}/api/notifications/check-reminders`, {}, { withCredentials: true })
      .then(() => fetchNotifications())
      .catch(() => fetchNotifications())
  }, [userData])

  // Poll every 60s for new notifications
  useEffect(() => {
    if (!userData) return
    const id = setInterval(fetchNotifications, 60000)
    return () => clearInterval(id)
  }, [userData, fetchNotifications])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          bellRef.current  && !bellRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Actions ──
  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    setUnreadCount(c => Math.max(0, c - 1))
    await axios.put(`${ServerURL}/api/notifications/${id}/read`, {}, { withCredentials: true })
  }

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
    await axios.put(`${ServerURL}/api/notifications/read-all`, {}, { withCredentials: true })
  }

  const deleteOne = async (e, id) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n._id !== id))
    setUnreadCount(prev => {
      const n = notifications.find(x => x._id === id)
      return n && !n.isRead ? Math.max(0, prev - 1) : prev
    })
    await axios.delete(`${ServerURL}/api/notifications/${id}`, { withCredentials: true })
  }

  const clearRead = async () => {
    setNotifications(prev => prev.filter(n => !n.isRead))
    await axios.delete(`${ServerURL}/api/notifications/clear-all`, { withCredentials: true })
  }

  const handleClick = async (notif) => {
    if (!notif.isRead) await markRead(notif._id)
    if (notif.actionUrl) {
      setOpen(false)
      navigate(notif.actionUrl)
    }
  }

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications

  if (!userData) return null

  return (
    <div className='relative'>
      {/* ── Bell Button ── */}
      <button
        ref={bellRef}
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications() }}
        className='relative w-9 h-9 flex items-center justify-center rounded-xl
          bg-white/[0.04] border border-white/[0.08] text-white/50
          hover:text-white/80 hover:bg-white/[0.08] hover:border-white/[0.14]
          transition-all duration-200 cursor-pointer'
      >
        <BsBellFill size={15} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className='absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                bg-red-500 rounded-full flex items-center justify-center
                text-[10px] font-black text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='absolute right-0 top-12 w-[380px] max-h-[540px] flex flex-col
              bg-[#0e0e0e] border border-white/[0.09] rounded-2xl shadow-2xl
              shadow-black/60 overflow-hidden z-[999]'
          >
            {/* Header */}
            <div className='flex items-center justify-between px-5 py-4 border-b border-white/[0.07]'>
              <div className='flex items-center gap-2'>
                <BsBellFill size={13} className='text-white/40' />
                <p className='text-sm font-semibold text-white/80'>Notifications</p>
                {unreadCount > 0 && (
                  <span className='px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25
                    text-red-400 text-[10px] font-bold'>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className='flex items-center gap-1'>
                {unreadCount > 0 && (
                  <button onClick={markAllRead}
                    className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px]
                      text-white/35 hover:text-emerald-400 hover:bg-emerald-500/10
                      transition-all duration-150 cursor-pointer'>
                    <BsCheckAll size={13} /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  className='p-1.5 rounded-lg text-white/25 hover:text-white/60
                    hover:bg-white/[0.06] transition-all cursor-pointer'>
                  <BsXLg size={11} />
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className='flex border-b border-white/[0.06]'>
              {['all', 'unread'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide
                    transition-all cursor-pointer capitalize
                    ${filter === f
                      ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/[0.04]'
                      : 'text-white/25 hover:text-white/50'}`}>
                  {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
                </button>
              ))}
            </div>

            {/* List */}
            <div className='flex-1 overflow-y-auto'>
              {loading && notifications.length === 0 ? (
                <div className='space-y-3 p-4'>
                  {[1, 2, 3].map(i => (
                    <div key={i} className='h-16 bg-white/[0.03] rounded-xl animate-pulse' />
                  ))}
                </div>
              ) : displayed.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-16 text-center px-6'>
                  <div className='w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07]
                    flex items-center justify-center mb-4'>
                    <BsBellFill size={22} className='text-white/15' />
                  </div>
                  <p className='text-white/40 font-medium text-sm mb-1'>
                    {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                  </p>
                  <p className='text-white/20 text-xs'>
                    {filter === 'unread' ? 'No unread notifications.' : "We'll notify you about sessions, tips, and updates."}
                  </p>
                </div>
              ) : (
                <div className='divide-y divide-white/[0.04]'>
                  {displayed.map(notif => {
                    const meta = TYPE_META[notif.type] || TYPE_META.system
                    return (
                      <motion.div
                        key={notif._id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        onClick={() => handleClick(notif)}
                        className={`relative flex items-start gap-3 px-4 py-4 cursor-pointer
                          border-l-2 transition-all duration-200 group
                          ${PRIORITY_BORDER[notif.priority]}
                          ${!notif.isRead ? 'bg-white/[0.025]' : 'hover:bg-white/[0.02]'}`}
                      >
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center
                          flex-shrink-0 mt-0.5 ${meta.bg} ${meta.color}`}>
                          {meta.icon}
                        </div>

                        {/* Content */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between gap-2 mb-1'>
                            <p className={`text-xs font-semibold leading-tight
                              ${!notif.isRead ? 'text-white/85' : 'text-white/55'}`}>
                              {notif.title}
                            </p>
                            <div className='flex items-center gap-1.5 flex-shrink-0'>
                              {!notif.isRead && (
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                              )}
                              <button
                                onClick={(e) => deleteOne(e, notif._id)}
                                className='opacity-0 group-hover:opacity-100 p-0.5 text-white/20
                                  hover:text-red-400 transition-all cursor-pointer'>
                                <BsTrashFill size={10} />
                              </button>
                            </div>
                          </div>
                          <p className='text-[11px] text-white/35 leading-relaxed mb-2'>
                            {notif.message}
                          </p>
                          <div className='flex items-center justify-between'>
                            <span className='text-[10px] text-white/20'>{timeAgo(notif.createdAt)}</span>
                            {notif.actionLabel && (
                              <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${meta.color}`}>
                                {notif.actionLabel} <BsChevronRight size={8} />
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.some(n => n.isRead) && (
              <div className='border-t border-white/[0.06] px-4 py-3'>
                <button onClick={clearRead}
                  className='flex items-center gap-1.5 text-[11px] text-white/25
                    hover:text-red-400 transition-all cursor-pointer'>
                  <BsTrashFill size={10} /> Clear read notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
