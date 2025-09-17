import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  CpuChipIcon,
  DocumentTextIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const StepsVisualizer = ({
  steps = [],
  isLoading = false,
  darkMode = false,
}) => {
  const [visibleSteps, setVisibleSteps] = useState([]);

  useEffect(() => {
    if (!steps || steps.length === 0) {
      setVisibleSteps([]);
      return;
    }

    // Animate steps appearing one by one
    setVisibleSteps([]);
    steps.forEach((step, index) => {
      setTimeout(() => {
        setVisibleSteps((prev) => [...prev, step]);
      }, index * 400);
    });
  }, [steps]);

  const getStepIcon = (step) => {
    switch (step.step) {
      case "retrieve_context":
        return <MagnifyingGlassIcon className="w-5 h-5" />;
      case "generate_response":
        return <CpuChipIcon className="w-5 h-5" />;
      case "log_interaction":
        return <DocumentTextIcon className="w-5 h-5" />;
      default:
        return <CogIcon className="w-5 h-5" />;
    }
  };

  const getStepTitle = (step) => {
    switch (step.step) {
      case "retrieve_context":
        return "🔍 Retriever Agent";
      case "generate_response":
        return "🧠 Tutor Agent";
      case "log_interaction":
        return "📝 Logger Agent";
      default:
        return step.step;
    }
  };

  const getStepDescription = (step) => {
    switch (step.step) {
      case "retrieve_context":
        return "Searching through your documents to find relevant information";
      case "generate_response":
        return "Analyzing context and generating an educational response";
      case "log_interaction":
        return "Saving the conversation for future reference";
      default:
        return step.action || "Processing...";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return darkMode
          ? "text-green-400 bg-green-900/30 border-green-700"
          : "text-green-700 bg-green-100 border-green-300";
      case "error":
        return darkMode
          ? "text-red-400 bg-red-900/30 border-red-700"
          : "text-red-700 bg-red-100 border-red-300";
      case "in_progress":
        return darkMode
          ? "text-blue-400 bg-blue-900/30 border-blue-700"
          : "text-blue-700 bg-blue-100 border-blue-300";
      default:
        return darkMode
          ? "text-gray-400 bg-gray-800 border-gray-600"
          : "text-gray-600 bg-gray-100 border-gray-300";
    }
  };

  const getStepColor = (step, status) => {
    const baseColors = {
      retrieve_context: darkMode
        ? "from-cyan-600 to-blue-600"
        : "from-cyan-500 to-blue-500",
      generate_response: darkMode
        ? "from-purple-600 to-pink-600"
        : "from-purple-500 to-pink-500",
      log_interaction: darkMode
        ? "from-green-600 to-teal-600"
        : "from-green-500 to-teal-500",
      default: darkMode
        ? "from-gray-600 to-gray-700"
        : "from-gray-400 to-gray-500",
    };

    return baseColors[step.step] || baseColors.default;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "error":
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case "in_progress":
        return (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  if (!steps || steps.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg shadow-md p-6 ${
          darkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        <div
          className={`text-center ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <CogIcon
            className={`w-12 h-12 mx-auto mb-3 ${
              darkMode ? "text-gray-600" : "text-gray-300"
            }`}
          />
          <h3
            className={`text-lg font-medium mb-2 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            No Processing Steps
          </h3>
          <p className="text-sm">
            Start a conversation to see the AI processing steps in real-time.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg shadow-md overflow-hidden ${
        darkMode
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`px-6 py-4 border-b ${
          darkMode
            ? "border-gray-700 bg-gray-750"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <h3
          className={`text-lg font-semibold flex items-center gap-2 ${
            darkMode ? "text-gray-200" : "text-gray-800"
          }`}
        >
          <CogIcon className="w-5 h-5" />
          AI Processing Steps
        </h3>
        <p
          className={`text-sm mt-1 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Real-time view of how your query is being processed
        </p>
      </div>

      {/* Steps Container */}
      <div className="p-6">
        <div className="space-y-4">
          <AnimatePresence>
            {visibleSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                className={`relative overflow-hidden rounded-xl border ${
                  darkMode ? "border-gray-600" : "border-gray-200"
                }`}
              >
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${getStepColor(
                    step,
                    step.status
                  )} opacity-10`}
                />

                <div className="relative flex items-start p-4">
                  {/* Step Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                    className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${getStepColor(
                      step,
                      step.status
                    )} flex items-center justify-center text-white shadow-lg`}
                  >
                    {getStepIcon(step)}
                  </motion.div>

                  {/* Step Content */}
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between mb-2">
                      <motion.h4
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className={`font-semibold ${
                          darkMode ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {getStepTitle(step)}
                      </motion.h4>

                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border ${getStatusColor(
                          step.status
                        )}`}
                      >
                        {getStatusIcon(step.status)}
                        <span className="capitalize">
                          {step.status.replace("_", " ")}
                        </span>
                      </motion.div>
                    </div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {getStepDescription(step)}
                    </motion.p>

                    {/* Result or Error */}
                    {step.result && step.status === "completed" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.6 }}
                        className={`mt-3 p-3 rounded-lg text-sm ${
                          darkMode
                            ? "bg-green-900/20 text-green-300 border border-green-700"
                            : "bg-green-50 text-green-700 border border-green-200"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{step.result}</span>
                        </div>
                      </motion.div>
                    )}

                    {step.error && step.status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.6 }}
                        className={`mt-3 p-3 rounded-lg text-sm ${
                          darkMode
                            ? "bg-red-900/20 text-red-300 border border-red-700"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{step.error}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading state for current step */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className={`relative overflow-hidden rounded-xl border border-dashed ${
                darkMode
                  ? "border-blue-500 bg-blue-900/10"
                  : "border-blue-400 bg-blue-50"
              }`}
            >
              <div className="flex items-start p-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${
                    darkMode
                      ? "from-blue-600 to-cyan-600"
                      : "from-blue-500 to-cyan-500"
                  } flex items-center justify-center text-white`}
                >
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="flex-1 ml-4">
                  <h4
                    className={`font-semibold ${
                      darkMode ? "text-blue-300" : "text-blue-700"
                    }`}
                  >
                    ⚡ Processing...
                  </h4>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    Working on your request
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Progress Bar */}
        {steps && steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <div
              className={`flex justify-between text-sm mb-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <span>Overall Progress</span>
              <span>
                {visibleSteps.filter((s) => s.status === "completed").length} /{" "}
                {steps.length} completed
              </span>
            </div>
            <div
              className={`w-full rounded-full h-2.5 ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (visibleSteps.filter((s) => s.status === "completed")
                      .length /
                      steps.length) *
                    100
                  }%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2.5 rounded-full shadow-sm"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StepsVisualizer;
