import { DEFAULT_ALLOCATIONS, SPRINT_END, SPRINT_ID, SPRINT_START, type Track } from "../../shared/sprint.js";
import { dbRequest } from "../_lib/db.js";
import { type ApiRequest, type ApiResponse, jsonBody, requireSession, sendError } from "../_lib/http.js";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const tracks = new Set<Track>(["backend", "ai", "dsa"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const collectionNames = ["days", "tasks", "study_sessions", "engineering_work", "reflections", "reschedules", "recovery_events"] as const;

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function inSprint(value: unknown): value is string {
  return isDate(value) && value >= SPRINT_START && value <= SPRINT_END;
}

function records(value: unknown, name: string): Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length > 2000 ||
      value.some((entry) => typeof entry !== "object" || entry === null || Array.isArray(entry))) {
    throw new Error(`Backup ${name} is malformed.`);
  }
  return value as Record<string, unknown>[];
}

function recordId(value: unknown, name: string): string {
  if (typeof value !== "string" || !uuidPattern.test(value)) throw new Error(`Backup ${name} contains an invalid id.`);
  return value;
}

function safeText(value: unknown, name: string, max = 5000): string {
  if (typeof value !== "string" || value.length > max) throw new Error(`Backup ${name} contains invalid text.`);
  return value;
}

function safeMinutes(value: unknown, name: string, min = 0): number {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > 1440) {
    throw new Error(`Backup ${name} contains invalid minutes.`);
  }
  return value as number;
}

function safeTrack(value: unknown): Track {
  if (typeof value !== "string" || !tracks.has(value as Track)) throw new Error("Backup contains an invalid track.");
  return value as Track;
}

function safeAllocations(value: unknown): typeof DEFAULT_ALLOCATIONS {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Backup contains invalid day allocations.");
  const item = value as Record<string, unknown>;
  const allocations = {
    backend: safeMinutes(item.backend, "backend allocation"),
    ai: safeMinutes(item.ai, "AI allocation"),
    dsa: safeMinutes(item.dsa, "DSA allocation"),
  };
  if (allocations.backend + allocations.ai + allocations.dsa > 1440) throw new Error("Backup daily allocations exceed 24 hours.");
  return allocations;
}

