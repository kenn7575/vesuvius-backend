// routes/userRoutes.js
import express from "express";
import { getProtectedResource } from "../controllers/userController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/protected", authenticateToken, getProtectedResource);

export default router;
