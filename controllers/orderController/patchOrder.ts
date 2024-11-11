//todo: roleId

import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// patch request to update an order by ID
app.patch("/orders/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { waiter_id, comment, status, items } = req.body; // Extract `items` from the request body

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(id) },
        data: {
          waiter_id,
          comment,
          status,
        },
      });

      // Update each item in `order_items`
      const updatedOrderItems = await Promise.all(
        (items || []).map(
          (item: { id: number; count?: number; price?: number }) =>
            prisma.order_items.update({
              where: { id: item.id },
              data: {
                count: item.count,
                price_in_oere: item.price,
              },
            })
        )
      );

      return { updatedOrder, updatedOrderItems };
    });

    // Send the updated order and order items as a JSON response
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
