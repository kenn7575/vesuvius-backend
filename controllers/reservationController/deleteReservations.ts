//todo: roleId

import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.delete('/reservations/:id', async(req: Request, res: Response) => {
    const {id} = req.params;

    try {
        await prisma.reservation.delete({
            where: {id: parseInt(id)}
        });

        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
  

});



export default app;
