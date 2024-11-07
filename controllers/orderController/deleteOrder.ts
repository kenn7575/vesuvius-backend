//todo: roleId
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.delete("/orders/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const orderId = parseInt(id);

  try {
    // Delete order items first
    await prisma.order_items.deleteMany({
      where: { order_id: orderId }
    });

    // Then delete the order
    await prisma.order.delete({
      where: { id: orderId }
    });

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default app;
