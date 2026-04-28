const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");

router.get("/", protect, getFeedback);
router.post("/", protect, createFeedback);
router.put("/:id", protect, updateFeedback);
router.delete("/:id", protect, deleteFeedback);

module.exports = router;