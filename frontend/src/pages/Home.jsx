import React, { useState } from "react";
import UploadForm from "../components/UploadForm";
import ChatBox from "../components/ChatBox";
import StepsVisualizer from "../components/StepsVisualizer";
import PlanEditor from "../components/PlanEditor";
import { createStudyPlan, getPlanTemplate } from "../utils/api";

const Home = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [currentSteps, setCurrentSteps] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planTopic, setPlanTopic] = useState("");

  const handleCreatePlan = async () => {
    if (!planTopic.trim() || isCreatingPlan) return;

    setIsCreatingPlan(true);
    try {
      const response = await createStudyPlan(planTopic);
      if (response.success) {
        setStudyPlan(response.study_plan);
      }
    } catch (error) {
      console.error("Error creating study plan:", error);
    } finally {
      setIsCreatingPlan(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            StudyBuddy AI
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
            Upload your documents and start learning smarter with AI-powered
            document processing and intelligent chat
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              PDF & Excel Support
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              Vector Search
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
              AI Chat
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "upload"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              📤 Upload Documents
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "chat"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              💬 AI Chat
            </button>
            <button
              onClick={() => setActiveTab("plan")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "plan"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              📋 Study Plans
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
          {activeTab === "upload" && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Upload Your Documents
                </h2>
                <p className="text-gray-600">
                  Upload PDFs or Excel files to get started with AI-powered
                  analysis
                </p>
              </div>
              <UploadForm />
            </div>
          )}

          {activeTab === "chat" && (
            <div className="h-[70vh] min-h-[500px] max-h-[800px] flex flex-col">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Chat with Your Documents
                </h2>
                <p className="text-gray-600">
                  Ask questions about your uploaded documents and get
                  intelligent answers
                </p>
              </div>

              <div className="flex-1 flex min-h-0">
                <div className="flex-1 min-w-0">
                  <ChatBox onStepsUpdate={setCurrentSteps} />
                </div>

                {/* Steps Visualizer Sidebar */}
                {currentSteps.length > 0 && (
                  <div className="w-80 border-l border-gray-200 p-4 bg-gray-50 flex-shrink-0 overflow-y-auto">
                    <StepsVisualizer steps={currentSteps} />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "plan" && (
            <div className="h-[70vh] min-h-[500px] max-h-[800px] flex flex-col">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  AI-Generated Study Plans
                </h2>
                <p className="text-gray-600 mb-4">
                  Create comprehensive study plans for any topic using AI
                </p>

                {/* Plan Creation Form */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter a topic to create a study plan (e.g., 'Machine Learning', 'React Development')"
                    value={planTopic}
                    onChange={(e) => setPlanTopic(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreatePlan();
                    }}
                  />
                  <button
                    onClick={handleCreatePlan}
                    disabled={!planTopic.trim() || isCreatingPlan}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isCreatingPlan ? "Creating..." : "Generate Plan"}
                  </button>
                </div>

                {isCreatingPlan && (
                  <div className="mt-4 flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">
                      Creating your personalized study plan...
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {studyPlan ? (
                  <PlanEditor
                    studyPlan={studyPlan}
                    isEditing={true}
                    onPlanUpdate={setStudyPlan}
                  />
                ) : (
                  <div className="text-center text-gray-500 mt-16">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-medium mb-2">
                      No Study Plan Yet
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Enter a topic above to generate a comprehensive study plan
                    </p>

                    <div className="max-w-md mx-auto">
                      <h4 className="font-medium text-gray-700 mb-3">
                        💡 Try these examples:
                      </h4>
                      <div className="space-y-2">
                        {[
                          "Python Programming for Beginners",
                          "Machine Learning Fundamentals",
                          "React Web Development",
                          "Data Science with Python",
                          "AWS Cloud Computing",
                        ].map((example, index) => (
                          <button
                            key={index}
                            onClick={() => setPlanTopic(example)}
                            className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Smart Processing
            </h3>
            <p className="text-gray-600 text-sm">
              Advanced AI extracts and structures content from your documents
            </p>
          </div>

          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Vector Search</h3>
            <p className="text-gray-600 text-sm">
              Semantic search finds relevant content using AI embeddings
            </p>
          </div>

          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Intelligent Chat
            </h3>
            <p className="text-gray-600 text-sm">
              Ask questions and get contextual answers from your documents
            </p>
          </div>

          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-12 h-12 bg-orange-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">
              Process documents and get answers in seconds
            </p>
          </div>
        </div>

        {/* Beautiful Footer */}
        <footer className="mt-20 pt-12 pb-8 border-t border-white/20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-gray-700 font-medium">Made with love by</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                  Rahul
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-6 mb-6">
              <a
                href="https://github.com/Rahul5977/StudyBot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>

              <div className="text-sm text-gray-500">
                <p>StudyBuddy AI © 2025</p>
                <p>Powered by OpenAI • LangChain • React</p>
              </div>
            </div>

            <div className="text-xs text-gray-400">
              <p>
                Built with cutting-edge AI technology to enhance your learning
                experience
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
