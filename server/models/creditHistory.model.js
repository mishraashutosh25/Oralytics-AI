import mongoose from "mongoose";

const creditHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  feature: {
    type: String,
    required: true,
    enum: [
      'Resume Analysis',
      'Mock Interview',
      'Video Interview',
      'Company Questions',
      'Placement Prediction',
      'Daily Reward',
      'Referral Reward',
      'Manual Add'
    ]
  },
  creditsDeducted: {
    type: Number,
    required: true,
    // Negative numbers can represent adding credits (e.g. Daily Reward: -5 deducted means +5 added)
    // Or we can just use "amount" and a "type" field (credit/debit). Let's stick to the user's prompt: "credits deducted"
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const CreditHistory = mongoose.model("CreditHistory", creditHistorySchema);
export default CreditHistory;
