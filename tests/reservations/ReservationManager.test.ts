// ReservationManager.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { ReservationManager } from "../../core/reservations/ReservationManager";
import { DateSpecificOpeningHours, Table } from "../../core/reservations/types";
import { SimpleTableAllocator } from "../../core/reservations/SimpleTableAllocator";

describe("ReservationManager", () => {
  let reservationManager: ReservationManager;
  const tables: Table[] = [
    { id: 1, capacity: 2 },
    { id: 2, capacity: 4 },
    { id: 3, capacity: 6 },
  ];
  const openingHoursByDate: DateSpecificOpeningHours = {
    "2023-10-10": { openingTime: "09:00", closingTime: "17:00" },
    "2023-10-11": { openingTime: "10:00", closingTime: "16:00" },
  };

  beforeEach(() => {
    reservationManager = new ReservationManager({
      Tables: tables,
      openingHoursByDate,
      tableAllocator: new SimpleTableAllocator(),
    });
  });

  it("should allow adding a reservation when tables are available", () => {
    const reservation = reservationManager.addReservation(
      2,
      "John Doe",
      new Date("2023-10-10T10:00:00Z"),
      60
    );
    expect(reservation).toBeDefined();
    expect(reservation.name).toBe("John Doe");
    expect(reservation.tableIds.length).toBeGreaterThan(0);
  });

  it("should not allow adding a reservation outside operational hours", () => {
    expect(() =>
      reservationManager.addReservation(
        2,
        "Jane Smith",
        new Date("2023-10-10T08:00:00"),
        60
      )
    ).toThrow("Reservation time is outside operational hours");
  });

  it("should not allow adding a reservation when the restaurant is closed", () => {
    expect(() =>
      reservationManager.addReservation(
        2,
        "Bob Brown",
        new Date("2023-10-12T10:00:00"),
        60
      )
    ).toThrow("No available tables");
  });

  it("should correctly report availability", () => {
    const isAvailable = reservationManager.isAvailable(
      4,
      new Date("2023-10-10T11:00:00"),
      60
    );
    expect(isAvailable).toBe(true);
  });

  it("should correctly report availability when tables can be combined", () => {
    reservationManager.addReservation(
      6,
      "Alice Green",
      new Date("2023-10-10T12:00:00Z"),
      120
    );
    const isAvailable = reservationManager.isAvailable(
      6,
      new Date("2023-10-10T12:30:00Z"),
      60
    );
    expect(isAvailable).toBe(true); // Adjusted expectation
  });

  it("should allow canceling a reservation", () => {
    reservationManager.addReservation(
      2,
      "Charlie Black",
      new Date("2023-10-10T14:00:00"),
      60
    );
    reservationManager.cancelReservation("Charlie Black");
    const isAvailable = reservationManager.isAvailable(
      2,
      new Date("2023-10-10T14:00:00"),
      60
    );
    expect(isAvailable).toBe(true);
  });

  it("should throw an error when canceling a non-existent reservation", () => {
    expect(() => reservationManager.cancelReservation("Non Existent")).toThrow(
      "Reservation not found"
    );
  });

  it("should check day availability as Available when no reservations", () => {
    const availability = reservationManager.checkDayAvailability(
      new Date("2023-10-10")
    );
    expect(availability).toBe("Available");
  });

  it("should check day availability as Unavailable when fully booked", () => {
    // Fully book all tables
    reservationManager.addReservation(
      2,
      "Guest 1",
      new Date("2023-10-10T09:00:00Z"),
      480 // 8 hours
    );
    reservationManager.addReservation(
      4,
      "Guest 2",
      new Date("2023-10-10T09:00:00z"),
      480
    );
    reservationManager.addReservation(
      6,
      "Guest 3",
      new Date("2023-10-10T09:00:00z"),
      480
    );

    const availability = reservationManager.checkDayAvailability(
      new Date("2023-10-10")
    );
    expect(availability).toBe("Unavailable");
  });

  it("should check day availability as PartiallyAvailable when partially booked", () => {
    reservationManager.addReservation(
      12,
      "Group",
      new Date("2023-10-10T12:00:00Z"),
      60
    );

    const availability = reservationManager.checkDayAvailability(
      new Date("2023-10-10")
    );
    expect(availability).toBe("PartiallyAvailable");
  });

  it("should correctly check availability in a date range", () => {
    reservationManager.addReservation(
      12,
      "Guest",
      new Date("2023-10-10T11:00:00Z"),
      60
    );

    const availabilityRange = reservationManager.checkAvailabilityInRange(
      new Date("2023-10-10"),
      new Date("2023-10-12")
    );

    expect(availabilityRange).toEqual([
      { availability: "PartiallyAvailable", date: "2023-10-10" },
      { availability: "Available", date: "2023-10-11" },
      { availability: "Unavailable", date: "2023-10-12" },
    ]);
  });

  it("should throw an error when start date is after end date in availability range", () => {
    expect(() =>
      reservationManager.checkAvailabilityInRange(
        new Date("2023-10-12"),
        new Date("2023-10-10")
      )
    ).toThrow("Start date must be before or equal to end date");
  });

  it("should respect default duration when not specified", () => {
    const customDefaultDuration = 120;
    const reservationManager = new ReservationManager({
      Tables: tables,
      defaultDuration: customDefaultDuration,
      openingHoursByDate,
    });

    const reservation = reservationManager.addReservation(
      2,
      "Test Guest",
      new Date("2023-10-10T10:00:00Z")
    );

    expect(reservation.duration).toBe(customDefaultDuration);
  });

  it("should initialize with existing reservations", () => {
    const existingReservation = [
      {
        partySize: 12,
        name: "Existing Guest",
        tableIds: [1],
        startTime: new Date("2024-10-10T10:00:00Z"),
        duration: 60,
      },
    ];

    const reservationManager = new ReservationManager({
      Tables: tables,
      Reservation: existingReservation,
      openingHoursByDate,
    });

    const isAvailable = reservationManager.isAvailable(
      2,
      new Date("2024-10-10T10:00:00Z"),
      60
    );

    expect(isAvailable).toBe(false);
  });

  it("should handle overlapping reservation times correctly", () => {
    // First reservation
    reservationManager.addReservation(
      2,
      "Guest 1",
      new Date("2023-10-10T10:00:00Z"),
      120
    );

    // Try to make overlapping reservation
    const isAvailable = reservationManager.isAvailable(
      2,
      new Date("2023-10-10T11:00:00Z"),
      60
    );

    expect(isAvailable).toBe(true); // Should be true since we have other tables available
  });

  // ReservationManager.test.ts

  it("should return availability for every 30-minute interval on a specific date", () => {
    // Set up reservations that block some time slots
    reservationManager.addReservation(
      12,
      "Group A",
      new Date("2023-10-10T10:00:00Z"),
      60
    );

    reservationManager.addReservation(
      12,
      "Group B",
      new Date("2023-10-10T12:30:00Z"), //until 14:00
      90
    );

    const timeSlots = reservationManager.checkTimeSlotAvailability(
      new Date("2023-10-10")
    );

    // Find the time slots corresponding to the reservations
    const slotAt10 = timeSlots.find(
      (slot) => slot.time === "2023-10-10T10:00:00.000Z"
    );
    const slotAt1030 = timeSlots.find(
      (slot) => slot.time === "2023-10-10T10:30:00.000Z"
    );

    const slotAt1230 = timeSlots.find(
      (slot) => slot.time === "2023-10-10T12:30:00.000Z"
    );
    const slotAt1300 = timeSlots.find(
      (slot) => slot.time === "2023-10-10T13:00:00.000Z"
    );
    const slotAt1400 = timeSlots.find(
      (slot) => slot.time === "2023-10-10T14:00:00.000Z"
    );

    expect(slotAt10?.available).toBe(false);
    expect(slotAt1030?.available).toBe(false);

    expect(slotAt1230?.available).toBe(false);
    expect(slotAt1300?.available).toBe(false);
    expect(slotAt1400?.available).toBe(true);

    // Check that other time slots are available
    const slotAt09 = timeSlots.find(
      (slot) => slot.time === "2023-10-10T09:00:00.000Z"
    );
    expect(slotAt09?.available).toBe(true);
  });
});
