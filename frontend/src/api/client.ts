// src/api/client.ts
import axios from "axios";

export const API_BASE_URL = "http://0.0.0.0:8080"; // если у бэка другой порт/префикс — поменяй

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper for error messages
export function handleApiError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    return (e.response?.data as any)?.message || e.message;
  }
  return String(e);
}
