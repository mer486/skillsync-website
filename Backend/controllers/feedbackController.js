const Feedback = require("../models/Feedback");

const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
};

const createFeedback = async (req, res) => {
  try {
    const { session, issue, rating, status } = req.body;

    if (!session || !issue) {
      return res.status(400).json({
        message: "Session and issue are required",
      });
    }

    const newFeedback = new Feedback({
      session,
      issue,
      rating,
      status,
    });

    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create feedback",
      error: error.message,
    });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { session, issue, rating, status } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      {
        session,
        issue,
        rating,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json(updatedFeedback);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update feedback",
      error: error.message,
    });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete feedback",
      error: error.message,
    });
  }
};

module.exports = {
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};