import axios from "axios";

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

export async function uploadFile(userId, sessionId, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);
  formData.append("session_id", sessionId);

  const res = await axios.post(`${API_BASE}/api/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function exportTestCaseToJira(testCase) {
  const res = await axios.post(`${API_BASE}/create-jira-test-case`, testCase);
  return res.data;
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
  return res.data.messages; // Expected: an array of message objects
}
