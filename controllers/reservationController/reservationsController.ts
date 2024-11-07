//todo: roleId

import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post("/reservations", async (req: Request, res: Response) => {
  const {
    time,
    duration_in_minutes,
    number_of_people,
    waiter_id,
    status,
    comment,
    customer_name,
    customer_phone_number,
  } = req.body;

  try {
    const reservation = await prisma.reservation.create({
      data: {
        time,
        duration_in_minutes,
        number_of_people,
        waiter_id,
        status,
        comment,
        customer_name,
        customer_phone_number,
      },
    });
    res.status(201).json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
