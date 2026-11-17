import { createHmac, timingSafeEqual } from "node:crypto";
import { rpc } from "./db";
import { ApiRequest, clientKey } from "./http";

const COOKIE_NAME = "portfolio_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

interface LoginRateLimitResult {
  allowed: boolean;
  retry_after_seconds: number;
}

function sessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export function adminIsConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SECRET_KEY &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_PASSWORD.length >= 16 &&
    process.env.ADMIN_PASSWORD.length <= 1024 &&
    sessionSecret(),
  );
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function cookieToken(req: ApiRequest): string | null {
  const value = req.headers.cookie;
  const cookieHeader = Array.isArray(value) ? value[0] ?? "" : value ?? "";
  const pair = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return pair ? pair.slice(COOKIE_NAME.length + 1) : null;
}

export function hasAdminSession(req: ApiRequest): boolean {
  const secret = sessionSecret();
  const token = cookieToken(req);
  if (!secret || !token) return false;

  const [payload, providedSignature, ...extra] = token.split(".");
  if (!payload || !providedSignature || extra.length > 0) return false;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(providedSignature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;

  try {
    const value: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof value === "object" && value !== null &&
      "sub" in value && value.sub === "admin" &&
      "exp" in value && typeof value.exp === "number" &&
      value.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function issueAdminCookie(): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("Admin session configuration is missing.");

  const payload = Buffer.from(JSON.stringify({
    sub: "admin",
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  })).toString("base64url");
  const token = `${payload}.${sign(payload, secret)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearAdminCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function sameOriginRequest(req: ApiRequest): boolean {
  const originValue = req.headers.origin;
  const hostValue = req.headers["x-forwarded-host"] ?? req.headers.host;
  const origin = Array.isArray(originValue) ? originValue[0] : originValue;
  const host = Array.isArray(hostValue) ? hostValue[0] : hostValue;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export async function checkAdminLoginRateLimit(req: ApiRequest, recordFailure: boolean): Promise<LoginRateLimitResult> {
  const secret = sessionSecret();
  if (!secret) throw new Error("Admin session configuration is missing.");
  const key = createHmac("sha256", secret).update(`admin-login:${clientKey(req)}`).digest("hex");
  const results = await rpc<LoginRateLimitResult[]>("check_portfolio_admin_login_rate_limit", {
    p_client_key: key,
    p_record_failure: recordFailure,
  });
  if (!results[0]) throw new Error("Admin rate-limit response was empty.");
  return results[0];
}

export async function resetAdminLoginRateLimit(req: ApiRequest): Promise<void> {
  const secret = sessionSecret();
  if (!secret) throw new Error("Admin session configuration is missing.");
  const key = createHmac("sha256", secret).update(`admin-login:${clientKey(req)}`).digest("hex");
  await rpc("reset_portfolio_admin_login_rate_limit", { p_client_key: key });
}

export function adminPasswordMatches(candidate: string): boolean {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return false;
  const expected = Buffer.from(configured);
  const actual = Buffer.from(candidate);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export { SESSION_TTL_SECONDS };
