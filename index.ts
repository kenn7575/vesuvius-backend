// server.js
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
