// routes/authRoutes.js
import express from "express";
import { signup, signin, refreshToken } from "../controllers/authController";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh-token", refreshToken);

export default router;
