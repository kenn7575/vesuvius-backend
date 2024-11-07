import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.delete("/order-items/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const orderItem = await prisma.order_items.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json(orderItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default app;
