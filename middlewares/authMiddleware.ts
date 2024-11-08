// middlewares/authMiddleware.js
import config from "../config/config";
import express, { Request, Response, NextFunction } from "express";
import { personel, reservation } from "@prisma/client";
import { RefreshTokenRepositoryImpl } from "../core/auth/refreshTokenRepositoryImpl";
import { TokenService } from "../core/auth/tokenService";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | any> {
  const authHeader = req.headers["authorization"];
  const audience = req.headers["audience"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("audience: ", audience);
  console.log("token: ", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized. No token provided." });
  }

  if (!audience || audience === "" || typeof audience !== "string") {
    return res
      .status(401)
      .json({ message: "Audience not set or incorrectly formatted" });
  }

  if (!config.jwtSecret) {
    throw new Error("JWT secret not set");
  }

  const refreshTokenRepository = new RefreshTokenRepositoryImpl(prisma);
  const tokenService = new TokenService(refreshTokenRepository);

  const tokenPayload = await tokenService.validateAccessToken(token, audience);

  if (!tokenPayload) {
    return res.sendStatus(403);
  }

  res.locals.userId = tokenPayload.sub;

  next();
}
