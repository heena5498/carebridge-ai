const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export async function loginPatient(email, password) {
  const response = await fetch(`${API_BASE_URL}/patient/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.detail || "Login failed");
  }
  return data;
}

export async function registerPatient(fullName, email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName, email, password, role: "patient" }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.detail || "Registration failed");
  }
  return data;
}