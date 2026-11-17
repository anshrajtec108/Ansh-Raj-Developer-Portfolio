async function authRequest<T>(method: "GET" | "POST" | "DELETE", password?: string): Promise<T> {
  const response = await fetch("/api/admin/auth", {
    method,
    credentials: "same-origin",
    headers: method === "POST" ? { "content-type": "application/json" } : undefined,
    body: method === "POST" ? JSON.stringify({ password }) : undefined,
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
      : "Admin authentication could not be completed.";
    throw new Error(message);
  }
  return payload as T;
}

function clearLegacyClientAuth(): void {
  if (typeof window !== "undefined") localStorage.removeItem("portfolio:auth");
}

export async function login(password: string): Promise<void> {
  clearLegacyClientAuth();
  await authRequest<{ authenticated: boolean }>("POST", password);
}

export async function logout(): Promise<void> {
  clearLegacyClientAuth();
  await authRequest<{ authenticated: boolean }>("DELETE");
}

export async function isAuthenticated(): Promise<boolean> {
  clearLegacyClientAuth();
  const result = await authRequest<{ authenticated: boolean }>("GET");
  return result.authenticated;
}
