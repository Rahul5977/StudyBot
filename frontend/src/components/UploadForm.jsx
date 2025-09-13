import React, { useState } from "react";

const UploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setUploadResponse(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Determine endpoint based on file type
      const isPDF = selectedFile.name.toLowerCase().endsWith(".pdf");
      const isExcel =
        selectedFile.name.toLowerCase().endsWith(".xlsx") ||
        selectedFile.name.toLowerCase().endsWith(".xls");

      let endpoint;
      if (isPDF) {
        endpoint = "http://localhost:8000/api/upload/pdf";
      } else if (isExcel) {
        endpoint = "http://localhost:8000/api/upload/excel";
      } else {
        throw new Error(
          "Unsupported file type. Please upload PDF or Excel files."
        );
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setUploadResponse(data);

      // Log the response to console as requested
      console.log("Upload Response:", data);
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setUploadResponse(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Upload Your Documents
        </h2>
        <p className="text-gray-600 text-lg">
          Support for PDF and Excel files (.pdf, .xlsx, .xls)
        </p>
      </div>

      {/* Upload Area */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
        <div className="relative border-2 border-dashed border-gray-300 group-hover:border-blue-400 rounded-2xl p-12 text-center bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <input
            type="file"
            accept=".pdf,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="fileInput"
          />

          {!selectedFile ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Choose File
                </label>
                <p className="mt-2 text-gray-500">
                  or drag and drop your file here
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {selectedFile.name}
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    {selectedFile.type || "Document"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {selectedFile && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition hover:scale-105 shadow-lg min-w-[200px]"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
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
                Upload & Process
              </>
            )}
          </button>

          <button
            onClick={resetForm}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition hover:scale-105 shadow-sm"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset
          </button>
        </div>
      )}

      {/* Success Message */}
      {uploadResponse && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl blur opacity-25"></div>
          <div className="relative bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-bold text-green-800 mb-3">
                  Upload Successful! 🎉
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-green-200">
                    <p className="font-medium text-green-800">File Name</p>
                    <p className="text-green-700">{uploadResponse.filename}</p>
                  </div>
                  {uploadResponse.total_pages && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-green-200">
                      <p className="font-medium text-green-800">Total Pages</p>
                      <p className="text-green-700">
                        {uploadResponse.total_pages}
                      </p>
                    </div>
                  )}
                  {uploadResponse.total_sheets && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-green-200">
                      <p className="font-medium text-green-800">Total Sheets</p>
                      <p className="text-green-700">
                        {uploadResponse.total_sheets}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Check browser console for detailed response data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
