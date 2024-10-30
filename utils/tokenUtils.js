// utils/tokenUtils.js
const jwt = require("jsonwebtoken");
const config = require("../config/config");

function generateAccessToken(user) {
  return jwt.sign(user, config.jwtSecret, {
    expiresIn: config.accessTokenExpiration,
  });
}

function generateRefreshToken(user) {
  return jwt.sign(user, config.jwtSecret, {
    expiresIn: config.refreshTokenExpiration,
  });
}

module.exports = { generateAccessToken, generateRefreshToken };
