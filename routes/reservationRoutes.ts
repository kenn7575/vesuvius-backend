import express from "express";
import { signup, signin, refreshToken } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import getDailyReservationAvailability from "../controllers/reservationController/getDailyReservationAvailability";
import getHourlyReservationAvailability from "../controllers/reservationController/getHourlyReservationAvailability";
import { getFutureReservations } from "../controllers/reservationController/getFutureReservations";
import { createNewReservation } from "../controllers/reservationController/createReservation";

const router = express.Router();

router.get("/range", getDailyReservationAvailability);
router.get("/day", getHourlyReservationAvailability);
router.get("/", getFutureReservations);
router.post("/", createNewReservation);

// todo: add the controllers for the following routes
router.patch("/:id", authMiddleware);
router.delete("/:id", authMiddleware);
router.get("/:id", authMiddleware);

export default router;
