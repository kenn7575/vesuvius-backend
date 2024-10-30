// routes/userRoutes.js
const express = require("express");
const { getProtectedResource } = require("../controllers/userController");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/protected", authenticateToken, getProtectedResource);

module.exports = router;
