import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post("/menu_items", async (req: Request, res: Response) => {
  const { name, description, price_in_kr, type_id } = req.body;

  try {
    const menuItem = await prisma.menu_item.create({
      data: {
        name,
        description,
        price_in_kr,
        type_id
      }
    });
    res.status(201).json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default app;
