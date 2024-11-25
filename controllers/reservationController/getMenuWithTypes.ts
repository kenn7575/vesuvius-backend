import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export async function getMenu(
  req: Request,
  res: Response
): Promise<void | any> {
  const menu = await prisma.menu_item_types.findMany({
    select: {
      name: true,
      menu_item: {
        select: {
          name: true,
          description: true,
          price_in_oere: true,
        },
      },
    },
  });

  console.log(menu);

  return res.json(menu);
}
