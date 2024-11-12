import express, { Request, Response } from "express";
import { menu_item, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllMenuItemTypes(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const menuItems = await prisma.menu_item_types.findMany();
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default getAllMenuItemTypes;
