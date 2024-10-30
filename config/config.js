// config/config.js
require("dotenv").config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION || "15m",
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || "7d",
  saltRounds: parseInt(process.env.SALT_ROUNDS) || 10,
};
