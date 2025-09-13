// API utility functions for frontend

const API_BASE_URL = "http://localhost:8000/api";

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload/pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
};

export const uploadExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload/excel`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
};

export const chatWithAI = async (query, sessionId = null) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      session_id: sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.statusText}`);
  }

  return response.json();
};

export const getChatLogs = async (limit = 50) => {
  const response = await fetch(`${API_BASE_URL}/chat/logs?limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Failed to get chat logs: ${response.statusText}`);
  }

  return response.json();
};

export const checkChatHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/chat/health`);

  if (!response.ok) {
    throw new Error(`Chat health check failed: ${response.statusText}`);
  }

  return response.json();
};

export const deleteDocument = async (docId) => {
  const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.statusText}`);
  }

  return response.json();
};

export const getDocumentStatus = async (docId) => {
  const response = await fetch(`${API_BASE_URL}/documents/${docId}/status`);

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`);
  }

  return response.json();
};

export const healthCheck = async () => {
  const response = await fetch("http://localhost:8000/ping");

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }

  return response.json();
};
