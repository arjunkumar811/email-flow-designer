import { Router } from "express";
const router = Router();
import {
  scheduleEmail,
  getScheduledEmails,
} from "../controllers/emailController.js";
import auth from "../middleware/auth.js";

// Apply auth middleware to all routes
router.use(auth);

// Schedule a single email
router.post("/schedule", scheduleEmail);

// Get all scheduled emails
router.get("/scheduled", getScheduledEmails);

export default router;
