// routes/authRoutes.js
import express from "express";
import { signup, signin, refreshToken } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { createMenuItem } from "../controllers/orderController/createOrder";

const router = express.Router();

router.post("/", authenticateToken, createMenuItem); // create
router.patch("/:id", authenticateToken); // update
router.get("/:id", authenticateToken); // get specific
router.get("/", authenticateToken); // get all

export default router;
