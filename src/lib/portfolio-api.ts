import type { PortfolioData } from "@/types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The server returned an unreadable response.");
  }
  if (!response.ok) {
    const message = typeof payload === "object" && payload !== null &&
      "error" in payload && typeof payload.error === "string"
      ? payload.error
      : "The portfolio request could not be completed.";
    throw new Error(message);
  }
  return payload as T;
}

export async function loadPublishedPortfolio(): Promise<PortfolioData | null> {
  const response = await request<{ data: PortfolioData | null }>("/api/portfolio");
  return response.data;
}

export async function loadAdminPortfolio(): Promise<PortfolioData | null> {
  const response = await request<{ data: PortfolioData | null }>("/api/admin/data");
  return response.data;
}

export async function saveAdminPortfolio(data: PortfolioData): Promise<void> {
  await request("/api/admin/data", {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
}
