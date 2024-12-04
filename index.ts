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
import menuRouter from "./routes/menuRoutes";
import orderRoutes from "./routes/orderRoutes";
import tableRoutes from "./routes/tableRouts";
import { getAllTables } from "./controllers/tableControllors/getAllTables";

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
app.use("/user", userRoutes);
app.use("/menu_items", menuItemRoutes);
app.use("/menu_item_types", menuItemTypesRoutes);
app.use("/reservations", reservationRoutes);
app.use("/tables", tableRoutes);
app.use("/menu", menuRouter);
app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 5005;

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
