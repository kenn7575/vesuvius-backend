import express from "express";
import { getMenu } from "../controllers/reservationController/getMenuWithTypes";

const router = express.Router();

router.get("/", getMenu); //get all

export default router;
