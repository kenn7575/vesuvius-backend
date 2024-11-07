import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.get("/reservations", async (req: Request, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany({
      select: {
        id: true,
        time: true,
        duration_in_minutes: true,
        number_of_people: true,
        waiter_id: true,
        status: true,
        comment: true,
        customer_name: true,
        customer_phone_number: true,
      },
    });
    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
