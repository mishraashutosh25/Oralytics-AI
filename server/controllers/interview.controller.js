import fs from "fs"
import path from "path"
import { createRequire } from "module"
import { askAi } from "../services/openRouter.service.js"
import User from "../models/user.model.js"
import Interview from "../models/interview.model.js"
import CreditHistory from "../models/creditHistory.model.js"
import { CREDIT_COSTS } from "./credit.controller.js"

const require = createRequire(import.meta.url)

import axios from "axios"

// ── Extract text from PDF or DOCX (Local or URL) ───────────────────────────
async function extractResumeText(fileSource) {
  let buffer;
  const isUrl = fileSource.startsWith("http");

  if (isUrl) {
    const response = await axios.get(fileSource, { responseType: 'arraybuffer' });
    buffer = Buffer.from(response.data);
  } else {
    buffer = fs.readFileSync(fileSource);
  }

  const isDocx = fileSource.toLowerCase().includes('.docx');

  if (isDocx) {
    const mammoth = require("mammoth")
    const result = await mammoth.extractRawText({ buffer })
    return result.value || ""
  }
  
  // Default: PDF
  const pdfParse = require("pdf-parse")
  const data = await pdfParse(buffer)
  return data.text || ""
}

// ── Parse AI JSON response with fallback ───────────────────────────────────
function safeParseJson(raw) {
  // Strip markdown code fences
  let cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim()
  // Extract first {...} block if there's prose before/after
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (match) cleaned = match[0]
  return JSON.parse(cleaned)
}

