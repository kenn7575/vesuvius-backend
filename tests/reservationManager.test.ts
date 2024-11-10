import { expect, test, describe, beforeEach } from "vitest";

import { ReservationManager } from "../core/reservations/reservationManager";
import { DayAvailability } from "../core/reservations/types";
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

describe("ReservationManager checkDayAvailability", () => {
  let manager: ReservationManager;

  beforeEach(() => {
    manager = new ReservationManager(
      [
        { id: 1, capacity: 2 },
        { id: 2, capacity: 4 },
        { id: 3, capacity: 2 },
      ],
      60 // default reservation duration in minutes
    );
  });

  test("should return Available when there are no reservations", () => {
    const date = new Date("2023-10-01");
    const availability = manager.checkDayAvailability(date);
    expect(availability).toBe(DayAvailability.Available);
  });

  test("should return PartiallyAvailable when some time slots are fully booked", () => {
    const date = new Date("2023-10-01");
    const startTime1 = new Date("2023-10-01T12:00:00");
    const startTime2 = new Date("2023-10-01T13:00:00");

    manager.addReservation(4, "John Doe", startTime1);
    manager.addReservation(4, "Jane Smith", startTime1);
    manager.addReservation(2, "Bob Brown", startTime2);

    const availability = manager.checkDayAvailability(date);
    expect(availability).toBe(DayAvailability.PartiallyAvailable);
  });

  test("should return Unavailable when all time slots are fully booked", () => {
    const date = new Date("2023-10-01");
    const openingTime = new Date("2023-10-01T10:00:00");
    const closingTime = new Date("2023-10-01T22:00:00");

    // Create reservations that cover the entire operational hours
    manager.addReservation(2, "Morning", openingTime, 720); // 12 hours
    manager.addReservation(4, "Full Day", openingTime, 720);
    manager.addReservation(2, "Evening", openingTime, 720);

    const availability = manager.checkDayAvailability(date);
    expect(availability).toBe(DayAvailability.Unavailable);
  });
});

describe("ReservationManager checkAvailabilityInRange", () => {
  let manager: ReservationManager;

  beforeEach(() => {
    manager = new ReservationManager(
      [
        { id: 1, capacity: 2 },
        { id: 2, capacity: 4 },
        { id: 3, capacity: 2 },
      ],

      60, // default reservation duration in minutes
      "14:00",
      "16:00"
    );
  });

  test("should return correct availability for a range with no reservations", () => {
    const startDate = new Date("2023-10-01");
    const endDate = new Date("2023-10-03");
    const availability = manager.checkAvailabilityInRange(startDate, endDate);

    expect(availability).toEqual([
      DayAvailability.Available.toString(),
      DayAvailability.Available.toString(),
      DayAvailability.Available.toString(),
    ]);
  });

  test("should return correct availability for a range with varying availability", () => {
    // Arrange
    const startDate = new Date("2040-11-20");
    const endDate = new Date("2040-11-22");

    //first day is fully booked
    const reservationDate1 = new Date("2040-11-20T14:00:00");
    manager.addReservation(4, "John Doe", reservationDate1, 120);

    const reservationDate2 = new Date("2040-11-20T14:00:00");
    manager.addReservation(2, "Jane Smith", reservationDate2, 120);

    const reservationDate3 = new Date("2040-11-20T14:00:00");
    manager.addReservation(2, "Jane Smith", reservationDate3, 120);

    // second day is partially booked
    const reservationDate4 = new Date("2040-11-21T14:00:00");
    manager.addReservation(4, "John Doe", reservationDate4, 60);

    const reservationDate5 = new Date("2040-11-21T14:00:00");
    manager.addReservation(2, "Jane Smith", reservationDate5, 60);

    const reservationDate6 = new Date("2040-11-21T14:00:00");
    manager.addReservation(2, "Jane Smith", reservationDate6, 60);

    // third day has free slots
    const reservationDate7 = new Date("2040-11-22T14:00:00");
    manager.addReservation(4, "John Doe", reservationDate7, 120);

    // Act
    const availability = manager.checkAvailabilityInRange(startDate, endDate);

    // Assert
    expect(availability).toEqual([
      DayAvailability.Unavailable.toString(),
      DayAvailability.PartiallyAvailable.toString(),
      DayAvailability.Available.toString(),
    ]);
  });

  test("should throw an error if startDate is after endDate", () => {
    const startDate = new Date("2023-10-05");
    const endDate = new Date("2023-10-03");

    expect(() => {
      manager.checkAvailabilityInRange(startDate, endDate);
    }).toThrow("Start date must be before or equal to end date");
  });
});
