// OpeningHoursManager.test.ts
import { describe, it, expect } from "vitest";
import { OpeningHoursManager } from "../../core/reservations/OpeningHoursManager";
import { DateSpecificOpeningHours } from "../../core/reservations/types";

describe("OpeningHoursManager", () => {
  const openingHoursByDate: DateSpecificOpeningHours = {
    "2023-10-10": { openingTime: "09:00", closingTime: "17:00" },
    "2023-10-11": { openingTime: "10:00", closingTime: "16:00" },
    "2023-10-12": { openingTime: null, closingTime: null }, // Closed
  };

  const openingHoursManager = new OpeningHoursManager(openingHoursByDate);

  it("should return correct operational hours for a given date", () => {
    const date = new Date("2023-10-10");
    const [openingTime, closingTime] =
      openingHoursManager.getOperationalHoursForDate(date);

    expect(openingTime).toEqual(new Date("2023-10-10T09:00:00.000Z"));
    expect(closingTime).toEqual(new Date("2023-10-10T17:00:00.000Z"));
  });

  it("should return null for opening and closing times when closed", () => {
    const date = new Date("2023-10-12");
    const [openingTime, closingTime] =
      openingHoursManager.getOperationalHoursForDate(date);

    expect(openingTime).toBeNull();
    expect(closingTime).toBeNull();
  });

  it("should handle dates not specified in opening hours", () => {
    const date = new Date("2023-10-13");
    const [openingTime, closingTime] =
      openingHoursManager.getOperationalHoursForDate(date);

    expect(openingTime).toBeNull();
    expect(closingTime).toBeNull();
  });
});
