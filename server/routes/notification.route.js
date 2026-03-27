import express from "express"
import isAuth from "../middlewares/isAuth.js"
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  clearReadNotifications,
  checkAndCreateReminders,
} from "../controllers/notification.controller.js"

const router = express.Router()

router.get("/",              isAuth, getNotifications)
router.put("/read-all",      isAuth, markAllRead)
router.put("/:id/read",      isAuth, markRead)
router.delete("/clear-all",  isAuth, clearReadNotifications)
router.delete("/:id",        isAuth, deleteNotification)
router.post("/check-reminders", isAuth, checkAndCreateReminders)

export default router
