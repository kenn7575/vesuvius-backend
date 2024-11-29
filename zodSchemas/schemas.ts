import { z } from "zod";
const idSchema = z
  .union([z.number(), z.string()])
  .refine(
    (value) => {
      if (typeof value === "string") {
        const parsed = parseInt(value, 10);
        return !isNaN(parsed) && Number.isInteger(parsed);
      }
      return Number.isInteger(value);
    },
    { message: "Id must be an integer or a valid integer string" }
  )
  .transform((value) =>
    typeof value === "string" ? parseInt(value, 10) : value
  );

const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string(),
  role_id: idSchema,
});

const getDailyReservationAvailabilitySchema = z.object({
  start_date: z.string().date("Invalid start date"),
  end_date: z.string().date("Invalid end date"),
});
export const getHourlyReservationAvailabilitySchema = z.object({
  date: z.string().date("Invalid date"),
  peopleCount: z
    .union([
      z
        .number()
        .positive("People count must be a positive integer")
        .max(12, "All reservations over 12 people must be made by phone"),
      z.string(),
    ])
    .refine(
      (value) => {
        if (typeof value === "string") {
          const parsed = parseInt(value, 10);
          return !isNaN(parsed) && Number.isInteger(parsed);
        }
        return Number.isInteger(value);
      },
      { message: "PeopleCount must be an integer or a valid integer string" }
    )
    .transform((value) =>
      typeof value === "string" ? parseInt(value, 10) : value
    ),
});

export const loginInputSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Udfyld venligst adgangskoden"),
});

export {
  createUserSchema,
  idSchema,
  getDailyReservationAvailabilitySchema as getReservationAvailabilityInRangeSchema,
};

export const createReservationSchema = z.object({
  time: z.string().datetime("Invalid date and time"),
  number_of_people: z
    .number()
    .positive("People count must be a positive integer")
    .max(12, "All reservations over 12 people must be made by phone"),
  comment: z.string().optional(),
  email: z.string().email("Invalid email"),
  customer_name: z.string(),
  customer_phone_number: z.string(),
});
