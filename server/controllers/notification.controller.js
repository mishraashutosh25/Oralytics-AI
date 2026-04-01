import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"


export const createNotification = async ({
  userId, type, priority = "medium",
  title, message, actionLabel = null, actionUrl = null,
  expiresInDays = null,
}) => {
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86400000)
    : null

  return Notification.create({
    userId, type, priority, title, message,
    actionLabel, actionUrl, expiresAt,
  })
}

export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId
    const limit = Math.min(parseInt(req.query.limit) || 30, 50)

    const notifications = await Notification.find({
      userId,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    const unreadCount = await Notification.countDocuments({
      userId, isRead: false,
    })

    return res.json({ success: true, notifications, unreadCount })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export const markRead = async (req, res) => {
  try {
    const { id } = req.params
    await Notification.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { isRead: true }
    )
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { isRead: true }
    )
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    await Notification.findOneAndDelete({ _id: id, userId: req.userId })
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}


export const clearReadNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.userId, isRead: true })
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export const checkAndCreateReminders = async (req, res) => {
  try {
    const userId = req.userId
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false })

    // ==================================
    // 1. Smart Practice Reminders
    // ==================================
    if (user.notifications?.sessionReminders) {
      const lastPractice = user.lastPracticeAt
      const daysSince = lastPractice
        ? Math.floor((now - new Date(lastPractice)) / 86400000)
        : null

      if (daysSince === null || daysSince >= 3) {
        // Prevent spam: only one active practice unread reminder at a time
        const activeReminder = await Notification.findOne({
          userId,
          type: "session_reminder",
          isRead: false
        })

        if (!activeReminder) {
          const isHighPriority = daysSince !== null && daysSince >= 7
          const title = isHighPriority ? "Your Interview Skills Wait For No One 🚀" : "Keep Your Streak Alive 🎯"
          const msg = daysSince === null
            ? "Top candidates practice mock interviews weekly. Start your first AI mock session today to set a baseline."
            : `It's been ${daysSince} days since your last session. Consistency is the #1 predictor of cracking technical rounds.`

          const n = await createNotification({
            userId,
            type: "session_reminder",
            priority: isHighPriority ? "high" : "medium",
            title,
            message: msg,
            actionLabel: "Start Mock Interview",
            actionUrl: "/interview",
            expiresInDays: 3,
          })
          created.push(n)
        }
      }
    }

    // ==================================
    // 2. Weekly Industry Insights / Report
    // ==================================
    if (user.notifications?.weeklyReport) {
      const isMonday = now.getDay() === 1
      if (isMonday) {
        const existingThisWeek = await Notification.findOne({
          userId,
          type: "weekly_report",
          createdAt: { $gte: new Date(now.getTime() - 7 * 86400000) },
        })
        if (!existingThisWeek) {
          const n = await createNotification({
            userId,
            type: "weekly_report",
            priority: "medium",
            title: "Your Weekly Analytics & Benchmark 📊",
            message: "Your personalized performance report is ready. See how you stack up against the 75th percentile of candidates this week.",
            actionLabel: "View Insights",
            actionUrl: "/analytics",
            expiresInDays: 7,
          })
          created.push(n)
        }
      }
    }

    // ==================================
    // 3. Industry-Level Tips & Tricks
    // ==================================
    if (user.notifications?.tipsNewsletter) {
      // Send a new tip only if they don't have an unread tip, and haven't received one in 3 days
      const recentTip = await Notification.findOne({
        userId, 
        type: "tip",
        createdAt: { $gte: new Date(now.getTime() - 3 * 86400000) }
      })
      
      const unreadTip = await Notification.findOne({ userId, type: "tip", isRead: false })

      if (!recentTip && !unreadTip) {
        const tips = [
          { title: "FAANG Meta: The STAR Framework ⭐", msg: "Don't just list what you did. Explain the Situation, Task, Action you took, and the quantifiable Result. (e.g., 'Reduced latency by 40ms')." },
          { title: "System Design Golden Rule 🏗️", msg: "Always clarify non-functional requirements (QPS, Latency, Consistency) before drawing a single architecture box. It shows senior-level maturity." },
          { title: "Resume ATS Hack 📄", msg: "ATS parsers fail on multi-column layouts. Use a clean, single-column plain text format to ensure a 100% parse rate." },
          { title: "The 'Tell me about yourself' Pitch 🎤", msg: "Keep it to 90 seconds: Past (brief setup), Present (current impact), and Future (why you're a perfect fit for this role)." },
          { title: "Handling 'I don't know' 🧠", msg: "Never just say 'I don't know'. Say: 'I haven't used X directly, but based on my experience with Y, I would approach it by...'. Shows engineering problem-solving." }
        ]
        const tip = tips[Math.floor(Math.random() * tips.length)]
        const n = await createNotification({
          userId, type: "tip", priority: "low",
          title: tip.title, message: tip.msg,
          actionLabel: "Try it in Mock", actionUrl: "/interview",
          expiresInDays: 5,
        })
        created.push(n)
      }
    }

    // ==================================
    // 4. Smart System Prompts
    // ==================================
    if (!user.resumeUrl) {
      const activeMissingResume = await Notification.findOne({ userId, type: "system", title: { $regex: /resume/i }, isRead: false })
      if (!activeMissingResume) {
        const n = await createNotification({
          userId, type: "system", priority: "medium",
          title: "Missing ATS Context 📎",
          message: "Upload your exact resume. Our AI adjusts interview questions, difficulty, and grading rubrics based on your claimed experience.",
          actionLabel: "Upload Resume", actionUrl: "/settings",
          expiresInDays: 7,
        })
        created.push(n)
      }
    } else {
      // Suggest features they haven't used much if they have a resume
      const hasPlacementPrompt = await Notification.findOne({ userId, type: "system", title: { $regex: /placement/i } })
      if (!hasPlacementPrompt && user.credits > 10) {
         const n = await createNotification({
          userId, type: "system", priority: "low",
          title: "Discover Your Placement Probability 🔮",
          message: "We've trained an ML model on 10,000+ candidate profiles. Use your credits to predict your FAANG/MAANG placement odds.",
          actionLabel: "Try Predictor", actionUrl: "/placement",
          expiresInDays: 7,
        })
        created.push(n)
      }
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false })
    return res.json({ success: true, created: created.length, unreadCount })

  } catch (err) {
    console.error("checkAndCreateReminders error:", err.message)
    return res.status(500).json({ success: false, message: err.message })
  }
}
