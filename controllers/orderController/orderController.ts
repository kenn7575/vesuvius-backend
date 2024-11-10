//todo: roleId

import express, { Request, Response } from "express";
import { order_items, PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

interface CreateOrderRequest {
  comment: string;
  status: string;
  waiterId: number;
  orderItems: order_items[];
}

app.post(
  "/orders",
  async (req: Request<{}, {}, CreateOrderRequest>, res: Response) => {
    req.user;
    const { comment, status, waiterId, orderItems } = req.body;

    try {
      const newOrder = await prisma.order.create({
        data: {
          comment,
          status,
          waiter_id: waiterId,
          order_items: {
            create: orderItems.map((item) => ({
              count: item.count,
              menu_item_id: item.menu_item_id,
              price: item.price_in_oere,
            })),
          },
        },
      });

      res.status(201).json(newOrder);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);
