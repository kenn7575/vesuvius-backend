// utils/tokenUtils.js
import jwt from "jsonwebtoken";
import config from "../config/config";
import { personel } from "@prisma/client";

export function generateAccessToken(user: personel) {
  if (!config.jwtSecret) {
    throw new Error("JWT secret not set");
  }
  const { password, ...userWithoutPassword } = user;

  return jwt.sign(userWithoutPassword, config.jwtSecret, {
    algorithm: "HS256",
    expiresIn: config.accessTokenExpiration,
    subject: user.id.toString(),
  });
}

export function generateRefreshToken(user: personel) {
  if (!config.jwtSecret) {
    throw new Error("JWT secret not set");
  }

  //remove password from user object
  const { password, ...userWithoutPassword } = user;

  return jwt.sign(userWithoutPassword, config.jwtSecret, {
    algorithm: "HS256",
    expiresIn: config.refreshTokenExpiration,
    subject: user.id.toString(),
  });
}
