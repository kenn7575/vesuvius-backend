import express from "express";
import { signup, signin, refreshToken } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/reservations", authenticateToken)
router.patch("/reservations/:id", authenticateToken)
router.delete("/reservations/:id", authenticateToken)
router.get("/reservations/:id", authenticateToken)


export default router;

