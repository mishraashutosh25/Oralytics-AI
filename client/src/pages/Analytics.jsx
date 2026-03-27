import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerURL } from '../App'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  BsBarChartFill, BsGraphUp, BsTrophyFill, BsClockHistory,
  BsArrowRight, BsStarFill, BsCheckCircleFill, BsXCircleFill,
  BsFire, BsCalendarCheck, BsPersonFill, BsLightningChargeFill,
  BsArrowUpRight, BsArrowDownRight, BsShieldFill, BsAward,
  BsClockFill, BsFilterLeft, BsChevronDown,
  BsArrowLeft
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'

// ── Smooth Line Chart (SVG, multi-point) ──────────────────────────────────────
function LineChart({ data, height = 180 }) {
  if (!data?.length || data.length < 2) return (
    <div className='flex items-center justify-center text-white/15 text-xs italic' style={{ height }}>
      Complete more sessions to see your trend
    </div>
  )
  const w = 400, h = height - 32
  const scores = data.map(d => d.score)
  const minS = Math.max(0, Math.min(...scores) - 5)
  const maxS = Math.min(100, Math.max(...scores) + 5)

  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((d.score - minS) / (maxS - minS || 1)) * h,
    score: d.score, date: d.date, role: d.role
  }))

  // Smooth bezier curve
  const smooth = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = pts[i - 1]
    const cpx = (prev.x + p.x) / 2
    return `C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`
  }).join(' ')

  const area = `${smooth} L ${pts[pts.length-1].x} ${h + 16} L 0 ${h + 16} Z`
  const sc = s => s >= 80 ? '#34d399' : s >= 60 ? '#fbbf24' : '#f87171'
  const latestTrend = scores.length >= 2 ? scores[scores.length-1] - scores[scores.length-2] : 0

  return (
    <div>
      {/* Trend badge */}
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          {latestTrend !== 0 && (
            <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full
              ${latestTrend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {latestTrend > 0 ? <BsArrowUpRight size={10} /> : <BsArrowDownRight size={10} />}
              {Math.abs(latestTrend)} pts vs last session
            </span>
          )}
        </div>
        <span className='text-[10px] text-white/20'>{data.length} sessions</span>
      </div>
      <svg viewBox={`0 0 ${w} ${height}`} className='w-full' style={{ height }}>
        <defs>
          <linearGradient id='areaGrad' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%'   stopColor='#34d399' stopOpacity='0.18' />
            <stop offset='100%' stopColor='#34d399' stopOpacity='0'    />
          </linearGradient>
          <filter id='glow'>
            <feGaussianBlur stdDeviation='2' result='blur' />
            <feMerge><feMergeNode in='blur' /><feMergeNode in='SourceGraphic' /></feMerge>
          </filter>
        </defs>

        {/* Y-axis grid lines */}
        {[0, 25, 50, 75, 100].map(pct => {
          const v = minS + (maxS - minS) * (1 - pct / 100)
          const y = (pct / 100) * h
          return (
            <g key={pct}>
              <line x1={0} y1={y} x2={w} y2={y} stroke='rgba(255,255,255,0.04)' strokeWidth='1' />
              <text x={2} y={y - 3} fontSize='7' fill='rgba(255,255,255,0.18)' fontFamily='DM Sans'>
                {Math.round(v)}
              </text>
            </g>
          )
        })}

        {/* Area */}
        <path d={area} fill='url(#areaGrad)' />

        {/* Line */}
        <path d={smooth} fill='none' stroke='#34d399' strokeWidth='2'
          strokeLinecap='round' strokeLinejoin='round' filter='url(#glow)' />

        {/* Dots */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r='4' fill='#0d0d0d' stroke={sc(p.score)} strokeWidth='2' />
            <circle cx={p.x} cy={p.y} r='2' fill={sc(p.score)} />
          </g>
        ))}

        {/* X labels (show first, mid, last) */}
        {[0, Math.floor(pts.length / 2), pts.length - 1].map(idx => {
          if (!pts[idx]) return null
          return (
            <text key={idx} x={pts[idx].x} y={h + 28} textAnchor='middle'
              fontSize='7' fill='rgba(255,255,255,0.2)' fontFamily='DM Sans'>
              {pts[idx].date}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ── Heatmap Calendar (GitHub-style) ──────────────────────────────────────────
function HeatmapCalendar({ sessions }) {
  const calendar = useMemo(() => {
    const map = {}
    sessions.forEach(s => {
      const d = new Date(s.completedAt || s.createdAt)
      const key = d.toISOString().split('T')[0]
      if (!map[key]) map[key] = { count: 0, avgScore: 0, totalScore: 0 }
      map[key].count++
      map[key].totalScore += s.report?.avgScore || 0
      map[key].avgScore = Math.round(map[key].totalScore / map[key].count)
    })
    // Build 16-week grid
    const weeks = []
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - 16 * 7 + 1)
    for (let w = 0; w < 16; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(start)
        date.setDate(start.getDate() + w * 7 + d)
        const key = date.toISOString().split('T')[0]
        week.push({ date: key, ...(map[key] || { count: 0, avgScore: 0 }) })
      }
      weeks.push(week)
    }
    return weeks
  }, [sessions])

  const cellColor = (count, score) => {
    if (count === 0) return 'bg-white/[0.04]'
    if (score >= 80) return 'bg-emerald-400 opacity-80'
    if (score >= 60) return 'bg-amber-400 opacity-80'
    return 'bg-red-400 opacity-70'
  }

  const DAYS = ['S','M','T','W','T','F','S']
  const totalThisMonth = calendar.flat().filter(d => d.count > 0).length

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-[10px] text-white/20'>Last 16 weeks activity</p>
        <div className='flex items-center gap-3 text-[9px] text-white/20'>
          <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-sm bg-white/[0.04] inline-block' />None</span>
          <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-sm bg-red-400/70 inline-block' />Low</span>
          <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-sm bg-amber-400/70 inline-block' />Good</span>
          <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-sm bg-emerald-400/70 inline-block' />Excellent</span>
        </div>
      </div>
      <div className='flex gap-1'>
        {/* Day labels */}
        <div className='flex flex-col gap-1 mr-1'>
          {DAYS.map((d, i) => (
            <div key={i} className='w-3 h-3 flex items-center justify-center text-[7px] text-white/15'>{d}</div>
          ))}
        </div>
        {/* Weeks */}
        {calendar.map((week, wi) => (
          <div key={wi} className='flex flex-col gap-1'>
            {week.map((day, di) => (
              <div key={di}
                title={day.count > 0 ? `${day.date}: ${day.count} session(s) · Avg ${day.avgScore}%` : day.date}
                className={`w-3 h-3 rounded-sm cursor-default transition-opacity duration-200
                  ${cellColor(day.count, day.avgScore)} hover:opacity-100`} />
            ))}
          </div>
        ))}
      </div>
      <p className='text-[10px] text-white/20 mt-3'>
        {totalThisMonth} active day{totalThisMonth !== 1 ? 's' : ''} in the last 16 weeks
      </p>
    </div>
  )
}

// ── Radar Chart ───────────────────────────────────────────────────────────────
function RadarChart({ data, size = 220 }) {
  const entries = Object.entries(data)
  if (!entries.length) return null
  const cx = size / 2, cy = size / 2, r = size * 0.32
  const n = entries.length
  const angle = (2 * Math.PI) / n
  const pt = (i, rad) => ({
    x: cx + rad * Math.cos(i * angle - Math.PI / 2),
    y: cy + rad * Math.sin(i * angle - Math.PI / 2)
  })
  const grids = [0.25, 0.5, 0.75, 1].map(t =>
    entries.map((_, i) => pt(i, r * t)).map(p => `${p.x},${p.y}`).join(' ')
  )
  const dataPts = entries.map(([, v], i) => pt(i, r * (v / 100)))
  const poly = dataPts.map(p => `${p.x},${p.y}`).join(' ')
  const sc = v => v >= 75 ? '#34d399' : v >= 50 ? '#fbbf24' : '#f87171'

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className='w-full max-w-[220px] mx-auto'>
      <defs>
        <radialGradient id='radarGrad'>
          <stop offset='0%'   stopColor='#34d399' stopOpacity='0.15' />
          <stop offset='100%' stopColor='#34d399' stopOpacity='0.03' />
        </radialGradient>
      </defs>
      {grids.map((pts, i) => (
        <polygon key={i} points={pts} fill='none'
          stroke='rgba(255,255,255,0.05)' strokeWidth='0.8' />
      ))}
      {entries.map((_, i) => {
        const end = pt(i, r)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
          stroke='rgba(255,255,255,0.05)' strokeWidth='0.8' />
      })}
      <polygon points={poly} fill='url(#radarGrad)' stroke='rgba(52,211,153,0.5)'
        strokeWidth='1.5' strokeLinejoin='round' />
      {dataPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r='3.5'
          fill={sc(entries[i][1])} stroke='#0d0d0d' strokeWidth='1.5' />
      ))}
      {entries.map(([label, val], i) => {
        const lp = pt(i, r + 26)
        return (
          <g key={i}>
            <text x={lp.x} y={lp.y} textAnchor='middle' dominantBaseline='middle'
              fontSize='6.5' fill='rgba(255,255,255,0.3)' fontFamily='DM Sans'>{label}</text>
            <text x={lp.x} y={lp.y + 9} textAnchor='middle' dominantBaseline='middle'
              fontSize='7' fontWeight='bold' fill={sc(val)} fontFamily='Sora'>{val}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  if (!total) return null
  const cx = size / 2, cy = size / 2, r = size * 0.36, stroke = size * 0.14
  let cumAngle = -Math.PI / 2
  const arcs = segments.map(seg => {
    const ratio = seg.value / total
    const start = cumAngle
    const end = start + ratio * 2 * Math.PI
    cumAngle = end
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end)
    const large = ratio > 0.5 ? 1 : 0
    return { ...seg, d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, ratio }
  })
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill='none'
        stroke='rgba(255,255,255,0.04)' strokeWidth={stroke} />
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill='none' stroke={arc.color}
          strokeWidth={stroke} strokeLinecap='round' />
      ))}
      <text x={cx} y={cy - 4} textAnchor='middle' dominantBaseline='middle'
        fontSize='16' fontWeight='900' fill='white' fontFamily='Sora'>{total}</text>
      <text x={cx} y={cy + 10} textAnchor='middle' dominantBaseline='middle'
        fontSize='7' fill='rgba(255,255,255,0.3)' fontFamily='DM Sans'>sessions</text>
    </svg>
  )
}

