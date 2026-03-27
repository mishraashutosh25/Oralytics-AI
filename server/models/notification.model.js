import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  // Notification type — drives icon + color on frontend
  type: {
    type: String,
    enum: [
      "session_reminder",   // Haven't practiced in 2+ days
      "weekly_report",      // Weekly performance summary
      "achievement",        // Badge / milestone earned
      "tip",                // Interview tip of the day
      "product_update",     // New feature / announcement
      "system",             // System / account messages
    ],
    required: true,
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },

  title:   { type: String, required: true },
  message: { type: String, required: true },

  // Optional CTA
  actionLabel: { type: String, default: null },
  actionUrl:   { type: String, default: null },

  isRead: { type: Boolean, default: false },

  // When to auto-expire (optional)
  expiresAt: { type: Date, default: null },

}, { timestamps: true })

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const Notification = mongoose.model("Notification", notificationSchema)
export default Notification
