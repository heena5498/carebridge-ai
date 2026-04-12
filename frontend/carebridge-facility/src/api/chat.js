import axios from "axios";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://backend-production-5bdbb.up.railway.app/";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Send a message to the facility chatbot.
 * @param {{ message: string, session_id?: string, case_id?: number }} payload
 * @returns {Promise<{ session_id: string, reply: string }>}
 */
export async function sendChatMessage(payload) {
  const response = await apiClient.post("/chat/facility", payload);
  return response.data;
}

/**
 * Clear/reset a chat session.
 * @param {string} sessionId
 */
export async function clearChatSession(sessionId) {
  const response = await apiClient.delete(`/chat/facility/${sessionId}`);
  return response.data;
}
