import { createHmac } from "node:crypto";
import { rpc, serverConfigIsPresent } from "../_lib/db";
import {
  ApiRequest,
  ApiResponse,
  clearSessionCookie,
  clientKey,
  hasValidSession,
  issueSessionCookie,
  jsonBody,
  sameSecret,
  sendError,
} from "../_lib/http";

interface RateLimitResult {
  allowed: boolean;
  retry_after_seconds: number;
}

function maskedClientKey(req: ApiRequest): string {
  const secret = process.env.SPRINT_SESSION_SECRET;
  if (!secret) throw new Error("Sprint session secret is not configured.");
  return createHmac("sha256", secret).update(clientKey(req)).digest("hex");
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method === "GET") {
    res.status(200).json({ authenticated: hasValidSession(req), configured: serverConfigIsPresent() });
    return;
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearSessionCookie());
    res.status(200).json({ authenticated: false });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, DELETE");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const configuredPin = process.env.SPRINT_ACCESS_PIN;
  const sessionSecret = process.env.SPRINT_SESSION_SECRET;
  if (!configuredPin || !sessionSecret || sessionSecret.length < 32) {
    res.status(503).json({ error: "Private tracker access has not been configured on the server." });
    return;
  }

  const body = jsonBody(req);
  if (!body || typeof body.pin !== "string" || body.pin.length < 1 || body.pin.length > 128) {
    res.status(400).json({ error: "Enter a valid PIN." });
    return;
  }

  try {
    const clientHash = maskedClientKey(req);
    const allowed = await rpc<RateLimitResult[]>("check_sprint_pin_rate_limit", {
      p_client_key: clientHash,
      p_record_failure: false,
    });
    const limit = allowed[0];
    if (!limit?.allowed) {
      res.status(429).json({ error: "Too many attempts. Try again after the lockout period.", retryAfter: limit?.retry_after_seconds ?? 900 });
      return;
    }

    if (!sameSecret(body.pin, configuredPin)) {
      const failure = await rpc<RateLimitResult[]>("check_sprint_pin_rate_limit", {
        p_client_key: clientHash,
        p_record_failure: true,
      });
      const failedLimit = failure[0];
      if (!failedLimit?.allowed) {
        res.status(429).json({ error: "Too many attempts. Try again after the lockout period.", retryAfter: failedLimit?.retry_after_seconds ?? 900 });
        return;
      }
      res.status(401).json({ error: "That PIN did not match. Please try again." });
      return;
    }

    await rpc("reset_sprint_pin_rate_limit", { p_client_key: clientHash });
    res.setHeader("Set-Cookie", issueSessionCookie(sessionSecret));
    res.status(200).json({ authenticated: true });
  } catch (error) {
    sendError(res, error, "pin");
  }
}
