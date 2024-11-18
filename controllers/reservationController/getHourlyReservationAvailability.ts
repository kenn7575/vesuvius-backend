import express, { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  getHourlyReservationAvailabilitySchema,
  getReservationAvailabilityInRangeSchema,
} from "../../zodSchemas/schemas";
import { ReservationManager } from "../../core/reservations/reservationManager";
import convertOpeningHours from "../../utils/convertOpeningHours";

const prisma = new PrismaClient();

export async function getHourlyReservationAvailability(
  req: Request,
  res: Response
): Promise<void | any> {
  // get search params from query
  const { date } = req.query;

  // validate search params
  const result = getHourlyReservationAvailabilitySchema.safeParse({
    date,
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
      Prisma.sql`SELECT * FROM get_opening_hours(${result.data.date}::DATE, ${result.data.date}::DATE)`
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
          gte: new Date(new Date(result.data.date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(result.data.date).setHours(23, 59, 59, 999)),
        },
      },
    });

    const reservationManager = new ReservationManager({
      Tables: tables,
      openingHoursByDate: convertOpeningHours(openingHours),
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
    function getTimeDifferenceInMinutes(
      startTime: string,
      endTime: string
    ): number {
      // Parse the "hh:mm" format strings to get hours and minutes
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      // Create Date objects with a fixed date (e.g., today) for both times
      const start = new Date();
      start.setHours(startHour, startMinute, 0, 0);

      const end = new Date();
      end.setHours(endHour, endMinute, 0, 0);

      // Calculate the difference in minutes
      const differenceInMinutes =
        (end.getTime() - start.getTime()) / (1000 * 60);

      return differenceInMinutes;
    }

    const openTime = new Date(openingHours[0]?.opening_time || "")
      .toISOString()
      ?.split("T")[1]
      .substring(0, 5);
    const closeTime = new Date(openingHours[0]?.closing_time || "")
      .toISOString()
      ?.split("T")[1]
      .substring(0, 5);

    if (!closeTime || !openTime) {
      return res.status(500);
    }
    const openDuration = getTimeDifferenceInMinutes(openTime, closeTime);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default getHourlyReservationAvailability;
