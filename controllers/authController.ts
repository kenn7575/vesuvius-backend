// controllers/authController.js
import { PrismaClient, type personel } from "@prisma/client";
import express, { Request, Response } from "express";
import validationSchema from "../zodSchemas/createUserSchema";
import jwt from "jsonwebtoken";
import { z } from "zod";
const prisma = new PrismaClient();
// use `prisma` in your application to read and write data in your DB

import bcrypt from "bcrypt";

import config from "../config/config";
import { RefreshTokenRepositoryImpl } from "../core/auth/refreshTokenRepositoryImpl";
import { TokenService } from "../core/auth/tokenService";

// Sign-up function to register a new user
export async function signup(req: Request, res: Response): Promise<void | any> {
  const { email, password, firstName, lastName, phoneNumber, roleId } =
    req.body;
  if (!config.jwtSecret) {
    throw new Error("JWT secret not set");
  }

  const inputData: Omit<personel, "id"> = {
    email,
    password: password,
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneNumber,
    role_id: roleId,
    created_at: new Date(),
    updated_at: new Date(),
  };

  try {
    validationSchema.parse(inputData);
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ message: error.flatten() });
    else return res.status(500).json({ message: "Internal server error" });
  }

  try {
    // Check if the user already exists
    const existingUser = await prisma.personel.findUnique({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.saltRounds)
    );
    inputData.password = hashedPassword;

    // Create and store the new user
    await prisma.personel.create({
      data: inputData,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Sign-in function to authenticate a user and issue tokens
export async function signin(req: Request, res: Response): Promise<void | any> {
  const { email, password } = req.body;
  const audience = req.headers["audience"] as string;
  if (!audience) return res.sendStatus(400);
  if (!config.jwtSecret) {
    throw new Error("JWT secret not set");
  }

  // Find the user by username
  const user = await prisma.personel.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Verify the password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate access and refresh tokens
  const refreshTokenRepository = new RefreshTokenRepositoryImpl(prisma);
  const tokenService = new TokenService(refreshTokenRepository);
  const accessToken = await tokenService.generateAccessToken(user, audience);
  const refreshToken = await tokenService.generateRefreshToken(user, audience);

  // Store the refresh token in the database
  const { password: _, ...userWithoutPassword } = user;

  res.json({ accessToken, refreshToken, userWithoutPassword });
}

// Refresh token function to issue a new access token
export async function refreshToken(
  req: Request,
  res: Response
): Promise<void | any> {
  // steps:
  // 1. get the refresh token and audience from the request
  // 2. validate the refresh token
  // 3. fetch user data from the database
  // 4. generate a new access token

  // 1. get the refresh token and audience from the request
  const { token: encryptedToken } = req.body;
  const audience = req.headers["audience"] as string;
  if (!encryptedToken || !audience)
    return res.sendStatus(400).json({
      message: "Invalid request. Missing token or audience in headers.",
    });
  if (!config.jwtSecret) {
    throw new Error("JWT secret not set");
  }

  // 2. validate the refresh token
  const refreshTokenRepository = new RefreshTokenRepositoryImpl(prisma);
  const tokenService = new TokenService(refreshTokenRepository);
  try {
    const token = await tokenService.validateRefreshToken(
      encryptedToken,
      audience
    );
    if (!token || !token.sub) {
      console.error("Invalid token");
      return res
        .sendStatus(401)
        .json({ message: "Invalid request. Token is invalid." });
    }
    // 3. fetch user data from the database
    const user = await prisma.personel.findUnique({
      where: {
        id: Number(token?.sub),
      },
    });
    if (!user) {
      console.error("User not found");
      return res.status(401);
    }

    // Generate a new access token
    const accessToken = tokenService.generateAccessToken(user, audience);

    res.json({ accessToken });
  } catch (error) {
    // if anything goes wrong, return a 403 status
    console.error("Error", error);
    res.sendStatus(401).json({ message: "Something unexpected happend." });
  }
}