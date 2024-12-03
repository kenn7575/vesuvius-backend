import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getOrder(
  req: Request,
  res: Response
): Promise<void | any> {
  if (res.locals.roleId < 1) {
    return res.status(403).send("Forbidden");
  }
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).send("Bad Request");
  }

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        order_items: true,
        tables_in_orders_and_reservations: true,
      },
    });
    return res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
