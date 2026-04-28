const User = require("../models/User");
const Mentor = require("../models/Mentor");
const CareerPath = require("../models/CareerPath");
const Feedback = require("../models/Feedback");

const getAnalyticsStats = async (req, res) => {
  try {
    const [totalUsers, totalMentors, totalCareerPaths, totalFeedback, mentors] =
      await Promise.all([
        User.countDocuments(),
        Mentor.countDocuments(),
        CareerPath.countDocuments(),
        Feedback.countDocuments(),
        Mentor.find(),
      ]);

    const totalSessions = mentors.reduce(
      (sum, mentor) => sum + (mentor.sessions || 0),
      0
    );

    const totalRatings = mentors.reduce(
      (sum, mentor) => sum + (mentor.rating || 0),
      0
    );

    const averageMentorRating =
      totalMentors > 0 ? Number((totalRatings / totalMentors).toFixed(1)) : 0;

    const growthBars = [
      { label: "Users", value: totalUsers },
      { label: "Mentors", value: totalMentors },
      { label: "Paths", value: totalCareerPaths },
      { label: "Feedback", value: totalFeedback },
      { label: "Sessions", value: totalSessions },
      { label: "Ratings", value: averageMentorRating * 20 },
    ];

    res.status(200).json({
      totalUsers,
      totalMentors,
      totalCareerPaths,
      totalFeedback,
      totalSessions,
      averageMentorRating,
      growthBars,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch analytics stats",
      error: error.message,
    });
  }
};

module.exports = { getAnalyticsStats };