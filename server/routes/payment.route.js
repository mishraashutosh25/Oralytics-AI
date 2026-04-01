import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import {
  getPlans,
  createOrder,
  verifyPayment,
  getPaymentHistory,
  createUpiOrder,
  checkUpiPayment,
  confirmUpiPayment,
  razorpayWebhook,
} from '../controllers/payment.controller.js'

const router = express.Router()

router.get('/plans',                  getPlans)
router.post('/create-order',          isAuth, createOrder)
router.post('/verify',                isAuth, verifyPayment)
router.get('/history',                isAuth, getPaymentHistory)
router.post('/create-upi',            isAuth, createUpiOrder)
router.get('/check-upi/:paymentDbId', isAuth, checkUpiPayment)
router.post('/confirm-upi',           isAuth, confirmUpiPayment)
router.post('/webhook',               razorpayWebhook)

export default router
