import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import createMenuItem from "../controllers/menuItemControllers/createMenuItem";
import updateMenuItem from "../controllers/menuItemControllers/updateMenuItem";
import deleteMenuItem from "../controllers/menuItemControllers/deleteMenuItem";
import getMenuItem from "../controllers/menuItemControllers/getMenuItem";
import getAllMenuItems from "../controllers/menuItemControllers/getAllMenuItems";

const router = express.Router();

// all routes in this file are protected by the authenticateToken middleware
// all routes in this file are prefixed with /menu_items

router.post("/", authenticateToken, createMenuItem); //create
router.put("/:id", authenticateToken, updateMenuItem); //update specific
router.delete("/:id", authenticateToken, deleteMenuItem); //delete specific
router.get("/:id", authenticateToken, getMenuItem); //get specific
router.get("/", authenticateToken, getAllMenuItems); //get all

export default router;
