// routes/userRoutes.js
import express from "express";
import { getUserData } from "../controllers/userController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, getUserData);

export default router;
