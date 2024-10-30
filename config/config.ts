// config/config.js
require("dotenv").config();

const config = {
  jwtSecret: process.env.JWT_SECRET,
  accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION || "15m",
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || "7d",
  saltRounds: process.env.SALT_ROUNDS || 10,
};
export default config;
