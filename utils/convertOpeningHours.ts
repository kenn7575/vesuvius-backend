import {
  DateSpecificOpeningHours,
  OpeningHours,
} from "../core/reservations/types";
type InputData = {
  date: string | Date;
  opening_time: string | Date | null;
  closing_time: string | Date | null;
};

export default function convertOpeningHours(
  input: InputData[]
): DateSpecificOpeningHours {
  const result: DateSpecificOpeningHours = {};

  input.forEach((item) => {
    const dateKey = new Date(item.date).toISOString().split("T")[0]; // Extract date in 'yyyy-MM-dd' format

    // If the opening and closing times are provided in 'hh:mm' format, convert them to strings (or set null if not available)
    const openingTime = item.opening_time
      ? new Date(item.opening_time).toISOString().split("T")[1].substring(0, 5)
      : null;
    const closingTime = item.closing_time
      ? new Date(item.closing_time).toISOString().split("T")[1].substring(0, 5)
      : null;

    result[dateKey] = {
      openingTime,
      closingTime,
    };
  });

  return result;
}
