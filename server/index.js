import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDb from './config/connectDb.js'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import interviewRouter from './routes/interview.route.js'
import placementRouter from './routes/placement.route.js'  
import analyticsRouter from './routes/analytics.route.js'
import notificationRouter from './routes/notification.route.js'
import paymentRouter from './routes/payment.route.js'
import creditRouter from './routes/credit.route.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(express.json())
app.use(cookieParser())
app.use('/public', express.static(path.join(__dirname, 'public')))

app.use("/api/auth",      authRouter)
app.use("/api/user",      userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/placement", placementRouter)
app.use("/api/analytics",      analyticsRouter)
app.use("/api/notifications",  notificationRouter)
app.use("/api/payment",        paymentRouter)
app.use("/api/credits",        creditRouter)

const PORT = process.env.PORT || 8080

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  await connectDb()
})
