import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { idSchema } from "../../zodSchemas/schemas";

const prisma = new PrismaClient();

const schema = z.object({
  item_type_id: idSchema.optional(),
  filter: z.enum(["active", "inactive", "all"]).optional(),
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().optional(),
});

export async function getAllMenuItemsAdmin(
  req: Request,
  res: Response
): Promise<void | any> {
  try {
    const item_type_id: string = req.query.item_type_id as string;
    const isActiveFilter: string = req.query.filter as string;
    const page: number = parseInt(req.query.page as string) || 1;
    const perPage: number = parseInt(req.query.perPage as string) || 10;

    const result = schema.safeParse({
      item_type_id,
      filter: isActiveFilter,
      page,
      perPage,
    });

    if (!result.success) {
      return res
        .status(400)
        .json({ message: result.error.flatten().fieldErrors });
    }

    let whereClause: any = {};

    if (result.data.filter === "active") {
      whereClause.is_active = true;
    } else if (result.data.filter === "inactive") {
      whereClause.is_active = false;
    }

    if (result.data.item_type_id) {
      whereClause.type_id = result.data.item_type_id;
    }

    const skip = (page - 1) * perPage;

    const [menuItems, total, menuItemTypes] = await Promise.all([
      prisma.menu_item.findMany({
        where: whereClause,
        skip,
        take: perPage,
      }),
      prisma.menu_item.count({
        where: whereClause,
      }),
      prisma.menu_item_types.findMany(),
    ]);

    res.json({
      items: menuItems.map((item) => ({
        ...item,
        type: menuItemTypes.find((type) => type.id === item.type_id)?.name,
      })),
      meta: {
        total,
        page,
        perPage,
        pageCount: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default getAllMenuItemsAdmin;