// ── FadeUp ─────────────────────────────────────────────────────────────────────
const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}>{children}</motion.div>
)

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, suffix = '', sub, icon, color, delay = 0 }) {
  const cs = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/8',  border: 'border-emerald-500/15', glow: 'rgba(52,211,153,0.08)' },
    amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/8',    border: 'border-amber-500/15',   glow: 'rgba(251,191,36,0.08)'  },
    violet:  { text: 'text-violet-400',  bg: 'bg-violet-500/8',   border: 'border-violet-500/15',  glow: 'rgba(167,139,250,0.08)' },
    sky:     { text: 'text-sky-400',     bg: 'bg-sky-500/8',      border: 'border-sky-500/15',     glow: 'rgba(56,189,248,0.08)'  },
    orange:  { text: 'text-orange-400',  bg: 'bg-orange-500/8',   border: 'border-orange-500/15',  glow: 'rgba(251,146,60,0.08)'  },
  }[color] || {}
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`relative bg-[#0b0b0b] border ${cs.border} rounded-2xl p-5 overflow-hidden group
        hover:border-opacity-50 transition-all duration-300`}
      style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 40px ${cs.glow}` }}>
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl ${cs.bg} opacity-60`} />
      <div className='relative z-10'>
        <div className='flex items-start justify-between mb-3'>
          <p className='text-[10px] text-white/25 uppercase tracking-[0.18em] font-medium'>{label}</p>
          <div className={`w-8 h-8 rounded-xl ${cs.bg} border ${cs.border} flex items-center justify-center ${cs.text}`}>
            {icon}
          </div>
        </div>
        <div className='flex items-end gap-1.5'>
          <span className={`text-[2.2rem] font-black leading-none tracking-tight ${cs.text}`}
            style={{ fontFamily: "'Sora', sans-serif" }}>{value}</span>
          {suffix && <span className={`text-base ${cs.text} opacity-60 mb-1`}>{suffix}</span>}
        </div>
        {sub && <p className='text-[10px] text-white/20 mt-1.5'>{sub}</p>}
      </div>
    </motion.div>
  )
}

