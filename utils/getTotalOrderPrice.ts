import { order_items, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getTotalOrderPrice(orderId: number) {
  const items = await prisma.order_items.findMany({
    where: { order_id: orderId },
  });

  const totalPrice = items.reduce((total, item) => {
    return total + item.price_in_oere * item.quantity;
  }, 0);

  return totalPrice;
}