async function upsert(table: string, items: unknown[], conflict = "id"): Promise<void> {
  if (items.length) await dbRequest(table, "POST", { on_conflict: conflict }, items, "resolution=merge-duplicates,return=minimal");
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (!requireSession(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const body = jsonBody(req);
  if (!body || body.app !== "ansh-raj-portfolio-sprint-tracker" || body.version !== 1 ||
      typeof body.snapshot !== "object" || body.snapshot === null || Array.isArray(body.snapshot)) {
    res.status(400).json({ error: "This backup format is not supported." });
    return;
  }

  try {
    const snapshot = body.snapshot as Record<string, unknown>;
    if (typeof snapshot.sprint !== "object" || snapshot.sprint === null ||
        (snapshot.sprint as { id?: unknown }).id !== SPRINT_ID) {
      res.status(400).json({ error: "The backup belongs to a different sprint." });
      return;
    }

    const backupCollections = Object.fromEntries(collectionNames.map((name) => [name, records(snapshot[name], name)])) as Record<(typeof collectionNames)[number], Record<string, unknown>[]>;
    if (backupCollections.days.length !== 15) throw new Error("A sprint backup must include all 15 days.");

    const idByDate = new Map<string, string>();
    const days = backupCollections.days.map((day) => {
      const dayId = recordId(day.id, "sprint day");
      const dayDate = day.day_date ?? day.date;
      if (!inSprint(dayDate) || !Number.isInteger(day.day_number) || Number(day.day_number) < 1 || Number(day.day_number) > 15) {
        throw new Error("Backup contains an invalid sprint day.");
      }
      if (typeof day.is_leave !== "boolean" || !["planned", "completed", "missed", "leave"].includes(String(day.status))) {
        throw new Error("Backup contains an invalid sprint day status.");
      }
      idByDate.set(String(dayDate), dayId);
      return {
        id: dayId, sprint_id: SPRINT_ID, day_number: day.day_number, day_date: dayDate,
        status: day.status, is_leave: day.is_leave, target_minutes: safeMinutes(day.target_minutes, "daily target"),
        allocations: safeAllocations(day.allocations), notes: safeText(day.notes ?? "", "day notes"),
        completion_at: typeof day.completion_at === "string" ? day.completion_at : null,
      };
    });

    const tasks = backupCollections.tasks.map((task) => {
      if (!inSprint(task.scheduled_date) || !inSprint(task.original_scheduled_date) || !idByDate.has(String(task.scheduled_date))) {
        throw new Error("Backup contains a task scheduled outside this sprint.");
      }
      if (typeof task.title !== "string" || !task.title.trim() || task.title.length > 200 ||
          !["pending", "completed"].includes(String(task.status)) ||
          !["low", "medium", "high"].includes(String(task.priority))) {
        throw new Error("Backup contains an invalid task.");
      }
      return {
        id: recordId(task.id, "task"), sprint_id: SPRINT_ID, day_id: idByDate.get(String(task.scheduled_date)),
        track: safeTrack(task.track), title: task.title, description: safeText(task.description ?? "", "task description"),
        sort_order: Number.isInteger(task.sort_order) ? task.sort_order : 0, priority: task.priority, status: task.status,
        completion_at: typeof task.completion_at === "string" ? task.completion_at : null,
        original_scheduled_date: task.original_scheduled_date, scheduled_date: task.scheduled_date,
        rescheduled_from_date: inSprint(task.rescheduled_from_date) ? task.rescheduled_from_date : null,
        is_predefined: task.is_predefined === true, notes: safeText(task.notes ?? "", "task notes"),
      };
    });

    const sessions = backupCollections.study_sessions.map((item) => {
      if (!inSprint(item.study_date)) throw new Error("Backup contains a study entry outside the sprint.");
      return {
        id: recordId(item.id, "study session"), sprint_id: SPRINT_ID, study_date: item.study_date,
        track: safeTrack(item.track), focused_minutes: safeMinutes(item.focused_minutes, "focused time", 1),
        notes: safeText(item.notes ?? "", "study note"),
      };
    });

    const work = backupCollections.engineering_work.map((item) => {
      if (!inSprint(item.work_date) || typeof item.project_name !== "string" || !item.project_name.trim() ||
          typeof item.title !== "string" || !item.title.trim()) throw new Error("Backup contains an invalid project entry.");
      const technologies = item.technologies ?? [];
      if (!Array.isArray(technologies) || technologies.length > 30 ||
          technologies.some((value) => typeof value !== "string" || value.length > 80)) {
        throw new Error("Backup contains invalid technology labels.");
      }
      return {
        id: recordId(item.id, "engineering work"), sprint_id: SPRINT_ID, work_date: item.work_date,
        project_name: safeText(item.project_name, "project name", 160), title: safeText(item.title, "work title", 200),
        description: safeText(item.description ?? "", "work description"), implementation: safeText(item.implementation ?? "", "implementation"),
        technologies, bugs: safeText(item.bugs ?? "", "bug notes"), experiments: safeText(item.experiments ?? "", "experiment notes"),
        learning_outcomes: safeText(item.learning_outcomes ?? "", "learning outcomes"),
        minutes_spent: safeMinutes(item.minutes_spent, "work time"), notes: safeText(item.notes ?? "", "work notes"),
      };
    });

    const reflections = backupCollections.reflections.map((item) => {
      if (!inSprint(item.reflection_date)) throw new Error("Backup contains a reflection outside the sprint.");
      return {
        id: recordId(item.id, "reflection"), sprint_id: SPRINT_ID, reflection_date: item.reflection_date,
        learned: safeText(item.learned ?? "", "reflection"), clear_topics: safeText(item.clear_topics ?? "", "reflection"),
        difficult_topics: safeText(item.difficult_topics ?? "", "reflection"), revisit: safeText(item.revisit ?? "", "reflection"),
        tomorrow_focus: safeText(item.tomorrow_focus ?? "", "reflection"), remarks: safeText(item.remarks ?? "", "reflection"),
      };
    });

    const reschedules = backupCollections.reschedules.map((item) => {
      if (!inSprint(item.from_date) || !inSprint(item.to_date) || item.from_date === item.to_date) {
        throw new Error("Backup contains invalid rescheduling history.");
      }
      return {
        id: recordId(item.id, "reschedule"), task_id: recordId(item.task_id, "rescheduled task"),
        from_date: item.from_date, to_date: item.to_date, reason: safeText(item.reason ?? "", "reschedule reason", 2000),
      };
    });

    const recoveryEvents = backupCollections.recovery_events.map((item) => {
      if (!inSprint(item.missed_date) || (item.recovery_date !== null && item.recovery_date !== undefined && !inSprint(item.recovery_date))) {
        throw new Error("Backup contains an invalid recovery event.");
      }
      return {
        id: recordId(item.id, "recovery event"), sprint_id: SPRINT_ID, missed_date: item.missed_date,
        reason: safeText(item.reason ?? "", "recovery reason", 2000), recovery_date: item.recovery_date ?? null,
      };
    });

    await upsert("sprint_days", days);
    await upsert("tasks", tasks);
    await upsert("task_reschedules", reschedules);
    await upsert("study_sessions", sessions);
    await upsert("engineering_work", work);
    if (reflections.length) {
      await dbRequest("daily_reflections", "POST", { on_conflict: "sprint_id,reflection_date" }, reflections, "resolution=merge-duplicates,return=minimal");
    }
    if (recoveryEvents.length) {
      await dbRequest("recovery_events", "POST", { on_conflict: "sprint_id,missed_date" }, recoveryEvents, "resolution=merge-duplicates,return=minimal");
    }
    res.status(200).json({ imported: true, counts: {
      days: days.length, tasks: tasks.length, study_sessions: sessions.length,
      engineering_work: work.length, reflections: reflections.length,
      reschedules: reschedules.length, recovery_events: recoveryEvents.length,
    } });
  } catch (error) {
    if (error instanceof Error && !error.message.startsWith("Supabase ")) {
      res.status(400).json({ error: error.message });
      return;
    }
    sendError(res, error, "import");
  }
}