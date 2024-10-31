// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import config from "../config/config";
import express, { Request, Response, NextFunction } from "express";
import { personel, reservation } from "@prisma/client";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void | any {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token", token);
  if (!token) return res.sendStatus(401);

  if (!config.jwtSecret) {
    throw new Error("JWT secret not set");
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      console.log("Token verification failed", err);
      return res.sendStatus(403);
    }
    // req.user = user as personel;
    next();
  });
}