export const analyzeResume = async (req, res) => {
  try {
    const userId = req.userId
    const user = await User.findById(userId)

    if (!user?.resumeUrl) {
      return res.status(400).json({ success: false, message: "Resume not uploaded. Please upload first." })
    }
    
    const isUrl = user.resumeUrl.startsWith("http");
    console.log("🔍 Analyze Resume Triggered! URL:", user.resumeUrl, "| isUrl:", isUrl);

    if (!isUrl && !fs.existsSync(user.resumeUrl)) {
      console.log("❌ File missing on disk and isUrl is false.");
      return res.status(400).json({ success: false, message: "Resume file not found on server. Please re-upload." })
    }

    // Extract text
    let resumeText
    try {
      resumeText = await extractResumeText(user.resumeUrl)
    } catch (e) {
      console.error("❌ extractResumeText Failed:", e.message, e.stack);
      return res.status(400).json({ success: false, message: `Could not read resume: ${e.message}` })
    }

    if (!resumeText || resumeText.trim().length < 50) {
      console.error("❌ resumeText too short or empty. Length:", resumeText?.length);
      return res.status(400).json({ success: false, message: "Resume appears to be empty or image-only. Please upload a text-based PDF." })
    }

    // Limit to 6000 chars to avoid token overflow
    const truncated = resumeText.slice(0, 6000)

    const SCHEMA = `{
  "atsScore": 78,
  "overview": "2-3 line professional summary of the candidate",
  "extractedInfo": {
    "name": "", "email": "", "phone": "", "location": "",
    "totalExperience": "", "currentRole": "", "education": "",
    "topSkills": ["skill1", "skill2"],
    "missingKeywords": ["keyword1", "keyword2"]
  },
  "sections": {
    "contactInfo":  { "score": 90, "status": "good",    "feedback": "feedback text" },
    "summary":      { "score": 60, "status": "average", "feedback": "feedback text" },
    "experience":   { "score": 75, "status": "good",    "feedback": "feedback text" },
    "education":    { "score": 90, "status": "good",    "feedback": "feedback text" },
    "skills":       { "score": 70, "status": "average", "feedback": "feedback text" },
    "projects":     { "score": 65, "status": "average", "feedback": "feedback text" },
    "formatting":   { "score": 80, "status": "good",    "feedback": "feedback text" }
  },
  "keywordAnalysis": {
    "foundKeywords": ["React", "Node.js"],
    "missingHighValue": ["Docker", "Kubernetes"],
    "overusedWords": ["worked", "helped"],
    "recommendedReplacements": [
      { "avoid": "worked on", "use": "engineered" },
      { "avoid": "helped with", "use": "collaborated to deliver" }
    ]
  },
  "impactAnalysis": {
    "hasQuantifiedAchievements": false,
    "quantifiedCount": 0,
    "missingQuantification": ["Add % improvement metrics to project outcomes", "Quantify team size"]
  },
  "actionVerbAnalysis": {
    "score": 65,
    "weakVerbs": ["worked", "helped", "did"],
    "suggestions": ["Use 'engineered' instead of 'worked on'"]
  },
  "industryBenchmark": {
    "role": "Software Engineer",
    "avgAtsScore": 72,
    "yourScore": 78,
    "percentile": 65,
    "verdict": "Above average for your role"
  },
  "atsCompatibility": {
    "score": 75,
    "verdict": "Likely to pass most ATS",
    "issues": ["Missing professional summary", "No LinkedIn URL"],
    "passesATS": true
  },
  "strengths": ["Strong technical skills section", "Good project variety"],
  "weaknesses": ["No quantified achievements", "Weak professional summary"],
  "improvements": [
    { "priority": "high",   "section": "Experience", "current": "Worked on backend APIs", "suggestion": "Led development of 5 RESTful APIs serving 10K daily users", "impact": "+8 ATS points" },
    { "priority": "medium", "section": "Summary",    "current": "",                        "suggestion": "Add a 3-line professional summary targeting your target role", "impact": "+5 ATS points" }
  ],
  "quickWins": [
    "Add LinkedIn URL to contact section",
    "Replace 'worked on' with action verbs like 'engineered', 'architected'",
    "Add measurable outcomes to at least 3 bullets"
  ],
  "estimatedImprovementScore": 88
}`

    const messages = [
      {
        role: "system",
        content: "You are a world-class ATS analyzer and senior career coach with 15+ years of experience. You MUST respond with ONLY valid JSON — no prose, no markdown fences, no extra text before or after the JSON object."
      },
      {
        role: "user",
        content: `Analyze the following resume and return ONLY a JSON object matching this exact schema (fill in all fields with real data from the resume):\n\nSCHEMA:\n${SCHEMA}\n\nRESUME TEXT:\n${truncated}`
      }
    ]

    const aiRaw = await askAi(messages)

    let analysis
    try {
      analysis = safeParseJson(aiRaw)
    } catch (parseErr) {
      console.error("JSON parse failed. Raw AI response:", aiRaw.slice(0, 500))
      return res.status(500).json({ success: false, message: "AI returned invalid JSON. Please try again." })
    }

    return res.status(200).json({ success: true, message: "Resume analyzed successfully", analysis })

  } catch (error) {
    console.error("analyzeResume error:", error.message)
    return res.status(500).json({ success: false, message: error.message || "Resume analysis failed." })
  }
}

