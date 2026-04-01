import mongoose from "mongoose"

const interviewSchema = new mongoose.Schema({

  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  role:       { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  mode:       { type: String, enum: ["text", "voice", "video"], default: "text" },
  duration:   { type: Number, default: 20 },
  resumeUsed: { type: Boolean, default: false },

  
  questions: [
    {
      id:           { type: Number },
      question:     { type: String },
      type:         { type: String },
      userAnswer:   { type: String, default: "" },
      aiFeedback:   { type: String, default: "" },
      score:        { type: Number, default: 0 },
      timeTaken:    { type: Number, default: 0 },
      metrics: {
        content:    { type: Number, default: 0 },
        clarity:    { type: Number, default: 0 },
        relevance:  { type: Number, default: 0 },
      }
    }
  ],

  
  report: {
    totalScore:      { type: Number, default: 0 },
    avgScore:        { type: Number, default: 0 },
    timeTaken:       { type: String, default: "0:00" },
    strengths:       [{ type: String }],
    weaknesses:      [{ type: String }],
    improvements:    [{ type: String }],
    overallFeedback: { type: String, default: "" },
    recommendation:  { type: String, default: "" },
  },

  
  status: {
    type: String,
    enum: ["in_progress", "completed", "abandoned"],
    default: "in_progress"
  },

  // ── Live proctoring & AI assistant metrics ──
  proctoringData: {
    violations:      { type: Number, default: 0 },
    integrityScore:  { type: Number, default: 100 },
    avgConfidence:   { type: Number, default: 0 },
    avgWPM:          { type: Number, default: 0 },
    avgEyeContact:   { type: Number, default: 0 },
    dominantEmotion: { type: String, default: '' },
    totalFillers:    { type: Number, default: 0 },
    keywordsMatched: [{ type: String }],
    violationTypes:  [{ type: String }],
  },

  completedAt: { type: Date, default: null },

}, { timestamps: true })

const Interview = mongoose.model("Interview", interviewSchema)
export default Interview