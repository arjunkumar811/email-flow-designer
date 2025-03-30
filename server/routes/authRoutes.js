import { Router } from "express";
const router = Router();
import { register, login, getMe } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

// Register a new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Get current user
router.get("/me", auth, getMe);

export default router;
