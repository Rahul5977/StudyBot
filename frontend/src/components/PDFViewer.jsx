import React, { useState, useEffect } from "react";
import "./PDFViewer.css";

const PDFViewer = ({
  pdfUrl,
  highlightedTopics = [],
  currentPage = 1,
  onPageChange,
  className = "",
}) => {
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pdfUrl) {
      setLoading(true);
      setError(null);
      // Simulate loading time - in a real implementation, you'd use pdf.js
      setTimeout(() => {
        setTotalPages(10); // Mock page count
        setLoading(false);
      }, 1000);
    }
  }, [pdfUrl]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange?.(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange?.(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className={`pdf-viewer loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pdf-viewer error ${className}`}>
        <div className="error-message">
          <h3>Error Loading PDF</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className={`pdf-viewer empty ${className}`}>
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No PDF Selected</h3>
          <p>Upload a PDF document to view it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer ${className}`}>
      <div className="pdf-header">
        <div className="page-controls">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="nav-btn"
          >
            ← Previous
          </button>

          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="nav-btn"
          >
            Next →
          </button>
        </div>

        {highlightedTopics.length > 0 && (
          <div className="highlight-topics">
            <span className="highlight-label">Highlighting:</span>
            {highlightedTopics.map((topic, index) => (
              <span key={index} className="highlight-topic">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pdf-content">
        {/* In a real implementation, you'd use react-pdf or pdf.js */}
        <div className="pdf-page">
          <div className="page-placeholder">
            <h3>PDF Page {currentPage}</h3>
            <p>
              PDF content would be rendered here using react-pdf or similar
              library
            </p>
            {highlightedTopics.length > 0 && (
              <div className="mock-highlights">
                <p>
                  <mark>
                    Example highlighted text for: {highlightedTopics[0]}
                  </mark>
                </p>
                <p>This paragraph contains information about the topic.</p>
                <p>
                  <mark>
                    Another highlighted section related to:{" "}
                    {highlightedTopics[0]}
                  </mark>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pdf-footer">
        <div className="zoom-controls">
          <button className="zoom-btn">Zoom Out</button>
          <span className="zoom-level">100%</span>
          <button className="zoom-btn">Zoom In</button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
