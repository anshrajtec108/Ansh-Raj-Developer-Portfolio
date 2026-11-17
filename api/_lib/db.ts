const env = process.env;

function config(): { url: string; key: string } {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase server configuration is missing.");
  return { url: url.replace(/\/$/, ""), key };
}

export async function dbRequest<T>(
  table: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: Record<string, string> = {},
  body?: unknown,
  prefer = "return=representation",
): Promise<T> {
  const { url, key } = config();
  const params = new URLSearchParams(query);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${url}/rest/v1/${table}${suffix}`, {
    method,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase request failed (${response.status}): ${text.slice(0, 500)}`);
  if (!text) return [] as T;
  return JSON.parse(text) as T;
}

export async function rpc<T>(functionName: string, body: unknown): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase RPC failed (${response.status}): ${text.slice(0, 500)}`);
  return (text ? JSON.parse(text) : null) as T;
}

export function serverConfigIsPresent(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SECRET_KEY && env.SPRINT_ACCESS_PIN && env.SPRINT_SESSION_SECRET);
}
