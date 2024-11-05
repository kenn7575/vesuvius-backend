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
