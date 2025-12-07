// src/api/client.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080", // если у бэка другой порт/префикс — поменяй
});

// Простой helper для ошибок
export function handleApiError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    return (e.response?.data as any)?.message || e.message;
  }
  return String(e);
}
