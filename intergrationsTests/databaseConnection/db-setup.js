// scripts/db-setup.js
import { execSync } from "child_process";
import waitOn from "wait-on";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

async function main() {
  // Wait for the database to be ready
  await waitOn({
    resources: [`tcp:localhost:5433`],
    timeout: 30000, //30 sec
  });

  // Run migrations
  execSync("npx prisma db push", { stdio: "inherit" });

  // Seed the database
  execSync("node prisma/seed.js", { stdio: "inherit" });
}

main().catch((err) => {
  console.error("Error setting up the database:", err);
  process.exit(1);
});
