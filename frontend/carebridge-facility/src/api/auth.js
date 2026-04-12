import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function registerUser(payload) {
  const response = await authClient.post("/auth/register", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await authClient.post("/auth/login", payload);
  return response.data;
}
