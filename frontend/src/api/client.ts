// src/api/client.ts
import axios from "axios";

function normalizeBaseUrl(input: string): string {
  let base = input.trim();
  base = base.replace(/\/+$/, "");

  // Allow users to accidentally pass ".../api" without breaking all requests.
  if (base.toLowerCase().endsWith("/api")) {
    base = base.slice(0, -4);
  }

  return base;
}

// Prefer explicit env, fallback to current hostname.
const hostname = window.location.hostname;
const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL) as
  | string
  | undefined;

export const API_BASE_URL = envBaseUrl ? normalizeBaseUrl(envBaseUrl) : `http://${hostname}:8080`;

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
