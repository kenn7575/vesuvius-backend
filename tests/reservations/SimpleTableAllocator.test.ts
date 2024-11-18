import { describe, it, expect } from "vitest";
import { Table } from "../../core/reservations/types";
import { SimpleTableAllocator } from "../../core/reservations/reservations/SimpleTableAllocator";

describe("SimpleTableAllocator", () => {
  const allocator = new SimpleTableAllocator();
  const availableTables: Table[] = [
    { id: 1, capacity: 2 },
    { id: 2, capacity: 4 },
    { id: 3, capacity: 6 },
    { id: 4, capacity: 2 },
  ];

  it("should allocate a single table when possible", () => {
    const tableIds = allocator.allocateTables(4, availableTables);
    expect(tableIds).toEqual([2]);
  });

  it("should combine tables when a single table is not sufficient", () => {
    const tableIds = allocator.allocateTables(10, availableTables);
    expect(tableIds).toEqual([2, 3]); // Total capacity 10
  });

  it("should return null when no combination can satisfy the party size", () => {
    const tableIds = allocator.allocateTables(15, availableTables);
    expect(tableIds).toBeNull();
  });

  it("should prefer the smallest sufficient combination", () => {
    const tableIds = allocator.allocateTables(6, [
      { id: 1, capacity: 2 },
      { id: 2, capacity: 2 },
      { id: 3, capacity: 2 },
      { id: 4, capacity: 3 },
      { id: 5, capacity: 3 },
    ]);
    expect(tableIds).toEqual([4, 5]); // Total capacity 6
  });

  it("should allocate the smallest possible table when multiple options are available", () => {
    const tableIds = allocator.allocateTables(2, availableTables);
    expect(tableIds).toEqual([1]); // Capacity 2
  });

  it("should handle empty available tables list", () => {
    const tableIds = allocator.allocateTables(2, []);
    expect(tableIds).toBeNull();
  });

  it("should handle invalid party size", () => {
    const tableIds = allocator.allocateTables(0, availableTables);
    expect(tableIds).toEqual([1]); // Returns smallest table
  });

  it("should handle negative party size", () => {
    const tableIds = allocator.allocateTables(-1, availableTables);
    expect(tableIds).toEqual([1]); // Returns smallest table
  });
});
