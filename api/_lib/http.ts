import { createHmac, timingSafeEqual } from "node:crypto";

export interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: { remoteAddress?: string };
  query?: Record<string, string | string[]>;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string | string[]): void;
  end(): void;
}

const SESSION_COOKIE = "sprint_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function header(req: ApiRequest, name: string): string {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function cookieValue(req: ApiRequest, name: string): string | null {
  const cookies = header(req, "cookie").split(";");
  const pair = cookies.map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
}

function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function issueSessionCookie(secret: string): string {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })).toString("base64url");
  const token = `${payload}.${signature(payload, secret)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/api/sprint; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/api/sprint; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function hasValidSession(req: ApiRequest): boolean {
  const token = cookieValue(req, SESSION_COOKIE);
  const secret = process.env.SPRINT_SESSION_SECRET;
  if (!token || !secret) return false;
  const [payload, providedSignature, ...extra] = token.split(".");
  if (!payload || !providedSignature || extra.length > 0) return false;
  const expected = signature(payload, secret);
  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(providedSignature);
  if (expectedBytes.length !== providedBytes.length || !timingSafeEqual(expectedBytes, providedBytes)) return false;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof parsed === "object" && parsed !== null && "exp" in parsed &&
      typeof parsed.exp === "number" && parsed.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function requireSession(req: ApiRequest, res: ApiResponse): boolean {
  if (hasValidSession(req)) return true;
  res.status(401).json({ error: "Your session has expired. Enter your PIN to continue." });
  return false;
}

export function jsonBody(req: ApiRequest): Record<string, unknown> | null {
  if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) return null;
  return req.body as Record<string, unknown>;
}

export function sendError(res: ApiResponse, error: unknown, context: string): void {
  console.error(`[sprint:${context}]`, error);
  res.status(500).json({ error: "The tracker could not complete this request. Please retry." });
}

export function clientKey(req: ApiRequest): string {
  const realIp = header(req, "x-real-ip");
  if (realIp) return realIp.trim();
  const forwarded = header(req, "x-forwarded-for").split(",")[0]?.trim();
  return forwarded || req.socket?.remoteAddress || "unknown-client";
}

export function sameSecret(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export { SESSION_TTL_SECONDS };
