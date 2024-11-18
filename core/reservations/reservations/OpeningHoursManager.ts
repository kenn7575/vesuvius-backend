import { OpeningHours, DateSpecificOpeningHours } from "../types";

export class OpeningHoursManager {
  private openingHoursByDate: Map<string, OpeningHours>;

  constructor(openingHoursByDate?: DateSpecificOpeningHours) {
    this.openingHoursByDate = new Map();
    if (openingHoursByDate) {
      Object.entries(openingHoursByDate).forEach(([date, hours]) => {
        this.openingHoursByDate.set(date, hours);
      });
    }
  }

  getOperationalHoursForDate(date: Date): [Date | null, Date | null] {
    const dateStr = date.toISOString().split("T")[0]; // 'YYYY-MM-DD'

    const openingHours = this.openingHoursByDate.get(dateStr);

    if (
      !openingHours ||
      openingHours.openingTime === null ||
      openingHours.closingTime === null
    ) {
      return [null, null];
    }

    const openingDateTime = new Date(date);
    const [openingHour, openingMinute] = openingHours.openingTime
      .split(":")
      .map(Number);
    openingDateTime.setUTCHours(openingHour, openingMinute, 0, 0);

    const closingDateTime = new Date(date);
    const [closingHour, closingMinute] = openingHours.closingTime
      .split(":")
      .map(Number);
    closingDateTime.setUTCHours(closingHour, closingMinute, 0, 0);

    return [openingDateTime, closingDateTime];
  }
}
