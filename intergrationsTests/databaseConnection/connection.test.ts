// tests/integration/user.integration.test.js
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../index";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  // Optional: Additional setup before all tests
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("API Integration Tests", () => {
  it("should retrieve all menu items types", async () => {
    const response = await request(app).get("/menu_item_types").send();

    expect(response.status).toBe(200);
  });

  it("should retrieve all menu items", async () => {
    const response = await request(app).get("/menu_items");

    expect(response.status).toBe(200);
  });
});
