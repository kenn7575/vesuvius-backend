import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { idSchema } from "../../zodSchemas/createUserSchema";

const prisma = new PrismaClient();

export async function deactivateMenuItem(
  req: Request,
  res: Response
): Promise<void | any> {
  const { id } = req.params;

  const validatedId = idSchema.safeParse(id);
  if (!validatedId.success) {
    console.log(JSON.stringify(validatedId.error));
    return res
      .status(400)
      .json({ message: validatedId.error.flatten().formErrors });
  }

  try {
    const orderItem = await prisma.menu_item.update({
      where: { id: validatedId.data },
      data: { is_active: false },
    });

    res.status(200).json(orderItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default deactivateMenuItem;
