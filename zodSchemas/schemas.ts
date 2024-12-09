import { z } from "zod";
export const idSchema = z
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

export const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string(),
  role_id: idSchema,
});

export const getReservationAvailabilityInRangeSchema = z.object({
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

export const numberSchema = z
  .union([z.number(), z.string()])
  .refine(
    (value) => {
      if (typeof value === "string") {
        const parsed = parseInt(value, 10);
        return !isNaN(parsed) && Number.isInteger(parsed);
      }
      return Number.isInteger(value);
    },
    { message: "Ikke et tal" }
  )
  .transform((value) =>
    typeof value === "string" ? parseInt(value, 10) : value
  )
  .refine((value) => value >= 0, {
    message: "Talet skal være positivt",
  });

export const upsertMenuItemSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Navn skal være mindst 2 tegn.",
    })
    .max(50, {
      message: "Navn skal være højst 50 tegn.",
    }),
  description: z
    .string()
    .min(10, {
      message: "Beskrivelse skal være mindst 10 tegn.",
    })
    .max(500, {
      message: "Beskrivelse skal være højst 500 tegn.",
    }),
  price: numberSchema,
  category: numberSchema,
  is_active: z.boolean(),
  is_sold_out: z.boolean(),
  is_lacking_ingredient: z.boolean(),
  comment: z
    .string()
    .max(500, {
      message: "Kommentaren skal være højst 500 tegn.",
    })
    .optional(),
});
