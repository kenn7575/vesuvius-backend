import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { idSchema } from "../../zodSchemas/schemas";
import { z } from "zod";

const prisma = new PrismaClient();

export async function getRevenueDiff(
  req: Request,
  res: Response
): Promise<void | any> {
  const roleId = res.locals.roleId;
  if (!roleId || roleId < 2) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { from, to } = req.query;

  const validatedFrom = z.object({
    from: z.string().date(),
    to: z.string().date(),
  });

  // get the date range and create a new date range before the given date range
  const { previousFrom, previousTo } = getPreviousDateRange(
    from as string,
    to as string
  );

  const validatedId = validatedFrom.safeParse({ from, to });
  if (!validatedId.success) {
    return res
      .status(400)
      .json({ message: validatedId.error.flatten().fieldErrors });
  }

  try {
    const thisRange = await prisma.order.aggregate({
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
    const lastRange = await prisma.order.aggregate({
      _sum: {
        total_price_in_oere: true,
      },
      where: {
        created_at: {
          gte: new Date(previousFrom),
          lte: new Date(previousTo),
        },
      },
    });

    res.json({
      thisRange: thisRange._sum.total_price_in_oere,
      lastRange: lastRange._sum.total_price_in_oere,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default getRevenueDiff;

function getPreviousDateRange(from: string, to: string) {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  const diffTime = toDate.getTime() - fromDate.getTime();
  const previousFromDate = new Date(fromDate.getTime() - diffTime);
  const previousToDate = new Date(toDate.getTime() - diffTime);

  return {
    previousFrom: previousFromDate.toISOString().split("T")[0],
    previousTo: previousToDate.toISOString().split("T")[0],
  };
}
