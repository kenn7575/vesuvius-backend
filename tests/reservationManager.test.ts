import { expect, test, describe, beforeEach } from "vitest";

import { ReservationManager } from "../core/reservations/reservationManager";
// __tests__/ReservationManager.test.ts

describe("ReservationManager with Time-based Reservations", () => {
  let manager: ReservationManager;

  beforeEach(() => {
    manager = new ReservationManager(
      [
        { id: 1, capacity: 2 },
        { id: 2, capacity: 4 },
      ],
      60 // default reservation duration in minutes
    );
  });

  test("should check availability considering time and duration", () => {
    const startTime = new Date("2023-10-01T18:00:00");
    expect(manager.isAvailable(2, startTime)).toBe(true);
    manager.addReservation(2, "John Doe", startTime);
    expect(manager.isAvailable(2, startTime)).toBe(true); // The 4-seat table is still available
    manager.addReservation(4, "Jane Smith", startTime);
    expect(manager.isAvailable(2, startTime)).toBe(false); // All tables are booked at this time
  });

  test("should handle overlapping reservations correctly", () => {
    const startTime1 = new Date("2023-10-01T18:00:00");
    const startTime2 = new Date("2023-10-01T18:30:00");
    manager.addReservation(2, "John Doe", startTime1);
    expect(manager.isAvailable(2, startTime2)).toBe(true); // Overlaps with existing reservation
    manager.addReservation(2, "Jane Smith", startTime2);
    expect(manager.isAvailable(2, startTime2)).toBe(false); // No tables available at this time
  });

  test("should allow reservations at different times", () => {
    const startTime1 = new Date("2023-10-01T18:00:00");
    const startTime2 = new Date("2023-10-01T20:00:00");
    manager.addReservation(2, "John Doe", startTime1);
    expect(manager.isAvailable(2, startTime2)).toBe(true); // Different time slot
  });

  test("should respect custom reservation durations", () => {
    const startTime1 = new Date("2023-10-01T18:00:00");
    manager.addReservation(2, "John Doe", startTime1, 120); // 2-hour reservation
    const startTime2 = new Date("2023-10-01T19:00:00");
    expect(manager.isAvailable(2, startTime2)).toBe(true); // Overlaps only if duration is considered
    expect(manager.isAvailable(2, startTime2, 60)).toBe(true);
    manager.addReservation(2, "Jane Smith", startTime2);
    expect(manager.isAvailable(2, startTime2)).toBe(false);
  });
});
