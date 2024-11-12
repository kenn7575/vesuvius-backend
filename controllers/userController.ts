// controllers/authController.js
import { PrismaClient, type personel } from "@prisma/client";
import express, { Request, Response } from "express";
const prisma = new PrismaClient();
export async function getUserData(
  req: Request,
  res: Response
): Promise<void | any> {
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(400).json({ message: "Token not provided." });
  }

  try {
    const user = await prisma.personel.findUnique({
      where: {
        id: Number(userId),
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error) {
    console.error("Error fetching user data: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
