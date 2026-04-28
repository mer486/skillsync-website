const CareerPath = require("../models/CareerPath");

const getCareerPaths = async (req, res) => {
  try {
    const careerPaths = await CareerPath.find().sort({ createdAt: -1 });
    res.status(200).json(careerPaths);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch career paths", error: error.message });
  }
};

const createCareerPath = async (req, res) => {
  try {
    const { path, skills, resources } = req.body;

    if (!path || !skills || !resources) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCareerPath = new CareerPath({
      path,
      skills,
      resources,
    });

    const savedCareerPath = await newCareerPath.save();
    res.status(201).json(savedCareerPath);
  } catch (error) {
    res.status(500).json({ message: "Failed to create career path", error: error.message });
  }
};

const updateCareerPath = async (req, res) => {
  try {
    const { id } = req.params;
    const { path, skills, resources } = req.body;

    const updatedCareerPath = await CareerPath.findByIdAndUpdate(
      id,
      { path, skills, resources },
      { new: true, runValidators: true }
    );

    if (!updatedCareerPath) {
      return res.status(404).json({ message: "Career path not found" });
    }

    res.status(200).json(updatedCareerPath);
  } catch (error) {
    res.status(500).json({ message: "Failed to update career path", error: error.message });
  }
};

const deleteCareerPath = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCareerPath = await CareerPath.findByIdAndDelete(id);

    if (!deletedCareerPath) {
      return res.status(404).json({ message: "Career path not found" });
    }

    res.status(200).json({ message: "Career path deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete career path", error: error.message });
  }
};

module.exports = {
  getCareerPaths,
  createCareerPath,
  updateCareerPath,
  deleteCareerPath,
};