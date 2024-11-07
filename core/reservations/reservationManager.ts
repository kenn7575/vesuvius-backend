import { Table, Reservation } from "./types";

export class ReservationManager {
  private tables: Table[];
  private reservations: Reservation[] = [];
  private defaultDuration: number;

  constructor(tables: Table[], defaultDuration: number = 60) {
    this.tables = tables;
    this.defaultDuration = defaultDuration;
  }

  isAvailable(
    partySize: number,
    startTime: Date,
    duration: number = this.defaultDuration
  ): boolean {
    return this.findTablesForParty(partySize, startTime, duration) !== null;
  }

  addReservation(
    partySize: number,
    name: string,
    startTime: Date,
    duration: number = this.defaultDuration
  ): Reservation {
    const tableIds = this.findTablesForParty(partySize, startTime, duration);
    if (!tableIds) throw new Error("No available tables");

    const reservation: Reservation = {
      partySize,
      name,
      tableIds,
      startTime,
      duration,
    };

    this.reservations.push(reservation);
    return reservation;
  }

  private findTablesForParty(
    partySize: number,
    startTime: Date,
    duration: number
  ): number[] | null {
    // Find available tables at the given time
    const availableTables = this.getAvailableTables(startTime, duration);

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

  private getAvailableTables(startTime: Date, duration: number): Table[] {
    return this.tables.filter((table) => {
      return !this.isTableOccupied(table.id, startTime, duration);
    });
  }

  private isTableOccupied(
    tableId: number,
    startTime: Date,
    duration: number
  ): boolean {
    return this.reservations.some((reservation) => {
      if (!reservation.tableIds.includes(tableId)) return false;
      return this.isOverlapping(
        reservation.startTime,
        reservation.duration,
        startTime,
        duration
      );
    });
  }

  private isOverlapping(
    startTime1: Date,
    duration1: number,
    startTime2: Date,
    duration2: number
  ): boolean {
    const endTime1 = new Date(startTime1.getTime() + duration1 * 60000);
    const endTime2 = new Date(startTime2.getTime() + duration2 * 60000);

    return startTime1 < endTime2 && startTime2 < endTime1;
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
        this.totalCapacity(a) - this.totalCapacity(b) || a.length - b.length
    );
  }

  private totalCapacity(tableIds: number[]): number {
    return tableIds.reduce(
      (sum, id) => sum + this.tables.find((table) => table.id === id)!.capacity,
      0
    );
  }

  cancelReservation(name: string): void {
    const reservationIndex = this.reservations.findIndex(
      (res) => res.name === name
    );
    if (reservationIndex === -1) throw new Error("Reservation not found");
    this.reservations.splice(reservationIndex, 1);
  }
}
