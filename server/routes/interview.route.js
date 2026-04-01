import express from "express"
import { analyzeResume, evaluateAnswer, generateQuestions, generateReport, getFollowUp, getHint, matchResumeWithJD, saveSession, getMySessions, deleteSession, getSessionById } from "../controllers/interview.controller.js"
import isAuth from "../middlewares/isAuth.js"
import { checkCredits } from "../middlewares/credit.middleware.js"
import { aiEndpointLimiter } from "../middlewares/rateLimiter.js"

const interviewRouter = express.Router()

interviewRouter.post("/analyze-resume", isAuth, aiEndpointLimiter, checkCredits('Resume Analysis'), analyzeResume)
interviewRouter.post("/match-jd",  isAuth, aiEndpointLimiter, checkCredits('Resume Analysis'), matchResumeWithJD)
interviewRouter.post("/generate-questions", isAuth, aiEndpointLimiter, generateQuestions)
interviewRouter.post("/evaluate-answer",   isAuth, aiEndpointLimiter, evaluateAnswer)
interviewRouter.post("/save-session",      isAuth, saveSession)
interviewRouter.post("/generate-report", isAuth, aiEndpointLimiter, generateReport)
interviewRouter.post("/get-hint",    isAuth, aiEndpointLimiter, getHint)
interviewRouter.post("/follow-up",   isAuth, getFollowUp)
interviewRouter.get("/my-sessions",  isAuth, getMySessions)
interviewRouter.get("/session/:id",  isAuth, getSessionById)
interviewRouter.delete("/session/:id", isAuth, deleteSession)

export default interviewRouter