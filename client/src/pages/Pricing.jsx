import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { ServerURL } from '../App'
import { setUserData } from '../redux/userSlice'
import Footer from '../components/Footer'
import {
  BsArrowLeft, BsArrowRight, BsLightningChargeFill, BsCheckCircleFill,
  BsStarFill, BsShieldCheck, BsClockHistory,
  BsGem, BsTrophyFill, BsRocketTakeoffFill, BsFire, BsXCircleFill,
  BsQrCode, BsClipboard, BsCheckLg
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'

const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    className={className}
  >{children}</motion.div>
)

const PLAN_CONFIG = {
  starter: {
    icon: <BsLightningChargeFill size={22} />, color: 'emerald', popular: false,
    features: ['50 AI Interview Credits', 'Text + Voice modes', 'Detailed PDF reports', 'Basic analytics', 'Email support'],
  },
  pro: {
    icon: <BsRocketTakeoffFill size={22} />, color: 'violet', popular: true,
    features: ['200 AI Interview Credits', 'Live Video Interview', 'Proctoring analytics', 'Resume AI analysis', 'Priority support', 'Company-specific questions'],
  },
  enterprise: {
    icon: <BsGem size={22} />, color: 'amber', popular: false,
    features: ['500 AI Interview Credits', 'Everything in Pro', 'Unlimited live sessions', 'Confidence training', 'Custom question sets', 'Dedicated support', 'Early features access'],
  },
}

const CM = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: '0 0 60px rgba(52,211,153,0.15)', btn: 'bg-emerald-400 hover:bg-emerald-300', grad: 'from-emerald-500/[0.06]' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', glow: '0 0 60px rgba(167,139,250,0.2)', btn: 'bg-violet-400 hover:bg-violet-300', grad: 'from-violet-500/[0.06]' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', glow: '0 0 60px rgba(251,191,36,0.15)', btn: 'bg-amber-400 hover:bg-amber-300', grad: 'from-amber-500/[0.06]' },
}

