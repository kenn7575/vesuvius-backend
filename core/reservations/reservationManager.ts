import {
  Reservation,
  Table,
  DateSpecificOpeningHours,
  DayAvailability,
  ITableAllocationStrategy,
} from "./types";
import { OpeningHoursManager } from "./OpeningHoursManager";
import { SimpleTableAllocator } from "./SimpleTableAllocator";
import { TableManager } from "./tableManager";

export class ReservationManager {
  private tableManager: TableManager;
  private openingHoursManager: OpeningHoursManager;
  private reservations: Reservation[] = [];
  private defaultDuration: number = 60;
  private tableAllocator: ITableAllocationStrategy;

  constructor({
    Tables,
    Reservation,
    defaultDuration,
    openingHoursByDate,
    tableAllocator,
  }: {
    Tables: Table[];
    Reservation?: Reservation[];
    defaultDuration?: number;
    openingHoursByDate?: DateSpecificOpeningHours;
    tableAllocator?: ITableAllocationStrategy;
  }) {
    this.tableManager = new TableManager(Tables);
    this.openingHoursManager = new OpeningHoursManager(openingHoursByDate);
    this.tableAllocator = tableAllocator || new SimpleTableAllocator();
    if (defaultDuration) this.defaultDuration = defaultDuration;
    if (Reservation) this.reservations = Reservation;
  }

  isAvailable(
    partySize: number,
    startTime: Date,
    duration: number = this.defaultDuration
  ): boolean {
    const utcStartTime = new Date(startTime.toISOString());
    const [openingDateTime, closingDateTime] =
      this.openingHoursManager.getOperationalHoursForDate(utcStartTime);

    if (openingDateTime === null || closingDateTime === null) {
      return false;
    }

    const reservationEndTime = new Date(
      utcStartTime.getTime() + duration * 60000
    );

    if (
      utcStartTime < openingDateTime ||
      reservationEndTime > closingDateTime
    ) {
      return false;
    }

    const availableTables = this.tableManager.getAvailableTables(
      this.reservations,
      utcStartTime,
      duration
    );

    return (
      this.tableAllocator.allocateTables(partySize, availableTables) !== null
    );
  }

  addReservation(
    partySize: number,
    name: string,
    startTime: Date,
    duration: number = this.defaultDuration
  ): Reservation {
    // Convert startTime to UTC (if necessary)
    const utcStartTime = new Date(startTime.toISOString());

    const [openingDateTime, closingDateTime] =
      this.openingHoursManager.getOperationalHoursForDate(utcStartTime);
    const reservationEndTime = new Date(
      utcStartTime.getTime() + duration * 60000
    );

    if (
      (openingDateTime && utcStartTime < openingDateTime) ||
      (closingDateTime && reservationEndTime > closingDateTime)
    ) {
      throw new Error("Reservation time is outside operational hours");
    }

    if (!this.isAvailable(partySize, utcStartTime, duration)) {
      throw new Error("No available tables");
    }

    const availableTables = this.tableManager.getAvailableTables(
      this.reservations,
      startTime,
      duration
    );

    const tableIds = this.tableAllocator.allocateTables(
      partySize,
      availableTables
    );
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

  cancelReservation(name: string): void {
    const reservationIndex = this.reservations.findIndex(
      (res) => res.name === name
    );
    if (reservationIndex === -1) throw new Error("Reservation not found");
    this.reservations.splice(reservationIndex, 1);
  }

  checkDayAvailability(date: Date): DayAvailability {
    const totalTables = this.tableManager.getTotalTables();
    const [openingDateTime, closingDateTime] =
      this.openingHoursManager.getOperationalHoursForDate(date);

    if (openingDateTime === null || closingDateTime === null) {
      return DayAvailability.Unavailable;
    }

    const reservationsOnDate = this.getReservationsForDate(date);

    if (reservationsOnDate.length === 0) {
      return DayAvailability.Available;
    }

    const events = this.createEvents(
      reservationsOnDate,
      openingDateTime,
      closingDateTime
    );

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

      if (currentTime > lastTime) {
        if (occupiedTables === totalTables) {
          wasFullyBooked = true;
        } else {
          wasAvailable = true;
        }
        if (wasFullyBooked && wasAvailable) {
          break;
        }
      }

      occupiedTables += event.delta;
      lastTime = currentTime;
    }

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

  private getReservationsForDate(date: Date): Reservation[] {
    const [openingDateTime, closingDateTime] =
      this.openingHoursManager.getOperationalHoursForDate(date);

    if (openingDateTime === null || closingDateTime === null) {
      return [];
    }

    return this.reservations.filter((reservation) => {
      const reservationStart = reservation.startTime;
      const reservationEnd = new Date(
        reservationStart.getTime() + reservation.duration * 60000
      );

      return (
        reservationStart < closingDateTime && reservationEnd > openingDateTime
      );
    });
  }

  checkAvailabilityInRange(
    startDate: Date,
    endDate: Date
  ): { availability: string; date: string }[] {
    const availabilityArray: { availability: string; date: string }[] = [];

    if (startDate > endDate) {
      throw new Error("Start date must be before or equal to end date");
    }

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const availability = this.checkDayAvailability(currentDate);
      availabilityArray.push({
        availability: availability.toString(),
        date: currentDate.toISOString().split("T")[0],
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availabilityArray;
  }

  checkTimeSlotAvailability(
    date: Date,
    intervalMinutes: number = 30
  ): { time: string; available: boolean }[] {
    const [openingDateTime, closingDateTime] =
      this.openingHoursManager.getOperationalHoursForDate(date);

    if (openingDateTime === null || closingDateTime === null) {
      // Restaurant is closed on this day
      return [];
    }

    const timeSlots: { time: string; available: boolean }[] = [];
    let currentTime = new Date(openingDateTime);

    while (currentTime < closingDateTime) {
      const isAvailable = this.isAnyTableAvailableAtTime(currentTime);
      timeSlots.push({
        time: currentTime.toISOString(),
        available: isAvailable,
      });

      // Increment the current time by the interval
      currentTime = new Date(currentTime.getTime() + intervalMinutes * 60000);
    }

    return timeSlots;
  }

  private isAnyTableAvailableAtTime(startTime: Date): boolean {
    // We use the default duration for each time slot
    const duration = this.defaultDuration;

    const availableTables = this.tableManager.getAvailableTables(
      this.reservations,
      startTime,
      duration
    );

    return availableTables.length > 0;
  }
}
