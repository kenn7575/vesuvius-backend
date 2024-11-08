import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function updateMenuItem(
  req: Request,
  res: Response
): Promise<void | any> {
  const { id } = req.params;

  // TODO: Add validation for the request body and access control

  const { name, description, price_in_kr, type_id } = req.body;

  try {
    const updatedMenuItem = await prisma.menu_item.update({
      where: { id: parseInt(id) },
      data: { name, description, price_in_kr, type_id },
    });
    res.json(updatedMenuItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default updateMenuItem;
