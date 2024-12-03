// todo: roleId
//todo: combine with orderItems

import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getOrder(
  req: Request,
  res: Response
): Promise<void | any> {
  if (res.locals.roleId < 1) {
    return res.status(403).send("Forbidden");
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        order_items: true,
        tables_in_orders_and_reservations: true,
      },
    });
    return res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
