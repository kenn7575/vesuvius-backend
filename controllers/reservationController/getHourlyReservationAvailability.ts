import express, { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  getHourlyReservationAvailabilitySchema,
  getReservationAvailabilityInRangeSchema,
} from "../../zodSchemas/schemas";
import { ReservationManager } from "../../core/reservations/reservationManager";
import convertOpeningHours from "../../utils/convertOpeningHours";
const prisma = new PrismaClient();

// Steps:
// 1. Get the date from the query parameters and validate it
// 2. Get the opening hours for the date
// 3. Get all tables
// 4. Get all reservations for the date
// 5. Create a reservation manager with the tables, opening hours, and reservations
// 6. Loop through the opening hours and check if there is a reservation for each 15-minute interval
// 7. Return the available times

export async function getHourlyReservationAvailability(
  req: Request,
  res: Response
): Promise<void | any> {
  // get search params from query
  const { date, peopleCount } = req.query;
  console.log("🚀 ~ date:", date);

  // validate search params
  const result = getHourlyReservationAvailabilitySchema.safeParse({
    date,
    peopleCount,
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
    console.log("🚀 ~ openingHours:", openingHours);
    if (!openingHours[0].opening_time! || !openingHours[0].closing_time!) {
      return res.status(404).send({
        availableTimes: [],
        message: "No opening hours found for this date",
      });
    }

    const tables = await prisma.cafe_table.findMany();
    console.log("🚀 ~ tables:", tables);

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
    const openTime = new Date(openingHours[0]?.opening_time || "")
      .toISOString()
      ?.split("T")[1]
      .substring(0, 5);
    console.log("🚀 ~ openTime:", openTime);
    const closeTime = new Date(openingHours[0]?.closing_time || "")
      .toISOString()
      ?.split("T")[1]
      .substring(0, 5);

    if (!closeTime || !openTime) {
      return res.status(500);
    }
    const openDuration = getTimeDifferenceInMinutes(openTime, closeTime); // minutes open

    // for every 15 minutes in the day, check if there is a reservation then add to list of available times
    const availableTimes = [];
    const startDate = new Date(result.data.date);
    const [openHour, openMinute] = openTime.split(":").map(Number);
    startDate.setHours(openHour, openMinute, 0, 0);

    const requestedPeopleCount = result?.data?.peopleCount;
    console.log("🚀 ~ requestedPeopleCount:", requestedPeopleCount);
    for (let i = 0; i < openDuration; i += 30) {
      const time = new Date(startDate);
      time.setMinutes(startDate.getMinutes() + i);
      if (reservationManager.isAvailable(requestedPeopleCount, time, 120)) {
        availableTimes.push(time.toTimeString().substring(0, 5));
      }
    }
    console.log(availableTimes);
    return res.json({ availableTimes: availableTimes, message: "Success" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ availableTimes: [], message: "Internal Server Error" });
  }
}

export default getHourlyReservationAvailability;

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
  const differenceInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

  return differenceInMinutes;
}
