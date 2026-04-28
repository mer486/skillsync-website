const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getMentors,
  createMentor,
  updateMentor,
  deleteMentor,
} = require("../controllers/mentorController");

router.get("/", protect, getMentors);
router.post("/", protect, createMentor);
router.put("/:id", protect, updateMentor);
router.delete("/:id", protect, deleteMentor);

module.exports = router;