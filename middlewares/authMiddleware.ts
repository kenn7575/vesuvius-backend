// middlewares/authMiddleware.js
import config from "../config/config";
import express, { Request, Response, NextFunction } from "express";
import { personel, reservation } from "@prisma/client";
import { RefreshTokenRepositoryImpl } from "../core/auth/refreshTokenRepositoryImpl";
import { TokenService } from "../core/auth/tokenService";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | any> {
  const authHeader = req.headers["authorization"];
  const audience = req.headers["audience"];
  const token = authHeader && authHeader.split(" ")[1];

  const ip = req.socket?.remoteAddress;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized. No token provided." });
  }

  if (
    (!audience || audience === "" || typeof audience !== "string") &&
    (!ip || ip === "" || typeof ip !== "string")
  ) {
    return res
      .status(401)
      .json({ message: "Audience not set or incorrectly formatted" });
  }

  if (!config.jwtSecret) {
    throw new Error("JWT secret not set");
  }

  const refreshTokenRepository = new RefreshTokenRepositoryImpl(prisma);
  const tokenService = new TokenService(refreshTokenRepository);

  const tokenPayload = await tokenService.validateAccessToken(
    token,
    (audience as string) ?? (ip as string)
  );

  if (!tokenPayload) {
    return res.sendStatus(403);
  }
  if (tokenPayload.role_id < 1) {
    return res.status(403).send("Forbidden");
  }

  res.locals.userId = Number(tokenPayload.sub);
  res.locals.roleId = Number(tokenPayload.role_id);

  next();
}
