import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllTables(
  req: Request,
  res: Response
): Promise<void | any> {
  const tables = await prisma.cafe_table.findMany();
  console.log("🚀 ~ tables:", tables);

  return res.json(tables);
}
