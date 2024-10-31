import RateLimit from "express-rate-limit";
import { PostgresStore } from "@acpr/rate-limit-postgresql";

import config from "../config/config";
console.log("postgresStore", {
  user: config.DbUser,
  password: config.DbPassword,
  host: config.DbHost,
  database: config.DbRateLimitName,
  port: config.DbPort,
});
const postgresStore = new PostgresStore(
  {
    user: config.DbUser,
    password: config.DbPassword,
    host: config.DbHost,
    database: config.DbRateLimitName,
    port: config.DbPort,
  },
  "aggregated_store"
);

let limiter = RateLimit({
  store: postgresStore,

  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 3 requests per `window` (here, per 15 minutes)
  message:
    "Too many accounts created from this IP, please try again after 15 minutes",
  standardHeaders: "draft-7", // Set `RateLimit` and `RateLimit-Policy`` headers
  legacyHeaders: false,
  passOnStoreError: true,
});

export default limiter;
