import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  BsCheckCircleFill, BsXCircleFill,
  BsLightningChargeFill, BsBriefcaseFill
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import { ServerURL } from '../App'

const scoreColor = (s) => s >= 75 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400'
const barColor = (s) => s >= 75 ? 'bg-emerald-400' : s >= 50 ? 'bg-amber-400' : 'bg-red-400'

export default function JDMatcherCard() {
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const handleMatch = async () => {
    if (jd.trim().length < 50) {
      setError("Please paste a proper job description (min 50 characters)")
      return
    }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await axios.post(
        ServerURL + '/api/interview/match-jd',
        { jobDescription: jd },
        { withCredentials: true }
      )
      setResult(res.data.result)
    } catch (e) {
      setError(e.response?.data?.message || "Analysis failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setJd('')
    setError(null)
  }

  return (
    <div className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 mt-4'>

      {/* Header */}
      <div className='flex items-start justify-between mb-5'>
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <BsBriefcaseFill size={14} className='text-violet-400' />
            <h2 className='s-title text-lg font-bold text-white'>Resume vs Job Description</h2>
          </div>
          <p className='text-white/35 text-xs'>
            Paste any job description — AI will tell you how well your resume matches
          </p>
        </div>
        {result && (
          <div className={`text-center px-4 py-2 rounded-xl border flex-shrink-0 ml-4
            ${result.matchScore >= 75 ? 'bg-emerald-500/10 border-emerald-500/20'
              : result.matchScore >= 50 ? 'bg-amber-500/10 border-amber-500/20'
                : 'bg-red-500/10 border-red-500/20'}`}>
            <p className={`s-title text-2xl font-black ${scoreColor(result.matchScore)}`}>
              {result.matchScore}%
            </p>
            <p className='text-[10px] text-white/30'>match</p>
          </div>
        )}
      </div>

      {/* JD Input */}
      <div className='relative mb-4'>
        <textarea
          value={jd}
          onChange={e => { setJd(e.target.value); setResult(null); setError(null) }}
          placeholder='Paste the job description here...'
          rows={expanded ? 10 : 4}
          className='w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
            text-white text-xs placeholder-white/20 outline-none resize-none
            focus:border-violet-500/40 focus:bg-white/[0.06] transition-all duration-200 leading-relaxed'
        />
        <div className='flex items-center justify-between mt-2'>
          <span className='text-[10px] text-white/20'>{jd.length} characters</span>
          <button onClick={() => setExpanded(!expanded)}
            className='text-[10px] text-white/30 hover:text-white/60 transition cursor-pointer'>
            {expanded ? 'Collapse ↑' : 'Expand ↓'}
          </button>
        </div>
      </div>

      {error && <p className='text-red-400 text-xs mb-4'>{error}</p>}

      {/* Match button */}
      <button
        onClick={handleMatch}
        disabled={loading || jd.trim().length < 50}
        className='w-full flex items-center justify-center gap-2 py-3 rounded-xl
          bg-violet-400 text-black font-bold text-sm cursor-pointer
          hover:bg-violet-300 transition-all duration-300
          disabled:opacity-40 disabled:cursor-not-allowed
          shadow-[0_0_20px_rgba(167,139,250,0.2)]'>
        {loading
          ? <><div className='w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin' /> Analyzing Match...</>
          : <><HiSparkles size={14} /> Match Resume with JD</>
        }
      </button>

      {/* Reset button — result aane ke baad dikhao */}
      {result && (
        <button
          onClick={handleReset}
          className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
            bg-white/[0.04] border border-white/[0.07] text-white/40 text-sm
            hover:bg-white/[0.07] hover:text-white/70 transition-all duration-200
            cursor-pointer mt-2'>
          ↺ Match with Different JD
        </button>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className='space-y-3 mt-5'
          >
            {/* Score Hero */}
            <div className='relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-5 overflow-hidden'>
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent
                ${result.matchScore >= 75 ? 'via-emerald-500/60'
                  : result.matchScore >= 50 ? 'via-amber-500/60' : 'via-red-500/60'}
                to-transparent`} />
              <div className='flex items-center justify-between mb-3'>
                <div>
                  <p className='text-[10px] text-white/25 uppercase tracking-widest mb-1'>Match Score</p>
                  <div className='flex items-end gap-1'>
                    <span className={`s-title text-5xl font-black ${scoreColor(result.matchScore)}`}>
                      {result.matchScore}
                    </span>
                    <span className='text-white/20 text-lg mb-1'>/100</span>
                  </div>
                </div>
                <div className='text-right'>
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-xl
                    ${result.matchScore >= 75 ? 'bg-emerald-500/15 text-emerald-400'
                      : result.matchScore >= 50 ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-red-500/15 text-red-400'}`}>
                    {result.verdict}
                  </span>
                  {result.interviewCallChance && (
                    <p className='text-[11px] text-white/30 mt-2'>
                      Interview call chance:{' '}
                      <span className={`font-bold ${scoreColor(result.interviewCallChance)}`}>
                        {result.interviewCallChance}%
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <div className='h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-3'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.matchScore}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className={`h-full rounded-full ${barColor(result.matchScore)}`}
                />
              </div>
              {result.summary && (
                <p className='text-white/40 text-xs leading-relaxed border-t border-white/[0.05] pt-3'>
                  {result.summary}
                </p>
              )}
            </div>

            {/* Keywords */}
            <div className='grid sm:grid-cols-2 gap-3'>
              {result.matchedKeywords?.length > 0 && (
                <div className='bg-emerald-500/[0.03] border border-emerald-500/15 rounded-2xl p-4'>
                  <div className='flex items-center gap-1.5 mb-3'>
                    <BsCheckCircleFill size={12} className='text-emerald-400' />
                    <p className='text-[11px] text-emerald-400/80 font-semibold uppercase tracking-wide'>
                      Matched ({result.matchedKeywords.length})
                    </p>
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    {result.matchedKeywords.map(k => (
                      <span key={k} className='px-2.5 py-1 rounded-lg bg-emerald-500/10
                        border border-emerald-500/20 text-emerald-400 text-[11px] font-medium'>{k}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.missingKeywords?.length > 0 && (
                <div className='bg-red-500/[0.03] border border-red-500/15 rounded-2xl p-4'>
                  <div className='flex items-center gap-1.5 mb-3'>
                    <BsXCircleFill size={12} className='text-red-400' />
                    <p className='text-[11px] text-red-400/80 font-semibold uppercase tracking-wide'>
                      Missing ({result.missingKeywords.length})
                    </p>
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    {result.missingKeywords.map(k => (
                      <span key={k} className='px-2.5 py-1 rounded-lg bg-red-500/10
                        border border-red-500/20 text-red-400 text-[11px] font-medium'>{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section Analysis */}
            {result.sectionAnalysis && (
              <div className='bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden'>
                <div className='px-5 py-4 border-b border-white/[0.05]'>
                  <p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>
                    Section Match Analysis
                  </p>
                </div>
                <div className='divide-y divide-white/[0.04]'>
                  {Object.entries(result.sectionAnalysis).map(([key, val]) => (
                    <div key={key} className='px-5 py-4 hover:bg-white/[0.02] transition-colors'>
                      <div className='flex items-center gap-4'>
                        <p className='text-xs text-white/50 capitalize font-medium w-24 flex-shrink-0'>{key}</p>
                        <div className='flex-1'>
                          <div className='h-1.5 bg-white/[0.05] rounded-full overflow-hidden'>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${val.score}%` }}
                              transition={{ duration: 0.9, ease: 'easeOut' }}
                              className={`h-full rounded-full ${barColor(val.score)}`}
                            />
                          </div>
                          {val.feedback && (
                            <p className='text-[11px] text-white/25 mt-1.5'>{val.feedback}</p>
                          )}
                        </div>
                        <span className={`text-sm font-bold w-7 text-right flex-shrink-0 ${scoreColor(val.score)}`}>
                          {val.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience + Education */}
            <div className='grid sm:grid-cols-2 gap-3'>
              {result.experienceMatch && (
                <div className={`rounded-2xl border p-4
                  ${result.experienceMatch.match
                    ? 'bg-emerald-500/[0.03] border-emerald-500/15'
                    : 'bg-red-500/[0.03] border-red-500/15'}`}>
                  <div className='flex items-center gap-2 mb-2'>
                    {result.experienceMatch.match
                      ? <BsCheckCircleFill size={12} className='text-emerald-400' />
                      : <BsXCircleFill size={12} className='text-red-400' />}
                    <p className='text-xs font-semibold text-white/70'>Experience</p>
                  </div>
                  <div className='space-y-1 mb-2'>
                    <div className='flex justify-between text-[11px]'>
                      <span className='text-white/30'>Required</span>
                      <span className='text-white/60 font-medium'>{result.experienceMatch.required}</span>
                    </div>
                    <div className='flex justify-between text-[11px]'>
                      <span className='text-white/30'>Yours</span>
                      <span className='text-white/60 font-medium'>{result.experienceMatch.candidate}</span>
                    </div>
                  </div>
                  <p className='text-[11px] text-white/35 leading-relaxed'>{result.experienceMatch.feedback}</p>
                </div>
              )}
              {result.educationMatch && (
                <div className={`rounded-2xl border p-4
                  ${result.educationMatch.match
                    ? 'bg-emerald-500/[0.03] border-emerald-500/15'
                    : 'bg-red-500/[0.03] border-red-500/15'}`}>
                  <div className='flex items-center gap-2 mb-2'>
                    {result.educationMatch.match
                      ? <BsCheckCircleFill size={12} className='text-emerald-400' />
                      : <BsXCircleFill size={12} className='text-red-400' />}
                    <p className='text-xs font-semibold text-white/70'>Education</p>
                  </div>
                  <div className='space-y-1 mb-2'>
                    <div className='flex justify-between text-[11px]'>
                      <span className='text-white/30'>Required</span>
                      <span className='text-white/60 font-medium'>{result.educationMatch.required}</span>
                    </div>
                    <div className='flex justify-between text-[11px]'>
                      <span className='text-white/30'>Yours</span>
                      <span className='text-white/60 font-medium'>{result.educationMatch.candidate}</span>
                    </div>
                  </div>
                  <p className='text-[11px] text-white/35 leading-relaxed'>{result.educationMatch.feedback}</p>
                </div>
              )}
            </div>

            {/* Tailored Suggestions */}
            {result.tailoredSuggestions?.length > 0 && (
              <div className='bg-violet-500/[0.03] border border-violet-500/15 rounded-2xl p-5'>
                <div className='flex items-center gap-2 mb-3'>
                  <BsLightningChargeFill size={12} className='text-violet-400' />
                  <p className='text-xs font-semibold text-white/70'>Tailored Suggestions for This Job</p>
                </div>
                <ul className='space-y-2'>
                  {result.tailoredSuggestions.map((s, i) => (
                    <li key={i} className='flex items-start gap-2 text-[11px] text-white/50'>
                      <span className='text-violet-400 font-bold flex-shrink-0'>{i + 1}.</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Culture + Salary */}
            {(result.companyCulture || result.salaryRange) && (
              <div className='grid sm:grid-cols-2 gap-3'>
                {result.companyCulture && (
                  <div className='bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4'>
                    <p className='text-[10px] text-white/20 uppercase tracking-widest mb-2'>Company Culture</p>
                    <p className='text-xs text-white/50 leading-relaxed'>{result.companyCulture}</p>
                  </div>
                )}
                {result.salaryRange && (
                  <div className='bg-emerald-500/[0.03] border border-emerald-500/15 rounded-2xl p-4'>
                    <p className='text-[10px] text-emerald-400/60 uppercase tracking-widest mb-2'>Estimated Salary</p>
                    <p className='s-title text-lg font-bold text-emerald-400'>{result.salaryRange}</p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom reset button */}
            <button
              onClick={handleReset}
              className='w-full flex items-center justify-center gap-2 py-3 rounded-xl
                bg-white/[0.04] border border-white/[0.07] text-white/40 text-sm
                hover:bg-white/[0.07] hover:text-white/70 transition-all duration-200
                cursor-pointer'>
              ↺ Match with Different JD
            </button>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}