import Razorpay from 'razorpay'
import crypto from 'crypto'
import User from '../models/user.model.js'
import Payment from '../models/payment.model.js'

// ── Plan config ──
const PLANS = {
  starter:    { credits: 50,   amount: 100,    label: 'Starter Pack'    },  // ₹1 (testing)
  pro:        { credits: 200,  amount: 29900,  label: 'Pro Pack'        },  // ₹299
  enterprise: { credits: 500,  amount: 49900,  label: 'Enterprise Pack' },  // ₹499
}

// ── Razorpay instance (lazy init — env vars not available at import time) ──
let _razorpay = null
const getRazorpay = () => {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return _razorpay
  
}


// ── GET /api/payment/plans ──
export const getPlans = (req, res) => {
  const plans = Object.entries(PLANS).map(([id, p]) => ({
    id,
    label:   p.label,
    credits: p.credits,
    amount:  p.amount,
    price:   `₹${(p.amount / 100).toLocaleString('en-IN')}`,
  }))
  res.json({ success: true, plans })
}

// ── POST /api/payment/create-order ──
export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body
    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' })
    }

    const { amount, credits, label } = PLANS[plan]

    const order = await getRazorpay().orders.create({
      amount,
      currency: 'INR',
      receipt: `ora_${String(req.userId).slice(-6)}_${Date.now().toString(36)}`,
      notes: {
        userId: req.userId,
        plan,
        credits: String(credits),
      },
    })

    // Save order to DB
    await Payment.create({
      userId:          req.userId,
      razorpayOrderId: order.id,
      plan,
      credits,
      amount,
      status: 'created',
    })

    res.json({
      success: true,
      order: {
        id:       order.id,
        amount:   order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
      planLabel: label,
    })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ success: false, message: 'Failed to create payment order' })
  }
}

// ── POST /api/payment/verify ──
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification data' })
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      // Mark payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      )
      return res.status(400).json({ success: false, message: 'Payment verification failed' })
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
      },
      { new: true }
    )

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' })
    }

    // Add credits to user
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $inc: { credits: payment.credits } },
      { new: true }
    )

    res.json({
      success: true,
      message: `${payment.credits} credits added successfully!`,
      credits: user.credits,
      payment: {
        id:      payment.razorpayPaymentId,
        plan:    payment.plan,
        credits: payment.credits,
        amount:  payment.amount,
      },
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    res.status(500).json({ success: false, message: 'Payment verification failed' })
  }
}

// ── GET /api/payment/history ──
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.userId,
      status: 'paid',
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    const user = await User.findById(req.userId).select('credits').lean()

    res.json({
      success: true,
      credits: user?.credits || 0,
      payments: payments.map(p => ({
        id:        p.razorpayPaymentId || p._id,
        plan:      p.plan,
        credits:   p.credits,
        amount:    p.amount,
        date:      p.createdAt,
        method:    p.method || 'razorpay',
      })),
    })
  } catch (error) {
    console.error('Payment history error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' })
  }
}

