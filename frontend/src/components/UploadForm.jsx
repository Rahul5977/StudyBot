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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Upload Your Documents
        </h2>
        <p className="text-gray-600 mb-6">
          Support for PDF and Excel files (.pdf, .xlsx, .xls)
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept=".pdf,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Choose File
        </label>

        {selectedFile && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Selected: <span className="font-medium">{selectedFile.name}</span>
            </p>
            <p className="text-xs text-gray-500">
              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="flex space-x-4">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Upload & Process"}
          </button>

          <button
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>
      )}

      {uploadResponse && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Upload Successful!
          </h3>
          <div className="text-sm text-green-700">
            <p>
              <strong>File:</strong> {uploadResponse.filename}
            </p>
            {uploadResponse.total_pages && (
              <p>
                <strong>Total Pages:</strong> {uploadResponse.total_pages}
              </p>
            )}
            {uploadResponse.total_sheets && (
              <p>
                <strong>Total Sheets:</strong> {uploadResponse.total_sheets}
              </p>
            )}
            <p className="mt-2 text-xs text-green-600">
              Check browser console for detailed response data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
