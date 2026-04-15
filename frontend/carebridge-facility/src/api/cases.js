import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://backend-production-5bdbb.up.railway.app/";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export async function fetchCases() {
  const response = await apiClient.get("/cases");
  return response.data;
}

export async function getCase(caseId) {
  const response = await apiClient.get(`/cases/${caseId}`);
  return response.data; // PatientCaseResponse including extraction_data
}

export async function createCase(payload) {
  const response = await apiClient.post("/cases", payload);
  return response.data;
}

export async function uploadDocument(caseId, file) {
  const form = new FormData();
  form.append("file", file);
  const response = await apiClient.post(
    `/cases/${caseId}/documents`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

export async function extractCase(caseId) {
  const response = await apiClient.post(`/cases/${caseId}/extract`);
  return response.data;
}

export async function reviewCase(caseId) {
  const response = await apiClient.get(`/cases/${caseId}/review`);
  return response.data;
}

export async function patchReview(caseId, payload) {
  const response = await apiClient.patch(`/cases/${caseId}/review`, payload);
  return response.data;
}

export async function approveCase(caseId) {
  const response = await apiClient.post(`/cases/${caseId}/approve`);
  return response.data;
}

export async function generateCarePlan(caseId) {
  const response = await apiClient.post(`/cases/${caseId}/care-plan/generate`);
  return response.data;
}

export async function fetchCarePlan(caseId) {
  const response = await apiClient.get(`/cases/${caseId}/care-plan`);
  return response.data;
}
