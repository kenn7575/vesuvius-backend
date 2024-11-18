// routes/authRoutes.js
import express from "express";
import { signup, signin, refreshToken } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("resources", authenticateToken);
router.patch("resources/:id", authenticateToken /*roleId*/);
router.delete("resources/:id", authenticateToken /*roleId*/);
router.get("resources/:id", authenticateToken);

export default router;
