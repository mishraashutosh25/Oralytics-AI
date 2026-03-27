import React, { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import { questions, COMPANIES, TOPICS, DIFFICULTIES } from '../data/dsaQuestions'
import {
  BsArrowLeft, BsSearch, BsFilterLeft, BsBookmarkFill, BsBookmark,
  BsLightningChargeFill, BsStarFill, BsChevronDown, BsBuilding,
  BsCalendarCheck, BsCheckCircleFill, BsXCircleFill, BsBarChartFill,
  BsArrowRight, BsGraphUp
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'

const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    className={className}
  >{children}</motion.div>
)

const DIFF_COLORS = {
  Easy: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  Medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  Hard: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
}

const TOPIC_EMOJIS = {
  'Arrays': '📦', 'Strings': '🔤', 'Linked List': '🔗', 'Trees': '🌳',
  'Graphs': '🕸️', 'Dynamic Programming': '🧠', 'Stack & Queue': '📚',
  'Sorting & Searching': '🔍', 'Recursion & Backtracking': '🔄', 'Hashing': '#️⃣'
}

const COMPANY_LOGOS = {
  'Google': '🔵', 'Amazon': '🟠', 'Microsoft': '🟦', 'Meta': '🔷', 'Apple': '🍎',
  'Netflix': '🔴', 'Uber': '⬛', 'Adobe': '🟥', 'Goldman Sachs': '🏦', 'Flipkart': '💛',
  'Walmart': '🟡', 'Infosys': '🔵', 'TCS': '🟣', 'Wipro': '🌻', 'Paytm': '💙',
  'PhonePe': '💜', 'Razorpay': '💎', 'Swiggy': '🧡', 'Zomato': '❤️', 'Atlassian': '🔹'
}

const TOP_COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Uber', 'Adobe', 'Flipkart', 'Goldman Sachs', 'Paytm']

const PER_PAGE = 20

export default function QuestionBank() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedCompany, setSelectedCompany] = useState('All')
  const [selectedYear, setSelectedYear] = useState('All')
  const [sortBy, setSortBy] = useState('frequency') // frequency | difficulty | year
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('oralytics_qbank_bookmarks') || '[]') }
    catch { return [] }
  })
  const [showHint, setShowHint] = useState(null)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const topRef = useRef(null)

  const toggleBookmark = (id) => {
    const next = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id]
    setBookmarks(next)
    localStorage.setItem('oralytics_qbank_bookmarks', JSON.stringify(next))
  }

  const years = [...new Set(questions.map(q => q.year))].sort((a, b) => b - a)

  const filtered = useMemo(() => {
    let result = [...questions]
    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter(q =>
        q.title.toLowerCase().includes(s) ||
        q.company.toLowerCase().includes(s) ||
        q.topic.toLowerCase().includes(s)
      )
    }
    if (selectedTopic !== 'All') result = result.filter(q => q.topic === selectedTopic)
    if (selectedDifficulty !== 'All') result = result.filter(q => q.difficulty === selectedDifficulty)
    if (selectedCompany !== 'All') result = result.filter(q => q.company === selectedCompany)
    if (selectedYear !== 'All') result = result.filter(q => q.year === parseInt(selectedYear))

    if (sortBy === 'frequency') result.sort((a, b) => b.frequency - a.frequency)
    if (sortBy === 'difficulty') result.sort((a, b) => {
      const order = { Easy: 0, Medium: 1, Hard: 2 }
      return order[a.difficulty] - order[b.difficulty]
    })
    if (sortBy === 'year') result.sort((a, b) => b.year - a.year)

    return result
  }, [search, selectedTopic, selectedDifficulty, selectedCompany, selectedYear, sortBy])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Stats
  const topicCounts = {}
  TOPICS.forEach(t => { topicCounts[t] = questions.filter(q => q.topic === t).length })
  const companyCounts = {}
  TOP_COMPANIES.forEach(c => { companyCounts[c] = questions.filter(q => q.company === c).length })
  const diffCounts = { Easy: 0, Medium: 0, Hard: 0 }
  questions.forEach(q => diffCounts[q.difficulty]++)

  const resetFilters = () => {
    setSearch(''); setSelectedTopic('All'); setSelectedDifficulty('All')
    setSelectedCompany('All'); setSelectedYear('All'); setPage(1)
  }

  const activeFilters = [selectedTopic, selectedDifficulty, selectedCompany, selectedYear].filter(f => f !== 'All').length + (search ? 1 : 0)

  return (
    <>
      <div className='relative w-full min-h-screen bg-[#030303] text-white overflow-x-hidden'
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
          .qb-title { font-family: 'Sora', sans-serif; }
          @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
          .freq-bar { background: linear-gradient(90deg, rgba(52,211,153,0.3), rgba(52,211,153,0.08)); }
        `}</style>

        {/* BG */}
        <div className='pointer-events-none fixed inset-0 overflow-hidden'>
          <div className='absolute w-[700px] h-[700px] bg-violet-500 opacity-[0.04] blur-[200px] rounded-full -top-60 -right-60' />
          <div className='absolute w-[500px] h-[500px] bg-emerald-500 opacity-[0.05] blur-[180px] rounded-full -bottom-40 -left-40' />
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
            <BsArrowLeft size={13} className='group-hover:-translate-x-0.5 transition-transform duration-200' />
            Back
          </motion.button>

          <div className='flex items-center gap-2 px-3.5 py-2 rounded-xl
            bg-violet-500/8 border border-violet-500/15 text-violet-400 text-[11px] font-medium'>
            <BsBookmarkFill size={10} /> Question Bank
          </div>
        </div>

        <div ref={topRef} className='relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-24'>

          {/* ── Header ── */}
          <FadeUp className='mb-8'>
            <div className='flex items-center gap-2 mb-4'>
              <span className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                bg-violet-500/8 border border-violet-500/15 text-violet-400 text-[11px]'>
                <HiSparkles size={11} /> Company-Curated DSA Questions
              </span>
            </div>
            <h1 className='qb-title text-4xl md:text-5xl font-black text-white tracking-tight mb-2'>
              DSA Question Bank
            </h1>
            <p className='text-white/30 text-sm max-w-xl leading-relaxed'>
              200+ most-asked DSA questions from top tech companies — Google, Amazon, Meta, Microsoft & more.
              Filtered by topic, company, year & difficulty.
            </p>
          </FadeUp>

          {/* ── Quick Stats ── */}
          <FadeUp delay={0.04} className='mb-8'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              {[
                { label: 'Total Questions', value: questions.length, icon: <BsBarChartFill size={14} />, color: 'violet' },
                { label: 'Companies', value: [...new Set(questions.map(q => q.company))].length, icon: <BsBuilding size={14} />, color: 'sky' },
                { label: 'Topics', value: TOPICS.length, icon: <BsGraphUp size={14} />, color: 'emerald' },
                { label: 'Bookmarked', value: bookmarks.length, icon: <BsBookmarkFill size={14} />, color: 'amber' },
              ].map((s, i) => (
                <div key={i} className={`bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-4`}>
                  <div className={`w-8 h-8 rounded-xl mb-3 flex items-center justify-center
                    ${s.color === 'violet' ? 'bg-violet-500/10 text-violet-400'
                      : s.color === 'sky' ? 'bg-sky-500/10 text-sky-400'
                        : s.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'}`}>
                    {s.icon}
                  </div>
                  <p className='qb-title text-2xl font-black text-white'>{s.value}</p>
                  <p className='text-[10px] text-white/25 mt-0.5'>{s.label}</p>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* ── Topic Pills ── */}
          <FadeUp delay={0.06} className='mb-6'>
            <div className='flex flex-wrap gap-2'>
              <button onClick={() => { setSelectedTopic('All'); setPage(1) }}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border
                  ${selectedTopic === 'All'
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/35 hover:text-white/60'}`}>
                All Topics ({questions.length})
              </button>
              {TOPICS.map(t => (
                <button key={t} onClick={() => { setSelectedTopic(t); setPage(1) }}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border
                    flex items-center gap-1.5
                    ${selectedTopic === t
                      ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                      : 'bg-white/[0.03] border-white/[0.06] text-white/35 hover:text-white/60'}`}>
                  <span>{TOPIC_EMOJIS[t]}</span> {t}
                  <span className='text-[9px] opacity-50'>({topicCounts[t]})</span>
                </button>
              ))}
            </div>
          </FadeUp>

          {/* ── Search + Filter Row ── */}
          <FadeUp delay={0.08} className='mb-6'>
            <div className='flex flex-col md:flex-row gap-3'>
              {/* Search */}
              <div className='flex-1 relative'>
                <BsSearch size={13} className='absolute left-4 top-1/2 -translate-y-1/2 text-white/20' />
                <input type='text' value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder='Search questions, companies...'
                  className='w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]
                    text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-violet-500/30
                    transition-all' />
              </div>

              {/* Difficulty */}
              <div className='flex gap-2'>
                {['All', ...DIFFICULTIES].map(d => (
                  <button key={d} onClick={() => { setSelectedDifficulty(d); setPage(1) }}
                    className={`px-4 py-3 rounded-xl text-xs font-medium cursor-pointer border transition-all
                      ${selectedDifficulty === d
                        ? d === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : d === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : d === 'Hard' ? 'bg-red-500/10 border-red-500/20 text-red-400'
                              : 'bg-white/10 border-white/20 text-white'
                        : 'bg-white/[0.03] border-white/[0.06] text-white/35 hover:text-white/60'}`}>
                    {d} {d !== 'All' && <span className='text-[9px] opacity-50 ml-1'>({diffCounts[d]})</span>}
                  </button>
                ))}
              </div>

              {/* More Filters Toggle */}
              <button onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl text-xs font-medium cursor-pointer border flex items-center gap-2 transition-all
                  ${showFilters ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/35 hover:text-white/60'}`}>
                <BsFilterLeft size={14} /> Filters
                {activeFilters > 0 && (
                  <span className='w-5 h-5 rounded-full bg-violet-400 text-black text-[10px] font-bold flex items-center justify-center'>
                    {activeFilters}
                  </span>
                )}
              </button>
            </div>
          </FadeUp>

          {/* ── Expanded Filters ── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className='overflow-hidden mb-6'
              >
                <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-5 space-y-4'>
                  {/* Company */}
                  <div>
                    <p className='text-[10px] text-white/25 uppercase tracking-widest mb-3'>Company</p>
                    <div className='flex flex-wrap gap-2'>
                      <button onClick={() => { setSelectedCompany('All'); setPage(1) }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer border transition
                          ${selectedCompany === 'All' ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/50'}`}>
                        All
                      </button>
                      {TOP_COMPANIES.map(c => (
                        <button key={c} onClick={() => { setSelectedCompany(c); setPage(1) }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer border transition
                            flex items-center gap-1.5
                            ${selectedCompany === c ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                              : 'bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/50'}`}>
                          <span>{COMPANY_LOGOS[c]}</span> {c}
                          <span className='text-[9px] opacity-40'>({companyCounts[c]})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Year + Sort */}
                  <div className='flex flex-wrap gap-6'>
                    <div>
                      <p className='text-[10px] text-white/25 uppercase tracking-widest mb-3'>Year</p>
                      <div className='flex gap-2'>
                        <button onClick={() => { setSelectedYear('All'); setPage(1) }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer border transition
                            ${selectedYear === 'All' ? 'bg-white/10 border-white/20 text-white'
                              : 'bg-white/[0.03] border-white/[0.06] text-white/30'}`}>
                          All
                        </button>
                        {years.map(y => (
                          <button key={y} onClick={() => { setSelectedYear(String(y)); setPage(1) }}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer border transition
                              ${selectedYear === String(y) ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                                : 'bg-white/[0.03] border-white/[0.06] text-white/30'}`}>
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className='text-[10px] text-white/25 uppercase tracking-widest mb-3'>Sort By</p>
                      <div className='flex gap-2'>
                        {[
                          { id: 'frequency', label: '🔥 Most Asked' },
                          { id: 'difficulty', label: '📊 Difficulty' },
                          { id: 'year', label: '📅 Year' },
                        ].map(s => (
                          <button key={s.id} onClick={() => setSortBy(s.id)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer border transition
                              ${sortBy === s.id ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-white/[0.03] border-white/[0.06] text-white/30'}`}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {activeFilters > 0 && (
                    <button onClick={resetFilters}
                      className='text-[11px] text-red-400/60 hover:text-red-400 cursor-pointer transition'>
                      ✕ Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Results Info ── */}
          <FadeUp delay={0.1} className='mb-4'>
            <div className='flex items-center justify-between'>
              <p className='text-white/30 text-xs'>
                Showing <span className='text-white/60 font-semibold'>{filtered.length}</span> question{filtered.length !== 1 ? 's' : ''}
                {activeFilters > 0 && <span className='text-violet-400/60 ml-1'>({activeFilters} filter{activeFilters > 1 ? 's' : ''} active)</span>}
              </p>
              <p className='text-white/20 text-[10px]'>
                Page {page} of {totalPages || 1}
              </p>
            </div>
          </FadeUp>

          {/* ── Question Cards ── */}
          {paginated.length > 0 ? (
            <div className='space-y-3 mb-8'>
              <AnimatePresence mode='popLayout'>
                {paginated.map((q, i) => {
                  const dc = DIFF_COLORS[q.difficulty]
                  return (
                    <motion.div key={q.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, delay: i * 0.02 }}
                      className='group bg-[#0b0b0b] border border-white/[0.07] rounded-2xl
                        hover:border-white/[0.12] hover:bg-white/[0.02] transition-all duration-300 overflow-hidden'
                    >
                      <div className='p-5'>
                        <div className='flex items-start justify-between gap-4'>
                          {/* Left */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-2 flex-wrap'>
                              <span className='text-[10px] text-white/20 font-mono'>#{q.id}</span>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${dc.bg} ${dc.border} ${dc.text}`}>
                                {q.difficulty}
                              </span>
                              <span className='text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/35'>
                                {TOPIC_EMOJIS[q.topic]} {q.topic}
                              </span>
                            </div>

                            <h3 className='text-sm font-semibold text-white/80 mb-2 group-hover:text-white transition-colors'>
                              {q.title}
                            </h3>

                            <div className='flex items-center gap-3 flex-wrap'>
                              <span className='flex items-center gap-1.5 text-[11px] text-white/35'>
                                <span>{COMPANY_LOGOS[q.company] || '🏢'}</span>
                                <span className='font-medium'>{q.company}</span>
                              </span>
                              <span className='flex items-center gap-1 text-[11px] text-white/25'>
                                <BsCalendarCheck size={9} /> {q.year}
                              </span>
                              <span className='flex items-center gap-1 text-[11px] text-emerald-400/60'>
                                <BsLightningChargeFill size={9} /> {q.frequency}% frequency
                              </span>
                            </div>

                            {/* Frequency bar */}
                            <div className='mt-3 h-1 bg-white/[0.04] rounded-full overflow-hidden max-w-[200px]'>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${q.frequency}%` }}
                                transition={{ duration: 0.8, delay: i * 0.02 + 0.2 }}
                                className='h-full rounded-full freq-bar'
                              />
                            </div>
                          </div>

                          {/* Right actions */}
                          <div className='flex flex-col items-end gap-2 flex-shrink-0'>
                            <button onClick={() => toggleBookmark(q.id)}
                              className='p-2 rounded-lg hover:bg-white/[0.06] transition cursor-pointer'>
                              {bookmarks.includes(q.id)
                                ? <BsBookmarkFill size={14} className='text-amber-400' />
                                : <BsBookmark size={14} className='text-white/20 hover:text-white/50' />
                              }
                            </button>
                            <button onClick={() => setShowHint(showHint === q.id ? null : q.id)}
                              className='text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07]
                                text-white/30 hover:text-white/60 cursor-pointer transition'>
                              {showHint === q.id ? 'Hide' : '💡 Hint'}
                            </button>
                          </div>
                        </div>

                        {/* Hint */}
                        <AnimatePresence>
                          {showHint === q.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className='overflow-hidden'
                            >
                              <div className='mt-3 px-4 py-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/10
                                text-xs text-amber-400/70 leading-relaxed'>
                                💡 <span className='font-medium text-amber-400'>Hint:</span> {q.hint}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <FadeUp className='mb-8'>
              <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-14 text-center'>
                <p className='text-4xl mb-4'>🔍</p>
                <p className='text-white/50 text-sm font-semibold mb-2'>No questions found</p>
                <p className='text-white/25 text-xs mb-6'>Try adjusting your filters or search term.</p>
                <button onClick={resetFilters}
                  className='px-5 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20
                    text-violet-400 text-xs font-medium cursor-pointer hover:bg-violet-500/15 transition'>
                  Clear Filters
                </button>
              </div>
            </FadeUp>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <FadeUp delay={0.12} className='mb-12'>
              <div className='flex items-center justify-center gap-2'>
                <button onClick={() => { setPage(Math.max(1, page - 1)); topRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
                  disabled={page === 1}
                  className='px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]
                    text-white/40 text-sm cursor-pointer hover:text-white/70 transition disabled:opacity-30'>
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page + i - 2
                  if (p < 1 || p > totalPages) return null
                  return (
                    <button key={p} onClick={() => { setPage(p); topRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
                      className={`w-9 h-9 rounded-xl text-sm font-medium cursor-pointer transition
                        ${p === page ? 'bg-violet-500/15 border border-violet-500/25 text-violet-400'
                          : 'bg-white/[0.04] border border-white/[0.07] text-white/30 hover:text-white/60'}`}>
                      {p}
                    </button>
                  )
                })}
                <button onClick={() => { setPage(Math.min(totalPages, page + 1)); topRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
                  disabled={page === totalPages}
                  className='px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]
                    text-white/40 text-sm cursor-pointer hover:text-white/70 transition disabled:opacity-30'>
                  Next →
                </button>
              </div>
            </FadeUp>
          )}

          {/* ── Company Frequency Grid ── */}
          <FadeUp delay={0.14}>
            <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-6'>
              <div className='flex items-center gap-2 mb-5'>
                <BsBuilding size={13} className='text-sky-400' />
                <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>Questions by Company</p>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                {TOP_COMPANIES.map(c => (
                  <button key={c}
                    onClick={() => { setSelectedCompany(c === selectedCompany ? 'All' : c); setPage(1) }}
                    className={`p-4 rounded-xl border text-center cursor-pointer transition-all duration-200
                      ${selectedCompany === c
                        ? 'bg-violet-500/10 border-violet-500/20'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'}`}>
                    <span className='text-2xl block mb-2'>{COMPANY_LOGOS[c]}</span>
                    <p className='text-xs font-semibold text-white/70 mb-0.5'>{c}</p>
                    <p className='text-[10px] text-white/25'>{companyCounts[c]} questions</p>
                  </button>
                ))}
              </div>
            </div>
          </FadeUp>

        </div>
      </div>
      <Footer />
    </>
  )
}
