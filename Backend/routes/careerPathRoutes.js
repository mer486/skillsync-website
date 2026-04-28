const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getCareerPaths,
  createCareerPath,
  updateCareerPath,
  deleteCareerPath,
} = require("../controllers/careerPathController");

router.get("/", protect, getCareerPaths);
router.post("/", protect, createCareerPath);
router.put("/:id", protect, updateCareerPath);
router.delete("/:id", protect, deleteCareerPath);

module.exports = router;