import { z } from "zod";

const createMenuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price_in_oere: z.number().min(1, "Price is required"),
  type_id: z.number().min(1, "Type is required"),
});




export default createMenuItemSchema;
