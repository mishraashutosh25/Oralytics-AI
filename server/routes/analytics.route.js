import express from "express"
import { getAnalytics } from "../controllers/analytics.controller.js"
import  isAuth  from "../middlewares/isAuth.js"

const analyticsRouter = express.Router()

analyticsRouter.get("/", isAuth, getAnalytics)

export default analyticsRouter