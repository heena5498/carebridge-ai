const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("carebridge_access_token");
}

async function authedGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.detail || "Request failed");
  }
  return data;
}

export function getMyCases() {
  return authedGet("/patient/cases/me");
}

export function getMyCarePlan(caseId) {
  return authedGet(`/patient/cases/${caseId}/care-plan`);
}