import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { idSchema } from "../../zodSchemas/schemas";

const prisma = new PrismaClient();

export async function activateMenuItem(
  req: Request,
  res: Response
): Promise<void | any> {
  const roleId = res.locals.roleId;
  if (!roleId || roleId < 2) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { id } = req.params;

  const validatedId = idSchema.safeParse(id);
  if (!validatedId.success) {
    return res
      .status(400)
      .json({ message: validatedId.error.flatten().formErrors });
  }

  try {
    const orderItem = await prisma.menu_item.update({
      where: { id: validatedId.data },
      data: { is_active: true },
    });

    res.status(200).json(orderItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default activateMenuItem;
