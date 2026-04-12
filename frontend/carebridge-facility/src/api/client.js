import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
	baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
	const token = localStorage.getItem("carebridge_access_token");
	if (token) {
		config.headers = config.headers || {};
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default apiClient;
