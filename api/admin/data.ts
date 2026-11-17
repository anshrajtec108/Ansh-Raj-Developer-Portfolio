import { dbRequest } from "../_lib/db";
import { ApiRequest, ApiResponse, jsonBody } from "../_lib/http";
import { hasAdminSession, sameOriginRequest } from "../_lib/admin-auth";
import { sendAdminError } from "../_lib/admin-http";
import type { PortfolioData } from "../../src/types";

const MAX_PORTFOLIO_BYTES = 1_000_000;

function isPortfolioData(value: unknown): value is PortfolioData {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  return typeof data.profile === "object" && data.profile !== null &&
    Array.isArray(data.skills) && Array.isArray(data.projects) &&
    Array.isArray(data.certifications) && Array.isArray(data.proofs) &&
    Array.isArray(data.engineeringNotes);
}

async function loadPortfolio(): Promise<PortfolioData | null> {
  const rows = await dbRequest<Array<{ data: PortfolioData }>>("portfolio_content", "GET", {
    id: "eq.main",
    select: "data",
    limit: "1",
  });
  return rows[0]?.data ?? null;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  if (!hasAdminSession(req)) {
    res.status(401).json({ error: "Admin session required." });
    return;
  }

  if (req.method === "GET") {
    try {
      res.status(200).json({ data: await loadPortfolio() });
    } catch (error) {
      sendAdminError(res, error, "admin-data-load", "Portfolio data could not be loaded. Please retry.");
    }
    return;
  }

  if (req.method !== "PUT") {
    res.setHeader("Allow", "GET, PUT");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  if (!sameOriginRequest(req)) {
    res.status(403).json({ error: "This request is not allowed." });
    return;
  }

  const body = jsonBody(req);
  if (!body || !isPortfolioData(body.data)) {
    res.status(400).json({ error: "Portfolio data has an invalid structure." });
    return;
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(body.data);
  } catch {
    res.status(400).json({ error: "Portfolio data could not be serialized." });
    return;
  }
  if (Buffer.byteLength(serialized, "utf8") > MAX_PORTFOLIO_BYTES) {
    res.status(413).json({ error: "Portfolio data is too large." });
    return;
  }

  try {
    await dbRequest("portfolio_content", "POST", { on_conflict: "id" }, [{
      id: "main",
      data: body.data,
      updated_at: new Date().toISOString(),
    }], "resolution=merge-duplicates,return=minimal");
    res.status(200).json({ saved: true });
  } catch (error) {
    sendAdminError(res, error, "admin-data-save", "Portfolio data could not be saved. Please retry.");
  }
}
