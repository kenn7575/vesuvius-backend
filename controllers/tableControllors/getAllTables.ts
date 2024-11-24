import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function tableRoutes(
  req: Request,
  res: Response
): Promise<void | any> {
  const tables = await prisma.cafe_table.findMany();

  // TODO: add access control
  console.log("tables: ", tables);

  return res.json(tables);
}
