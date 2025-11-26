import axios from "axios";

// const API_BASE = "https://fastapi-agent-backend-342811635923.us-east4.run.app";
const API_BASE = "http://127.0.0.1:8000";



export async function runAgent(userId, sessionId, message) {
  // console.log(userId, sessionId, message);
  const res = await axios.post(`${API_BASE}/agent/run`, {
    user_id: userId,
    session_id: sessionId,
    message: message,
  });
  return res.data;
}

// export async function uploadFile(userId, sessionId, file) {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("user_id", userId);
//   formData.append("session_id", sessionId);

//   const res = await axios.post(`${API_BASE}/api/upload`, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// }

export async function exportTestCaseToJira(userId, sessionId, projectKey, testCase, requirementKey = null) {
  const res = await axios.post(`${API_BASE}/api/jira/create-jira-test-case`, {
      user_id: userId,
      session_id: sessionId,
      project_key: projectKey,
      test_case: testCase,
      requirement_key: requirementKey
  });
  return res.data;
}

export async function exchangeJiraCode(userId, code) {
  // We send a POST because we are submitting data (the code), not just following a link
  const res = await axios.post(`${API_BASE}/api/jira/callback`, {
    user_id: userId,
    code: code
  });
  return res.data; // Expected: { status: "success", connected: true }
}

export async function createNewSession(userId)
{
  const res = await axios.post(`${API_BASE}/new-session`,{
    user_id: userId
  });
  return res.data;
}

export async function fetchSessions(userId) {
  const res = await axios.get(`${API_BASE}/sessions/${userId}`);
  return res.data.sessions; // Expected: an array of session objects
}


export async function sendMessage(userId, sessionId, message) {
  const res = await axios.post(`${API_BASE}/sessions/${sessionId}/messages`, {
    user_id: userId,
    message: message,
  });

  return res.data; // Expected: { role: "assistant", text: "..." }
}

export async function fetchMessages(userId, sessionId) {
  // Fetches the message history for a specific conversation
  const res = await axios.get(`${API_BASE}/sessions/${sessionId}/messages`, {
    params: { user_id: userId }
  });
  return res.data; // Expected: an array of message objects
}

export async function renameConversation(userId, sessionId, newTitle) {
  const res = await axios.patch(`${API_BASE}/sessions/${sessionId}/title`, 
    { new_title: newTitle },
    { params: { user_id: userId } }
  );
  return res.data;
}

