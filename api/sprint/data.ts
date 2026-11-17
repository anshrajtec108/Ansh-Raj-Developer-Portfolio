import { DEFAULT_ALLOCATIONS, SPRINT_ID } from "../../shared/sprint";
import { dbRequest } from "../_lib/db";
import { ApiRequest, ApiResponse, requireSession, sendError } from "../_lib/http";

interface DayRow {
  id: string;
  day_number: number;
  day_date: string;
  status: "planned" | "completed" | "missed" | "leave";
  is_leave: boolean;
  target_minutes: number;
  allocations: typeof DEFAULT_ALLOCATIONS;
  notes: string;
  completion_at: string | null;
  updated_at: string;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }
  if (!requireSession(req, res)) return;
  try {
    const [sprints, days, tasks, sessions, work, reflections, reschedules, recoveryEvents] = await Promise.all([
      dbRequest<unknown[]>("sprints", "GET", { id: `eq.${SPRINT_ID}`, limit: "1" }),
      dbRequest<DayRow[]>("sprint_days", "GET", { sprint_id: `eq.${SPRINT_ID}`, order: "day_number.asc" }),
      dbRequest<unknown[]>("tasks", "GET", { sprint_id: `eq.${SPRINT_ID}`, order: "scheduled_date.asc,sort_order.asc,created_at.asc" }),
      dbRequest<unknown[]>("study_sessions", "GET", { sprint_id: `eq.${SPRINT_ID}`, order: "study_date.asc,created_at.asc" }),
      dbRequest<unknown[]>("engineering_work", "GET", { sprint_id: `eq.${SPRINT_ID}`, order: "work_date.desc,created_at.desc" }),
      dbRequest<unknown[]>("daily_reflections", "GET", { sprint_id: `eq.${SPRINT_ID}`, order: "reflection_date.asc" }),
      dbRequest<unknown[]>("task_reschedules", "GET", { order: "created_at.asc" }),
      dbRequest<unknown[]>("recovery_events", "GET", { sprint_id: `eq.${SPRINT_ID}`, order: "missed_date.asc" }),
    ]);
    const sprint = (sprints[0] ?? null) as Record<string, unknown> | null;
    if (!sprint) throw new Error("Sprint configuration could not be loaded.");
    const normalizedDays = days.map(({ day_date, ...day }) => ({ ...day, date: day_date }));
    res.status(200).json({
      sprint: {
        ...sprint,
        default_allocations: sprint.default_allocations ?? DEFAULT_ALLOCATIONS,
      },
      days: normalizedDays,
      tasks,
      study_sessions: sessions,
      engineering_work: work,
      reflections,
      reschedules,
      recovery_events: recoveryEvents,
    });
  } catch (error) {
    sendError(res, error, "load");
  }
}
