import express from "express";
import { signup, signin, refreshToken } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";
import getDailyReservationAvailability from "../controllers/reservationController/getDailyReservationAvailability";
import getHourlyReservationAvailability from "../controllers/reservationController/getHourlyReservationAvailability";
import { getFutureReservations } from "../controllers/reservationController/getFutureReservations";
import { createNewReservation } from "../controllers/reservationController/createReservation";

const router = express.Router();

router.get("/range", getDailyReservationAvailability);
router.get("/day", getHourlyReservationAvailability);
router.get("/", getFutureReservations);
router.post("/", createNewReservation);

router.patch("/reservations/:id", authenticateToken);
router.delete("/reservations/:id", authenticateToken);
router.get("/reservations/:id", authenticateToken);

export default router;
