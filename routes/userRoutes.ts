// routes/userRoutes.js
import express from "express";
import { getUserData } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getUserData);

export default router;
