import { ApiResponse } from "./http";

export function sendAdminError(res: ApiResponse, error: unknown, context: string, message: string): void {
  console.error(`[admin:${context}]`, error);
  res.status(500).json({ error: message });
}
