import express from "express";
import { signup, signin, refreshToken } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";
import getReservationAvailabilityInRange from "../controllers/reservationController/getReservationAvailabilityInRange";

const router = express.Router();

router.get("/range", getReservationAvailabilityInRange);

router.patch("/reservations/:id", authenticateToken);
router.delete("/reservations/:id", authenticateToken);
router.get("/reservations/:id", authenticateToken);

export default router;
