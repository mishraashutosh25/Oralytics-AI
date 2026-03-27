import express from "express"
import {
  getCurrentUser, updateUser, saveResume,
  deleteResume, deleteAccount, getUserStats,
  saveProfilePhoto, deleteProfilePhoto,
} from "../controllers/user.controller.js"
import isAuth from "../middlewares/isAuth.js"
import { upload, uploadPhoto } from "../middlewares/multer.js"

const router = express.Router()

router.get("/current-user", isAuth, getCurrentUser)
router.get("/stats",        isAuth, getUserStats)
router.put("/update",       isAuth, updateUser)
router.delete("/resume",    isAuth, deleteResume)
router.delete("/account",   isAuth, deleteAccount)

// Profile photo
router.post("/photo",  isAuth, (req, res, next) => {
  uploadPhoto.single("photo")(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message || "Upload failed" })
    next()
  })
}, saveProfilePhoto)
router.delete("/photo", isAuth, deleteProfilePhoto)


router.post("/resume", isAuth, (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      console.log("Multer error:", err.message)
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed"
      })
    }
    next()
  })
}, saveResume)

export default router