// todo: roleId
//todo: combine with orderItems

import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/orders", async (req: Request, res: Response) => {
  try {
    // Fetch order records from the database
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        waiter_id: true,
        created_at: true,
        updated_at: true,
        comment: true,
        status: true,
        order_items: {
          select: {
            id: true,
            count: true,
            price: true,
            order_id: true,
            menu_item_id: true,
          },
        },
      },
    });

    // Send the fetched orders as a JSON response
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
