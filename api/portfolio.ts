import { dbRequest } from "./_lib/db";
import { ApiRequest, ApiResponse } from "./_lib/http";
import { sendAdminError } from "./_lib/admin-http";
import type { PortfolioData } from "../src/types";

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const rows = await dbRequest<Array<{ data: PortfolioData }>>("portfolio_content", "GET", {
      id: "eq.main",
      select: "data",
      limit: "1",
    });
    const data = rows[0]?.data;
    res.status(200).json({
      data: data ? { ...data, engineeringNotes: data.engineeringNotes.filter((note) => note.visible) } : null,
    });
  } catch (error) {
    sendAdminError(res, error, "public-portfolio", "Published portfolio data is temporarily unavailable.");
  }
}
