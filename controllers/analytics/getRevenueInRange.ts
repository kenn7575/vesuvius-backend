import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { idSchema } from "../../zodSchemas/schemas";
import { z } from "zod";

const prisma = new PrismaClient();

export async function getRevenueInRange(
  req: Request,
  res: Response
): Promise<void | any> {
  const roleId = res.locals.roleId;
  if (!roleId || roleId < 2) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { from, to } = req.query;
  console.log("🚀 ~ { from, to } :", { from, to });

  const validatedFrom = z.object({
    from: z.string().date(),
    to: z.string().date(),
  });

  const validatedId = validatedFrom.safeParse({ from, to });
  if (!validatedId.success) {
    return res
      .status(400)
      .json({ message: validatedId.error.flatten().fieldErrors });
  }

  try {
    const revenue = await prisma.order.aggregate({
      _sum: {
        total_price_in_oere: true,
      },
      where: {
        created_at: {
          gte: new Date(validatedId.data.from),
          lte: new Date(validatedId.data.to),
        },
      },
    });

    res.json(revenue._sum.total_price_in_oere);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default getRevenueInRange;