export const matchResumeWithJD = async (req, res) => {
  try {
    const userId = req.userId
    const { jobDescription } = req.body

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ success: false, message: "Please provide a valid job description (min 50 characters)" })
    }

    const user = await User.findById(userId)
    if (!user?.resumeUrl) {
      return res.status(400).json({ success: false, message: "Please upload your resume first" })
    }

    const isUrl = user.resumeUrl.startsWith("http");
    if (!isUrl && !fs.existsSync(user.resumeUrl)) {
      return res.status(400).json({ success: false, message: "Resume file not found. Please re-upload." })
    }

    let resumeText;
    try {
      resumeText = await extractResumeText(user.resumeUrl);
    } catch (e) {
      console.error("Match JD text extraction error:", e.message);
      return res.status(400).json({ success: false, message: `Could not read resume: ${e.message}` })
    }

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ success: false, message: "Resume appears empty. Please re-upload a valid PDF/DOCX." });
    }

    const messages = [
      {
        role: "system",
        content: `You are an expert ATS system and recruiter with 15+ years experience.
        Always respond in valid JSON only. No extra text.`
      },
      {
        role: "user",
        content: `Compare this resume with the job description and provide detailed match analysis.

        RESUME:
        ${resumeText}

        JOB DESCRIPTION:
        ${jobDescription}

        Return ONLY this JSON:
        {
          "matchScore": 73,
          "verdict": "Strong Match",
          "summary": "2-3 line summary",
          "matchedKeywords": [],
          "missingKeywords": [],
          "matchedSkills": [],
          "missingSkills": [],
          "experienceMatch": {
            "required": "3+ years",
            "candidate": "2 years",
            "match": false,
            "feedback": ""
          },
          "educationMatch": {
            "required": "B.Tech CS",
            "candidate": "B.Tech CS",
            "match": true,
            "feedback": ""
          },
          "sectionAnalysis": {
            "skills":     { "score": 65, "feedback": "" },
            "experience": { "score": 70, "feedback": "" },
            "projects":   { "score": 80, "feedback": "" },
            "education":  { "score": 90, "feedback": "" }
          },
          "tailoredSuggestions": [],
          "interviewCallChance": 62,
          "companyCulture": "",
          "salaryRange": "₹8-14 LPA"
        }`
      }
    ]

    const aiResponse = await askAi(messages)
    let result
    try {
      const cleaned = aiResponse.replace(/```json|```/g, "").trim()
      result = JSON.parse(cleaned)
    } catch {
      return res.status(500).json({ success: false, message: "AI response parsing failed." })
    }

    return res.status(200).json({ success: true, result })

  } catch (error) {
    return res.status(500).json({ success: false, message: `matchResumeWithJD error: ${error.message}` })
  }
}

export const generateQuestions = async (req, res) => {
  try {
    const userId = req.userId
    const { role, difficulty, useResume, sessionDuration, persona, company } = req.body

    if (!role) {
      return res.status(400).json({ success: false, message: "Role is required" })
    }

    const questionCount = sessionDuration === '10' ? 5
      : sessionDuration === '20' ? 8
        : sessionDuration === '30' ? 12 : 15


    let resumeContext = ""
    let user = await User.findById(userId)
    
    // Feature usage cost check
    const featureName = req.body.mode === 'video' ? 'Video Interview' : 'Mock Interview'
    const cost = CREDIT_COSTS[featureName] || 25
    
    if (user.credits < cost) {
      return res.status(402).json({ success: false, message: `Insufficient credits. Need ${cost} but have ${user.credits}. Please upgrade.` })
    }

    if (useResume && user?.resumeUrl) {
      try {
        resumeContext = await extractResumeText(user.resumeUrl);
      } catch (e) {
        console.error("Warning: Resume provided but failed to extract text:", e.message);
      }
    }

    const personaPrompts = {
      google: "You are a strict Google/FAANG interviewer. Focus on algorithms, system design, scalability, and technical depth.",
      startup: "You are a startup CTO interviewer. Focus on practical skills, speed of execution, and product thinking.",
      hr: "You are a friendly HR interviewer. Focus on behavioral questions, culture fit, and soft skills.",
      senior: "You are a senior engineer interviewer. Ask deep technical questions, architecture trade-offs, and leadership scenarios."
    }


    const companyPrompts = {
      google: "Focus heavily on DSA, algorithms, time complexity, and system design at scale. Include Googleyness culture fit questions.",
      amazon: "Focus on Amazon's 14 Leadership Principles. Every question should relate to LP like Customer Obsession, Ownership, Bias for Action. Candidate should use STAR method.",
      microsoft: "Focus on growth mindset, collaboration, coding problems, and design discussions. Include behavioral questions about teamwork and learning from failures.",
      meta: "Focus on coding efficiency, system design for billion-scale, product sense, and data-driven decisions. Include questions about moving fast and iterating.",
      flipkart: "Focus on data structures, algorithms, and practical problem solving. Include questions about e-commerce domain knowledge.",
      infosys: "Focus on basic CS fundamentals, verbal communication, aptitude-style questions, and HR behavioral questions. Keep difficulty moderate.",
      startup_generic: "Focus on practical skills, ability to work independently, ship fast mentality, ownership, and culture fit questions.",
      none: ""
    }

    const systemPrompt = personaPrompts[persona] || personaPrompts.google
    const companyContext = company && company !== 'none'
      ? `\nCompany-Specific Focus: ${companyPrompts[company]}`
      : ''

    const messages = [
      {
        role: "system",
        content: `${systemPrompt}
Generate realistic, challenging interview questions.
${companyContext}
Always respond in valid JSON only. No extra text.`
      },
      {
        role: "user",
        content: `Generate ${questionCount} interview questions for a ${role} role.

Difficulty: ${difficulty}
Persona: ${persona}
${company && company !== 'none' ? `Target Company: ${company}` : ''}
${resumeContext ? `\nCandidate Resume:\n${resumeContext}` : ''}

Mix of question types:
- Technical questions (based on role${resumeContext ? ' and resume skills' : ''})
- HR/Behavioral questions
- ${resumeContext ? 'Project-specific questions based on resume projects' : 'Problem solving questions'}
${company && company !== 'none' ? `- Company-specific questions matching ${company} interview style` : ''}

Return ONLY this JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "type": "Technical",
      "difficulty": "medium",
      "expectedPoints": ["point1", "point2", "point3"],
      "timeLimit": 120,
      "hint": "Subtle hint without giving away the answer"
    }
  ],
  "sessionConfig": {
    "role": "${role}",
    "difficulty": "${difficulty}",
    "persona": "${persona}",
    "company": "${company || 'none'}",
    "totalQuestions": ${questionCount},
    "estimatedTime": "${sessionDuration} minutes",
    "resumeUsed": ${useResume ? 'true' : 'false'}
  }
}`
      }
    ]

    const aiResponse = await askAi(messages)
    let data
    try {
      const cleaned = aiResponse.replace(/```json|```/g, "").trim()
      data = JSON.parse(cleaned)
    } catch {
      return res.status(500).json({ success: false, message: "AI response parsing failed." })
    }

    // Deduct credits ONLY if successful array is parsed
    user.credits -= cost;
    if (user.credits < 0) user.credits = 0;
    await user.save();
    
    await CreditHistory.create({
      userId: user._id,
      feature: featureName,
      creditsDeducted: cost,
      description: `Generated ${questionCount} questions on ${role}`
    });

    return res.status(200).json({
      success: true,
      questions: data.questions,
      sessionConfig: data.sessionConfig,
      credits: user.credits
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: `generateQuestions error: ${error.message}` })
  }
}

