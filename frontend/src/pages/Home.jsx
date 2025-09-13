import React from "react";
import UploadForm from "../components/UploadForm";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            StudyBuddy AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload your documents and start learning smarter
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8">
          <UploadForm />
        </div>
      </div>
    </div>
  );
};

export default Home;
