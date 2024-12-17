import express, { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { getReservationAvailabilityInRangeSchema } from "../../zodSchemas/schemas";
import { ReservationManager } from "../../core/reservations/ReservationManager";
import convertOpeningHours from "../../utils/convertOpeningHours";

const prisma = new PrismaClient();

export async function getDailyReservationAvailability(
  req: Request,
  res: Response
): Promise<void | any> {
  // get search params from query
  const { start_date, end_date } = req.query;

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

    const tables = await prisma.cafe_table.findMany();

    const reservations = await prisma.reservation.findMany({
      select: {
        duration_in_minutes: true,
        time: true,
        number_of_people: true,
        customer_name: true,
        tables_in_orders_and_reservations: {
          select: {
            table_id: true,
          },
        },
      },
      where: {
        time: {
          gte: new Date(result.data.start_date).toISOString(),
          lte: new Date(result.data.end_date).toISOString(),
        },
      },
    });

    const test = convertOpeningHours(openingHours);

    const reservationManager = new ReservationManager({
      Tables: tables,
      openingHoursByDate: test,
      Reservation: reservations.map((e) => {
        return {
          partySize: e.number_of_people,
          name: e.customer_name,
          tableIds: e.tables_in_orders_and_reservations
            .map((table) => table.table_id)
            .filter((id): id is number => id !== null),
          startTime: e.time,
          duration: e.duration_in_minutes,
        };
      }),
    });

    res.json(
      reservationManager.checkAvailabilityInRange(
        new Date(result.data.start_date),
        new Date(result.data.end_date)
      )
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default getDailyReservationAvailability;
