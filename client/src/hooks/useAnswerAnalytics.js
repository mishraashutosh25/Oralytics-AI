/**
 * useAnswerAnalytics.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time speech analytics for interview answers.
 * Tracks:
 *  - WPM (words per minute)
 *  - Filler words (um, uh, like, basically, right, you know, actually, so, well)
 *  - Confidence score (composite of WPM, filler ratio, answer length)
 *  - Keyword match with role/question keywords
 *  - Basic grammar flags (starting sentences with "and"/"but", repeated words)
 */
import { useMemo } from 'react'

// Filler words to detect
const FILLERS = [
  'um', 'uh', 'umm', 'uhh', 'like', 'basically', 'literally',
  'right', 'you know', 'actually', 'so', 'well', 'kind of',
  'sort of', 'i mean', 'okay so', 'honestly', 'literally',
]

// Role → keyword hints mapping
const ROLE_KEYWORDS = {
  'Software Engineer':    ['algorithm', 'data structure', 'complexity', 'scalability', 'system design', 'oop', 'api', 'testing', 'debugging', 'optimization'],
  'Frontend Developer':  ['react', 'component', 'state', 'dom', 'css', 'responsive', 'performance', 'accessibility', 'hooks', 'rendering'],
  'Backend Developer':   ['api', 'database', 'sql', 'nosql', 'rest', 'server', 'authentication', 'caching', 'microservices', 'scalability'],
  'Full Stack Developer':['frontend', 'backend', 'database', 'api', 'deployment', 'git', 'devops', 'react', 'node', 'rest'],
  'Data Analyst':        ['data', 'sql', 'analysis', 'visualization', 'python', 'excel', 'dashboard', 'insight', 'metric', 'trend'],
  'Product Manager':     ['roadmap', 'stakeholder', 'user story', 'agile', 'sprint', 'kpi', 'metric', 'prioritize', 'customer', 'feedback'],
}

// Simple grammar flags
function checkGrammar(text) {
  const flags = []
  const words = text.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return flags

  // Starts with filler at sentence start
  if (FILLERS.includes(words[0])) flags.push('Started with filler word')

  // Very short answer
  if (words.length < 15) flags.push('Answer seems too short')

  // Repeated consecutive words
  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1] && words[i].length > 3) {
      flags.push(`Repeated word: "${words[i]}"`)
      break
    }
  }

  return flags.slice(0, 2) // max 2 flags
}

function countFillers(text) {
  const lower = text.toLowerCase()
  let count = 0
  for (const f of FILLERS) {
    const regex = new RegExp(`\\b${f}\\b`, 'gi')
    const matches = lower.match(regex)
    if (matches) count += matches.length
  }
  return count
}

function findKeywordMatches(text, role, jdKeywords = []) {
  const lower = text.toLowerCase()
  const roleKws = ROLE_KEYWORDS[role] || []
  const allKws  = [...new Set([...roleKws, ...jdKeywords.map(k => k.toLowerCase())])]
  return allKws.filter(kw => lower.includes(kw))
}

function getMissingKeywords(text, role, jdKeywords = []) {
  const matched = findKeywordMatches(text, role, jdKeywords)
  const roleKws = (ROLE_KEYWORDS[role] || []).slice(0, 6)
  const allKws  = [...new Set([...roleKws, ...jdKeywords.map(k => k.toLowerCase())])]
  return allKws.filter(kw => !matched.includes(kw)).slice(0, 4)
}

function calcWPM(text, startTime) {
  if (!startTime) return 0
  const words   = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = (Date.now() - startTime) / 60000
  return minutes > 0 ? Math.round(words / minutes) : 0
}

function calcConfidence(wpm, fillerCount, wordCount, keywordMatchCount) {
  if (wordCount < 5) return 0

  // WPM score: ideal 120-160 wpm
  const wpmScore = wpm < 60 ? 40
    : wpm < 100 ? 60
    : wpm < 180 ? 90
    : wpm < 220 ? 70
    : 50

  // Filler ratio score
  const fillerRatio = wordCount > 0 ? fillerCount / wordCount : 0
  const fillerScore = fillerRatio < 0.02 ? 100
    : fillerRatio < 0.05 ? 80
    : fillerRatio < 0.10 ? 55
    : 30

  // Length score (more content = better)
  const lengthScore = wordCount < 20 ? 40 : wordCount < 50 ? 70 : wordCount < 100 ? 90 : 100

  // Keyword score
  const kwScore = keywordMatchCount === 0 ? 50 : Math.min(100, 60 + keywordMatchCount * 10)

  const raw = wpmScore * 0.25 + fillerScore * 0.30 + lengthScore * 0.25 + kwScore * 0.20
  return Math.min(100, Math.max(0, Math.round(raw)))
}

export default function useAnswerAnalytics({
  transcript,
  interimText,
  startTime,
  role,
  jdKeywords = [],
}) {
  return useMemo(() => {
    const fullText  = (transcript + ' ' + interimText).trim()
    const wordCount = fullText.split(/\s+/).filter(Boolean).length
    const fillerCount = countFillers(fullText)
    const wpm       = calcWPM(fullText, startTime)
    const matched   = findKeywordMatches(fullText, role, jdKeywords)
    const missing   = getMissingKeywords(fullText, role, jdKeywords)
    const grammar   = checkGrammar(fullText)
    const confidence = calcConfidence(wpm, fillerCount, wordCount, matched.length)

    // Detected filler instances for highlighting
    const fillerInstances = FILLERS.filter(f =>
      new RegExp(`\\b${f}\\b`, 'i').test(fullText)
    )

    return {
      wordCount,
      fillerCount,
      fillerInstances,
      wpm,
      matched,
      missing,
      grammar,
      confidence,
      // Labels
      confidenceLabel: confidence >= 80 ? 'Excellent' : confidence >= 65 ? 'Good' : confidence >= 45 ? 'Fair' : 'Low',
      wpmLabel:        wpm === 0 ? '—' : wpm < 80 ? 'Too slow' : wpm < 120 ? 'Ideal' : wpm < 180 ? 'Good' : 'Too fast',
    }
  }, [transcript, interimText, startTime, role, jdKeywords])
}
