// src/api/client.ts
import axios from "axios";

export const API_BASE_URL = "http://localhost:8080"; // если у бэка другой порт/префикс — поменяй

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Простой helper для ошибок
export function handleApiError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    return (e.response?.data as any)?.message || e.message;
  }
  return String(e);
}
