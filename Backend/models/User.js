const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      default: "Learner",
      trim: true,
    },
    status: {
      type: String,
      default: "Active",
      trim: true,
    },
    blockReason: {
      type: String,
      default: "",
      trim: true,
    },
    blockNote: {
      type: String,
      default: "",
      trim: true,
    },
    blockedAt: {
      type: Date,
      default: null,
    },
    blockedBy: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);