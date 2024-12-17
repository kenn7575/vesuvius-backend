import { Table } from "./types";

// ITableAllocationStrategy.ts

export interface ITableAllocationStrategy {
  allocateTables(partySize: number, availableTables: Table[]): number[] | null;
}
