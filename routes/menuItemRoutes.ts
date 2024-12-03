import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import createMenuItem from "../controllers/menuItemControllers/createMenuItem";
import updateMenuItem from "../controllers/menuItemControllers/updateMenuItem";
import getMenuItem from "../controllers/menuItemControllers/getMenuItem";
import getAllMenuItems from "../controllers/menuItemControllers/getAllMenuItems";
import deactivateMenuItem from "../controllers/menuItemControllers/deactivateMenuItem";
import activateMenuItem from "../controllers/menuItemControllers/activateMenuItem";

const router = express.Router();

// all routes in this file are protected by the authenticateToken middleware
// all routes in this file are prefixed with /menu_items

// todo: add access control with roleId in each controller
router.post("/", authenticateToken, createMenuItem); //create
router.put("/:id", authenticateToken, updateMenuItem); //update specific
router.delete("/:id/deactivate", authenticateToken, deactivateMenuItem); //delete specific
router.get("/:id", getMenuItem); //get specific
router.get("/", getAllMenuItems); //get all
router.patch("/:id/activate", authenticateToken, activateMenuItem); //deactivate specific

export default router;
