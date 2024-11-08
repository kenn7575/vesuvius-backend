import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function deleteMenuItem(
  req: Request,
  res: Response
): Promise<void | any> {
  const { id } = req.params;

  // TODO: Add validation for the request body and access control

  try {
    const orderItem = await prisma.order_items.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json(orderItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default deleteMenuItem;
