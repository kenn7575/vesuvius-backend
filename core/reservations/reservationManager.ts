import { Table, Reservation, DayAvailability } from "./types";

export class ReservationManager {
  private tables: Table[];
  private reservations: Reservation[] = [];
  private defaultDuration: number;
  private openingTime: string;
  private closingTime: string;

  constructor(
    tables: Table[],
    defaultDuration: number = 60,
    openingTime: string = "10:00",
    closingTime: string = "22:00"
  ) {
    this.tables = tables;
    this.defaultDuration = defaultDuration;
    this.openingTime = openingTime;
    this.closingTime = closingTime;
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

  checkDayAvailability(date: Date): DayAvailability {
    const totalTables = this.tables.length;

    // Define opening and closing times for the given date
    const openingDateTime = new Date(date);
    const [openingHour, openingMinute] = this.openingTime
      .split(":")
      .map(Number);
    openingDateTime.setHours(openingHour, openingMinute, 0, 0);

    const closingDateTime = new Date(date);
    const [closingHour, closingMinute] = this.closingTime
      .split(":")
      .map(Number);
    closingDateTime.setHours(closingHour, closingMinute, 0, 0);

    // Collect all events (start and end times of reservations)
    interface Event {
      time: Date;
      deltaOccupiedTables: number;
    }

    const events: Event[] = [];

    // Collect all reservations that overlap with the operational hours
    const reservationsOnDate = this.reservations.filter((reservation) => {
      const reservationEndTime = new Date(
        reservation.startTime.getTime() + reservation.duration * 60000
      );
      // Check if reservation overlaps with operational hours and the date matches
      return (
        reservation.startTime.toDateString() === date.toDateString() ||
        reservationEndTime.toDateString() === date.toDateString()
      );
    });

    for (const reservation of reservationsOnDate) {
      const startTime =
        reservation.startTime < openingDateTime
          ? openingDateTime
          : reservation.startTime;
      const endTime = new Date(
        reservation.startTime.getTime() + reservation.duration * 60000
      );
      const adjustedEndTime =
        endTime > closingDateTime ? closingDateTime : endTime;

      // Ensure the events are within the operational hours
      if (startTime < closingDateTime && adjustedEndTime > openingDateTime) {
        events.push(
          {
            time: startTime,
            deltaOccupiedTables: +reservation.tableIds.length,
          },
          {
            time: adjustedEndTime,
            deltaOccupiedTables: -reservation.tableIds.length,
          }
        );
      }
    }

    // Add events at opening and closing times if not already present
    events.push(
      { time: openingDateTime, deltaOccupiedTables: 0 },
      { time: closingDateTime, deltaOccupiedTables: 0 }
    );

    // Sort events by time
    events.sort((a, b) => a.time.getTime() - b.time.getTime());

    let occupiedTables = 0;
    let wasFullyBookedAtAnyTime = false;
    let wasAvailableAtAnyTime = false;
    let lastTime = openingDateTime;

    // Process events
    for (const event of events) {
      const currentTime = event.time;

      if (currentTime > lastTime) {
        // There is a time interval between lastTime and currentTime
        if (occupiedTables === totalTables) {
          wasFullyBookedAtAnyTime = true;
        } else {
          wasAvailableAtAnyTime = true;
        }
      }

      occupiedTables += event.deltaOccupiedTables;
      lastTime = currentTime;
    }

    // Determine DayAvailability
    if (!wasFullyBookedAtAnyTime) {
      return DayAvailability.Available;
    } else if (!wasAvailableAtAnyTime) {
      return DayAvailability.Unavailable;
    } else {
      return DayAvailability.PartiallyAvailable;
    }
  }
  // src/ReservationManager.ts (Add this method within the ReservationManager class)

  checkAvailabilityInRange(startDate: Date, endDate: Date): string[] {
    const availabilityArray: string[] = [];

    // Ensure startDate is not after endDate
    if (startDate > endDate) {
      throw new Error("Start date must be before or equal to end date");
    }

    // Clone the start date to avoid mutating the original date
    let currentDate = new Date(startDate);

    // Loop through each day in the range
    while (currentDate <= endDate) {
      const availability = this.checkDayAvailability(currentDate);
      availabilityArray.push(availability.toString());

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availabilityArray;
  }
}
