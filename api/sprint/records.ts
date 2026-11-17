import { DEFAULT_ALLOCATIONS, SPRINT_END, SPRINT_ID, SPRINT_START, Track } from "../../shared/sprint";
import { dbRequest } from "../_lib/db";
import { ApiRequest, ApiResponse, jsonBody, requireSession, sendError } from "../_lib/http";

type RecordType = "tasks" | "study_sessions" | "engineering_work" | "daily_reflections" | "sprint_days" | "recovery_events";
type JsonRecord = Record<string, unknown>;

const TRACKS = new Set<Track>(["backend", "ai", "dsa"]);
const TYPES = new Set<RecordType>(["tasks", "study_sessions", "engineering_work", "daily_reflections", "sprint_days", "recovery_events"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const fields: Record<RecordType, Set<string>> = {
  tasks: new Set(["title", "description", "track", "priority", "status", "scheduled_date", "sort_order", "notes"]),
  study_sessions: new Set(["study_date", "track", "focused_minutes", "notes"]),
  engineering_work: new Set(["work_date", "project_name", "title", "description", "implementation", "technologies", "bugs", "experiments", "learning_outcomes", "minutes_spent", "notes"]),
  daily_reflections: new Set(["learned", "clear_topics", "difficult_topics", "revisit", "tomorrow_focus", "remarks"]),
  sprint_days: new Set(["is_leave", "status", "target_minutes", "allocations", "notes"]),
  recovery_events: new Set(["missed_date", "reason", "recovery_date"]),
};

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function withinSprint(value: unknown): value is string {
  return isDate(value) && value >= SPRINT_START && value <= SPRINT_END;
}

function string(value: unknown, name: string, required = false, max = 5000): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) {
    throw new Error(`${name} is invalid.`);
  }
  return value;
}

function integer(value: unknown, name: string, min: number, max: number): number {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw new Error(`${name} must be between ${min} and ${max}.`);
  }
  return value as number;
}