export const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, role, difficulty, expectedPoints, isFollowUp } = req.body

    if (!question || !answer) {
      return res.status(400).json({ success: false, message: "Question and answer are required" })
    }

    if (answer.trim().length < 5 || answer === "(No answer provided)") {
      return res.status(200).json({
        success: true,
        evaluation: {
          score: 0,
          feedback: "No answer provided. Please attempt the question.",
          strengths: [],
          improvements: ["Provide a detailed answer"],
          idealAnswer: "",
          metrics: { content: 0, clarity: 0, relevance: 0 }
        }
      })
    }

    const messages = [
      {
        role: "system",
        content: `You are an expert interviewer evaluating candidate answers.
        Be honest, constructive and specific. Always respond in valid JSON only.`
      },
      {
        role: "user",
        content: `Evaluate this ${isFollowUp ? 'follow-up' : ''} interview answer:

        Role: ${role}
        Difficulty: ${difficulty}
        Question: ${question}
        Expected Points: ${expectedPoints?.join(', ') || 'N/A'}
        Candidate Answer: ${answer}

        Return ONLY this JSON:
        {
          "score": 78,
          "feedback": "2-3 line specific feedback",
          "strengths": ["Good point 1", "Good point 2"],
          "improvements": ["Could improve X", "Missing Y"],
          "idealAnswer": "What ideal answer would include",
          "metrics": {
            "content": 80,
            "clarity": 75,
            "relevance": 78
          }
        }`
      }
    ]

    const aiResponse = await askAi(messages)
    let evaluation
    try {
      const cleaned = aiResponse.replace(/```json|```/g, "").trim()
      evaluation = JSON.parse(cleaned)
    } catch {
      return res.status(500).json({ success: false, message: "Evaluation parsing failed." })
    }

    return res.status(200).json({ success: true, evaluation })

  } catch (error) {
    return res.status(500).json({ success: false, message: `evaluateAnswer error: ${error.message}` })
  }
}

