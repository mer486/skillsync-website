const Mentor = require("../models/Mentor");

const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find().sort({ createdAt: -1 });
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch mentors",
      error: error.message,
    });
  }
};

const createMentor = async (req, res) => {
  try {
    const { name, email, field, rating, sessions, status } = req.body;

    if (!name || !email || !field) {
      return res.status(400).json({
        message: "Name, email, and specialization are required",
      });
    }

    const existingMentor = await Mentor.findOne({
      email: email.toLowerCase(),
    });

    if (existingMentor) {
      return res.status(400).json({ message: "Mentor already exists" });
    }

    const newMentor = new Mentor({
      name,
      email: email.toLowerCase(),
      field,
      rating,
      sessions,
      status,
    });

    const savedMentor = await newMentor.save();
    res.status(201).json(savedMentor);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create mentor",
      error: error.message,
    });
  }
};

const updateMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, field, rating, sessions, status } = req.body;

    const updatedMentor = await Mentor.findByIdAndUpdate(
      id,
      {
        name,
        email: email?.toLowerCase(),
        field,
        rating,
        sessions,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedMentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.status(200).json(updatedMentor);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update mentor",
      error: error.message,
    });
  }
};

const deleteMentor = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMentor = await Mentor.findByIdAndDelete(id);

    if (!deletedMentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.status(200).json({ message: "Mentor deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete mentor",
      error: error.message,
    });
  }
};

module.exports = {
  getMentors,
  createMentor,
  updateMentor,
  deleteMentor,
};