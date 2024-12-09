import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { upsertMenuItemSchema } from "../../zodSchemas/schemas";

const prisma = new PrismaClient();

export async function createMenuItem(
  req: Request,
  res: Response
): Promise<void | any> {
  const roleId = res.locals.roleId;

  if (!roleId || roleId < 2) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const result = upsertMenuItemSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten().fieldErrors });
  }

  const data = result.data;

  try {
    const updatedMenuItem = await prisma.menu_item.create({
      data: {
        name: data.name,
        description: data.description,
        price_in_oere: data.price * 100, // convert to øre
        type_id: data.category,
        is_active: data.is_active,
        is_sold_out: data.is_sold_out,
        is_lacking_ingredient: data.is_lacking_ingredient,
        comment: data.comment,
      },
    });
    res.json(updatedMenuItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default createMenuItem;
