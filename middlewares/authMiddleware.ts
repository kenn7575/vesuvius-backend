// middlewares/authMiddleware.js
import config from "../config/config";
import express, { Request, Response, NextFunction } from "express";
import { personel, reservation } from "@prisma/client";
import { RefreshTokenRepositoryImpl } from "../core/auth/refreshTokenRepositoryImpl";
import { TokenService } from "../core/auth/tokenService";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void | any {
  const authHeader = req.headers["authorization"];
  const audience = req.headers["audience"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res
      .sendStatus(401)
      .json({ message: "Unauthorized. No token provided." });
  if (!audience || audience === "" || typeof audience !== "string")
    return res
      .sendStatus(401)
      .json({ message: "Audience not set or incorrectly formated" });

  if (!config.jwtSecret) {
    throw new Error("JWT secret not set");
  }

  const refreshTokenRepository = new RefreshTokenRepositoryImpl(prisma);
  const tokenService = new TokenService(refreshTokenRepository);

  const isValid = tokenService.validateRefreshToken(token, audience);
  if (!isValid) return res.sendStatus(403);
  next();
}
