import { Request, Response } from "express";
import { order_items, PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

interface CreateOrderRequest {
  comment: string;
  status: string;
  waiterId: number;
  orderItems: order_items[];
}

const createOrderSchema = z.object({
  comment: z.string().optional().nullable(),
  waiter_id: z.number(),
  order_items: z
    .array(
      z.object({
        menu_item_id: z.number(),
        quantity: z.number(),
        comment: z.string().optional().nullable(),
      })
    )
    .min(1),
  order_tables: z
    .array(
      z.object({
        table_id: z.number(),
      })
    )
    .min(1),
});

export async function createMenuItem(
  req: Request,
  res: Response
): Promise<void | any> {
  if (res.locals.roleId < 1) {
    return res.status(403).send("Forbidden");
  }

  const result = createOrderSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: result.error.flatten().fieldErrors });
  }

  const data = result.data;

  try {
    // start by getting the price of the menu item included in the order

    const menuItems = await prisma.menu_item.findMany({
      where: {
        id: {
          in: data.order_items.map((orderItem) => orderItem.menu_item_id),
        },
      },
    });

    // create order
    const order = await prisma.order.create({
      data: {
        comment: data.comment,
        status: "Pending",
        created_at: new Date(),
        updated_at: new Date(),
        waiter_id: data.waiter_id,
        order_items: {
          create: data.order_items.map((orderItem) => ({
            quantity: orderItem.quantity,
            comment: orderItem.comment,
            menu_item_id: orderItem.menu_item_id,
            price_in_oere: menuItems.find(
              (menuItem) => menuItem.id === orderItem.menu_item_id
            )?.price_in_oere,
          })),
        },
        tables_in_orders_and_reservations: {
          create: data.order_tables.map((orderTable) => ({
            table_id: orderTable.table_id,
          })),
        },
      },
      include: {
        order_items: true,
        tables_in_orders_and_reservations: true,
      },
    });

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
