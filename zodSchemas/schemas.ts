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
  start_date: z
    .string()
    .regex(/^[0-9-]+$/, "Start date must contain only numbers and '-'")
    .max(10),
  end_date: z
    .string()
    .regex(/^[0-9-]+$/, "End date must contain only numbers and '-'")
    .max(10),
});
export const getHourlyReservationAvailabilitySchema = z.object({
  date: z
    .string()
    .regex(/^[0-9-]+$/, "Start date must contain only numbers and '-'")
    .max(10),
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
