import express, { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { getReservationAvailabilityInRangeSchema } from "../../zodSchemas/createUserSchema";

const prisma = new PrismaClient();

export async function getReservationAvailabilityInRange(
  req: Request,
  res: Response
): Promise<void | any> {
  // get search params from query
  const { start_date, end_date } = req.query;
  console.log(start_date, end_date);

  // validate search params
  const result = getReservationAvailabilityInRangeSchema.safeParse({
    start_date,
    end_date,
  });

  if (!result.success) {
    return res
      .status(400)
      .json({ message: result.error.flatten().fieldErrors });
  }

  try {
    const openingHours = await prisma.$queryRaw<
      { date: Date; opening_time: string | null; closing_time: string | null }[]
    >(
      Prisma.sql`SELECT * FROM get_opening_hours(${result.data.start_date}::DATE, ${result.data.end_date}::DATE)`
    );

    // const tables = await prisma.cafe_table.findMany({

    res.json();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default getReservationAvailabilityInRange;
