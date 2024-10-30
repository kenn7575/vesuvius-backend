// controllers/authController.js
import { PrismaClient, type personel } from "@prisma/client";
import express, { Request, Response } from "express";
const prisma = new PrismaClient();
export async function getProtectedResource(
  req: Request,
  res: Response
): Promise<void | any> {
  try {
    const reservations = await prisma.reservation.findMany();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
