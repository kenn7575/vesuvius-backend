import express from "express";
import { getAllTables } from "../controllers/tableControllors/getAllTables";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getAllTables);

export default router;
