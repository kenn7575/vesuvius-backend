import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

export async function generateRandomOrders(
  req: Request,
  res: Response
): Promise<void | any> {
  try {
    console.log("🚀 ~ generateRandomOrders ~ req", req.body);
    // start by getting the price of the menu item included in the order

    const menuItems = await prisma.menu_item.findMany();

    // create order

    let listOfOrders: any = [];

    for (let i = 0; i < 20000; i++) {
      console.log("Creating: ", i);
      let resentDate = faker.date.recent({ days: 730 });
      const testData = {
        created_at: resentDate,
        updated_at: resentDate,
        status:
          faker.number.int({ min: 0, max: 10 }) == 0 ? "Pending" : "Completed",
        comment:
          faker.number.int({ min: 0, max: 1 }) == 0
            ? faker.food.adjective()
            : null,
        waiter_id: faker.number.int({ min: 1, max: 5 }),
        order_items: Array.from(
          { length: faker.number.int({ min: 1, max: 8 }) },
          () => ({
            menu_item_id: faker.number.int({ min: 5, max: 27 }),
            quantity: faker.number.int({ min: 1, max: 3 }),
            comment:
              faker.number.int({ min: 0, max: 1 }) == 0
                ? faker.food.adjective()
                : null,
          })
        ),
        order_tables: Array.from(
          { length: faker.number.int({ min: 1, max: 3 }) },
          () => ({
            table_id: faker.number.int({ min: 1, max: 3 }),
          })
        ),
      };

      const order = await prisma.order.create({
        data: {
          comment: testData.comment,
          total_price_in_oere: testData.order_items.reduce(
            (acc, orderItem) =>
              acc +
              menuItems.find(
                (menuItem) => menuItem.id === orderItem.menu_item_id
              )?.price_in_oere! *
                orderItem.quantity,
            0
          ),
          status: "Pending",
          created_at: testData.created_at,
          updated_at: testData.updated_at,
          waiter_id: testData.waiter_id,
          order_items: {
            create: testData.order_items.map((orderItem) => ({
              quantity: orderItem.quantity,
              comment: orderItem.comment,
              menu_item_id: orderItem.menu_item_id,
              price_in_oere: menuItems.find(
                (menuItem) => menuItem.id === orderItem.menu_item_id
              )?.price_in_oere,
            })),
          },
          tables_in_orders_and_reservations: {
            create: testData.order_tables.map((orderTable) => ({
              table_id: orderTable.table_id,
            })),
          },
        },
        include: {
          order_items: true,
          tables_in_orders_and_reservations: true,
        },
      });

      listOfOrders.push(order);
    }

    res.status(200).json(listOfOrders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
