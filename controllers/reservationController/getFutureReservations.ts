import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export async function getFutureReservations(
  req: Request,
  res: Response
): Promise<void | any> {
  const reservations = await prisma.reservation.findMany({
    where: {
      time: {
        gte: new Date(new Date().getTime() - 15 * 60000).toISOString(), // 15 minutes ago
        lt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(), // 23:59:59.999
      },
    },
    include: {
      tables_in_orders_and_reservations: true,
    },
  });

  console.log(reservations);

  return res.json(reservations);
}
