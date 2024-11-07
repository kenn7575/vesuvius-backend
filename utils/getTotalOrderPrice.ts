import { order_items, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getTotalOrderPrice(orderId: number) {
  const items = await prisma.order_items.findMany({
    where: { order_id: orderId },
  });

  const totalPrice = items.reduce((total, item) => {
    return total + item.price * item.count;
  }, 0);

  return totalPrice;
}

// Example usage:
getTotalOrderPrice(1)
  .then((totalPrice) => {
    console.log("Total Price:", totalPrice);
  })
  .catch(console.error);
