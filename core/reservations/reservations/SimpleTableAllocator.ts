import { Table } from "../types";
import { ITableAllocationStrategy } from "./ITableAllocationStrategy";

// SimpleTableAllocator.ts

export class SimpleTableAllocator implements ITableAllocationStrategy {
  allocateTables(partySize: number, availableTables: Table[]): number[] | null {
    // Try to find a single table
    const suitableTables = availableTables
      .filter((table) => table.capacity >= partySize)
      .sort((a, b) => a.capacity - b.capacity);

    if (suitableTables.length > 0) {
      return [suitableTables[0].id];
    }

    // Try to combine tables
    const combinations = this.combineTables(partySize, availableTables);

    if (combinations.length > 0) {
      return combinations[0];
    }

    return null;
  }

  private combineTables(
    partySize: number,
    availableTables: Table[]
  ): number[][] {
    const results: number[][] = [];

    const findCombination = (
      currentCombo: Table[],
      remainingTables: Table[],
      currentSize: number
    ) => {
      if (currentSize >= partySize) {
        results.push(currentCombo.map((table) => table.id));
        return;
      }

      for (let i = 0; i < remainingTables.length; i++) {
        findCombination(
          [...currentCombo, remainingTables[i]],
          remainingTables.slice(i + 1),
          currentSize + remainingTables[i].capacity
        );
      }
    };

    findCombination([], availableTables, 0);
    return results.sort(
      (a, b) =>
        this.totalCapacity(a, availableTables) -
          this.totalCapacity(b, availableTables) || a.length - b.length
    );
  }

  private totalCapacity(tableIds: number[], tables: Table[]): number {
    return tableIds.reduce((sum, id) => {
      const table = tables.find((t) => t.id === id);
      return sum + (table ? table.capacity : 0);
    }, 0);
  }
}
