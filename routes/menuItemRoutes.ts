import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("resources", authenticateToken)
router.patch("resources/:id", authenticateToken)
router.delete("resources/:id", authenticateToken)
router.get("resources/:id", authenticateToken)

export default router;
