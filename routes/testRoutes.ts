import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { generateRandomOrders } from "../controllers/testControllers/generateRandomOrders";

const router = express.Router();

router.post("/generate-order", authMiddleware, generateRandomOrders);

export default router;
