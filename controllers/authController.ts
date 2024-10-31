// controllers/authController.js
import { PrismaClient, type personel } from "@prisma/client";
import express, { Request, Response } from "express";
import validationSchema from "../zodSchemas/createUserSchema";
import jwt from "jsonwebtoken";
import { z } from "zod";
const prisma = new PrismaClient();
// use `prisma` in your application to read and write data in your DB

import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils";
import config from "../config/config";

// Sign-up function to register a new user
export async function signup(req: Request, res: Response): Promise<void | any> {
  const { email, password, firstName, lastName, phoneNumber, roleId } =
    req.body;

  const inputData: Omit<personel, "id"> = {
    email,
    password: password,
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneNumber,
    role_id: roleId,
  };

  try {
    validationSchema.parse(inputData);
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ message: error.flatten() });
    else return res.status(500).json({ message: "Internal server error" });
  }

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
  const hashedPassword = await bcrypt.hash(password, Number(config.saltRounds));
  inputData.password = hashedPassword;

  // Create and store the new user

  await prisma.personel.create({
    data: inputData,
  });

  res.status(201).json({ message: "User registered successfully" });
}

// Sign-in function to authenticate a user and issue tokens
export async function signin(req: Request, res: Response): Promise<void | any> {
  const { email, password } = req.body;

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
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store the refresh token in the database

  res.json({ accessToken, refreshToken });
}

// Refresh token function to issue a new access token
export async function refreshToken(
  req: Request,
  res: Response
): Promise<void | any> {
  // Get the refresh token from the request
  const { token } = req.body;

  // Check if the refresh token is present and the server has a JWT secret
  if (!token) return res.sendStatus(401);
  if (!config.jwtSecret) {
    throw new Error("JWT secret not set");
  }

  // Check if the refresh token is valid in the database
  // try {
  //   const tokenFromDatabase = await prisma.refresh_tokens.findUnique({
  //     where: {
  //       token: token,
  //     },
  //   });

  //   if (!tokenFromDatabase) {
  //     // If the token is not found in the database, return a 403 status
  //     return res.sendStatus(403);
  //   }
  // } catch (error) {

  //   return res.sendStatus(403);
  // }

  // Verify the refresh token
  try {
    jwt.verify(token, config.jwtSecret, async (err: any, data: any) => {
      if (err) {
        console.log("Token verification failed", err);
        return res.sendStatus(403);
      }
      console.log("Data", data);
      // Fetch latest user data from the database
      const user = await prisma.personel.findUnique({
        where: {
          id: data.id,
        },
      });
      if (!user) {
        console.log("User not found");
        return res.status(403);
      }

      // Generate a new access token
      const accessToken = generateAccessToken(user);

      res.json({ accessToken });
    });
  } catch (error) {
    // if anything goes wrong, return a 403 status
    console.log("Error", error);
    res.sendStatus(403);
  }
}
