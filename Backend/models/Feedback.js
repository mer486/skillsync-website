const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    session: {
      type: String,
      required: true,
      trim: true,
    },
    issue: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Open",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);