export const getHint = async (req, res) => {
  try {
    const { question, role, partialAnswer } = req.body

    const messages = [
      {
        role: "system",
        content: "You are a helpful interview coach. Give subtle, guiding hints — not full answers. Keep it to 1-2 sentences max."
      },
      {
        role: "user",
        content: `Give a subtle hint for this interview question:
        Role: ${role}
        Question: ${question}
        ${partialAnswer ? `Partial answer so far: ${partialAnswer}` : ''}
        
        Return ONLY the hint text, nothing else. 1-2 sentences max.`
      }
    ]

    const hint = await askAi(messages)
    return res.status(200).json({ success: true, hint: hint.trim() })

  } catch (error) {
    return res.status(500).json({ success: false, message: "Hint generation failed." })
  }
}

export const getFollowUp = async (req, res) => {
  try {
    const { question, answer, role } = req.body

    const messages = [
      {
        role: "system",
        content: "You are a sharp interviewer. Ask ONE specific follow-up question to dig deeper into a weak or incomplete answer."
      },
      {
        role: "user",
        content: `Generate a follow-up question:
        Role: ${role}
        Original Question: ${question}
        Candidate Answer: ${answer}
        
        Ask ONE follow-up that probes a gap or asks for more depth.
        Return ONLY the question text, nothing else.`
      }
    ]

    const followUp = await askAi(messages)
    return res.status(200).json({ success: true, followUp: followUp.trim() })

  } catch (error) {
    return res.status(500).json({ success: false, message: "Follow-up generation failed." })
  }
}

export const generateReport = async (req, res) => {
  try {
    const { answers, sessionConfig, totalTime } = req.body

    const avgScore = Math.round(
      answers.reduce((sum, a) => sum + a.score, 0) / answers.length
    )

    const answeredCount = answers.filter(a => a.userAnswer !== '(Skipped)').length
    const skippedCount = answers.filter(a => a.userAnswer === '(Skipped)').length
    const followUpCount = answers.filter(a => a.isFollowUp).length

    const messages = [
      {
        role: "system",
        content: `You are an expert interview coach. Generate detailed, actionable interview reports.
        Always respond in valid JSON only.`
      },
      {
        role: "user",
        content: `Generate a comprehensive interview report:

        Role: ${sessionConfig.role}
        Difficulty: ${sessionConfig.difficulty}
        Persona: ${sessionConfig.persona || 'standard'}
        Total Time: ${totalTime}
        Average Score: ${avgScore}/100
        Questions Answered: ${answeredCount}
        Questions Skipped: ${skippedCount}
        Follow-up Questions: ${followUpCount}
        Resume Used: ${sessionConfig.resumeUsed}

        Answers:
        ${answers.map((a, i) => `
        Q${i + 1}${a.isFollowUp ? ' (Follow-up)' : ''}: ${a.question}
        Answer: ${a.userAnswer}
        Score: ${a.score}/100
        `).join('\n')}

        Return ONLY this JSON:
        {
          "overallFeedback": "3-4 line comprehensive, specific feedback mentioning actual answers",
          "strengths": [
            "Specific strength with example from answers",
            "Specific strength 2",
            "Specific strength 3"
          ],
          "weaknesses": [
            "Specific weakness with example",
            "Specific weakness 2"
          ],
          "improvements": [
            "Actionable improvement 1 — how to fix it",
            "Actionable improvement 2",
            "Actionable improvement 3"
          ],
          "recommendation": "Ready",
          "topicsToStudy": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "nextSteps": "Specific 2-3 line advice on what to do next",
          "interviewReadiness": {
            "technical": 72,
            "communication": 80,
            "problemSolving": 68,
            "overallReadiness": 73
          }
        }`
      }
    ]

    const aiResponse = await askAi(messages)
    let report
    try {
      const cleaned = aiResponse.replace(/```json|```/g, "").trim()
      report = JSON.parse(cleaned)
    } catch {
      return res.status(500).json({ success: false, message: "Report generation failed." })
    }

    return res.status(200).json({ success: true, report })

  } catch (error) {
    return res.status(500).json({ success: false, message: `generateReport error: ${error.message}` })
  }
}

