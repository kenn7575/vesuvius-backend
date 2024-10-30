// controllers/authController.js
const bcrypt = require("bcrypt");
const users = require("../models/userModel");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokenUtils");
const config = require("../config/config");

// Mock storage for refresh tokens. In production, use a database to store them.
let refreshTokens = [];

// Sign-up function to register a new user
async function signup(req, res) {
  const { username, password } = req.body;

  // Check if the user already exists
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, config.saltRounds);

  // Create and store the new user
  const user = { username, password: hashedPassword };
  users.push(user);

  res.status(201).json({ message: "User registered successfully" });
}

// Sign-in function to authenticate a user and issue tokens
async function signin(req, res) {
  const { username, password } = req.body;

  // Find the user by username
  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Verify the password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate access and refresh tokens
  const accessToken = generateAccessToken({ username: user.username });
  const refreshToken = generateRefreshToken({ username: user.username });
  refreshTokens.push(refreshToken); // Store the refresh token in memory (or database in production)

  res.json({ accessToken, refreshToken });
}

// Refresh token function to issue a new access token
function refreshToken(req, res) {
  const { token } = req.body;

  if (!token) return res.sendStatus(401);
  if (!refreshTokens.includes(token)) return res.sendStatus(403);

  // Verify the refresh token
  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);

    // Generate a new access token
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
}

module.exports = { signup, signin, refreshToken };
