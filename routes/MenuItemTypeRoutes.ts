import express from "express";
import getAllMenuItemTypes from "../controllers/menuItemTypeControllers/getAllMenuItemTypes";

const router = express.Router();

router.get("/", getAllMenuItemTypes); //get all

export default router;
