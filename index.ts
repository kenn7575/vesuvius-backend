// server.js
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import menuItemRoutes from "./routes/menuItemRoutes";
import menuItemTypesRoutes from "./routes/MenuItemTypeRoutes";
import limiter from "./utils/rateLimiter";
import reservationRoutes from "./routes/reservationRoutes";
import cors from "cors";
import { tableRoutes } from "./controllers/tableControllors/getAllTables";

dotenv.config();

const app = express();
app.use(express.json());
var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.use("/auth/signin", limiter);
app.use("/auth/signup", limiter);
app.use("/auth", authRoutes);
app.use("/user", userRoutes); // only for testing purposes. TODO: remove this later
app.use("/menu_items", menuItemRoutes);
app.use("/menu_item_types", menuItemTypesRoutes);
app.use("/reservations", reservationRoutes);
app.use("/tables", tableRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

import { randomBytes } from "crypto";

const key = randomBytes(32).toString("base64");
console.log(key);
export default app;
