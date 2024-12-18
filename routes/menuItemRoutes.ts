import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import createMenuItem from "../controllers/menuItemControllers/createMenuItem";
import updateMenuItem from "../controllers/menuItemControllers/updateMenuItem";
import getMenuItem from "../controllers/menuItemControllers/getMenuItem";
import getAllMenuItems from "../controllers/menuItemControllers/getAllMenuItems";
import deactivateMenuItem from "../controllers/menuItemControllers/deactivateMenuItem";
import activateMenuItem from "../controllers/menuItemControllers/activateMenuItem";
import getAllMenuItemsAdmin from "../controllers/menuItemControllers/getAllMenuItemsAdmin";
import getMenuItemsAdmin from "../controllers/menuItemControllers/getMenuItemAdmin";

const router = express.Router();

// all routes in this file are protected by the authenticateToken middleware
// all routes in this file are prefixed with /menu_items

router.get("/admin", authMiddleware, getAllMenuItemsAdmin); //get all for admins
router.get("/admin/:id", authMiddleware, getMenuItemsAdmin); //get all for admins
router.post("/", authMiddleware, createMenuItem); //create
router.put("/admin/:id", authMiddleware, updateMenuItem); //update specific
router.delete("/:id/deactivate", authMiddleware, deactivateMenuItem); //delete specific
router.get("/:id", getMenuItem); //get specific
router.get("/", getAllMenuItems); //get all
router.patch("/:id/activate", authMiddleware, activateMenuItem); //deactivate specific

export default router;
