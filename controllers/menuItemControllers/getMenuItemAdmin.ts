import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { idSchema } from "../../zodSchemas/schemas";

const prisma = new PrismaClient();

export async function getMenuItemsAdmin(
  req: Request,
  res: Response
): Promise<void | any> {
  const { id } = req.params;

  const validatedId = idSchema.safeParse(id);
  if (!validatedId.success) {
    return res
      .status(400)
      .json({ message: validatedId.error.flatten().formErrors });
  }

  try {
    const [menuItems, menuItemType] = await Promise.all([
      await prisma.menu_item.findUnique({
        where: {
          id: validatedId.data,
        },
      }),
      await prisma.menu_item_types.findMany({
        where: {
          menu_item: { some: { id: validatedId.data } },
        },
      }),
    ]);

    return res.json({
      menu_item: menuItems,
      menu_item_type: menuItemType.length > 0 ? menuItemType[0] : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default getMenuItemsAdmin;
