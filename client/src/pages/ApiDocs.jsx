import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  BsArrowRight, BsCodeSlash, BsFileTextFill, BsLockFill, 
  BsServer, BsTerminalFill, BsCheck2, BsBoxArrowUpRight, BsCopy
} from 'react-icons/bs'
import logo from "../assets/logo.png"

export default function ApiDocs() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('curl')
  const [copied, setCopied] = useState(false)
  const [activeNav, setActiveNav] = useState('auth')

  const copyToClipboard = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Smooth scroll handler
  const scrollTo = (id) => {
    setActiveNav(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className='relative w-full min-h-screen bg-[#000000] text-white flex flex-col'
      style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .api-title { font-family: 'Inter', sans-serif; letter-spacing: -0.02em; }
        .api-code  { font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        
        .syntax-string { color: #86efac; } /* green-300 */
        .syntax-number { color: #facc15; } /* yellow-400 */
        .syntax-keyword { color: #c084fc; } /* purple-400 */
        .syntax-key { color: #7dd3fc; } /* sky-300 */
        .syntax-comment { color: #6b7280; } /* gray-500 */
        .syntax-punct { color: #9ca3af; } /* gray-400 */
      `}</style>

      {/* ── Navbar ── */}
      <div className='sticky top-0 z-50 flex items-center justify-between w-full px-6 py-4 bg-black/50 backdrop-blur-xl border-b border-white/[0.08]'>
        <div onClick={() => navigate('/')}
          className='flex items-center gap-2.5 cursor-pointer group'>
          <div className="relative w-7 h-7 flex items-center justify-center rounded-lg bg-[#111] border border-white/10 shadow-inner group-hover:border-emerald-500/40 transition-all duration-300">
            <img src={logo} alt="logo" className="w-5 h-5 object-contain" />
            <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-emerald-500/5 transition-opacity" />
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-white/90 group-hover:text-white transition">
            Oralytics<span className="text-emerald-400 font-bold"> API</span>
          </span>
          <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-white/40">v1.2</span>
        </div>
        <div className='flex items-center gap-5'>
           <a href="mailto:api@oralytics.ai"
            className='text-white/40 hover:text-white transition text-sm font-medium flex items-center gap-2'>
            Access Tokens <BsBoxArrowUpRight size={11} />
          </a>
          <div className="w-px h-4 bg-white/10" />
          <button onClick={() => navigate('/dashboard')}
            className='text-white/60 text-sm font-medium hover:text-white transition cursor-pointer'>
            Dashboard
          </button>
        </div>
      </div>

      {/* ── Main Layout: 3 Columns ── */}
      <main className='flex-1 flex overflow-hidden lg:h-[calc(100vh-65px)]'>
        
        {/* COL 1: Sidebar Navigation (Hidden on mobile) */}
        <aside className='hidden lg:block w-64 flex-shrink-0 border-r border-white/[0.08] bg-[#050505] overflow-y-auto py-8 px-6'>
          <div className="mb-8">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Getting Started</h4>
            <ul className="space-y-1">
              <li>
                <button onClick={() => scrollTo('intro')} className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition ${activeNav === 'intro' ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>Introduction</button>
              </li>
              <li>
                <button onClick={() => scrollTo('auth')} className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition ${activeNav === 'auth' ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>Authentication</button>
              </li>
              <li>
                <button onClick={() => scrollTo('errors')} className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition ${activeNav === 'errors' ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>Errors & Rate Limits</button>
              </li>
            </ul>
          </div>
          
          <div className="mb-8">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Endpoints</h4>
            <ul className="space-y-1">
              <li>
                <button onClick={() => scrollTo('generate')} className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center justify-between group ${activeNav === 'generate' ? 'bg-white/5 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                  <span>Generate Specs</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${activeNav === 'generate' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white/50'}`}>POST</span>
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('analysis')} className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center justify-between group ${activeNav === 'analysis' ? 'bg-white/5 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                  <span>Fetch Analysis</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${activeNav === 'analysis' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white/50'}`}>GET</span>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* COL 2: Content (Scrollable) */}
        <div className='flex-1 overflow-y-auto px-6 py-12 lg:px-16 scroll-smooth pb-40' id="main-content">
          <div className="max-w-3xl mx-auto xl:mx-0">
            
            {/* Intro */}
            <section id="intro" className="mb-20 scroll-mt-24">
              <h1 className='api-title text-4xl font-bold text-white mb-4'>API Reference</h1>
              <p className='text-white/50 text-base leading-relaxed mb-6'>
                The Oralytics API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.
              </p>
              <div className="bg-[#111] border border-white/10 p-5 rounded-xl">
                <p className="text-white/60 text-sm leading-relaxed">Base URL for all v1 endpoints:</p>
                <div className="mt-2 bg-black border border-white/10 px-3 py-2 rounded-lg flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <code className="api-code text-white/90">https://api.oralytics.ai/v1</code>
                </div>
              </div>
            </section>

            {/* Authentication */}
            <section id="auth" className="mb-20 pt-10 border-t border-white/10 scroll-mt-24">
              <h2 className='api-title text-2xl font-bold text-white mb-4'>Authentication</h2>
              <p className='text-white/50 text-[15px] leading-relaxed mb-5'>
                The Oralytics API uses API keys to authenticate requests. You can view and manage your API keys in the <a href="#" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-400/30">Developer Dashboard</a>.
              </p>
              <p className='text-white/50 text-[15px] leading-relaxed mb-6'>
                Authentication to the API is performed via HTTP Bearer Auth. Provide your API key as the bearer token value.
              </p>
              <div className="bg-[#111] border border-white/10 overflow-hidden rounded-xl">
                <div className="bg-white/5 px-4 py-2 border-b border-white/10 text-xs font-bold text-white/40 uppercase tracking-widest">Header Example</div>
                <div className="p-4 bg-black">
                  <code className="api-code text-white/80">
                    <span className="syntax-punct">Authorization:</span> Bearer <span className="syntax-string">orl_live_aB39x...</span>
                  </code>
                </div>
              </div>
            </section>

            {/* Generate Endpoint */}
            <section id="generate" className="mb-20 pt-10 border-t border-white/10 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-2 py-1 rounded bg-[#2563eb]/20 text-[#60a5fa] border border-[#2563eb]/30 text-[11px] font-black uppercase tracking-widest">POST</span>
                <h2 className='api-title text-2xl font-bold text-white'>/v1/interviews/generate</h2>
              </div>
              <p className='text-white/50 text-[15px] leading-relaxed mb-8'>
                Generates a tailored set of interview questions based on the candidate's target role and optional resume context. This utilizes our core ML question-generation engine.
              </p>

              <h3 className="api-title text-lg font-semibold text-white mb-4">Body Parameters</h3>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a] divide-y divide-white/10">
                {/* param */}
                <div className="p-4 lg:p-5 flex flex-col md:flex-row gap-2 md:gap-6">
                  <div className="md:w-48 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="api-code text-white/90 font-semibold">job_role</code>
                      <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider bg-red-400/10 px-1.5 py-0.5 rounded">Required</span>
                    </div>
                    <div className="text-[11px] text-white/40 api-code">string</div>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-2">The target job title the candidate is applying for.</p>
                    <p className="text-xs text-white/40">Example: <code className="bg-white/10 px-1 rounded text-white/70">Frontend Developer</code></p>
                  </div>
                </div>
                {/* param */}
                <div className="p-4 lg:p-5 flex flex-col md:flex-row gap-2 md:gap-6">
                  <div className="md:w-48 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="api-code text-white/90 font-semibold">resume_url</code>
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider border border-white/10 px-1.5 py-0.5 rounded">Optional</span>
                    </div>
                    <div className="text-[11px] text-white/40 api-code">string</div>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-2">A public URL to the candidate's PDF or DOCX resume. If provided, the questions will be deeply tailored to their past projects and experience.</p>
                  </div>
                </div>
                {/* param */}
                <div className="p-4 lg:p-5 flex flex-col md:flex-row gap-2 md:gap-6">
                  <div className="md:w-48 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="api-code text-white/90 font-semibold">difficulty</code>
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider border border-white/10 px-1.5 py-0.5 rounded">Optional</span>
                    </div>
                    <div className="text-[11px] text-white/40 api-code">string</div>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-2">Defaults to <code className="bg-white/10 px-1 rounded">intermediate</code>. Controls the technical depth of generated questions.</p>
                    <p className="text-xs text-white/40">Allowed: <code className="bg-white/10 px-1 rounded text-white/70">beginner</code> | <code className="bg-white/10 px-1 rounded text-white/70">intermediate</code> | <code className="bg-white/10 px-1 rounded text-white/70">advanced</code></p>
                  </div>
                </div>
              </div>
            </section>

             {/* Analysis Endpoint */}
             <section id="analysis" className="mb-20 pt-10 border-t border-white/10 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-2 py-1 rounded bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30 text-[11px] font-black uppercase tracking-widest">GET</span>
                <h2 className='api-title text-2xl font-bold text-white'>/v1/sessions/:id/analysis</h2>
              </div>
              <p className='text-white/50 text-[15px] leading-relaxed mb-8'>
                Retrieves the comprehensive AI analysis, scores, and transcription for a completed interview session.
              </p>
            </section>

          </div>
        </div>

        {/* COL 3: Code Terminal (Sticky Right) */}
        <div className='hidden xl:flex flex-col w-[32rem] 2xl:w-[38rem] flex-shrink-0 bg-[#0a0a0a] border-l border-white/[0.08] relative'>
          
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth pb-32">
            
            {/* The Code Window */}
            <div className="sticky top-6">
              
              {/* Request Block */}
              <div className="rounded-xl overflow-hidden border border-[#222] shadow-2xl mb-6 bg-[#000]">
                {/* Mac Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-[#222]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  {/* Language Tabs */}
                  <div className="flex gap-4 absolute left-1/2 -translate-x-1/2">
                    <button onClick={() => setActiveTab('curl')} className={`text-xs font-medium ${activeTab === 'curl' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>cURL</button>
                    <button onClick={() => setActiveTab('node')} className={`text-xs font-medium ${activeTab === 'node' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>Node</button>
                    <button onClick={() => setActiveTab('python')} className={`text-xs font-medium ${activeTab === 'python' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>Python</button>
                  </div>
                  <button onClick={copyToClipboard} className="text-white/40 hover:text-white transition">
                    {copied ? <BsCheck2 size={14} className="text-emerald-400" /> : <BsCopy size={14} />}
                  </button>
                </div>
                
                {/* Request Code */}
                <div className="p-5 overflow-x-auto relative group">
                  <pre className="api-code leading-[1.6]">
                    {activeTab === 'curl' && (
<>
<span className="syntax-keyword">curl</span> -X POST https://api.oralytics.ai/v1/interviews/generate \<br/>
  -H <span className="syntax-string">"Authorization: Bearer orl_live_aB39x..."</span> \<br/>
  -H <span className="syntax-string">"Content-Type: application/json"</span> \<br/>
  -d <span className="syntax-string">'{'{'}</span><br/>
    <span className="syntax-key">"job_role"</span><span className="syntax-punct">:</span> <span className="syntax-string">"Backend Engineer"</span><span className="syntax-punct">,</span><br/>
    <span className="syntax-key">"difficulty"</span><span className="syntax-punct">:</span> <span className="syntax-string">"advanced"</span><br/>
  <span className="syntax-string">{'}'}'</span>
</>
                    )}
                    {activeTab === 'node' && (
<>
<span className="syntax-keyword">const</span> axios <span className="syntax-punct">=</span> require(<span className="syntax-string">'axios'</span>)<span className="syntax-punct">;</span><br/><br/>
<span className="syntax-keyword">const</span> response <span className="syntax-punct">=</span> <span className="syntax-keyword">await</span> axios.<span className="syntax-punct">post</span>(<span className="syntax-string">'https://api.oralytics.ai/v1/interviews/generate'</span>, {'{'}<br/>
  <span className="syntax-key">job_role</span><span className="syntax-punct">:</span> <span className="syntax-string">'Backend Engineer'</span>,<br/>
  <span className="syntax-key">difficulty</span><span className="syntax-punct">:</span> <span className="syntax-string">'advanced'</span><br/>
{'}'}, {'{'}<br/>
  <span className="syntax-key">headers</span><span className="syntax-punct">:</span> {'{'}<br/>
    <span className="syntax-string">'Authorization'</span><span className="syntax-punct">:</span> <span className="syntax-string">'Bearer orl_live_aB39x...'</span><br/>
  {'}'}<br/>
{'}'})<span className="syntax-punct">;</span><br/><br/>
console.<span className="syntax-punct">log</span>(response.data)<span className="syntax-punct">;</span>
</>
                    )}
                    {activeTab === 'python' && (
<>
<span className="syntax-keyword">import</span> requests<br/><br/>
headers <span className="syntax-punct">=</span> {'{'}<br/>
    <span className="syntax-string">'Authorization'</span><span className="syntax-punct">:</span> <span className="syntax-string">'Bearer orl_live_aB39x...'</span><span className="syntax-punct">,</span><br/>
    <span className="syntax-string">'Content-Type'</span><span className="syntax-punct">:</span> <span className="syntax-string">'application/json'</span><br/>
{'}'}<br/><br/>
data <span className="syntax-punct">=</span> {'{'}<br/>
    <span className="syntax-string">'job_role'</span><span className="syntax-punct">:</span> <span className="syntax-string">'Backend Engineer'</span><span className="syntax-punct">,</span><br/>
    <span className="syntax-string">'difficulty'</span><span className="syntax-punct">:</span> <span className="syntax-string">'advanced'</span><br/>
{'}'}<br/><br/>
response <span className="syntax-punct">=</span> requests.<span className="syntax-punct">post</span>(<br/>
    <span className="syntax-string">'https://api.oralytics.ai/v1/interviews/generate'</span><span className="syntax-punct">,</span><br/>
    headers<span className="syntax-punct">=</span>headers,<br/>
    json<span className="syntax-punct">=</span>data<br/>
)<br/><br/>
<span className="syntax-keyword">print</span>(response.json())
</>
                    )}
                  </pre>
                </div>
              </div>

              {/* Response Block */}
              <div className="rounded-xl overflow-hidden border border-[#222] shadow-2xl bg-[#000] relative">
                <div className="px-4 py-2 bg-[#0a0a0a] border-b border-[#222] flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Response</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[9px] font-bold text-emerald-400">200 OK</span>
                  </div>
                </div>
                <div className="p-5 overflow-x-auto">
                  <pre className="api-code leading-[1.6]">
<span className="syntax-punct">{'{'}</span><br/>
  <span className="syntax-key">"object"</span><span className="syntax-punct">:</span> <span className="syntax-string">"list"</span><span className="syntax-punct">,</span><br/>
  <span className="syntax-key">"data"</span><span className="syntax-punct">:</span> <span className="syntax-punct">[</span><br/>
    <span className="syntax-punct">{'{'}</span><br/>
      <span className="syntax-key">"id"</span><span className="syntax-punct">:</span> <span className="syntax-string">"q_x7bN3mQ..."</span><span className="syntax-punct">,</span><br/>
      <span className="syntax-key">"text"</span><span className="syntax-punct">:</span> <span className="syntax-string">"How would you handle race conditions in a high-throughput distributed message queue?"</span><span className="syntax-punct">,</span><br/>
      <span className="syntax-key">"type"</span><span className="syntax-punct">:</span> <span className="syntax-string">"technical_scenario"</span><span className="syntax-punct">,</span><br/>
      <span className="syntax-key">"expected_keywords"</span><span className="syntax-punct">:</span> <span className="syntax-punct">[</span><span className="syntax-string">"locks"</span><span className="syntax-punct">,</span> <span className="syntax-string">"idempotency"</span><span className="syntax-punct">,</span> <span className="syntax-string">"versioning"</span><span className="syntax-punct">]</span><br/>
    <span className="syntax-punct">{'}'}</span><span className="syntax-punct">,</span><br/>
    <span className="syntax-punct">{'{'}</span><br/>
      <span className="syntax-key">"id"</span><span className="syntax-punct">:</span> <span className="syntax-string">"q_k9LP2wB..."</span><span className="syntax-punct">,</span><br/>
      <span className="syntax-key">"text"</span><span className="syntax-punct">:</span> <span className="syntax-string">"Explain a time you strongly disagreed with a senior engineer's architectural decision."</span><span className="syntax-punct">,</span><br/>
      <span className="syntax-key">"type"</span><span className="syntax-punct">:</span> <span className="syntax-string">"behavioral"</span><span className="syntax-punct">,</span><br/>
      <span className="syntax-key">"expected_keywords"</span><span className="syntax-punct">:</span> <span className="syntax-punct">[</span><span className="syntax-string">"communication"</span><span className="syntax-punct">,</span> <span className="syntax-string">"metrics"</span><span className="syntax-punct">,</span> <span className="syntax-string">"compromise"</span><span className="syntax-punct">]</span><br/>
    <span className="syntax-punct">{'}'}</span><br/>
  <span className="syntax-punct">]</span><br/>
<span className="syntax-punct">{'}'}</span>
                  </pre>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
