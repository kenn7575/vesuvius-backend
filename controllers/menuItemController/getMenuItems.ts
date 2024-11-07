import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.get("/menu_items", async (req: Request, res: Response) => {
  try {
    const menuItems = await prisma.menu_item.findMany({
      select: {
        id: true,
        name: true,
        price_in_kr: true,
        description: true,
        type_id: true,
      },
    });
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default app;
