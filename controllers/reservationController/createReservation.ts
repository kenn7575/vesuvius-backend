import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { createReservationSchema } from "../../zodSchemas/schemas";
import { ReservationManager } from "../../core/reservations/ReservationManager";
import convertOpeningHours from "../../utils/convertOpeningHours";

const prisma = new PrismaClient();

export async function createNewReservation(
  req: Request,
  res: Response
): Promise<void | any> {
  console.log("🚀 ~ creating new reservation:", req.body);
  const {
    time,
    number_of_people,
    comment = "",
    email,
    customer_name,
    customer_phone_number,
  } = req.body;

  const result = createReservationSchema.safeParse({
    time,
    number_of_people,
    comment,
    email,
    customer_name,
    customer_phone_number,
  });
  if (!result.success) {
    return res
      .status(400)
      .json({ message: result.error.flatten().fieldErrors });
  }

  const openingHours = await prisma.$queryRaw<
    { date: Date; opening_time: string | null; closing_time: string | null }[]
  >(
    Prisma.sql`SELECT * FROM get_opening_hours(${result.data.time}::DATE, ${result.data.time}::DATE)`
  );

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
        gte: new Date(new Date(result.data.time).setHours(0, 0, 0, 0)),
        lt: new Date(new Date(result.data.time).setHours(23, 59, 59, 999)),
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

  try {
    const reservationData = reservationManager.addReservation(
      result.data.number_of_people,
      result.data.customer_phone_number,
      new Date(result.data.time),
      120
    );

    //make the reservation in the database
    const reservation = await prisma.reservation.create({
      data: {
        time: reservationData.startTime,
        duration_in_minutes: reservationData.duration,
        number_of_people: reservationData.partySize,
        waiter_id: null,
        status: "Pending",
        comment: result.data.comment,
        customer_name: result.data.customer_name,
        customer_phone_number: result.data.customer_phone_number,
        email: result.data.email,
      },
    });

    // assign tables to the reservation
    await prisma.tables_in_orders_and_reservations.createMany({
      data: reservationData.tableIds.map((tableId) => ({
        table_id: tableId,
        reservation_id: reservation.id,
      })),
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Noget gik galt under oprettelsen af reservationen! " + error);
  }
}