function allowedFields(type: RecordType, record: JsonRecord, creating: boolean): JsonRecord {
  const safe: JsonRecord = {};
  for (const [key, value] of Object.entries(record)) {
    if (!fields[type].has(key)) throw new Error(`The ${key} field cannot be changed.`);
    safe[key] = value;
  }
  if (type === "tasks") {
    if (safe.title !== undefined) safe.title = string(safe.title, "Task title", true, 200);
    if (safe.description !== undefined) safe.description = string(safe.description, "Description");
    if (safe.notes !== undefined) safe.notes = string(safe.notes, "Task notes");
    if (safe.track !== undefined && !TRACKS.has(safe.track as Track)) throw new Error("Choose a valid track.");
    if (safe.priority !== undefined && !["low", "medium", "high"].includes(String(safe.priority))) throw new Error("Choose a valid priority.");
    if (safe.status !== undefined && !["pending", "completed"].includes(String(safe.status))) throw new Error("Choose a valid task status.");
    if (safe.sort_order !== undefined) safe.sort_order = integer(safe.sort_order, "Sort order", 0, 100000);
    if (safe.scheduled_date !== undefined && !withinSprint(safe.scheduled_date)) throw new Error("Tasks must be scheduled within the sprint.");
    if (safe.status === "completed") safe.completion_at = new Date().toISOString();
    else if (safe.status === "pending") safe.completion_at = null;
  } else if (type === "study_sessions") {
    if (safe.study_date !== undefined && !withinSprint(safe.study_date)) throw new Error("Study entries must be dated within the sprint.");
    if (safe.track !== undefined && !TRACKS.has(safe.track as Track)) throw new Error("Choose a valid track.");
    if (safe.focused_minutes !== undefined) safe.focused_minutes = integer(safe.focused_minutes, "Focused minutes", 1, 1440);
    if (safe.notes !== undefined) safe.notes = string(safe.notes, "Session notes");
    if (creating && (safe.study_date === undefined || safe.track === undefined || safe.focused_minutes === undefined)) {
      throw new Error("Date, track, and focused minutes are required.");
    }
  } else if (type === "engineering_work") {
    if (safe.work_date !== undefined && !withinSprint(safe.work_date)) throw new Error("Work entries must be dated within the sprint.");
    if (safe.project_name !== undefined) safe.project_name = string(safe.project_name, "Project name", true, 160);
    if (safe.title !== undefined) safe.title = string(safe.title, "Work title", true, 200);
    if (safe.minutes_spent !== undefined) safe.minutes_spent = integer(safe.minutes_spent, "Minutes spent", 0, 1440);
    if (safe.technologies !== undefined && (!Array.isArray(safe.technologies) || safe.technologies.length > 30 || safe.technologies.some((item) => typeof item !== "string" || item.length > 80))) {
      throw new Error("Technologies must be a list of short text values.");
    }
    for (const key of ["description", "implementation", "bugs", "experiments", "learning_outcomes", "notes"]) {
      if (safe[key] !== undefined) safe[key] = string(safe[key], key);
    }
    if (creating && (safe.work_date === undefined || safe.project_name === undefined || safe.title === undefined)) {
      throw new Error("Date, project name, and work title are required.");
    }
  } else if (type === "daily_reflections") {
    for (const key of ["learned", "clear_topics", "difficult_topics", "revisit", "tomorrow_focus", "remarks"]) {
      if (safe[key] !== undefined) safe[key] = string(safe[key], key);
    }
  } else if (type === "sprint_days") {
    if (safe.is_leave !== undefined && typeof safe.is_leave !== "boolean") throw new Error("Leave day must be true or false.");
    if (safe.status !== undefined && !["planned", "completed", "missed", "leave"].includes(String(safe.status))) throw new Error("Choose a valid day status.");
    if (safe.target_minutes !== undefined) safe.target_minutes = integer(safe.target_minutes, "Daily target", 0, 1440);
    if (safe.allocations !== undefined) {
      if (typeof safe.allocations !== "object" || safe.allocations === null || Array.isArray(safe.allocations)) throw new Error("Allocations are invalid.");
      const allocations = safe.allocations as Record<string, unknown>;
      if (Object.keys(allocations).some((key) => !TRACKS.has(key as Track))) throw new Error("Allocations contain an unknown track.");
      safe.allocations = {
        backend: integer(allocations.backend, "Backend allocation", 0, 1440),
        ai: integer(allocations.ai, "AI allocation", 0, 1440),
        dsa: integer(allocations.dsa, "DSA allocation", 0, 1440),
      };
      if (Object.values(safe.allocations as typeof DEFAULT_ALLOCATIONS).reduce((sum, item) => sum + item, 0) > 1440) {
        throw new Error("Daily allocations cannot exceed 24 hours.");
      }
    }
    if (safe.notes !== undefined) safe.notes = string(safe.notes, "Day notes");
  } else if (type === "recovery_events") {
    if (safe.missed_date !== undefined && !withinSprint(safe.missed_date)) throw new Error("Choose a missed date within this sprint.");
    if (safe.recovery_date !== undefined && safe.recovery_date !== null && !withinSprint(safe.recovery_date)) throw new Error("Choose a recovery date within this sprint.");
    if (safe.reason !== undefined) safe.reason = string(safe.reason, "Recovery reason", false, 2000);
    if (creating && !withinSprint(record.missed_date)) throw new Error("A valid missed date is required.");
  }
  return safe;
}

async function findDay(date: string): Promise<{ id: string; day_date: string }> {
  const days = await dbRequest<Array<{ id: string; day_date: string }>>("sprint_days", "GET", {
    sprint_id: `eq.${SPRINT_ID}`,
    day_date: `eq.${date}`,
    select: "id,day_date",
    limit: "1",
  });
  if (!days[0]) throw new Error("That sprint day could not be found.");
  return days[0];
}

async function refreshDayStatus(dayId: string): Promise<void> {
  const [day, tasks] = await Promise.all([
    dbRequest<Array<{ id: string; is_leave: boolean }>>("sprint_days", "GET", { id: `eq.${dayId}`, select: "id,is_leave", limit: "1" }),
    dbRequest<Array<{ status: string }>>("tasks", "GET", { day_id: `eq.${dayId}`, select: "status" }),
  ]);
  if (!day[0]) return;
  const completed = tasks.length > 0 && tasks.every((task) => task.status === "completed");
  const status = day[0].is_leave ? "leave" : completed ? "completed" : "planned";
  await dbRequest("sprint_days", "PATCH", { id: `eq.${dayId}` }, {
    status,
    completion_at: completed ? new Date().toISOString() : null,
  });
}

