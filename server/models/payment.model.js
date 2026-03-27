import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
  },
  razorpaySignature: {
    type: String,
    default: null,
  },
  plan: {
    type: String,
    enum: ['starter', 'pro', 'enterprise'],
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number, // in paise (INR)
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'refunded'],
    default: 'created',
  },
  method: {
    type: String,
    enum: ['razorpay', 'upi'],
    default: 'razorpay',
  },
}, { timestamps: true })

paymentSchema.index({ userId: 1, createdAt: -1 })
paymentSchema.index({ razorpayOrderId: 1 }, { unique: true })

const Payment = mongoose.model('Payment', paymentSchema)
export default Payment
