// TableManager.ts
import { Table, Reservation } from "../types";
import { TimeInterval } from "./TimeInterval";

export class TableManager {
  private tables: Table[];

  constructor(tables: Table[]) {
    this.tables = tables;
  }

  getAvailableTables(
    reservations: Reservation[],
    startTime: Date,
    duration: number
  ): Table[] {
    return this.tables.filter(
      (table) =>
        !this.isTableOccupied(table.id, reservations, startTime, duration)
    );
  }

  isTableOccupied(
    tableId: number,
    reservations: Reservation[],
    startTime: Date,
    duration: number
  ): boolean {
    return reservations.some((reservation) => {
      if (!reservation.tableIds.includes(tableId)) return false;
      return TimeInterval.isOverlapping(
        reservation.startTime,
        reservation.duration,
        startTime,
        duration
      );
    });
  }

  getTotalTables(): number {
    return this.tables.length;
  }

  getTableById(id: number): Table | undefined {
    return this.tables.find((table) => table.id === id);
  }
}
