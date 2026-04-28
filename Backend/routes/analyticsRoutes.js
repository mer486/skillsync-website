const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getAnalyticsStats } = require("../controllers/analyticsController");

router.get("/", protect, getAnalyticsStats);

module.exports = router;