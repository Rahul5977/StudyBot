import React, { useState, useEffect } from "react";

const StepsVisualizer = ({ steps = [], isLoading = false }) => {
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
      }, index * 300);
    });
  }, [steps]);

  const getStepIcon = (step) => {
    switch (step.step) {
      case "retrieve_context":
        return "🔍";
      case "generate_response":
        return "🧠";
      case "log_interaction":
        return "📝";
      default:
        return "⚙️";
    }
  };

  const getStepTitle = (step) => {
    switch (step.step) {
      case "retrieve_context":
        return "Searching Documents";
      case "generate_response":
        return "Generating Response";
      case "log_interaction":
        return "Saving Interaction";
      default:
        return step.step;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "running":
        return "text-blue-600 bg-blue-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅";
      case "running":
        return "⏳";
      case "error":
        return "❌";
      default:
        return "⏸️";
    }
  };

  if (!isLoading && (!steps || steps.length === 0)) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        🔄 AI Processing Steps
      </h3>

      <div className="space-y-3">
        {visibleSteps.map((step, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 transition-all duration-300 transform"
            style={{
              animation: `slideInLeft 0.3s ease-out ${index * 0.1}s both`,
            }}
          >
            {/* Step Icon */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg">{getStepIcon(step)}</span>
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  {getStepTitle(step)}
                </h4>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                    step.status
                  )}`}
                >
                  <span>{getStatusIcon(step.status)}</span>
                  <span className="capitalize">{step.status}</span>
                </div>
              </div>

              {step.action && (
                <p className="text-sm text-gray-600 mt-1">{step.action}</p>
              )}

              {step.result && step.status === "completed" && (
                <p className="text-sm text-green-700 mt-1 bg-green-50 p-2 rounded">
                  ✨ {step.result}
                </p>
              )}

              {step.error && step.status === "error" && (
                <p className="text-sm text-red-700 mt-1 bg-red-50 p-2 rounded">
                  ⚠️ {step.error}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Loading state for current step */}
        {isLoading && (
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-blue-200 bg-blue-50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Processing...</h4>
              <p className="text-sm text-blue-700">Working on your request</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {steps && steps.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>
              {visibleSteps.filter((s) => s.status === "completed").length} /{" "}
              {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (visibleSteps.filter((s) => s.status === "completed").length /
                    steps.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add CSS animation
const styles = `
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default StepsVisualizer;
