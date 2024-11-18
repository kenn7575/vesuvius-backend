import { describe, it, expect } from "vitest";
import { Reservation, Table } from "../../core/reservations/types";
import { TableManager } from "../../core/reservations/reservations/tableManager";

describe("TableManager", () => {
  const tables: Table[] = [
    { id: 1, capacity: 2 },
    { id: 2, capacity: 4 },
    { id: 3, capacity: 6 },
  ];

  const tableManager = new TableManager(tables);

  it("should return all tables when none are occupied", () => {
    const reservations: Reservation[] = [];
    const availableTables = tableManager.getAvailableTables(
      reservations,
      new Date("2023-10-10T10:00:00"),
      60
    );

    expect(availableTables.length).toBe(3);
  });

  it("should return only unoccupied tables", () => {
    const reservations: Reservation[] = [
      {
        partySize: 2,
        name: "John Doe",
        tableIds: [1],
        startTime: new Date("2023-10-10T10:00:00"),
        duration: 60,
      },
    ];

    const availableTables = tableManager.getAvailableTables(
      reservations,
      new Date("2023-10-10T10:30:00"),
      60
    );

    expect(availableTables.length).toBe(2);
    expect(availableTables.map((t) => t.id)).toEqual([2, 3]);
  });

  it("should correctly identify if a table is occupied", () => {
    const reservations: Reservation[] = [
      {
        partySize: 2,
        name: "Jane Smith",
        tableIds: [2],
        startTime: new Date("2023-10-10T12:00:00"),
        duration: 90,
      },
    ];

    const isOccupied = tableManager.isTableOccupied(
      2,
      reservations,
      new Date("2023-10-10T12:30:00"),
      60
    );

    expect(isOccupied).toBe(true);
  });

  it("should return the correct total number of tables", () => {
    expect(tableManager.getTotalTables()).toBe(3);
  });

  it("should retrieve a table by its ID", () => {
    const table = tableManager.getTableById(2);
    expect(table).toEqual({ id: 2, capacity: 4 });
  });

  it("should return undefined when searching for non-existent table ID", () => {
    const nonExistentTable = tableManager.getTableById(999);
    expect(nonExistentTable).toBeUndefined();
  });

  it("should identify table as not occupied when reservation is outside time window", () => {
    const reservations: Reservation[] = [
      {
        partySize: 2,
        name: "Alice Brown",
        tableIds: [1],
        startTime: new Date("2023-10-10T14:00:00"),
        duration: 60,
      },
    ];

    const isOccupied = tableManager.isTableOccupied(
      1,
      reservations,
      new Date("2023-10-10T16:00:00"),
      60
    );

    expect(isOccupied).toBe(false);
  });
});
