const User = require("../models/User");
const Mentor = require("../models/Mentor");
const CareerPath = require("../models/CareerPath");

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalMentors, totalCareerPaths, mentors] = await Promise.all([
      User.countDocuments(),
      Mentor.countDocuments(),
      CareerPath.countDocuments(),
      Mentor.find().sort({ createdAt: -1 }),
    ]);

    const activeSessions = mentors.reduce(
      (sum, mentor) => sum + (mentor.sessions || 0),
      0
    );

    const totalRatings = mentors.reduce(
      (sum, mentor) => sum + (mentor.rating || 0),
      0
    );

    const averageMentorRating =
      totalMentors > 0 ? Number((totalRatings / totalMentors).toFixed(1)) : 0;

    const fieldCountsMap = {};
    mentors.forEach((mentor) => {
      const field = mentor.field || "Unknown";
      fieldCountsMap[field] = (fieldCountsMap[field] || 0) + 1;
    });

    const topFields = Object.entries(fieldCountsMap)
      .map(([title, count]) => ({
        title,
        count,
        subtitle: `${count} mentor${count !== 1 ? "s" : ""}`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const recentMentors = mentors.slice(0, 3).map((mentor) => ({
      name: mentor.name,
      area: mentor.field,
      status: mentor.status || "Active",
      sessions: mentor.sessions || 0,
    }));

    res.status(200).json({
      totalUsers,
      totalMentors,
      totalCareerPaths,
      activeSessions,
      averageMentorRating,
      topFields,
      recentMentors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

module.exports = { getDashboardStats };