export const saveSession = async (req, res) => {
  try {
    const userId = req.userId
    const { sessionConfig, answers, report, proctoringData } = req.body

    const session = new Interview({
      userId,
      role: sessionConfig.role,
      difficulty: sessionConfig.difficulty,
      mode: sessionConfig.mode || 'text',
      duration: parseInt(sessionConfig.estimatedTime) || 20,
      resumeUsed: sessionConfig.resumeUsed || false,
      questions: answers.map(a => ({
        id: a.questionId,
        question: a.question,
        type: a.type || 'General',
        userAnswer: a.userAnswer,
        aiFeedback: a.evaluation?.feedback || '',
        score: a.score || 0,
        timeTaken: a.timeTaken || 0,
        metrics: {
          content: a.metrics?.content || 0,
          clarity: a.metrics?.clarity || 0,
          relevance: a.metrics?.relevance || 0,
        }
      })),
      report: {
        totalScore: report.avgScore || 0,
        avgScore: report.avgScore || 0,
        timeTaken: report.totalTime || '0:00',
        strengths: report.strengths || [],
        weaknesses: report.weaknesses || [],
        improvements: report.improvements || [],
        overallFeedback: report.overallFeedback || '',
        recommendation: report.recommendation || 'Needs Practice',
      },
      // ── Save live proctoring metrics ──
      proctoringData: {
        violations: proctoringData?.violations || sessionConfig?.violations || 0,
        integrityScore: proctoringData?.integrityScore || sessionConfig?.integrityScore || 100,
        avgConfidence: proctoringData?.avgConfidence || 0,
        avgWPM: proctoringData?.avgWPM || 0,
        avgEyeContact: proctoringData?.avgEyeContact || 0,
        dominantEmotion: proctoringData?.dominantEmotion || '',
        totalFillers: proctoringData?.totalFillers || 0,
        keywordsMatched: proctoringData?.keywordsMatched || [],
        violationTypes: proctoringData?.violationTypes || [],
      },
      status: 'completed',
      completedAt: new Date()
    })

    await session.save()

    await User.findByIdAndUpdate(userId, {
      $set: { lastPracticeAt: new Date() },
    })

    return res.status(200).json({
      success: true,
      message: 'Session saved successfully',
      sessionId: session._id
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: `saveSession error: ${error.message}` })
  }
}

// ── Get All Sessions for History Table ────────────────────────────────────────
export const getMySessions = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId
    const sessions = await Interview.find({ userId, status: 'completed' })
      .sort({ completedAt: -1 })
      .select('role difficulty mode questions report completedAt createdAt')
      .lean()

    const mapped = sessions.map(s => ({
      _id: s._id,
      role: s.role,
      difficulty: s.difficulty || 'medium',
      mode: s.mode || 'text',
      completedAt: s.completedAt || s.createdAt,
      createdAt: s.createdAt,
      report: {
        avgScore: s.report?.avgScore || 0,
        recommendation: s.report?.recommendation || 'N/A',
        totalQuestions: s.questions?.length || 0,
        answered: (s.questions || []).filter(q => q.userAnswer && q.userAnswer !== '(Skipped)').length,
      },
      questionTypes: [...new Set((s.questions || []).map(q => q.type).filter(Boolean))],
    }))

    return res.json({ success: true, sessions: mapped })
  } catch (err) {
    console.error('getMySessions error:', err)
    return res.status(500).json({ success: false, message: 'Failed to fetch sessions' })
  }
}

// ── Delete Session ────────────────────────────────────────
export const deleteSession = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId
    const { id } = req.params

    const session = await Interview.findOneAndDelete({ _id: id, userId })

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or already deleted' })
    }

    return res.json({ success: true, message: 'Session deleted successfully' })
  } catch (err) {
    console.error('deleteSession error:', err)
    return res.status(500).json({ success: false, message: 'Failed to delete session' })
  }
}
