//todo: roleId

import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.patch("/reservations/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    customer_name: name,
    customer_phone: phone,
    time,
    number_of_people: guests,
    comment,
  } = req.body;

  try {
    const reservation = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: {
        customer_name: name,
        customer_phone_number: phone,
        time: new Date(time),
        number_of_people: guests,
        comment: comment,
      },
    });
    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default app;