// --- 1. CORRECTED THIS FUNCTION ---
export async function uploadFile(userId, sessionId, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);
  formData.append("session_id", sessionId);

  // This now points to your new RAG upload endpoint
  const res = await axios.post(`${API_BASE}/api/rag/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// --- 2. ADDED THIS NEW FUNCTION ---
export async function fetchSessionDocuments(userId, sessionId) {
  const res = await axios.get(`${API_BASE}/api/rag/documents/session/${sessionId}`, {
    params: { user_id: userId }
  });
  return res.data; // Expected: { documents: [], ... }
}

// --- 3. ADDED THIS NEW FUNCTION ---
export async function toggleDocumentActive(userId, documentId, newActiveState) {
  // We send this as form data to match the main.py correction
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("is_active", newActiveState);

  const res = await axios.patch(`${API_BASE}/api/rag/documents/${documentId}/toggle`, formData);
  return res.data;
}

// ============================================================================
// JIRA OAUTH API FUNCTIONS
// ============================================================================

export async function checkJiraConnectionStatus(userId) {
  const res = await axios.get(`${API_BASE}/api/jira/status`, {
    params: { user_id: userId }
  });
  return res.data; // { connected: boolean, jira_url?: string, expires_at?: string }
}

export async function initiateJiraOAuth(userId) {
  const res = await axios.get(`${API_BASE}/api/jira/connect`, {
    params: { user_id: userId }
  });
  return res.data; // { authorization_url: string }
}

export async function disconnectJira(userId) {
  const res = await axios.delete(`${API_BASE}/api/jira/disconnect`, {
    params: { user_id: userId }
  });
  return res.data;
}

export async function fetchJiraProjects(userId) {
  const res = await axios.get(`${API_BASE}/api/jira/projects`, {
    params: { user_id: userId }
  });
  return res.data; // { projects: [{key, name}] } or { error: string }
}

export async function fetchJiraExports(sessionId, userId) {
  const res = await axios.get(`${API_BASE}/api/jira/exports`, {
    params: { session_id: sessionId, user_id: userId }
  });
  return res.data; // { exports: [...], total }
}

export async function fetchJiraRequirements(userId, projectKey) {
  const res = await axios.post(`${API_BASE}/api/jira/fetch-requirements`, {
    user_id: userId,
    project_key: projectKey
  });
  return res.data; // { status: "success", requirements: [...] } or { error: string }
}

export async function createJiraTestCase(userId, projectKey, testCase, requirementKey = null) {
  const res = await axios.post(`${API_BASE}/api/jira/create-test-case`, {
    user_id: userId,
    project_key: projectKey,
    test_case: testCase,
    requirement_key: requirementKey
  });
  return res.data; // { status: "success", jira_key, jira_url } or { error: string }
}

// Update the import function signature
export async function importJiraRequirements(
  userId,
  sessionId,
  requirements,
  overwrite = false
){
  const response = await fetch(`${API_BASE}/api/jira/import-requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      session_id: sessionId,
      requirements,
      overwrite,
    }),
  });
  if (!response.ok) throw new Error('Failed to import requirements');
  return response.json();
}

export async function deleteRequirement(
  userId,
  sessionId,
  requirementId 
){
  // console.log("Deleting requirement ID: " + requirementId);
  const response = await fetch(
    `${API_BASE}/api/requirements/${requirementId}?user_id=${userId}&session_id=${sessionId}`,
    {
      method: 'DELETE',
    }
  );
  // console.log("delete: " + response);
  if (!response.ok) throw new Error('Failed to delete requirement');
  return response.json();
}

export async function checkDuplicateRequirements(
  userId,
  sessionId,
  requirementIds
){
  const response = await fetch(`${API_BASE}/api/jira/check-duplicate-requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      session_id: sessionId,
      requirement_ids: requirementIds,
    }),
  });
  if (!response.ok) throw new Error('Failed to check duplicates');
  return response.json();
}


export async function getSessionRequirements(userId, sessionId) {
  const res = await axios.get(`${API_BASE}/api/requirements/session/${sessionId}`, {
    params: { user_id: userId }
  });
  return res.data;
}

// --- Analytics API helpers ---
export async function fetchAnalyticsOverview(userId) {
  const res = await axios.get(`${API_BASE}/api/analytics/overview`, { params: { user_id: userId } });
  return res.data;
}

export async function fetchAnalyticsSession(sessionId, userId) {
  const res = await axios.get(`${API_BASE}/api/analytics/session/${sessionId}`, { params: { user_id: userId } });
  return res.data;
}

export async function fetchExportsTimeseries(userId, days = 30) {
  const res = await axios.get(`${API_BASE}/api/analytics/exports-timeseries`, { params: { user_id: userId, days } });
  return res.data;
}
const deleteAllRequirements = async () => {
  if (!sessionId) return;
  
  if (!confirm("Are you sure you want to delete all imported requirements for this session?")) {
    return;
  }

  try {
    const res = await fetch(`/api/requirements/session/${sessionId}?user_id=${userId}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (data.status === "success") {
      addToast({ 
        title: "Deleted", 
        description: `${data.deleted} requirements removed`, 
        type: "success" 
      });
      fetchRequirements();
    } else {
      throw new Error("Delete failed");
    }
  } catch (err) {
    addToast({ title: "Error deleting requirements", type: "error" });
    console.error(err);
  }
};
