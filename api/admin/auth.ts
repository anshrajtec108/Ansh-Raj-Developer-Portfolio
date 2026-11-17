import {
  adminIsConfigured,
  adminPasswordMatches,
  checkAdminLoginRateLimit,
  clearAdminCookie,
  hasAdminSession,
  issueAdminCookie,
  resetAdminLoginRateLimit,
  sameOriginRequest,
} from "../_lib/admin-auth";
import { ApiRequest, ApiResponse, jsonBody } from "../_lib/http";
import { sendAdminError } from "../_lib/admin-http";

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    res.status(200).json({ authenticated: hasAdminSession(req), configured: adminIsConfigured() });
    return;
  }

  if (!sameOriginRequest(req)) {
    res.status(403).json({ error: "This request is not allowed." });
    return;
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearAdminCookie());
    res.status(200).json({ authenticated: false });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, DELETE");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  if (!adminIsConfigured()) {
    res.status(503).json({ error: "Admin access is not configured on the server." });
    return;
  }

  const body = jsonBody(req);
  if (!body || typeof body.password !== "string" || body.password.length < 1 || body.password.length > 1024) {
    res.status(400).json({ error: "Enter a valid password." });
    return;
  }

  try {
    const limit = await checkAdminLoginRateLimit(req, false);
    if (!limit.allowed) {
      res.status(429).json({
        error: "Too many login attempts. Try again after the lockout period.",
        retryAfter: limit.retry_after_seconds,
      });
      return;
    }

    if (!adminPasswordMatches(body.password)) {
      const failure = await checkAdminLoginRateLimit(req, true);
      if (!failure.allowed) {
        res.status(429).json({
          error: "Too many login attempts. Try again after the lockout period.",
          retryAfter: failure.retry_after_seconds,
        });
        return;
      }
      res.status(401).json({ error: "Invalid password." });
      return;
    }

    await resetAdminLoginRateLimit(req);
    res.setHeader("Set-Cookie", issueAdminCookie());
    res.status(200).json({ authenticated: true });
  } catch (error) {
    sendAdminError(res, error, "admin-auth", "Admin authentication could not be completed. Please retry.");
  }
}
