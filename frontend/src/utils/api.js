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

export const chatWithAI = async (
  query,
  sessionId = null,
  useMultiAgent = true
) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      session_id: sessionId,
      use_multi_agent: useMultiAgent,
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

// Study Plan API functions
export const createStudyPlan = async (
  topic,
  preferences = null,
  includeSearch = true
) => {
  const response = await fetch(`${API_BASE_URL}/plan/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
      preferences,
      include_search: includeSearch,
    }),
  });

  if (!response.ok) {
    throw new Error(`Study plan creation failed: ${response.statusText}`);
  }

  return response.json();
};

export const refineStudyPlan = async (currentPlan, refinementRequest) => {
  const response = await fetch(`${API_BASE_URL}/plan/refine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      current_plan: currentPlan,
      refinement_request: refinementRequest,
    }),
  });

  if (!response.ok) {
    throw new Error(`Study plan refinement failed: ${response.statusText}`);
  }

  return response.json();
};

export const getPlanTemplate = async (difficulty = "intermediate") => {
  const response = await fetch(`${API_BASE_URL}/plan/template/${difficulty}`);

  if (!response.ok) {
    throw new Error(`Failed to get plan template: ${response.statusText}`);
  }

  return response.json();
};
