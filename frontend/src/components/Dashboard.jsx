import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Dashboard = ({ darkMode = false }) => {
  const [studyStats, setStudyStats] = useState({
    currentPlan: null,
    progressPercentage: 0,
    flashcardsDue: 0,
    totalFlashcards: 0,
    studyStreak: 0,
    completedTopics: 0,
    totalTopics: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load flashcard stats
      const flashcardResponse = await fetch(
        "http://localhost:8000/api/flashcards/stats"
      );
      const flashcardStats = flashcardResponse.ok
        ? await flashcardResponse.json()
        : {};

      // Load recent interactions
      const logsResponse = await fetch(
        "http://localhost:8000/api/chat/logs?limit=5"
      );
      const logs = logsResponse.ok
        ? await logsResponse.json()
        : { interactions: [] };

      // Simulate study plan progress (in real app, this would come from user progress tracking)
      const mockProgress = {
        currentPlan: {
          title: "Machine Learning Fundamentals",
          totalSections: 8,
          completedSections: 3,
          currentSection: "Linear Regression",
          difficulty: "Intermediate",
          duration: "6 weeks",
        },
        studyStreak: 7,
        completedTopics: 12,
        totalTopics: 24,
      };

      setStudyStats({
        ...mockProgress,
        progressPercentage:
          (mockProgress.completedTopics / mockProgress.totalTopics) * 100,
        flashcardsDue: flashcardStats.due_today || 0,
        totalFlashcards: flashcardStats.total_cards || 0,
      });

      setRecentActivity(logs.interactions || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } mt-1`}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={`text-sm ${
                darkMode ? "text-gray-500" : "text-gray-500"
              } mt-1`}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className={`text-3xl text-${color}-500`}>{icon}</div>
      </div>
    </motion.div>
  );

  const ProgressBar = ({ percentage, color = "blue" }) => (
    <div
      className={`w-full rounded-full h-3 ${
        darkMode ? "bg-gray-700" : "bg-gray-200"
      }`}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-3 rounded-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
      />
    </div>
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen p-6 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div
              className={`h-8 ${
                darkMode ? "bg-gray-700" : "bg-gray-300"
              } rounded w-1/3`}
            ></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-32 ${
                    darkMode ? "bg-gray-700" : "bg-gray-300"
                  } rounded-xl`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Study Dashboard
            </h1>
            <p
              className={`${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}
            >
              Track your learning progress and stay motivated!
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            🔄 Refresh
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Study Streak"
            value={`${studyStats.studyStreak} days`}
            icon="🔥"
            color="orange"
          />
          <StatCard
            title="Flashcards Due"
            value={studyStats.flashcardsDue}
            subtitle={`of ${studyStats.totalFlashcards} total`}
            icon="🧠"
            color="purple"
          />
          <StatCard
            title="Topics Completed"
            value={`${studyStats.completedTopics}/${studyStats.totalTopics}`}
            subtitle={`${Math.round(studyStats.progressPercentage)}% complete`}
            icon="📚"
            color="green"
          />
          <StatCard
            title="Current Plan"
            value={
              studyStats.currentPlan?.title.split(" ").slice(0, 2).join(" ") ||
              "None"
            }
            subtitle={studyStats.currentPlan?.difficulty}
            icon="🎯"
            color="blue"
          />
        </div>

        {/* Current Study Plan */}
        {studyStats.currentPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border rounded-xl p-6 shadow-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                📖 Current Study Plan
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  studyStats.currentPlan.difficulty === "Beginner"
                    ? "bg-green-100 text-green-800"
                    : studyStats.currentPlan.difficulty === "Intermediate"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {studyStats.currentPlan.difficulty}
              </span>
            </div>

            <h3
              className={`text-lg font-semibold ${
                darkMode ? "text-blue-400" : "text-blue-600"
              } mb-2`}
            >
              {studyStats.currentPlan.title}
            </h3>

            <p
              className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-4`}
            >
              Currently studying:{" "}
              <strong>{studyStats.currentPlan.currentSection}</strong>
            </p>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  Progress
                </span>
                <span
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {studyStats.currentPlan.completedSections}/
                  {studyStats.currentPlan.totalSections} sections
                </span>
              </div>
              <ProgressBar
                percentage={
                  (studyStats.currentPlan.completedSections /
                    studyStats.currentPlan.totalSections) *
                  100
                }
                color="blue"
              />
              <div className="flex justify-between text-sm">
                <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  Duration: {studyStats.currentPlan.duration}
                </span>
                <span
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {Math.round(
                    (studyStats.currentPlan.completedSections /
                      studyStats.currentPlan.totalSections) *
                      100
                  )}
                  % Complete
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border rounded-xl p-6 shadow-sm`}
        >
          <h2
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            🏆 Overall Learning Progress
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span
                className={`${
                  darkMode ? "text-gray-300" : "text-gray-700"
                } font-medium`}
              >
                Topics Mastered
              </span>
              <span
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {studyStats.completedTopics}/{studyStats.totalTopics}
              </span>
            </div>
            <ProgressBar
              percentage={studyStats.progressPercentage}
              color="green"
            />
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              You're doing great! Keep up the momentum to reach your learning
              goals.
            </p>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border rounded-xl p-6 shadow-sm`}
        >
          <h2
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            📝 Recent Study Activity
          </h2>

          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 3).map((activity, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    <strong>Q:</strong> {activity.query?.substring(0, 80)}...
                  </p>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {new Date(activity.timestamp).toLocaleDateString()} at{" "}
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-600"
              } text-center py-8`}
            >
              No recent activity. Start studying to see your progress here!
            </p>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            📚 Continue Studying
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all"
          >
            🧠 Review Flashcards
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all"
          >
            ➕ New Study Plan
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
