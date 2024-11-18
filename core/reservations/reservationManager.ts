import {
  Table,
  Reservation,
  DayAvailability,
  WeeklyOpeningHours,
  DateSpecificOpeningHours,
  OpeningHours,
} from "./types";

export class ReservationManager {
  private tables: Table[];
  private reservations: Reservation[] = [];
  private defaultDuration: number = 60;
  private openingHoursByDate: Map<string, OpeningHours> = new Map();

  constructor({
    Tables,
    Reservation,
    defaultDuration,
    openingHoursByDate,
  }: {
    Tables: Table[];
    Reservation?: Reservation[];
    defaultDuration?: number;
    openingHoursByDate?: DateSpecificOpeningHours;
  }) {
    this.tables = Tables;
    if (defaultDuration) this.defaultDuration = defaultDuration;
    if (Reservation) this.reservations = Reservation;
    if (openingHoursByDate) {
      Object.entries(openingHoursByDate).forEach(([date, hours]) => {
        this.openingHoursByDate.set(date, hours);
      });
    }
  }

  isAvailable(
    partySize: number,
    startTime: Date,
    duration: number = this.defaultDuration
  ): boolean {
    const [openingDateTime, closingDateTime] =
      this.getOperationalHoursForDate(startTime);

    if (openingDateTime === null || closingDateTime === null) {
      // Restaurant is closed
      return false;
    }

    // Check if the reservation time is within operational hours
    const reservationEndTime = new Date(startTime.getTime() + duration * 60000);

    if (startTime < openingDateTime || reservationEndTime > closingDateTime) {
      return false;
    }

    return this.findTablesForParty(partySize, startTime, duration) !== null;
  }

  addReservation(
    partySize: number,
    name: string,
    startTime: Date,
    duration: number = this.defaultDuration
  ): Reservation {
    const [openingDateTime, closingDateTime] =
      this.getOperationalHoursForDate(startTime);

    if (openingDateTime === null || closingDateTime === null) {
      throw new Error("Restaurant is closed on this day");
    }

    // Check if the reservation time is within operational hours
    const reservationEndTime = new Date(startTime.getTime() + duration * 60000);

    if (startTime < openingDateTime || reservationEndTime > closingDateTime) {
      throw new Error("Reservation time is outside operational hours");
    }

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
    const [openingDateTime, closingDateTime] =
      this.getOperationalHoursForDate(date);

    if (openingDateTime === null || closingDateTime === null) {
      // Restaurant is closed on this day
      return DayAvailability.Unavailable;
    }

    // Proceed with existing logic...
    const reservationsOnDate = this.getReservationsForDate(date);

    if (reservationsOnDate.length === 0) {
      return DayAvailability.Available;
    }

    // Create events for the start and end times of reservations
    const events = this.createEvents(
      reservationsOnDate,
      openingDateTime,
      closingDateTime
    );

    // Process events to determine availability
    return this.determineDayAvailability(
      events,
      totalTables,
      openingDateTime.getTime(),
      closingDateTime.getTime()
    );
  }
  private determineDayAvailability(
    events: { time: number; delta: number }[],
    totalTables: number,
    openingTime: number,
    closingTime: number
  ): DayAvailability {
    let occupiedTables = 0;
    let wasFullyBooked = false;
    let wasAvailable = false;
    let lastTime = openingTime;

    for (const event of events) {
      const currentTime = event.time;

      // If there's an interval between lastTime and currentTime
      if (currentTime > lastTime) {
        if (occupiedTables === totalTables) {
          wasFullyBooked = true;
        } else {
          wasAvailable = true;
        }

        // Early exit if both states have been encountered
        if (wasFullyBooked && wasAvailable) {
          break;
        }
      }

      occupiedTables += event.delta;
      lastTime = currentTime;
    }

    // After processing all events, check the interval from lastTime to closingTime
    if (lastTime < closingTime) {
      if (occupiedTables === totalTables) {
        wasFullyBooked = true;
      } else {
        wasAvailable = true;
      }
    }

    if (!wasFullyBooked) {
      return DayAvailability.Available;
    } else if (!wasAvailable) {
      return DayAvailability.Unavailable;
    } else {
      return DayAvailability.PartiallyAvailable;
    }
  }
  private createEvents(
    reservations: Reservation[],
    openingDateTime: Date,
    closingDateTime: Date
  ): { time: number; delta: number }[] {
    const events: { time: number; delta: number }[] = [];

    for (const reservation of reservations) {
      const startTime = Math.max(
        reservation.startTime.getTime(),
        openingDateTime.getTime()
      );
      const endTime = Math.min(
        reservation.startTime.getTime() + reservation.duration * 60000,
        closingDateTime.getTime()
      );

      events.push({ time: startTime, delta: reservation.tableIds.length });
      events.push({ time: endTime, delta: -reservation.tableIds.length });
    }

    events.sort((a, b) => a.time - b.time);
    return events;
  }
  // src/ReservationManager.ts (Within the ReservationManager class)

  // src/ReservationManager.ts (Within the ReservationManager class)

  private getOperationalHoursForDate(date: Date): [Date | null, Date | null] {
    const dateStr = date.toISOString().split("T")[0]; // 'YYYY-MM-DD'

    const openingHours = this.openingHoursByDate.get(dateStr);

    if (
      !openingHours ||
      openingHours.openingTime === null ||
      openingHours.closingTime === null
    ) {
      // Restaurant is closed on this day
      return [null, null];
    }

    const openingDateTime = new Date(date);
    const [openingHour, openingMinute] = String(openingHours.openingTime)
      .split(":")
      .map(Number);
    openingDateTime.setHours(openingHour, openingMinute, 0, 0);

    const closingDateTime = new Date(date);
    const [closingHour, closingMinute] = String(openingHours.closingTime)
      .split(":")
      .map(Number);
    closingDateTime.setHours(closingHour, closingMinute, 0, 0);

    return [openingDateTime, closingDateTime];
  }
  private getReservationsForDate(date: Date): Reservation[] {
    const [openingDateTime, closingDateTime] =
      this.getOperationalHoursForDate(date);

    if (openingDateTime === null || closingDateTime === null) {
      // Restaurant is closed; no reservations are valid
      return [];
    }

    return this.reservations.filter((reservation) => {
      const reservationStart = reservation.startTime;
      const reservationEnd = new Date(
        reservationStart.getTime() + reservation.duration * 60000
      );

      // Check if the reservation overlaps with the operational hours
      return (
        reservationStart < closingDateTime && reservationEnd > openingDateTime
      );
    });
  }
  // src/ReservationManager.ts (Add this method within the ReservationManager class)

  checkAvailabilityInRange(
    startDate: Date,
    endDate: Date
  ): { availability: string; date: string }[] {
    const availabilityArray: { availability: string; date: string }[] = [];

    // Ensure startDate is not after endDate
    if (startDate > endDate) {
      throw new Error("Start date must be before or equal to end date");
    }

    // Clone the start date to avoid mutating the original date
    let currentDate = new Date(startDate);

    // Loop through each day in the range
    while (currentDate <= endDate) {
      const availability = this.checkDayAvailability(currentDate);
      availabilityArray.push({
        availability: availability.toString(),
        date: currentDate.toISOString().split("T")[0],
      });

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availabilityArray;
  }
}
