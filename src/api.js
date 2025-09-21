import axios from "axios";

const API_BASE = "http://localhost:8000"; // or your deployed FastAPI URL

export async function runAgent(userId, sessionId, message) {
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
