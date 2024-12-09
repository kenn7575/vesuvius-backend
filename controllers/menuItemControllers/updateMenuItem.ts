import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { upsertMenuItemSchema } from "../../zodSchemas/schemas";

const prisma = new PrismaClient();

export async function updateMenuItem(
  req: Request,
  res: Response
): Promise<void | any> {
  // const roleId = res.locals.roleId;
  // if (!roleId || roleId < 2) {
  //   return res.status(403).json({ message: "Forbidden" });
  // }
  const { id } = req.params;

  const result = upsertMenuItemSchema.safeParse(req.body);
  console.log("🚀 ~ result:", result.error?.flatten().fieldErrors);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: result.error.flatten().fieldErrors });
  }
  console.log("🚀 ~ result.data: ", result.data);

  try {
    const updatedMenuItem = await prisma.menu_item.update({
      where: { id: parseInt(id) },
      data: {
        name: result.data.name,
        description: result.data.description,
        price_in_oere: result.data.price * 100, // convert to øre
        type_id: result.data.category,
        is_active: result.data.is_active,
        is_sold_out: result.data.is_sold_out,
        is_lacking_ingredient: result.data.is_lacking_ingredient,
        comment: result.data.comment,
      },
    });
    res.json(updatedMenuItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default updateMenuItem;
