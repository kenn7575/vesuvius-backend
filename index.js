const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const users = []; // Temporary user storage. Replace with a database in production.

function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
}

const refreshTokens = []; // This array will store valid refresh tokens. For production, use a database.

app.post("/login", (req, res) => {
  const { username } = req.body;

  // Mock user object (in real applications, fetch this from your database)
  const user = { username };

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  refreshTokens.push(refreshToken); // Store refresh token

  res.json({ accessToken, refreshToken });
});

app.post("/refresh-token", (req, res) => {
  const { token } = req.body;

  if (!token) return res.sendStatus(401);
  if (!refreshTokens.includes(token)) return res.sendStatus(403); // Token not valid

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // Attach the user object to the request
    next();
  });
}

app.get("/protected", authenticateToken, (req, res) => {
  res.json({
    message: `Hello, ${req.user.username}! Welcome to the protected route.`,
  });
});
