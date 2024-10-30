// routes/authRoutes.js
const express = require("express");
const {
  signup,
  signin,
  refreshToken,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh-token", refreshToken);

module.exports = router;
