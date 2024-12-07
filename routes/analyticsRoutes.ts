// routes/authRoutes.js
import express from "express";
import getRevenueInRange from "../controllers/analytics/getRevenueInRange";
import { authMiddleware } from "../middlewares/authMiddleware";
import getOrdersInRange from "../controllers/analytics/getOrdersInRange";
import getOrderItemsInRange from "../controllers/analytics/getOrderItemsInRange";
import getRevenueDiff from "../controllers/analytics/getRevenueDiff";
import getTopMenuItems from "../controllers/analytics/getTopMenuItems";
import getRevenueChart from "../controllers/analytics/getRevenueChart";

const router = express.Router();

router.get("/revenue", authMiddleware, getRevenueInRange);
router.get("/order_count", authMiddleware, getOrdersInRange);
router.get("/order_item_count", authMiddleware, getOrderItemsInRange);
router.get("/revenue_diff", authMiddleware, getRevenueDiff);
router.get("/top_menu_items", authMiddleware, getTopMenuItems);
router.get("/revenue_chart", authMiddleware, getRevenueChart);

export default router;