export default function Pricing() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userData } = useSelector(s => s.user)
  const [loading, setLoading] = useState(null)
  const [plans, setPlans] = useState([])
  const [history, setHistory] = useState([])
  const [credits, setCredits] = useState(userData?.credits || 0)
  const [showSuccess, setShowSuccess] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  // UPI modal
  const [upi, setUpi] = useState(null)
  const [payStatus, setPayStatus] = useState('scanning') // scanning | detecting | paid
  const [copied, setCopied] = useState(false)
  const [showConfirmBtn, setShowConfirmBtn] = useState(false)
  const pollRef = useRef(null)
  const pollCountRef = useRef(0)
  const confirmTimerRef = useRef(null)

  useEffect(() => {
    axios.get(`${ServerURL}/api/payment/plans`).then(r => { if (r.data.success) setPlans(r.data.plans) }).catch(console.error)
  }, [])

  useEffect(() => {
    if (!userData) return
    axios.get(`${ServerURL}/api/payment/history`, { withCredentials: true })
      .then(r => { if (r.data.success) { setHistory(r.data.payments); setCredits(r.data.credits) } })
      .catch(console.error)
  }, [userData])

  // Auto-poll for payment
  const startPolling = (paymentDbId) => {
    pollCountRef.current = 0
    pollRef.current = setInterval(async () => {
      pollCountRef.current++
      try {
        const { data } = await axios.get(`${ServerURL}/api/payment/check-upi/${paymentDbId}`, { withCredentials: true })
        if (data.status === 'paid') {
          clearInterval(pollRef.current)
          setPayStatus('paid')
          setCredits(data.credits)
          dispatch(setUserData({ ...userData, credits: data.credits }))
          // Show success after 1.5s animation
          setTimeout(() => {
            setUpi(null)
            setShowSuccess(data.payment)
            setPayStatus('scanning')
          }, 1800)
          // Refresh history
          axios.get(`${ServerURL}/api/payment/history`, { withCredentials: true })
            .then(r => { if (r.data.success) setHistory(r.data.payments) })
        }
        // After 60 polls (~3 min), slow down
        if (pollCountRef.current > 60) {
          clearInterval(pollRef.current)
          pollRef.current = setInterval(async () => {
            const { data: d2 } = await axios.get(`${ServerURL}/api/payment/check-upi/${paymentDbId}`, { withCredentials: true })
            if (d2.status === 'paid') {
              clearInterval(pollRef.current)
              setPayStatus('paid')
              setCredits(d2.credits)
              dispatch(setUserData({ ...userData, credits: d2.credits }))
              setTimeout(() => { setUpi(null); setShowSuccess(d2.payment); setPayStatus('scanning') }, 1800)
            }
          }, 10000) // slow to 10s
        }
      } catch (e) { console.log('Poll error:', e.message) }
    }, 3000)
  }

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current)
  }

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [])

  const handleUpiPay = async (planId) => {
    if (!userData) { navigate('/auth'); return }
    setLoading(planId)
    try {
      const { data } = await axios.post(`${ServerURL}/api/payment/create-upi`, { plan: planId }, { withCredentials: true })
      if (data.success) {
        setUpi(data.upi)
        setPayStatus('scanning')
        setShowConfirmBtn(false)
        // Switch to detecting after 3s, show confirm after 8s
        setTimeout(() => setPayStatus('detecting'), 3000)
        confirmTimerRef.current = setTimeout(() => setShowConfirmBtn(true), 8000)
        if (data.upi.useRazorpayQr) startPolling(data.upi.paymentDbId)
      }
    } catch (err) { alert('Failed to generate QR') }
    setLoading(null)
  }

  // Manual confirm
  const handleManualConfirm = async () => {
    if (!upi) return
    stopPolling()
    setShowConfirmBtn(false)
    try {
      const { data } = await axios.post(`${ServerURL}/api/payment/confirm-upi`, { paymentDbId: upi.paymentDbId }, { withCredentials: true })
      if (data.success) {
        setPayStatus('paid')
        setCredits(data.credits)
        dispatch(setUserData({ ...userData, credits: data.credits }))
        setTimeout(() => { setUpi(null); setShowSuccess(data.payment); setPayStatus('scanning') }, 1800)
        axios.get(`${ServerURL}/api/payment/history`, { withCredentials: true })
          .then(r => { if (r.data.success) setHistory(r.data.payments) })
      }
    } catch (err) { alert('Failed to confirm') }
  }

  const closeUpi = () => { stopPolling(); if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current); setUpi(null); setPayStatus('scanning'); setShowConfirmBtn(false) }
  const copyId = (id) => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <>
      <div className='relative w-full min-h-screen bg-[#030303] text-white overflow-x-hidden'
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
          .p-title { font-family: 'Sora', sans-serif; }
          @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 0; } 100% { transform: scale(0.8); opacity: 0.5; } }
        `}</style>

        <div className='pointer-events-none fixed inset-0 overflow-hidden'>
          <div className='absolute w-[700px] h-[700px] bg-violet-500 opacity-[0.05] blur-[200px] rounded-full -top-60 -left-40' />
          <div className='absolute w-[500px] h-[500px] bg-emerald-500 opacity-[0.04] blur-[180px] rounded-full -bottom-40 -right-40' />
          <div className='pointer-events-none absolute inset-0' style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.012) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        {/* Nav */}
        <div className='relative z-20 flex items-center justify-between px-6 pt-7 max-w-7xl mx-auto'>
          <motion.button onClick={() => navigate('/dashboard')}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
            className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07]
              text-white/45 hover:text-white/80 transition-all cursor-pointer text-sm font-medium group'>
            <BsArrowLeft size={13} className='group-hover:-translate-x-0.5 transition-transform' /> Back
          </motion.button>
          {userData && (
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/8 border border-amber-500/15 text-amber-400 text-sm font-bold'>
                <BsGem size={13} /> {credits} Credits
              </div>
              <button onClick={() => setShowHistory(true)} className='flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/35 text-[11px] hover:text-white/60 cursor-pointer transition'>
                <BsClockHistory size={11} /> History
              </button>
            </div>
          )}
        </div>

        <div className='relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-24'>
          {/* Header */}
          <FadeUp className='text-center mb-14'>
            <div className='flex justify-center mb-5'>
              <span className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/8 border border-violet-500/15 text-violet-400 text-[11px] font-semibold'>
                <HiSparkles size={12} /> Simple, Transparent Pricing
              </span>
            </div>
            <h1 className='p-title text-4xl md:text-6xl font-black text-white tracking-tight mb-4'>
              Fuel Your{" "}
              <span style={{ background: 'linear-gradient(90deg,#a78bfa,#38bdf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Interview Prep</span>
            </h1>
            <p className='text-white/30 text-sm max-w-xl mx-auto'>Scan QR → Pay via UPI → Credits added automatically. No clicks needed.</p>
            <div className='flex justify-center mt-5'>
              <div className='flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#0b0b0b] border border-white/[0.07]'>
                <BsQrCode size={16} className='text-emerald-400' />
                <span className='text-xs text-white/40'>Pay via</span>
                <span className='text-xs font-bold text-white/70'>UPI QR Code</span>
                <span className='text-[10px] text-white/20'>•</span>
                <span className='text-[10px] text-white/30'>GPay · PhonePe · Paytm</span>
              </div>
            </div>
          </FadeUp>

          {/* Cards */}
          <FadeUp delay={0.08} className='mb-16'>
            <div className='grid md:grid-cols-3 gap-5'>
              {plans.map((plan, i) => {
                const cfg = PLAN_CONFIG[plan.id] || PLAN_CONFIG.starter
                const cm = CM[cfg.color]
                return (
                  <motion.div key={plan.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ y: -6 }}
                    className={`relative bg-[#0b0b0b] border ${cm.border} rounded-3xl overflow-hidden group ${cfg.popular ? 'ring-1 ring-violet-500/30' : ''}`}
                    style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = cm.glow}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)'}
                  >
                    <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${cfg.color === 'violet' ? 'via-violet-400/60' : cfg.color === 'emerald' ? 'via-emerald-400/50' : 'via-amber-400/50'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className={`absolute inset-0 bg-gradient-to-br ${cm.grad} via-transparent to-transparent pointer-events-none`} />
                    {cfg.popular && <div className='absolute top-4 right-4 z-10'><span className='flex items-center gap-1 px-3 py-1 rounded-full bg-violet-400 text-black text-[10px] font-bold'><BsFire size={9} /> MOST POPULAR</span></div>}
                    <div className='relative z-10 p-8'>
                      <div className={`w-14 h-14 rounded-2xl ${cm.bg} border ${cm.border} flex items-center justify-center ${cm.text} mb-6`}>{cfg.icon}</div>
                      <h3 className='p-title text-xl font-black text-white mb-1'>{plan.label}</h3>
                      <p className='text-white/25 text-xs mb-6'>{plan.credits} AI interview credits</p>
                      <div className='flex items-baseline gap-1 mb-8'>
                        <span className='p-title text-5xl font-black text-white'>{plan.price}</span>
                        <span className='text-white/25 text-sm'>one-time</span>
                      </div>
                      <div className='space-y-3 mb-8'>
                        {cfg.features.map((f, fi) => <div key={fi} className='flex items-center gap-2.5'><BsCheckCircleFill size={12} className={cm.text} /><span className='text-xs text-white/50'>{f}</span></div>)}
                      </div>
                      <motion.button onClick={() => handleUpiPay(plan.id)} disabled={loading === plan.id}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl ${cm.btn} text-black font-bold text-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(167,139,250,0.15)]`}>
                        {loading === plan.id ? <div className='w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin' /> : <><BsQrCode size={15} /> Pay {plan.price} via UPI <BsArrowRight size={12} /></>}
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </FadeUp>

          {/* Trust + Credits + FAQ sections */}
          <FadeUp delay={0.14} className='mb-16'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {[
                { icon: <BsShieldCheck size={18} />, t: 'Secure UPI', d: 'Scan & pay with any UPI app', c: 'emerald' },
                { icon: <BsLightningChargeFill size={18} />, t: 'Auto-Detect', d: 'Payment detected automatically', c: 'amber' },
                { icon: <BsStarFill size={18} />, t: 'No Expiry', d: 'Credits never expire', c: 'violet' },
                { icon: <BsTrophyFill size={18} />, t: 'Refund', d: '7-day money-back guarantee', c: 'sky' },
              ].map((b, i) => (
                <div key={i} className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-5 text-center'>
                  <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${b.c === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : b.c === 'amber' ? 'bg-amber-500/10 text-amber-400' : b.c === 'violet' ? 'bg-violet-500/10 text-violet-400' : 'bg-sky-500/10 text-sky-400'}`}>{b.icon}</div>
                  <p className='text-xs font-bold text-white/70 mb-1'>{b.t}</p>
                  <p className='text-[10px] text-white/25'>{b.d}</p>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.18} className='mb-16'>
            <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-8'>
              <div className='flex items-center gap-2 mb-6'><BsLightningChargeFill size={14} className='text-amber-400' /><p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>How Credits Work</p></div>
              <div className='grid md:grid-cols-3 gap-6'>
                {[{ c: '5', a: 'Standard AI Interview', d: '5 questions + PDF report' }, { c: '10', a: 'Live Video Interview', d: 'Proctoring + confidence analysis' }, { c: '3', a: 'Resume AI Analysis', d: 'Resume review + keyword matching' }].map((item, i) => (
                  <div key={i} className='flex gap-4'>
                    <div className='w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center flex-shrink-0'>
                      <span className='p-title text-lg font-black text-amber-400'>{item.c}</span></div>
                    <div><p className='text-sm font-semibold text-white/70 mb-1'>{item.a}</p><p className='text-[11px] text-white/30'>{item.d}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.22}>
            <div className='bg-[#0b0b0b] border border-white/[0.07] rounded-2xl p-8'>
              <div className='flex items-center gap-2 mb-6'><HiSparkles size={14} className='text-violet-400' /><p className='text-[11px] text-white/30 uppercase tracking-widest font-medium'>FAQ</p></div>
              <div className='grid md:grid-cols-2 gap-6'>
                {[
                  { q: 'How does payment work?', a: 'Scan QR with any UPI app. Payment is auto-detected — credits added instantly.' },
                  { q: 'Do credits expire?', a: "Never. Use them at your own pace." },
                  { q: 'Is it secure?', a: 'UPI is bank-grade encrypted. We never see your bank details.' },
                  { q: 'Free credits?', a: 'Every new account gets 100 free credits!' },
                ].map((f, i) => <div key={i} className='p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]'><p className='text-sm font-semibold text-white/60 mb-2'>{f.q}</p><p className='text-[11px] text-white/30'>{f.a}</p></div>)}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>

      {/* ═══ UPI QR MODAL ═══ */}
      <AnimatePresence>
        {upi && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/80 z-50' onClick={closeUpi} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className='fixed inset-0 z-50 flex items-center justify-center p-4'>
              <div className='bg-[#0a0a0a] border border-white/[0.1] rounded-3xl w-full max-w-md overflow-hidden'
                onClick={e => e.stopPropagation()}>
                <div className='flex items-center justify-between p-6 pb-0'>
                  <div className='flex items-center gap-2'>
                    <BsQrCode size={16} className='text-violet-400' />
                    <span className='text-sm font-bold text-white'>
                      {payStatus === 'paid' ? 'Payment Successful!' : 'Scan & Pay'}
                    </span>
                  </div>
                  <button onClick={closeUpi} className='p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 cursor-pointer transition'>
                    <BsXCircleFill size={16} />
                  </button>
                </div>

                <div className='p-6 space-y-5'>
                  {/* Plan */}
                  <div className='flex items-center justify-between p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/15'>
                    <div><p className='text-white/70 text-sm font-semibold'>{upi.label}</p><p className='text-white/30 text-[11px]'>{upi.credits} credits</p></div>
                    <p className='p-title text-2xl font-black text-white'>₹{upi.amount}</p>
                  </div>

                  {/* QR — changes based on status */}
                  <AnimatePresence mode='wait'>
                    {payStatus === 'paid' ? (
                      <motion.div key='paid' initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className='text-center py-6'>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                          className='w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-4'>
                          <BsCheckCircleFill size={42} className='text-emerald-400' />
                        </motion.div>
                        <p className='text-xl font-black text-white mb-1' style={{ fontFamily: "'Sora',sans-serif" }}>Payment Received! 🎉</p>
                        <p className='text-white/40 text-sm'>Adding <span className='text-emerald-400 font-bold'>{upi.credits} credits</span> to your account...</p>
                      </motion.div>
                    ) : (
                      <motion.div key='qr' exit={{ opacity: 0, scale: 0.9 }} className='text-center'>
                        <p className='text-[10px] text-white/25 uppercase tracking-widest mb-3'>Scan with any UPI app</p>
                        <div className='relative inline-block'>
                          <div className='p-4 bg-white rounded-2xl'>
                            <img src={upi.qrUrl} alt='UPI QR' className='w-52 h-52' />
                          </div>
                          {/* Scanning pulse */}
                          {payStatus === 'detecting' && (
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <div className='w-full h-full rounded-2xl border-2 border-emerald-400/40'
                                style={{ animation: 'pulse-ring 2s ease-in-out infinite' }} />
                            </div>
                          )}
                        </div>
                        <div className='flex items-center justify-center gap-2 mt-3'>
                          {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((a, i) => (
                            <span key={i} className='text-[10px] text-white/20'>{i > 0 && '• '}{a}</span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Status indicator */}
                  {payStatus !== 'paid' && !showConfirmBtn && (
                    <div className={`flex items-center justify-center gap-3 p-3 rounded-xl border ${
                      payStatus === 'detecting'
                        ? 'bg-amber-500/[0.06] border-amber-500/15'
                        : 'bg-white/[0.02] border-white/[0.06]'
                    }`}>
                      {payStatus === 'detecting' ? (
                        <>
                          <div className='w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin' />
                          <span className='text-xs text-amber-400 font-medium'>Waiting for payment...</span>
                        </>
                      ) : (
                        <>
                          <BsQrCode size={12} className='text-white/30' />
                          <span className='text-xs text-white/30'>Scan the QR code to pay</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* UPI ID */}
                  {payStatus !== 'paid' && (
                    <div className='flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]'>
                      <div>
                        <p className='text-[10px] text-white/25 mb-0.5'>Or pay to UPI ID</p>
                        <p className='text-sm font-mono text-emerald-400 font-bold'>{upi.upiId}</p>
                      </div>
                      <button onClick={() => copyId(upi.upiId)}
                        className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/50 text-[11px] cursor-pointer hover:text-white/80 transition'>
                        {copied ? <><BsCheckLg size={10} className='text-emerald-400' /> Copied</> : <><BsClipboard size={10} /> Copy</>}
                      </button>
                    </div>
                  )}

                  {/* Confirm payment — appears after 8 seconds */}
                  {showConfirmBtn && payStatus !== 'paid' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='space-y-2'>
                      <div className='flex items-center gap-2 justify-center'>
                        <div className='flex-1 h-px bg-emerald-500/20' />
                        <span className='text-[10px] text-emerald-400/60 uppercase tracking-widest'>Payment Done?</span>
                        <div className='flex-1 h-px bg-emerald-500/20' />
                      </div>
                      <motion.button
                        onClick={handleManualConfirm}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className='w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl
                          bg-emerald-400 text-black font-bold text-sm cursor-pointer hover:bg-emerald-300
                          transition-all shadow-[0_0_30px_rgba(52,211,153,0.25)]'>
                        <BsCheckCircleFill size={16} />
                        I've Completed the Payment
                      </motion.button>
                      <p className='text-[10px] text-white/20 text-center'>Click after you've paid via UPI to add credits instantly</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ HISTORY ═══ */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)} className='fixed inset-0 bg-black/60 z-40' />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className='fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-white/[0.07] z-50 overflow-y-auto'>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-lg font-bold text-white' style={{ fontFamily: "'Sora',sans-serif" }}>Purchase History</h3>
                  <button onClick={() => setShowHistory(false)} className='p-2 rounded-lg hover:bg-white/[0.06] text-white/40 cursor-pointer transition'><BsXCircleFill size={18} /></button>
                </div>
                <div className='flex items-center gap-3 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/15 mb-6'>
                  <BsGem size={20} className='text-amber-400' />
                  <div>
                    <p className='text-2xl font-black text-amber-400' style={{ fontFamily: "'Sora',sans-serif" }}>{credits}</p>
                    <p className='text-[10px] text-white/25'>Available Credits</p>
                  </div>
                </div>
                {history.length > 0 ? (
                  <div className='space-y-3'>
                    {history.map((p, i) => (
                      <div key={i} className='p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]'>
                        <div className='flex items-center justify-between mb-2'>
                          <span className='text-sm font-semibold text-white/70 capitalize'>{p.plan} Pack</span>
                          <span className='text-xs text-emerald-400 font-bold'>+{p.credits} credits</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-[11px] text-white/25'>₹{(p.amount / 100).toLocaleString('en-IN')}</span>
                          <span className='text-[10px] text-white/20'>{new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className='text-center py-12'><p className='text-3xl mb-3'>💳</p><p className='text-white/30 text-sm'>No purchases yet</p></div>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ SUCCESS MODAL ═══ */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6' onClick={() => setShowSuccess(null)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()} className='bg-[#0b0b0b] border border-emerald-500/20 rounded-3xl p-10 max-w-sm w-full text-center'>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                className='w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6'>
                <BsCheckCircleFill size={36} className='text-emerald-400' />
              </motion.div>
              <h3 className='text-2xl font-black text-white mb-2' style={{ fontFamily: "'Sora',sans-serif" }}>Credits Added! 🎉</h3>
              <p className='text-white/40 text-sm mb-6'><span className='text-emerald-400 font-bold'>{showSuccess.credits} credits</span> are now in your account.</p>
              <div className='p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6 text-left'>
                <div className='flex justify-between mb-2'><span className='text-[11px] text-white/30'>Plan</span><span className='text-xs text-white/60 capitalize font-semibold'>{showSuccess.plan}</span></div>
                <div className='flex justify-between mb-2'><span className='text-[11px] text-white/30'>Credits</span><span className='text-xs text-emerald-400 font-bold'>+{showSuccess.credits}</span></div>
                <div className='flex justify-between'><span className='text-[11px] text-white/30'>Amount</span><span className='text-xs text-white/60'>₹{(showSuccess.amount / 100).toLocaleString('en-IN')}</span></div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setShowSuccess(null); navigate('/interview') }}
                className='w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-400 text-black font-bold text-sm cursor-pointer hover:bg-emerald-300 transition'>
                Start Practicing <BsArrowRight size={13} />
              </motion.button>
              <button onClick={() => setShowSuccess(null)} className='mt-3 text-white/25 text-xs cursor-pointer hover:text-white/50 transition'>Stay here</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  )
}