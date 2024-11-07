import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.patch("/menu_items/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

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
});
