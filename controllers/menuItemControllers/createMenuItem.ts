import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createMenuItem(
  req: Request,
  res: Response
): Promise<void | any> {
  const { name, description, price_in_kr, type_id } = req.body;

  // TODO: Add validation for the request body and access control

  try {
    const menuItem = await prisma.menu_item.create({
      data: {
        name,
        description,
        price_in_kr,
        type_id,
      },
    });
    res.status(201).json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default createMenuItem;
