// routes/authRoutes.js
import express from "express";
import { signup, signin, refreshToken } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createMenuItem } from "../controllers/orderController/createOrder";

const router = express.Router();

router.post("/", authMiddleware, createMenuItem); // create
router.patch("/:id", authMiddleware); // update
router.get("/:id", authMiddleware); // get specific
router.get("/", authMiddleware); // get all

export default router;
