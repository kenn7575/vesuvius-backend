import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import createMenuItemSchema from "./createMenuItemSchema";

const prisma = new PrismaClient();

export async function createMenuItem(
  req: Request,
  res: Response
): Promise<void | any> {
  const roleId = res.locals.roleId;

  if (!roleId || roleId < 2) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const parsedCreateMenuItemSchema = createMenuItemSchema.safeParse(req.body);

  if (!parsedCreateMenuItemSchema.success) {
    return res
      .status(400)
      .json({ error: parsedCreateMenuItemSchema.error.flatten().fieldErrors });
  }

  const data = parsedCreateMenuItemSchema.data;

  try {
    const menuItem = await prisma.menu_item.create({
      data: {
        name: data.name,
        description: data.description,
        price_in_oere: data.price_in_oere,
        type_id: data.type_id,
      },
    });
    res.status(201).json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default createMenuItem;
