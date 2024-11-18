import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllMenuItems(
  req: Request,
  res: Response
): Promise<void | any> {
  try {
    const item_type_id: string = req.query.item_type_id as string;
    console.log("🚀 ~ item_type_id:", item_type_id, typeof item_type_id);

    let menuItems;
    if (parseInt(item_type_id)) {
      menuItems = await prisma.menu_item.findMany({
        where: { type_id: parseInt(item_type_id), is_active: true },
      });
    } else {
      menuItems = await prisma.menu_item.findMany({
        where: { is_active: true },
      });
    }
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default getAllMenuItems;
