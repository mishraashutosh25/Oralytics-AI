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
