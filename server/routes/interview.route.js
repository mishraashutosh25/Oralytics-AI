import express from "express"
import { analyzeResume, evaluateAnswer, generateQuestions, generateReport, getFollowUp, getHint, matchResumeWithJD, saveSession, getMySessions, deleteSession, getSessionById } from "../controllers/interview.controller.js"
import isAuth from "../middlewares/isAuth.js"
import { checkCredits } from "../middlewares/credit.middleware.js"

const interviewRouter = express.Router()

interviewRouter.post("/analyze-resume", isAuth, checkCredits('Resume Analysis'), analyzeResume)
interviewRouter.post("/match-jd",  isAuth, checkCredits('Resume Analysis'), matchResumeWithJD)
interviewRouter.post("/generate-questions", isAuth, generateQuestions)
interviewRouter.post("/evaluate-answer",   isAuth, evaluateAnswer)
interviewRouter.post("/save-session",      isAuth, saveSession)
interviewRouter.post("/generate-report", isAuth, generateReport)
interviewRouter.post("/get-hint",    isAuth, getHint)
interviewRouter.post("/follow-up",   isAuth, getFollowUp)
interviewRouter.get("/my-sessions",  isAuth, getMySessions)
interviewRouter.get("/session/:id",  isAuth, getSessionById)
interviewRouter.delete("/session/:id", isAuth, deleteSession)

export default interviewRouter