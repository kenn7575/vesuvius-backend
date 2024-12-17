export interface Table {
  id: number;
  capacity: number;
  isOccupied?: boolean;
}

// src/types.ts
export interface Reservation {
  partySize: number;
  name: string;
  tableIds: number[];
  startTime: Date;
  duration: number; // in minutes
}

export enum DayAvailability {
  Available = "Available",
  PartiallyAvailable = "PartiallyAvailable",
  Unavailable = "Unavailable",
}

export interface OpeningHours {
  openingTime: string | null; // e.g., '10:00' or null if closed
  closingTime: string | null; // e.g., '22:00' or null if closed
}

export interface DateSpecificOpeningHours {
  [date: string]: OpeningHours; // date in 'YYYY-MM-DD' format
}

export interface WeeklyOpeningHours {
  [day: string]: OpeningHours; // day can be 'Monday', 'Tuesday', etc.
}
export interface ITableAllocationStrategy {
  allocateTables(partySize: number, availableTables: Table[]): number[] | null;
}
