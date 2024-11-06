// routes/userRoutes.js
import express from "express";
import { userData } from "../controllers/userController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/protected", authenticateToken, userData);

export default router;