// ── Readiness Verdict ──────────────────────────────────────────────────────────
function ReadinessCard({ avgScore, totalSessions, streak, bestScore }) {
  const level = avgScore >= 80 ? 'Interview Ready'
    : avgScore >= 65 ? 'Almost There'
    : avgScore >= 50 ? 'Keep Practicing'
    : 'Just Getting Started'

  const pct = Math.min(100, Math.round((avgScore * 0.5) + (Math.min(totalSessions, 20) / 20) * 25 + (streak > 0 ? 15 : 0) + (bestScore >= 80 ? 10 : 0)))
  const color = pct >= 75 ? '#34d399' : pct >= 55 ? '#fbbf24' : '#f87171'
  const circumference = 2 * Math.PI * 42

  return (
    <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6 flex items-center gap-6'>
      {/* Circular progress */}
      <div className='relative flex-shrink-0'>
        <svg width='100' height='100' viewBox='0 0 100 100'>
          <circle cx='50' cy='50' r='42' fill='none' stroke='rgba(255,255,255,0.05)' strokeWidth='8' />
          <motion.circle cx='50' cy='50' r='42' fill='none' stroke={color} strokeWidth='8'
            strokeLinecap='round' strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            transform='rotate(-90 50 50)' />
          <text x='50' y='46' textAnchor='middle' dominantBaseline='middle'
            fontSize='18' fontWeight='900' fill={color} fontFamily='Sora'>{pct}</text>
          <text x='50' y='60' textAnchor='middle' dominantBaseline='middle'
            fontSize='7' fill='rgba(255,255,255,0.3)' fontFamily='DM Sans'>Readiness</text>
        </svg>
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[10px] text-white/25 uppercase tracking-widest mb-1'>AI Verdict</p>
        <p className='text-xl font-black text-white mb-2' style={{ fontFamily: "'Sora', sans-serif" }}
          >{level}</p>
        <div className='space-y-1.5'>
          {[
            { label: 'Avg Score',    val: `${avgScore}%`,       ok: avgScore >= 70 },
            { label: 'Sessions',     val: `${totalSessions}`,   ok: totalSessions >= 5 },
            { label: 'Best Score',   val: `${bestScore}%`,      ok: bestScore >= 80 },
            { label: 'Active Streak',val: `${streak} day${streak !== 1 ? 's' : ''}`, ok: streak >= 3 },
          ].map((r, i) => (
            <div key={i} className='flex items-center justify-between'>
              <span className='text-[10px] text-white/30'>{r.label}</span>
              <span className={`text-[10px] font-semibold ${r.ok ? 'text-emerald-400' : 'text-white/40'}`}>
                {r.ok ? '✓' : '○'} {r.val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Session History Table ──────────────────────────────────────────────────────
function SessionTable({ sessions }) {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(0)
  const PER_PAGE = 8

  const filtered = useMemo(() => {
    let s = [...sessions]
    if (filter !== 'all') s = s.filter(x => x.difficulty === filter)
    s.sort((a, b) => {
      const va = sortBy === 'date' ? new Date(a.completedAt || a.createdAt)
        : sortBy === 'score' ? a.report.avgScore : 0
      const vb = sortBy === 'date' ? new Date(b.completedAt || b.createdAt)
        : sortBy === 'score' ? b.report.avgScore : 0
      return sortDir === 'desc' ? vb - va : va - vb
    })
    return s
  }, [sessions, filter, sortBy, sortDir])

  const pages = Math.ceil(filtered.length / PER_PAGE)
  const visible = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  const sc = s => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400'
  const bc = s => s >= 80 ? 'bg-emerald-500/8 border-emerald-500/15'
    : s >= 60 ? 'bg-amber-500/8 border-amber-500/15' : 'bg-red-500/8 border-red-500/15'

  const toggle = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  return (
    <div>
      {/* Controls */}
      <div className='flex items-center gap-3 mb-4 flex-wrap'>
        <div className='flex items-center gap-1.5'>
          <BsFilterLeft size={12} className='text-white/25' />
          {['all','easy','medium','hard'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(0) }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer
                ${filter === f
                  ? f === 'easy' ? 'bg-emerald-500/12 border border-emerald-500/20 text-emerald-400'
                  : f === 'medium' ? 'bg-amber-500/12 border border-amber-500/20 text-amber-400'
                  : f === 'hard' ? 'bg-red-500/12 border border-red-500/20 text-red-400'
                  : 'bg-white/[0.06] border border-white/[0.12] text-white/70'
                  : 'text-white/30 hover:text-white/55 hover:bg-white/[0.04]'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className='ml-auto text-[10px] text-white/20'>
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className='rounded-xl overflow-hidden border border-white/[0.06]'>
        {/* Header */}
        <div className='grid grid-cols-[1fr_100px_80px_80px_100px] px-4 py-2.5
          bg-white/[0.02] border-b border-white/[0.06] text-[9px] text-white/25 uppercase tracking-widest'>
          <span>Role</span>
          <button onClick={() => toggle('date')} className='flex items-center gap-1 cursor-pointer hover:text-white/50 transition'>
            Date {sortBy === 'date' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
          </button>
          <span>Difficulty</span>
          <button onClick={() => toggle('score')} className='flex items-center gap-1 cursor-pointer hover:text-white/50 transition'>
            Score {sortBy === 'score' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
          </button>
          <span>Verdict</span>
        </div>

        {visible.length === 0 ? (
          <div className='py-10 text-center text-white/20 text-xs'>No sessions match this filter</div>
        ) : (
          <div className='divide-y divide-white/[0.04]'>
            {visible.map((s, i) => (
              <motion.div key={s._id || i}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className='grid grid-cols-[1fr_100px_80px_80px_100px] px-4 py-3.5
                  hover:bg-white/[0.02] transition-colors items-center'>
                <p className='text-xs text-white/65 font-medium truncate pr-3'>{s.role}</p>
                <p className='text-[10px] text-white/30'>
                  {new Date(s.completedAt || s.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
                <span className={`text-[9px] font-semibold capitalize
                  ${s.difficulty === 'easy' ? 'text-emerald-400'
                  : s.difficulty === 'hard' ? 'text-red-400' : 'text-amber-400'}`}>
                  {s.difficulty}
                </span>
                <div className='flex items-center gap-2'>
                  <span className={`text-sm font-black ${sc(s.report.avgScore)}`}
                    style={{ fontFamily: "'Sora', sans-serif" }}>
                    {s.report.avgScore}
                  </span>
                </div>
                <span className={`text-[9px] px-2 py-1 rounded-full border font-medium w-fit
                  ${s.report.recommendation === 'Ready'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : s.report.recommendation === 'Needs Practice'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {s.report.recommendation}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className='flex items-center justify-center gap-2 mt-4'>
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-7 h-7 rounded-lg text-[10px] font-semibold transition cursor-pointer
                ${page === i ? 'bg-emerald-400 text-black' : 'bg-white/[0.04] text-white/30 hover:bg-white/[0.08]'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Analytics Page ────────────────────────────────────────────────────────
export default function Analytics() {
  const navigate = useNavigate()
  const [data,       setData]       = useState(null)
  const [sessions,   setSessions]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [activeTab,  setActiveTab]  = useState('overview')

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, sessionsRes] = await Promise.all([
          axios.get(ServerURL + '/api/analytics',       { withCredentials: true }),
          axios.get(ServerURL + '/api/interview/my-sessions', { withCredentials: true }),
        ])
        setData(analyticsRes.data)
        setSessions(sessionsRes.data?.sessions || [])
      } catch (e) {
        // Try analytics only if sessions endpoint doesn't exist
        try {
          const r = await axios.get(ServerURL + '/api/analytics', { withCredentials: true })
          setData(r.data)
        } catch { setError('Failed to load analytics') }
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const sc = s => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400'
  const bc = s => s >= 80 ? 'bg-emerald-400' : s >= 60 ? 'bg-amber-400' : 'bg-red-400'

  // Loading
  if (loading) return (
    <div className='min-h-screen bg-[#050505] flex items-center justify-center'>
      <div className='text-center'>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className='w-10 h-10 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full mx-auto mb-4' />
        <p className='text-white/30 text-sm'>Loading analytics...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className='min-h-screen bg-[#050505] flex items-center justify-center'>
      <div className='text-center'>
        <p className='text-red-400 mb-4'>{error}</p>
        <button onClick={() => navigate('/dashboard')}
          className='text-white/40 text-sm hover:text-white/70 cursor-pointer'>← Back</button>
      </div>
    </div>
  )

  // No sessions
  if (data?.totalSessions === 0) return (
    <>
      <div className='min-h-screen bg-[#030303] text-white' style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
        <Navbar />
        <div className='flex flex-col items-center justify-center min-h-[80vh] px-6 text-center'>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className='w-24 h-24 rounded-3xl bg-emerald-500/8 border border-emerald-500/15
              flex items-center justify-center text-emerald-400 mx-auto mb-8'>
            <BsBarChartFill size={40} />
          </motion.div>
          <h2 className='text-4xl font-black text-white mb-3' style={{ fontFamily: "'Sora',sans-serif" }}>
            No Data Yet
          </h2>
          <p className='text-white/35 text-sm max-w-md mb-8 leading-relaxed'>
            Complete your first interview session to unlock detailed analytics, performance trends, and AI-driven readiness scores.
          </p>
          <button onClick={() => navigate('/interview')}
            className='flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-400 text-black
              font-bold cursor-pointer hover:bg-emerald-300 transition shadow-[0_0_30px_rgba(52,211,153,0.2)]'>
            Start First Interview <BsArrowRight size={16} />
          </button>
        </div>
      </div>
      <Footer />
    </>
  )

  // Improvement rate
  const improvementRate = (() => {
    const s = data.scoreOverTime
    if (s.length < 3) return null
    const first = s.slice(0, Math.floor(s.length / 2)).reduce((a, b) => a + b.score, 0) / Math.floor(s.length / 2)
    const last  = s.slice(Math.floor(s.length / 2)).reduce((a, b) => a + b.score, 0) / Math.ceil(s.length / 2)
    return Math.round(last - first)
  })()

  const TABS = [
    { id: 'overview',  label: 'Overview'       },
    { id: 'progress',  label: 'Progress'       },
    { id: 'skills',    label: 'Skills'         },
    { id: 'history',   label: 'History'        },
    { id: 'live',      label: '🛡 Live Analysis' },
  ]

  return (
    <>
      <div className='relative min-h-screen bg-[#030303] text-white overflow-x-hidden'
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
          .a-title { font-family: 'Sora', sans-serif; }
        `}</style>

        {/* BG */}
        <div className='pointer-events-none fixed inset-0 overflow-hidden'>
          <div className='absolute w-[700px] h-[700px] bg-emerald-500 opacity-[0.04] blur-[220px] rounded-full -top-60 -left-60' />
          <div className='absolute w-[500px] h-[500px] bg-violet-500 opacity-[0.03] blur-[180px] rounded-full -bottom-32 -right-32' />
          <div className='pointer-events-none absolute inset-0'
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.012) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
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
            <BsArrowLeft size={13} className='group-hover:-translate-x-0.5 transition-transform duration-200'/>
            Back
          </motion.button>

          <div className='flex items-center gap-2 px-3.5 py-2 rounded-xl
            bg-emerald-500/8 border border-emerald-500/15 text-emerald-400 text-[11px] font-medium'>
            <BsBarChartFill size={11} /> Analytics
          </div>
        </div>



        <div className='relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-24'>

          {/* ── Header ── */}
          <FadeUp className='mb-8'>
            <div className='flex items-center justify-between flex-wrap gap-4'>
              <div>
                <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                  bg-emerald-500/8 border border-emerald-500/15 text-emerald-400 text-[11px] mb-4'>
                  <HiSparkles size={11} /> Performance Analytics
                </div>
                <h1 className='a-title text-4xl md:text-5xl font-black text-white tracking-tight'>
                  Your Progress
                </h1>
                <p className='text-white/30 text-sm mt-2'>
                  {data.totalSessions} session{data.totalSessions > 1 ? 's' : ''} completed
                  {improvementRate !== null && (
                    <span className={`ml-2 font-semibold ${improvementRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      · {improvementRate >= 0 ? '+' : ''}{improvementRate} pts improvement
                    </span>
                  )}
                </p>
              </div>
              <button onClick={() => navigate('/interview')}
                className='flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-400 text-black
                  font-bold text-sm cursor-pointer hover:bg-emerald-300 transition
                  shadow-[0_0_25px_rgba(52,211,153,0.2)]'>
                New Session <BsArrowRight size={13} />
              </button>
            </div>
          </FadeUp>

          {/* ── Tabs ── */}
          <FadeUp delay={0.03} className='mb-8'>
            <div className='flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.07]
              rounded-2xl w-fit'>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
                    ${activeTab === tab.id
                      ? 'bg-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                      : 'text-white/35 hover:text-white/60'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </FadeUp>

          {/* ══ OVERVIEW TAB ══ */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Row */}
              <FadeUp delay={0.05} className='mb-6'>
                <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                  <StatCard label='Total Sessions' value={data.totalSessions} icon={<BsClockHistory size={14} />} color='emerald' delay={0}    sub='All time' />
                  <StatCard label='Average Score'  value={data.avgScore}      suffix='%' icon={<BsStarFill size={14} />}     color='amber'   delay={0.06} sub='All sessions' />
                  <StatCard label='Best Score'     value={data.bestScore}     suffix='%' icon={<BsTrophyFill size={14} />}   color='violet'  delay={0.12} sub='Personal best' />
                  <StatCard label='Streak'         value={data.streak}        icon={<BsFire size={14} />}          color='orange'  delay={0.18} sub='Days in a row' />
                  <StatCard label='Readiness'
                    value={Math.min(100, Math.round((data.avgScore * 0.5) + (Math.min(data.totalSessions, 20) / 20) * 25 + (data.streak > 0 ? 15 : 0) + (data.bestScore >= 80 ? 10 : 0)))}
                    suffix='%' icon={<BsShieldFill size={14} />} color='sky' delay={0.24} sub='AI score' />
                </div>
              </FadeUp>

              {/* Readiness + Activity */}
              <FadeUp delay={0.1} className='mb-6'>
                <div className='grid md:grid-cols-2 gap-4'>
                  <ReadinessCard
                    avgScore={data.avgScore}
                    totalSessions={data.totalSessions}
                    streak={data.streak}
                    bestScore={data.bestScore} />
                  {/* Donut + Role */}
                  <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
                    <div className='flex items-center gap-2 mb-5'>
                      <BsPersonFill size={13} className='text-amber-400' />
                      <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Role Breakdown</p>
                    </div>
                    <div className='flex items-center gap-6'>
                      <DonutChart size={110} segments={data.roleBreakdown.slice(0, 5).map((r, i) => ({
                        value: r.count,
                        color: ['#34d399','#fbbf24','#a78bfa','#60a5fa','#fb923c'][i % 5]
                      }))} />
                      <div className='flex-1 space-y-2'>
                        {data.roleBreakdown.slice(0, 5).map((r, i) => (
                          <div key={i} className='flex items-center gap-2'>
                            <div className='w-2 h-2 rounded-full flex-shrink-0'
                              style={{ background: ['#34d399','#fbbf24','#a78bfa','#60a5fa','#fb923c'][i % 5] }} />
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center justify-between'>
                                <span className='text-[10px] text-white/55 truncate'>{r.role}</span>
                                <span className={`text-[10px] font-bold ml-2 flex-shrink-0 ${sc(r.avgScore)}`}>{r.avgScore}%</span>
                              </div>
                              <div className='h-1 bg-white/[0.05] rounded-full mt-1 overflow-hidden'>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${r.avgScore}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.1 }}
                                  className={`h-full rounded-full ${bc(r.avgScore)}`} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeUp>

              {/* Best / Worst */}
              <FadeUp delay={0.15} className='mb-6'>
                <div className='grid md:grid-cols-2 gap-4'>
                  {data.improvements.best.length > 0 && (
                    <div className='bg-emerald-500/[0.03] border border-emerald-500/12 rounded-2xl p-6'>
                      <div className='flex items-center gap-2 mb-4'>
                        <BsCheckCircleFill size={12} className='text-emerald-400' />
                        <p className='text-[10px] text-emerald-400/60 uppercase tracking-widest font-semibold'>Best Answers</p>
                      </div>
                      <div className='space-y-3'>
                        {data.improvements.best.map((q, i) => (
                          <div key={i} className='flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]'>
                            <span className='a-title text-base font-black text-emerald-400 flex-shrink-0 w-8 text-center'>{q.score}</span>
                            <div>
                              <p className='text-xs text-white/60 leading-relaxed line-clamp-2'>{q.question}</p>
                              <span className='text-[9px] text-emerald-400/50 mt-1 block'>{q.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.improvements.worst.length > 0 && (
                    <div className='bg-red-500/[0.03] border border-red-500/12 rounded-2xl p-6'>
                      <div className='flex items-center gap-2 mb-4'>
                        <BsXCircleFill size={12} className='text-red-400' />
                        <p className='text-[10px] text-red-400/60 uppercase tracking-widest font-semibold'>Needs Improvement</p>
                      </div>
                      <div className='space-y-3'>
                        {data.improvements.worst.map((q, i) => (
                          <div key={i} className='flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]'>
                            <span className='a-title text-base font-black text-red-400 flex-shrink-0 w-8 text-center'>{q.score}</span>
                            <div>
                              <p className='text-xs text-white/60 leading-relaxed line-clamp-2'>{q.question}</p>
                              <span className='text-[9px] text-red-400/50 mt-1 block'>{q.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FadeUp>
            </>
          )}

          {/* ══ PROGRESS TAB ══ */}
          {activeTab === 'progress' && (
            <>
              <FadeUp delay={0.05} className='mb-6'>
                <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
                  <div className='flex items-center gap-2 mb-2'>
                    <BsGraphUp size={13} className='text-emerald-400' />
                    <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Score Over Time</p>
                  </div>
                  <LineChart data={data.scoreOverTime} height={200} />
                </div>
              </FadeUp>

              <FadeUp delay={0.1} className='mb-6'>
                <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
                  <div className='flex items-center gap-2 mb-5'>
                    <BsCalendarCheck size={13} className='text-sky-400' />
                    <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Activity Heatmap</p>
                  </div>
                  <HeatmapCalendar sessions={sessions.length > 0 ? sessions : data.recentSessions.map(s => ({
                    completedAt: s.date, report: { avgScore: s.score }
                  }))} />
                </div>
              </FadeUp>

              {/* Difficulty breakdown */}
              <FadeUp delay={0.15}>
                <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
                  <div className='flex items-center gap-2 mb-6'>
                    <BsTrophyFill size={13} className='text-amber-400' />
                    <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Difficulty Breakdown</p>
                  </div>
                  <div className='grid grid-cols-3 gap-4'>
                    {data.difficultyBreakdown.map((d, i) => {
                      const cs = {
                        easy:   { text: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/15', bar: 'bg-emerald-400', label: 'Easy' },
                        medium: { text: 'text-amber-400',   bg: 'bg-amber-500/8',   border: 'border-amber-500/15',   bar: 'bg-amber-400',   label: 'Medium' },
                        hard:   { text: 'text-red-400',     bg: 'bg-red-500/8',     border: 'border-red-500/15',     bar: 'bg-red-400',     label: 'Hard' },
                      }[d.difficulty] || {}
                      return (
                        <div key={i} className={`${cs.bg} border ${cs.border} rounded-2xl p-5 text-center`}>
                          <p className={`a-title text-4xl font-black ${cs.text} mb-1`}>{d.count}</p>
                          <p className='text-xs text-white/35 mb-4'>{cs.label} session{d.count !== 1 ? 's' : ''}</p>
                          {d.count > 0 && (
                            <>
                              <div className='h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2'>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${d.avgScore}%` }}
                                  transition={{ duration: 1.2, ease: 'easeOut' }}
                                  className={`h-full rounded-full ${cs.bar}`} />
                              </div>
                              <p className={`text-sm font-bold ${sc(d.avgScore)}`}>Avg: {d.avgScore}%</p>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </FadeUp>
            </>
          )}

          {/* ══ SKILLS TAB ══ */}
          {activeTab === 'skills' && (
            <>
              <FadeUp delay={0.05} className='mb-6'>
                <div className='grid md:grid-cols-2 gap-4'>
                  <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
                    <div className='flex items-center gap-2 mb-5'>
                      <BsAward size={13} className='text-violet-400' />
                      <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Topic Performance Radar</p>
                    </div>
                    {Object.keys(data.topicPerformance).length > 0 ? (
                      <RadarChart data={data.topicPerformance} size={240} />
                    ) : (
                      <div className='h-48 flex items-center justify-center text-white/15 text-xs'>No topic data yet</div>
                    )}
                  </div>

                  <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
                    <div className='flex items-center gap-2 mb-5'>
                      <BsLightningChargeFill size={13} className='text-emerald-400' />
                      <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Topic Score Bars</p>
                    </div>
                    {Object.keys(data.topicPerformance).length > 0 ? (
                      <div className='space-y-4'>
                        {Object.entries(data.topicPerformance).map(([topic, score]) => (
                          <div key={topic}>
                            <div className='flex items-center justify-between mb-1.5'>
                              <span className='text-xs text-white/55 font-medium'>{topic}</span>
                              <span className={`text-xs font-black ${sc(score)}`} style={{ fontFamily: "'Sora',sans-serif" }}>{score}%</span>
                            </div>
                            <div className='h-2 bg-white/[0.05] rounded-full overflow-hidden'>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full rounded-full ${bc(score)}`} />
                            </div>
                            <p className='text-[9px] text-white/20 mt-1'>
                              {score >= 80 ? '✓ Strong area' : score >= 60 ? '~ Room to grow' : '↑ Focus here'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='h-48 flex items-center justify-center text-white/15 text-xs'>No data yet</div>
                    )}
                  </div>
                </div>
              </FadeUp>

              {/* Improvement Tips */}
              <FadeUp delay={0.1}>
                <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
                  <div className='flex items-center gap-2 mb-5'>
                    <HiSparkles size={14} className='text-amber-400' />
                    <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>AI Recommendations</p>
                  </div>
                  <div className='grid md:grid-cols-3 gap-4'>
                    {[
                      {
                        label: 'Strong Area',
                        value: Object.entries(data.topicPerformance).sort((a,b) => b[1]-a[1])[0]?.[0] || '—',
                        tip: 'Leverage this in interviews. Lead with confidence.',
                        color: 'emerald',
                        icon: '💪'
                      },
                      {
                        label: 'Focus Area',
                        value: Object.entries(data.topicPerformance).sort((a,b) => a[1]-b[1])[0]?.[0] || '—',
                        tip: 'Practice 2–3 targeted questions daily to improve.',
                        color: 'red',
                        icon: '🎯'
                      },
                      {
                        label: 'Best Role',
                        value: data.roleBreakdown.sort((a,b) => b.avgScore - a.avgScore)[0]?.role || '—',
                        tip: 'Your highest-scoring role. Consider targeting this.',
                        color: 'violet',
                        icon: '🏆'
                      },
                    ].map((r, i) => (
                      <div key={i} className={`p-5 rounded-2xl border
                        ${r.color === 'emerald' ? 'bg-emerald-500/[0.04] border-emerald-500/12'
                        : r.color === 'red' ? 'bg-red-500/[0.04] border-red-500/12'
                        : 'bg-violet-500/[0.04] border-violet-500/12'}`}>
                        <p className='text-2xl mb-3'>{r.icon}</p>
                        <p className='text-[9px] text-white/25 uppercase tracking-widest mb-1'>{r.label}</p>
                        <p className='text-sm font-bold text-white/80 mb-2' style={{ fontFamily: "'Sora',sans-serif" }}>{r.value}</p>
                        <p className='text-[11px] text-white/35 leading-relaxed'>{r.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>
            </>
          )}

          {/* ══ HISTORY TAB ══ */}
          {activeTab === 'history' && (
            <FadeUp delay={0.05}>
              <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
                <div className='flex items-center gap-2 mb-6'>
                  <BsClockHistory size={13} className='text-white/30' />
                  <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Session History</p>
                </div>
                <SessionTable sessions={sessions.length > 0 ? sessions :
                  data.recentSessions.map(s => ({
                    _id: s.id, role: s.role, difficulty: s.difficulty,
                    completedAt: s.date, createdAt: s.date,
                    report: { avgScore: s.score, recommendation: s.recommendation }
                  }))} />
              </div>
            </FadeUp>
          )}

          {/* ══ LIVE ANALYSIS TAB ══ */}
          {activeTab === 'live' && (() => {
            const ps = data.proctoringStats || {}
            const EMOTION_EMOJI = { happy: '😊', neutral: '😐', surprised: '😮', fearful: '😰', sad: '😟', angry: '😤', disgusted: '🤢' }
            const VIOLATION_LABEL = { tab_switch: 'Tab Switch', no_face: 'No Face Detected', gaze: 'Gaze Away', multiple_faces: 'Multiple Faces', voice: 'Extra Voice' }
            const trend = ps.proctoringTrend || []
            const hasProcData = (ps.avgConfidence || 0) + (ps.avgWPM || 0) + (ps.avgEyeContact || 0) > 0

            if (!hasProcData) return (
              <FadeUp key='no-live'>
                <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-14 text-center'>
                  <p className='text-5xl mb-5'>🛡</p>
                  <p className='text-white/55 text-sm font-semibold mb-2'>No Live Analysis Data Yet</p>
                  <p className='text-white/25 text-xs max-w-sm mx-auto leading-relaxed mb-8'>
                    Complete a Live Video Interview to unlock real-time proctoring metrics —
                    confidence score, eye contact %, WPM, violation log, and facial emotion analysis.
                  </p>
                  <button onClick={() => navigate('/interview')}
                    className='inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-400
                      text-black font-bold text-sm cursor-pointer hover:bg-emerald-300 transition'>
                    Start Live Interview <BsArrowRight size={13} />
                  </button>
                </div>
              </FadeUp>
            )

            return (
              <div key='live-content' className='space-y-6'>

                {/* ── 4 stat cards ── */}
                <FadeUp delay={0.04}>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <StatCard label='Avg Confidence'  value={ps.avgConfidence || 0}  suffix='%' icon={<BsLightningChargeFill size={14}/>} color='emerald' delay={0}    sub='Speech confidence score' />
                    <StatCard label='Avg Speed'       value={ps.avgWPM || 0}          suffix=' WPM' icon={<BsClockFill size={14}/>}    color='sky'     delay={0.06} sub='Words per minute' />
                    <StatCard label='Avg Eye Contact' value={ps.avgEyeContact || 0}   suffix='%' icon={<BsShieldFill size={14}/>}     color='violet'  delay={0.12} sub='Camera focus score' />
                    <StatCard label='Integrity Score' value={ps.avgIntegrity ?? 100}  suffix='%' icon={<BsAward size={14}/>}          color='amber'   delay={0.18} sub='Avg across sessions' />
                  </div>
                </FadeUp>

                {/* ── Trend chart + Violation breakdown ── */}
                <FadeUp delay={0.1}>
                  <div className='grid md:grid-cols-2 gap-4'>

                    {/* Proctoring trend */}
                    <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
                      <div className='flex items-center gap-2 mb-5'>
                        <BsGraphUp size={13} className='text-emerald-400'/>
                        <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Proctoring Trend</p>
                        <span className='text-[9px] text-white/20 ml-auto'>Last {trend.length} sessions</span>
                      </div>
                      {trend.length > 1 ? (
                        <div className='space-y-5'>
                          {[
                            { k: 'confidence', label: 'Confidence', color: '#34d399' },
                            { k: 'eyeContact', label: 'Eye Contact', color: '#a78bfa' },
                            { k: 'integrity',  label: 'Integrity',   color: '#fbbf24' },
                          ].map(m => (
                            <div key={m.k}>
                              <div className='flex items-center justify-between mb-2'>
                                <span className='text-[10px] text-white/40'>{m.label}</span>
                                <span className='text-[10px] font-bold' style={{ color: m.color }}>
                                  {trend[trend.length - 1]?.[m.k] || 0}%
                                </span>
                              </div>
                              <div className='flex items-end gap-1 h-12'>
                                {trend.map((t, i) => (
                                  <motion.div key={i}
                                    initial={{ scaleY: 0, originY: 1 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ duration: 0.6, delay: i * 0.08 }}
                                    className='flex-1 rounded-t-md min-h-[3px]'
                                    style={{ height: `${Math.max(4, (t[m.k] / 100) * 48)}px`, background: m.color, opacity: 0.75 }}
                                    title={`${t.date}: ${t[m.k]}%`}
                                  />
                                ))}
                              </div>
                              <div className='flex mt-1'>
                                {trend.map((t, i) => (
                                  <span key={i} className='flex-1 text-center text-[8px] text-white/15'>{t.date?.slice(5)}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='h-40 flex items-center justify-center text-white/15 text-xs italic'>
                          Need at least 2 live sessions for trend
                        </div>
                      )}
                    </div>

                    {/* Violation breakdown */}
                    <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
                      <div className='flex items-center gap-2 mb-5'>
                        <BsShieldFill size={13} className='text-red-400'/>
                        <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Violation Breakdown</p>
                      </div>
                      <div className='flex items-center gap-4 p-4 rounded-xl bg-red-500/[0.04] border border-red-500/10 mb-5'>
                        <div className='text-center flex-shrink-0'>
                          <p className='text-3xl font-black text-red-400' style={{ fontFamily: "'Sora',sans-serif" }}>
                            {ps.totalViolations || 0}
                          </p>
                          <p className='text-[9px] text-white/25 mt-0.5'>Total Violations</p>
                        </div>
                        <p className='text-xs text-white/40 leading-relaxed'>
                          {!ps.totalViolations
                            ? '✅ Perfect integrity — zero violations detected across all sessions.'
                            : `${ps.totalViolations} violation${ps.totalViolations > 1 ? 's' : ''} detected. Review the breakdown below.`}
                        </p>
                      </div>
                      {(ps.violationBreakdown || []).length > 0 ? (
                        <div className='space-y-3'>
                          {ps.violationBreakdown.map((v, i) => (
                            <div key={i}>
                              <div className='flex items-center justify-between mb-1.5'>
                                <span className='text-xs text-white/50'>{VIOLATION_LABEL[v.type] || v.type}</span>
                                <span className='text-xs font-bold text-red-400'>{v.count}×</span>
                              </div>
                              <div className='h-1.5 bg-white/[0.05] rounded-full overflow-hidden'>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(v.count / Math.max(ps.totalViolations, 1)) * 100}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.1 }}
                                  className='h-full rounded-full bg-red-400'
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className='text-white/20 text-xs text-center py-6'>No violations recorded 🎉</p>
                      )}
                    </div>
                  </div>
                </FadeUp>

                {/* ── Emotion + Keywords/Fillers ── */}
                <FadeUp delay={0.15}>
                  <div className='grid md:grid-cols-2 gap-4'>

                    {/* Emotion distribution */}
                    <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
                      <div className='flex items-center gap-2 mb-5'>
                        <HiSparkles size={13} className='text-amber-400'/>
                        <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Emotion Distribution</p>
                      </div>
                      {(ps.emotionBreakdown || []).length > 0 ? (
                        <div className='space-y-3'>
                          {ps.emotionBreakdown.map((e, i) => {
                            const total = ps.emotionBreakdown.reduce((a, x) => a + x.count, 0)
                            const pct   = Math.round((e.count / total) * 100)
                            return (
                              <div key={i}>
                                <div className='flex items-center justify-between mb-1.5'>
                                  <span className='text-xs text-white/55 capitalize flex items-center gap-1.5'>
                                    <span>{EMOTION_EMOJI[e.emotion] || '😐'}</span>
                                    {e.emotion}
                                  </span>
                                  <span className='text-[10px] text-white/30'>{pct}% · {e.count} session{e.count > 1 ? 's' : ''}</span>
                                </div>
                                <div className='h-1.5 bg-white/[0.05] rounded-full overflow-hidden'>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                    className='h-full rounded-full bg-amber-400'
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className='h-36 flex flex-col items-center justify-center gap-2'>
                          <span className='text-4xl'>😐</span>
                          <p className='text-white/20 text-xs'>No emotion data recorded yet</p>
                        </div>
                      )}
                      <p className='text-[9px] text-white/20 mt-4 pt-3 border-t border-white/[0.05]'>
                        ℹ Tracked via facial expression model during live interviews
                      </p>
                    </div>

                    {/* Keywords + Fillers */}
                    <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
                      <div className='flex items-center gap-2 mb-5'>
                        <BsCheckCircleFill size={13} className='text-emerald-400'/>
                        <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Top Keywords Used</p>
                      </div>
                      {(ps.topKeywords || []).length > 0 ? (
                        <div className='flex flex-wrap gap-2 mb-6'>
                          {ps.topKeywords.map((k, i) => (
                            <span key={i}
                              className='px-3 py-1.5 rounded-xl bg-emerald-500/8 border border-emerald-500/15
                                text-emerald-400 text-[11px] font-medium'>
                              ✓ {k}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className='text-white/20 text-xs mb-6 leading-relaxed'>
                          No keyword data yet. Paste a Job Description in the interview setup screen
                          to start tracking matched keywords.
                        </p>
                      )}
                      <div className='border-t border-white/[0.05] pt-4 space-y-3'>
                        <div className='flex items-center justify-between'>
                          <span className='text-[11px] text-white/35'>Total Filler Words (all sessions)</span>
                          <span className='text-lg font-black text-amber-400' style={{ fontFamily: "'Sora',sans-serif" }}>
                            {ps.totalFillers || 0}
                          </span>
                        </div>
                        <div className='px-3 py-2.5 rounded-xl text-[11px] leading-relaxed
                          bg-white/[0.02] border border-white/[0.05] text-white/35'>
                          {!ps.totalFillers
                            ? '✅ Excellent — very clean speech across all sessions!'
                            : ps.totalFillers < 10
                            ? '👍 Good — minimal filler usage.'
                            : ps.totalFillers < 30
                            ? '⚠️ Some fillers detected. Practice pausing instead of saying "um/uh/like".'
                            : '🔴 High filler count. Focus on deliberate pausing and structured responses.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeUp>

              </div>
            )
          })()}

        </div>
      </div>
      <Footer />
    </>
  )
}