// ── POST /api/payment/create-upi ──
export const createUpiOrder = async (req, res) => {
  try {
    const { plan } = req.body
    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' })
    }

    const { amount, credits, label } = PLANS[plan]
    const amountRs = amount / 100
    const upiId = process.env.UPI_VPA || '6392635665@axl'

    let qrUrl, qrId, useRazorpayQr = false

    // Try Razorpay QR Code API first (auto-detects payment)
    try {
      const rz = getRazorpay()
      const qr = await rz.qrCode.create({
        type: 'upi_qr',
        name: 'OralyticsAI',
        usage: 'single_use',
        fixed_amount: true,
        payment_amount: amount,
        description: `${label} - ${credits} Credits`,
        close_by: Math.floor(Date.now() / 1000) + 900,
      })
      qrUrl = qr.image_url
      qrId = qr.id
      useRazorpayQr = true
      console.log('Razorpay QR created:', qrId)
    } catch (rzErr) {
      console.log('Razorpay QR fallback:', rzErr.error?.description || rzErr.message)
      const upiUrl = `upi://pay?pa=${upiId}&pn=OralyticsAI&am=${amountRs}&cu=INR&tn=${encodeURIComponent(label)}`
      qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiUrl)}`
      qrId = null
    }

    const orderId = qrId || `ORA${Date.now().toString(36).toUpperCase()}`

    const payment = await Payment.create({
      userId: req.userId,
      razorpayOrderId: orderId,
      plan, credits, amount,
      method: 'upi',
      status: 'created',
    })

    res.json({
      success: true,
      upi: {
        qrUrl, qrId, upiId,
        amount: amountRs,
        paymentDbId: payment._id,
        label, credits, useRazorpayQr,
      },
    })
  } catch (error) {
    console.error('Create UPI order error:', error)
    res.status(500).json({ success: false, message: 'Failed to create UPI order' })
  }
}

// ── GET /api/payment/check-upi/:paymentDbId ── (auto-polling)
export const checkUpiPayment = async (req, res) => {
  try {
    const { paymentDbId } = req.params
    const payment = await Payment.findOne({ _id: paymentDbId, userId: req.userId })

    if (!payment) return res.status(404).json({ success: false, status: 'not_found' })

    if (payment.status === 'paid') {
      const user = await User.findById(req.userId).select('credits').lean()
      return res.json({
        success: true, status: 'paid', credits: user?.credits || 0,
        payment: { plan: payment.plan, credits: payment.credits, amount: payment.amount },
      })
    }

    // Check Razorpay QR payments
    if (payment.razorpayOrderId && payment.razorpayOrderId.startsWith('qr_')) {
      try {
        const rz = getRazorpay()
        const result = await rz.qrCode.fetchAllPayments(payment.razorpayOrderId, {})
        if (result.items && result.items.length > 0) {
          payment.razorpayPaymentId = result.items[0].id
          payment.status = 'paid'
          await payment.save()

          const user = await User.findByIdAndUpdate(
            req.userId, { $inc: { credits: payment.credits } }, { new: true }
          )
          return res.json({
            success: true, status: 'paid', credits: user.credits,
            payment: { plan: payment.plan, credits: payment.credits, amount: payment.amount },
          })
        }
      } catch (e) { console.log('QR check err:', e.message) }
    }

    return res.json({ success: true, status: 'pending' })
  } catch (error) {
    console.error('Check UPI error:', error)
    res.status(500).json({ success: false, status: 'error' })
  }
}

// ── POST /api/payment/confirm-upi ── (manual fallback)
export const confirmUpiPayment = async (req, res) => {
  try {
    const { paymentDbId } = req.body
    if (!paymentDbId) return res.status(400).json({ success: false, message: 'Payment ID missing' })

    const payment = await Payment.findOne({
      _id: paymentDbId, userId: req.userId, status: 'created', method: 'upi',
    })
    if (!payment) return res.status(404).json({ success: false, message: 'Not found or already processed' })

    payment.razorpayPaymentId = `CONFIRMED_${Date.now()}`
    payment.status = 'paid'
    await payment.save()

    const user = await User.findByIdAndUpdate(
      req.userId, { $inc: { credits: payment.credits } }, { new: true }
    )

    res.json({
      success: true, credits: user.credits,
      payment: { plan: payment.plan, credits: payment.credits, amount: payment.amount },
    })
  } catch (error) {
    console.error('Confirm UPI error:', error)
    res.status(500).json({ success: false, message: 'Failed to confirm manual payment' })
  }
}

// ── Razorpay Webhook ── (Production grade auto-fulfillment)
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    // Verify Webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).send('Invalid webhook signature');
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment.entity;
      // Get the order_id or notes provided during order creation
      const razorpayOrderId = paymentEntity.order_id || payload.order?.entity?.id;
      
      const payment = await Payment.findOne({ 
        $or: [
          { razorpayOrderId: razorpayOrderId },
          { razorpayOrderId: paymentEntity.notes?.qr_id } // if it's a QR payment
        ]
      });

      if (payment && payment.status !== 'paid') {
        payment.status = 'paid';
        payment.razorpayPaymentId = paymentEntity.id;
        await payment.save();

        if (payment.userId) {
          await User.findByIdAndUpdate(
            payment.userId,
            { $inc: { credits: payment.credits } },
            { new: true }
          );
        }
      }
    }
    
    return res.status(200).send('Webhook verified and processed');
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).send('Webhook error');
  }
}
