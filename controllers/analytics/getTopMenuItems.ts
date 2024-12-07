import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { idSchema } from "../../zodSchemas/schemas";
import { z } from "zod";

const prisma = new PrismaClient();

export async function getTopMenuItems(
  req: Request,
  res: Response
): Promise<void | any> {
  const roleId = res.locals.roleId;
  if (!roleId || roleId < 2) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { from, to } = req.query;
  console.log("🚀 ~ { from, to } :", { from, to });

  const validatedFrom = z.object({
    from: z.string().date(),
    to: z.string().date(),
  });

  const validatedDates = validatedFrom.safeParse({ from, to });
  if (!validatedDates.success) {
    return res
      .status(400)
      .json({ message: validatedDates.error.flatten().fieldErrors });
  }
  const startDate = new Date(validatedDates.data.from); // Convert to Date object
  const endDate = new Date(validatedDates.data.to);
  try {
    // find all orders and include order_items in the given range and count the order_items
    const groupedItems = await prisma.order_items.groupBy({
      by: ["menu_item_id"],
      _count: {
        menu_item_id: true,
      },
      where: {
        order: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      orderBy: {
        _count: {
          menu_item_id: "desc",
        },
      },
      take: 10,
    });

    const menuItemIds = groupedItems.map((item) => item.menu_item_id);

    const detailedItems = await prisma.menu_item.findMany({
      where: {
        id: {
          in: menuItemIds,
        },
      },
      select: {
        id: true,
        name: true,
        image_path: true,
      },
    });

    // Step 3: Combine the count data with the menu item details
    const data = groupedItems.map((groupedItem) => {
      const menuItem = detailedItems.find(
        (item) => item.id === groupedItem.menu_item_id
      );
      return {
        menuItemId: groupedItem.menu_item_id,
        count: groupedItem._count.menu_item_id,
        name: menuItem?.name,
        image_path: menuItem?.image_path,
      };
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export default getTopMenuItems;
