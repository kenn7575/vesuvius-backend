// config/config.js
require("dotenv").config();

const config = {
  jwtSecret: process.env.JWT_SECRET,
  accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION || 60 * 60, // 1 hour

  refreshTokenExpiration:
    process.env.REFRESH_TOKEN_EXPIRATION || 60 * 60 * 24 * 7, // 7 days

  saltRounds: process.env.SALT_ROUNDS || 10,
  DbUser: process.env.DB_USER,
  DbPassword: process.env.DB_PASSWORD,
  DbHost: process.env.DB_HOST,
  DbPort: process.env.DB_PORT,
  DbName: process.env.DB_NAME,
  DbRateLimitName: process.env.DB_RATE_LIMIT_NAME,
  DbSchema: process.env.DB_RATE_LIMIT_NAME,
  encryptionKey: process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, "base64")
    : undefined,
  ivLength: process.env.IV_LENGTH || 16,
};
export default config;
