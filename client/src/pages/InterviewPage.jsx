import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Step1SetUp from '../components/Step1SetUp'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'

function InterviewPage() {
  const navigate = useNavigate()
  const [step,          setStep]          = useState(1)
  const [interviewData, setInterviewData] = useState(null)
  const [report,        setReport]        = useState(null)

  return (
    <div className='min-h-screen bg-[#050505]'>

      {/* Back button — sirf Step1 pe */}
      {step === 1 && (
        <button
          onClick={() => navigate(-1)}
          className='fixed top-5 left-5 z-50 flex items-center gap-2
            px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]
            text-white/40 text-sm hover:text-white/70 hover:bg-white/[0.07]
            transition-all duration-200 cursor-pointer'>
          ← Back
        </button>
      )}

      {step === 1 && (
        <Step1SetUp
          onStart={(data) => {
            setInterviewData(data)
            setStep(2)
          }}
        />
      )}

      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          onComplete={(report) => {
            setReport(report)
            setStep(3)
          }}
        />
      )}

      {step === 3 && (
        <Step3Report
          report={report}
          onRestart={() => {
            setStep(1)
            setInterviewData(null)
            setReport(null)
          }}
        />
      )}

    </div>
  )
}

export default InterviewPage
