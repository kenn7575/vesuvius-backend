import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function updateMenuItem(
  req: Request,
  res: Response
): Promise<void | any> {
  const roleId = res.locals.roleId;
  if (!roleId || roleId < 2) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { id } = req.params;

  const { name, description, price_in_oere, type_id } = req.body;
  // todo: validate the input

  try {
    const updatedMenuItem = await prisma.menu_item.update({
      where: { id: parseInt(id) },
      data: { name, description, price_in_oere, type_id },
    });
    res.json(updatedMenuItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default updateMenuItem;
