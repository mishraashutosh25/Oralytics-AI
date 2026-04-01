import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  credits: {
    type: Number,
    default: 100,
  },

  
  resumeUrl: {
    type: String,
    default: null,
  },
  resumeOriginalName: {
    type: String,
    default: null,
  },

  // Profile fields
  profilePhotoUrl: { type: String, default: null },
  bio:             { type: String, default: '' },
  headline:        { type: String, default: '' },
  location:        { type: String, default: '' },
  website:         { type: String, default: '' },
  linkedIn:        { type: String, default: '' },
  github:          { type: String, default: '' },
  // DiceBear avatar seed + style (used when no profile photo)
  avatarSeed:      { type: String, default: null },
  avatarStyle:     { type: String, default: 'avataaars' },


  // Tracks last practice session — used for reminder logic
  lastPracticeAt: { type: Date, default: null },

  notifications: {
    sessionReminders: { type: Boolean, default: true  },
    weeklyReport:     { type: Boolean, default: true  },
    productUpdates:   { type: Boolean, default: false },
    tipsNewsletter:   { type: Boolean, default: true  },
  },

  interviewPrefs: {
    defaultMode:     { type: String,  default: 'text'   },
    difficulty:      { type: String,  default: 'medium' }, 
    sessionDuration: { type: String,  default: '20'     }, 
    autoFeedback:    { type: Boolean, default: true     },
    voiceTranscript: { type: Boolean, default: true     },
  },

  // ── Credit System Extensions ──
  referralCode: {
    type: String,
    unique: true,
    sparse: true // Allows multiple users to safely have null referralCodes initially
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lastDailyRewardAt: {
    type: Date,
    default: null
  }

}, { timestamps: true })

const User = mongoose.model("User", userSchema)
export default User