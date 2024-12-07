import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllMenuItems(
  req: Request,
  res: Response
): Promise<void | any> {
  try {
    const item_type_id: string = req.query.item_type_id as string;
    const isActiveFilter: string = req.query.filter as string;

    let whereClause: any = {};

    // Handle is_active filter
    if (isActiveFilter === "Active") {
      whereClause.is_active = true;
    } else if (isActiveFilter === "Inactive") {
      whereClause.is_active = false;
    }
    // If isActiveFilter is "All" or undefined, no filter will be applied

    // Add type_id filter if present
    if (parseInt(item_type_id)) {
      whereClause.type_id = parseInt(item_type_id);
    }

    const menuItems = await prisma.menu_item.findMany({
      where: whereClause,
    });

    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default getAllMenuItems;