async function handleCreate(type: RecordType, body: JsonRecord): Promise<unknown> {
  if (typeof body.record !== "object" || body.record === null || Array.isArray(body.record)) throw new Error("Record data is invalid.");
  const recordInput = body.record as JsonRecord;
  const payload = allowedFields(type, recordInput, true);
  if (type === "tasks") {
    const date = String(payload.scheduled_date ?? "");
    if (!withinSprint(date)) throw new Error("Choose a scheduled sprint date.");
    const day = await findDay(date);
    const record = await dbRequest<unknown[]>("tasks", "POST", {}, [{
      ...payload,
      sprint_id: SPRINT_ID,
      day_id: day.id,
      original_scheduled_date: date,
      scheduled_date: date,
      is_predefined: false,
    }]);
    await refreshDayStatus(day.id);
    return record;
  }
  if (type === "study_sessions" || type === "engineering_work") {
    const record = await dbRequest<unknown[]>(type, "POST", {}, [{ ...payload, sprint_id: SPRINT_ID }]);
    return record;
  }
  if (type === "daily_reflections") {
    const reflectionDate = body.reflection_date;
    if (!withinSprint(reflectionDate)) throw new Error("Choose a reflection date within the sprint.");
    return dbRequest<unknown[]>("daily_reflections", "POST", { on_conflict: "sprint_id,reflection_date" }, [{
      ...payload,
      sprint_id: SPRINT_ID,
      reflection_date: reflectionDate,
    }], "resolution=merge-duplicates,return=representation");
  }
  if (type === "recovery_events") {
    return dbRequest<unknown[]>("recovery_events", "POST", { on_conflict: "sprint_id,missed_date" }, [{
      ...payload,
      sprint_id: SPRINT_ID,
    }], "resolution=merge-duplicates,return=representation");
  }
  throw new Error("This record cannot be created.");
}

async function handleUpdate(type: RecordType, id: string, body: JsonRecord): Promise<unknown> {
  if (!uuidPattern.test(id)) throw new Error("Record id is invalid.");
  const payload = allowedFields(type, body.updates as JsonRecord, false);
  if (Object.keys(payload).length === 0) throw new Error("No valid changes were provided.");

  if (type === "tasks" && payload.scheduled_date) {
    const day = await findDay(String(payload.scheduled_date));
    payload.day_id = day.id;
  }
  const existing = type === "tasks"
    ? await dbRequest<Array<{ day_id: string }>>("tasks", "GET", { id: `eq.${id}`, select: "day_id", limit: "1" })
    : [];
  if (type === "tasks" && existing.length === 0) throw new Error("Task was not found.");
  const response = await dbRequest<unknown[]>(type, "PATCH", { id: `eq.${id}` }, payload);
  if (type === "tasks") {
    const updated = response[0] as { day_id?: string } | undefined;
    await Promise.all([refreshDayStatus(existing[0].day_id), ...(updated?.day_id && updated.day_id !== existing[0].day_id ? [refreshDayStatus(updated.day_id)] : [])]);
  }
  return response;
}

async function handleDelete(type: RecordType, id: string): Promise<unknown> {
  if (!uuidPattern.test(id)) throw new Error("Record id is invalid.");
  if (!["tasks", "study_sessions", "engineering_work", "recovery_events"].includes(type)) {
    throw new Error("This record cannot be deleted.");
  }
  let dayId: string | null = null;
  if (type === "tasks") {
    const existing = await dbRequest<Array<{ day_id: string }>>("tasks", "GET", { id: `eq.${id}`, select: "day_id", limit: "1" });
    dayId = existing[0]?.day_id ?? null;
  }
  const response = await dbRequest<unknown[]>(type, "DELETE", { id: `eq.${id}` });
  if (dayId) await refreshDayStatus(dayId);
  return response;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (!requireSession(req, res)) return;
  if (!["POST", "PATCH", "DELETE"].includes(req.method ?? "")) {
    res.setHeader("Allow", "POST, PATCH, DELETE");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }
  const body = jsonBody(req);
  if (!body || typeof body.type !== "string" || !TYPES.has(body.type as RecordType)) {
    res.status(400).json({ error: "Choose a valid record type." });
    return;
  }

  try {
    const type = body.type as RecordType;
    let result: unknown;
    if (req.method === "POST") result = await handleCreate(type, body);
    else if (req.method === "PATCH") {
      if (typeof body.id !== "string") throw new Error("Record id is required.");
      result = await handleUpdate(type, body.id, body);
    } else {
      if (typeof body.id !== "string") throw new Error("Record id is required.");
      result = await handleDelete(type, body.id);
    }
    res.status(200).json({ data: result });
  } catch (error) {
    if (error instanceof Error && !error.message.startsWith("Supabase ")) {
      res.status(400).json({ error: error.message });
      return;
    }
    sendError(res, error, "record");
  }
}
