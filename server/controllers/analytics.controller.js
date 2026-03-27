import Interview from "../models/interview.model.js"

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.userId

    // Saare completed sessions
    const sessions = await Interview.find({
      userId,
      status: "completed"
    }).sort({ completedAt: 1 })

    if (sessions.length === 0) {
      return res.json({
        totalSessions: 0,
        avgScore: 0,
        bestScore: 0,
        totalTime: 0,
        streak: 0,
        scoreOverTime: [],
        sessionsPerWeek: [],
        roleBreakdown: [],
        difficultyBreakdown: [],
        topicPerformance: { Technical: 0, HR: 0, Behavioral: 0 },
        recentSessions: [],
        improvements: { best: [], worst: [] }
      })
    }

    // ── Basic Stats ──
    const totalSessions = sessions.length
    const avgScore      = Math.round(sessions.reduce((s, i) => s + i.report.avgScore, 0) / totalSessions)
    const bestScore     = Math.max(...sessions.map(s => s.report.avgScore))
    const totalTime     = sessions.reduce((acc, s) => {
      // each session: estimate from questions count × avg 2 min
      return acc + (s.questions?.length || 5) * 2
    }, 0)

    // ── Score Over Time ──
    const scoreOverTime = sessions.map(s => ({
      date:  s.completedAt?.toISOString().split('T')[0] || s.createdAt.toISOString().split('T')[0],
      score: s.report.avgScore,
      role:  s.role
    }))

    // ── Sessions Per Week (last 8 weeks) ──
    const now = new Date()
    const sessionsPerWeek = []
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - w * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)

      const count = sessions.filter(s => {
        const d = s.completedAt || s.createdAt
        return d >= weekStart && d < weekEnd
      }).length

      const weekLabel = `W${8 - w}`
      sessionsPerWeek.push({ week: weekLabel, count })
    }

    // ── Role Breakdown ──
    const roleMap = {}
    sessions.forEach(s => {
      if (!roleMap[s.role]) roleMap[s.role] = { count: 0, totalScore: 0 }
      roleMap[s.role].count++
      roleMap[s.role].totalScore += s.report.avgScore
    })
    const roleBreakdown = Object.entries(roleMap).map(([role, data]) => ({
      role,
      count:    data.count,
      avgScore: Math.round(data.totalScore / data.count)
    })).sort((a, b) => b.count - a.count)

    // ── Difficulty Breakdown ──
    const diffMap = { easy: { count: 0, total: 0 }, medium: { count: 0, total: 0 }, hard: { count: 0, total: 0 } }
    sessions.forEach(s => {
      const d = s.difficulty || 'medium'
      diffMap[d].count++
      diffMap[d].total += s.report.avgScore
    })
    const difficultyBreakdown = Object.entries(diffMap).map(([diff, data]) => ({
      difficulty: diff,
      count:      data.count,
      avgScore:   data.count > 0 ? Math.round(data.total / data.count) : 0
    }))

    // ── Topic Performance (avg score by question type) ──
    const topicMap = {}
    sessions.forEach(s => {
      s.questions.forEach(q => {
        if (!q.type) return
        if (!topicMap[q.type]) topicMap[q.type] = { total: 0, count: 0 }
        topicMap[q.type].total += q.score
        topicMap[q.type].count++
      })
    })
    const topicPerformance = {}
    Object.entries(topicMap).forEach(([type, data]) => {
      topicPerformance[type] = Math.round(data.total / data.count)
    })

    // ── Streak Calculation ──
    const today     = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const sessionDates = [...new Set(sessions.map(s =>
      (s.completedAt || s.createdAt).toDateString()
    ))].reverse()

    let streak = 0
    let checkDate = today
    for (const date of sessionDates) {
      if (date === checkDate || date === yesterday) {
        streak++
        const d = new Date(date)
        d.setDate(d.getDate() - 1)
        checkDate = d.toDateString()
      } else break
    }

    // ── Recent Sessions ──
    const recentSessions = sessions.slice(-5).reverse().map(s => ({
      id:         s._id,
      role:       s.role,
      difficulty: s.difficulty,
      score:      s.report.avgScore,
      date:       s.completedAt || s.createdAt,
      recommendation: s.report.recommendation
    }))

    // ── Best & Worst Questions ──
    const allQuestions = []
    sessions.forEach(s => {
      s.questions.forEach(q => {
        if (q.userAnswer && q.userAnswer !== '(Skipped)') {
          allQuestions.push({ question: q.question, score: q.score, type: q.type })
        }
      })
    })
    allQuestions.sort((a, b) => b.score - a.score)
    const improvements = {
      best:  allQuestions.slice(0, 3),
      worst: allQuestions.slice(-3).reverse()
    }

    // ── Proctoring Aggregates ──
    const sessionsWithProctoring = sessions.filter(s => s.proctoringData)
    const pCount = sessionsWithProctoring.length || 1

    const proctoringStats = {
      avgConfidence:    Math.round(sessionsWithProctoring.reduce((a, s) => a + (s.proctoringData?.avgConfidence  || 0), 0) / pCount),
      avgWPM:           Math.round(sessionsWithProctoring.reduce((a, s) => a + (s.proctoringData?.avgWPM         || 0), 0) / pCount),
      avgEyeContact:    Math.round(sessionsWithProctoring.reduce((a, s) => a + (s.proctoringData?.avgEyeContact  || 0), 0) / pCount),
      avgIntegrity:     Math.round(sessionsWithProctoring.reduce((a, s) => a + (s.proctoringData?.integrityScore || 100), 0) / pCount),
      totalFillers:     sessionsWithProctoring.reduce((a, s) => a + (s.proctoringData?.totalFillers || 0), 0),
      totalViolations:  sessionsWithProctoring.reduce((a, s) => a + (s.proctoringData?.violations   || 0), 0),
      // Top keywords used across all sessions
      topKeywords: (() => {
        const kMap = {}
        sessionsWithProctoring.forEach(s =>
          (s.proctoringData?.keywordsMatched || []).forEach(k => { kMap[k] = (kMap[k] || 0) + 1 })
        )
        return Object.entries(kMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k]) => k)
      })(),
      // Violation type distribution
      violationBreakdown: (() => {
        const vMap = {}
        sessionsWithProctoring.forEach(s =>
          (s.proctoringData?.violationTypes || []).forEach(v => { vMap[v] = (vMap[v] || 0) + 1 })
        )
        return Object.entries(vMap).map(([type, count]) => ({ type, count }))
      })(),
      // Emotion distribution
      emotionBreakdown: (() => {
        const eMap = {}
        sessionsWithProctoring.forEach(s => {
          const e = s.proctoringData?.dominantEmotion
          if (e) eMap[e] = (eMap[e] || 0) + 1
        })
        return Object.entries(eMap).sort((a, b) => b[1] - a[1]).map(([emotion, count]) => ({ emotion, count }))
      })(),
      // Trend: last 5 sessions proctoring scores
      proctoringTrend: sessionsWithProctoring.slice(-5).map(s => ({
        date:       (s.completedAt || s.createdAt).toISOString().split('T')[0],
        confidence: s.proctoringData?.avgConfidence  || 0,
        eyeContact: s.proctoringData?.avgEyeContact  || 0,
        integrity:  s.proctoringData?.integrityScore || 100,
        wpm:        s.proctoringData?.avgWPM         || 0,
      }))
    }

    res.json({
      totalSessions,
      avgScore,
      bestScore,
      streak,
      totalTime,
      scoreOverTime,
      sessionsPerWeek,
      roleBreakdown,
      difficultyBreakdown,
      topicPerformance,
      recentSessions,
      improvements,
      proctoringStats
    })

  } catch (err) {
    console.error("Analytics error:", err)
    res.status(500).json({ message: "Failed to fetch analytics" })
  }
}