import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Internal helper — create a notification (used by other controllers too)
 */
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

// ─── Route Handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/notifications
 * Returns all non-expired notifications for the user, newest first.
 */
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

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read.
 */
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

/**
 * PUT /api/notifications/read-all
 * Mark ALL notifications as read.
 */
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

/**
 * DELETE /api/notifications/:id
 * Delete a single notification.
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    await Notification.findOneAndDelete({ _id: id, userId: req.userId })
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * DELETE /api/notifications/clear-all
 * Delete all read notifications.
 */
export const clearReadNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.userId, isRead: true })
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * POST /api/notifications/check-reminders  (called on login / dashboard load)
 * Smart logic: auto-generate contextual notifications based on user state.
 */
export const checkAndCreateReminders = async (req, res) => {
  try {
    const userId = req.userId
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false })

    const created = []
    const now = new Date()

    // ── 1. Session Reminder — if enabled & no practice in 2+ days ──
    if (user.notifications?.sessionReminders) {
      const lastPractice = user.lastPracticeAt
      const daysSince = lastPractice
        ? Math.floor((now - new Date(lastPractice)) / 86400000)
        : null

      if (daysSince === null || daysSince >= 2) {
        // Check if we already sent this reminder today
        const existingToday = await Notification.findOne({
          userId,
          type: "session_reminder",
          createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
        })

        if (!existingToday) {
          const msg = daysSince === null
            ? "You haven't done any practice session yet. Start now to build momentum!"
            : `It's been ${daysSince} day${daysSince > 1 ? 's' : ''} since your last session. Keep the streak going!`

          const n = await createNotification({
            userId,
            type: "session_reminder",
            priority: daysSince >= 5 ? "high" : "medium",
            title: "Time to Practice! 🎯",
            message: msg,
            actionLabel: "Start Session",
            actionUrl: "/interview",
            expiresInDays: 2,
          })
          created.push(n)
        }
      }
    }

    // ── 2. Weekly Report — every Monday ──
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
            priority: "low",
            title: "Your Weekly Summary is Ready 📊",
            message: "Check your progress report for last week — see what improved and where to focus.",
            actionLabel: "View Analytics",
            actionUrl: "/analytics",
            expiresInDays: 7,
          })
          created.push(n)
        }
      }
    }

    // ── 3. First-time welcome tip ──
    if (user.notifications?.tipsNewsletter) {
      const welcomeDone = await Notification.findOne({ userId, type: "tip" })
      if (!welcomeDone) {
        const tips = [
          { title: "Pro Tip: Use the STAR Method ⭐", msg: "When answering behavioral questions, use Situation → Task → Action → Result. It impresses interviewers every time." },
          { title: "Did you know? 💡", msg: "Candidates who do 5+ mock interviews are 3× more likely to clear technical rounds on the first attempt." },
          { title: "Resume Hack 📄", msg: "Quantify your achievements — '20% faster' beats 'improved performance' every time. Upload your resume for a free ATS check." },
        ]
        const tip = tips[Math.floor(Math.random() * tips.length)]
        const n = await createNotification({
          userId, type: "tip", priority: "low",
          title: tip.title, message: tip.msg,
          actionLabel: "Practice Now", actionUrl: "/interview",
          expiresInDays: 14,
        })
        created.push(n)
      }
    }

    // ── 4. Resume missing warning ──
    if (!user.resumeUrl) {
      const existing = await Notification.findOne({ userId, type: "system", title: { $regex: /resume/i } })
      if (!existing) {
        const n = await createNotification({
          userId, type: "system", priority: "medium",
          title: "Upload Your Resume 📎",
          message: "Get AI-powered ATS scoring, keyword gap analysis, and interview questions tailored to your experience.",
          actionLabel: "Go to Settings", actionUrl: "/settings",
          expiresInDays: 30,
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
