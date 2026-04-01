import React, { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  BsArrowRight, BsBookFill, BsLightningChargeFill,
  BsCodeSlash, BsPersonFill, BsClock, BsFire, BsEnvelopeFill
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import image1 from '../assets/ashutosh.png'
import logo from "../assets/logo.png"
import Footer from '../components/Footer'

const FadeUp = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 25 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >{children}</motion.div>
  )
}

const articles = [
  {
    id: 1,
    category: 'Engineering',
    icon: <BsCodeSlash size={12} />,
    title: 'How we reduced AI response latency by 65%',
    desc: 'Deep dive into our move from sequential REST pipelines to WebSocket streaming and optimized LLM token generation for real-time interview vibes. This architecture supports 10k concurrent sessions without dropping frames.',
    date: 'March 28, 2026',
    readTime: '8 min read',
    author: 'Ashutosh Mishra',
    authorRole: 'Founding Engineer',
    avatar: image1,
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    featured: true,
  },
  {
    id: 2,
    category: 'Interview Guide',
    icon: <BsBookFill size={12} />,
    title: 'The Ultimate Guide to Google\'s System Design Round',
    desc: 'They don\'t just want you to build it; they want to know how it fails. Here is the framework that 40+ candidates used to clear L4/L5 this year.',
    date: 'March 15, 2026',
    readTime: '12 min read',
    author: 'Elena Rodriguez',
    authorRole: 'Career Coach',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100&h=100',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    featured: false,
  },
  {
    id: 3,
    category: 'Product Update',
    icon: <BsLightningChargeFill size={12} />,
    title: 'Introducing Resume-Aware Mock Interviews',
    desc: 'Upload your ATS resume and let our engine instantly tailor technical depth and behavioral questions strictly to your stated experience.',
    date: 'March 02, 2026',
    readTime: '4 min read',
    author: 'Product Team',
    authorRole: 'Oralytics AI',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?fit=crop&w=100&h=100',
    img: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=600',
    featured: false,
  },
  {
    id: 4,
    category: 'Interview Guide',
    icon: <BsBookFill size={12} />,
    title: 'Stop using the STAR method wrong',
    desc: 'The biggest mistake candidates make in behavioral rounds is spending 80% of their time on the "Situation" and only 20% on the "Action". Here is how to fix it immediately.',
    date: 'February 18, 2026',
    readTime: '6 min read',
    author: 'Elena Rodriguez',
    authorRole: 'Career Coach',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100&h=100',
    img: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=600',
    featured: false,
  },
  {
    id: 5,
    category: 'Engineering',
    icon: <BsCodeSlash size={12} />,
    title: 'Scaling our Python ML Predictor in Production',
    desc: 'How we transitioned our Random Forest placement models from local scikit-learn notebooks into a high-concurrency FastAPI microservice.',
    date: 'February 05, 2026',
    readTime: '9 min read',
    author: 'Ashutosh Mishra',
    authorRole: 'Founding Engineer',
    avatar: image1,
    img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=600',
    featured: false,
  },
  {
    id: 6,
    category: 'Success Story',
    icon: <BsFire size={12} />,
    title: 'From Tier-3 College to Amazon SDE-1',
    desc: 'How Rahul used 45 AI mock sessions to overcome interview anxiety and negotiate a top-tier package during the tech winter.',
    date: 'January 22, 2026',
    readTime: '5 min read',
    author: 'Customer Success',
    authorRole: 'Oralytics AI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=100&h=100',
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600',
    featured: false,
  },
]

