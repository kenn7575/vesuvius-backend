// prisma/seed.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.personel.createMany({
    data: [
      {
        email: "user1@example.com",
        first_name: "User ",
        last_name: "One",
        password:
          "$2a$10$bXRYf7kB5D5mNs4p2mpLMuW0dJmpWXYTEQ81wy5emJzS1dRLszurW" /*password*/,
        role_id: 1,
        phone_number: "12345678",
      },
      {
        email: "user2@example.com",
        first_name: "User ",
        last_name: "Two",
        password:
          "$2a$10$bXRYf7kB5D5mNs4p2mpLMuW0dJmpWXYTEQ81wy5emJzS1dRLszurW" /*password*/,
        role_id: 1,
        phone_number: "87654321",
      },
    ],
  });
  // Add more seed data as needed
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
