import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string(),
  role_id: z.number().min(1, "Invalid role ID"),
});

export default createUserSchema;