export default function Blog() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')

  const categories = ['All', 'Engineering', 'Interview Guide', 'Product Update', 'Success Story']
  const filtered = filter === 'All' ? articles : articles.filter(a => a.category === filter)
  const featured = articles.find(a => a.featured)

  return (
    <div className='relative w-full min-h-screen bg-[#000000] text-white overflow-x-hidden'
      style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .tracking-tighter { letter-spacing: -0.04em; }
        .tracking-tight { letter-spacing: -0.02em; }
        .glass-card { background: rgba(10, 10, 10, 0.4); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .grad-border::before { content: ""; position: absolute; inset: 0; padding: 1px; border-radius: inherit; background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.02)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
      `}</style>

      {/* Hero Ambient Background */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden h-[80vh] z-0'>
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen opacity-60' />
        <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")] opacity-[0.03] mix-blend-overlay' />
      </div>

      {/* Navigation */}
      <div className='relative z-50 flex items-center justify-between max-w-7xl mx-auto px-6 py-6'>
        <div onClick={() => navigate('/')} className='flex items-center gap-2.5 cursor-pointer group'>
          <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-[#111] border border-white/10 shadow-inner group-hover:border-emerald-500/40 transition-all duration-300">
            <img src={logo} alt="logo" className="w-6 h-6 object-contain" />
            <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-emerald-500/5 transition-opacity duration-300" />
          </div>
          <span className="text-[19px] font-semibold tracking-tight text-white/90 group-hover:text-white transition">
            Oralytics<span className="text-emerald-400 font-bold"> Blog</span>
          </span>
        </div>
        <button onClick={() => navigate(-1)} className='px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/60 text-sm font-medium hover:text-white hover:bg-white/[0.08] transition cursor-pointer backdrop-blur-md'>
          Return to App
        </button>
      </div>

      <main className='relative z-10 max-w-7xl mx-auto px-6 pb-32 pt-12 md:pt-20'>
        
        {/* Header Section */}
        <section className='mb-20 text-center md:text-left flex flex-col items-center md:items-start'>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold tracking-wide uppercase mb-6'>
            <HiSparkles size={12} /> News, guides & engineering
          </motion.div>
          
          <h1 className='text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.05]'>
            Building the future <br className="hidden md:block"/> of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">technical interviews</span>
          </h1>
          <p className='text-white/40 text-lg md:text-xl font-medium max-w-2xl leading-relaxed'>
            We write about building large-scale ML systems, decoding ATS logic, 
            and giving candidates the highest possible edge in modern technical rounds.
          </p>
        </section>

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-2.5 mb-14 border-b border-white/[0.06] pb-8'>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                filter === c 
                  ? 'bg-white text-black shadow-[0_4px_14px_0_rgba(255,255,255,0.39)]' 
                  : 'bg-white/[0.02] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.06]'
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Featured Article (Linear/Vercel style) */}
        {filter === 'All' && featured && (
          <FadeUp className='mb-24'>
            <div className='group relative cursor-pointer glass-card grad-border rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_80px_-20px_rgba(52,211,153,0.3)]'>
              <div className='absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#000000] z-10 pointer-events-none' />
              <div className='h-[450px] md:h-[600px] w-full relative'>
                <img src={featured.img} alt={featured.title} 
                  className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out grayscale-[0.5] opacity-60' />
              </div>
              
              <div className='absolute bottom-0 left-0 right-0 z-20 p-8 md:p-14 flex flex-col justify-end'>
                <div className='flex items-center gap-3 mb-6'>
                  <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 border border-emerald-400 text-black text-[11px] font-bold uppercase tracking-wider'>
                    {featured.icon} {featured.category}
                  </span>
                  <span className='text-white/60 text-sm font-medium flex items-center gap-1.5'>
                    <BsClock size={12} /> {featured.readTime}
                  </span>
                </div>
                
                <h2 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1] group-hover:text-emerald-400 transition-colors duration-300 max-w-4xl'>
                  {featured.title}
                </h2>
                <p className='text-white/60 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-3xl'>
                  {featured.desc}
                </p>
                
                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-3 md:gap-4'>
                    <img src={featured.avatar} alt="author" className="w-12 h-12 rounded-full border border-white/20" />
                    <div className='flex flex-col'>
                      <span className='text-white text-sm font-semibold'>{featured.author}</span>
                      <span className='text-white/40 text-[13px] font-medium'>{featured.authorRole} • {featured.date}</span>
                    </div>
                  </div>
                  <div className='w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:bg-emerald-400 group-hover:text-black group-hover:border-emerald-400 transition-all duration-300 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'>
                    <BsArrowRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        )}

        {/* Regular Article Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16'>
          <AnimatePresence mode='popLayout'>
            {filtered.map((article, i) => {
              if (filter === 'All' && article.featured) return null; 
              return (
                <motion.div key={article.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className='group relative cursor-pointer flex flex-col'
                >
                  <div className='h-60 relative overflow-hidden rounded-3xl mb-6 grad-border z-10'>
                    <div className='absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10' />
                    <img src={article.img} alt={article.title} 
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100' />
                  </div>
                  
                  <div className='flex flex-col flex-1 px-2'>
                    <div className='flex items-center gap-3 mb-4'>
                      <span className='text-emerald-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5'>
                        {article.category}
                      </span>
                      <span className='w-1 h-1 rounded-full bg-white/20' />
                      <span className='text-white/40 text-xs font-medium'>{article.readTime}</span>
                    </div>

                    <h3 className='text-2xl font-bold text-white mb-3 tracking-tight leading-[1.3] group-hover:text-emerald-400 transition-colors'>
                      {article.title}
                    </h3>
                    <p className='text-white/50 text-[15px] font-medium leading-relaxed mb-8 line-clamp-3'>
                      {article.desc}
                    </p>

                    <div className='mt-auto flex items-center justify-between pt-6 border-t border-white/[0.08]'>
                      <div className='flex items-center gap-3'>
                        <img src={article.avatar} alt={article.author} className="w-8 h-8 rounded-full border border-white/10" />
                        <div className="flex flex-col">
                          <span className="text-white/90 text-xs font-semibold">{article.author}</span>
                          <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest mt-0.5">{article.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Newsletter CTA */}
        <FadeUp className='mt-40'>
          <div className='relative overflow-hidden glass-card grad-border rounded-[32px] p-10 md:p-20 text-center flex flex-col items-center border border-white/5'>
            <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent' />
            <div className='absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none' />

            <div className='w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-emerald-400 mb-8 shadow-inner'>
               <BsEnvelopeFill size={28} />
            </div>
            <h2 className='text-3xl md:text-5xl font-bold tracking-tight text-white mb-5'>Subscribe to the deep dive</h2>
            <p className='text-white/50 text-base md:text-lg mb-10 max-w-lg leading-relaxed'>
              Get one high-signal email per month. No spam, only architectural breakdowns, ATS algorithm updates, and interview mastery.
            </p>
            <div className='flex flex-col sm:flex-row w-full max-w-md gap-3 relative z-20'>
              <input type="email" placeholder="tim@apple.com" className="flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-white/30 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
              <button className="bg-white text-black font-semibold px-7 py-3.5 rounded-xl hover:bg-emerald-400 transition-colors shadow-xl">
                Subscribe
              </button>
            </div>
          </div>
        </FadeUp>

      </main>
      <Footer />
    </div>
  )
}
