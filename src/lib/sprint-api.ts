import type { EngineeringWork, SprintSnapshot, SprintTask, Track } from "@shared/sprint";

type RecordType = "tasks" | "study_sessions" | "engineering_work" | "daily_reflections" | "sprint_days" | "recovery_events";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The server returned an unreadable response. Please retry.");
  }
  if (!response.ok) {
    const error = typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string"
      ? payload.error
      : "The request could not be completed.";
    throw new Error(error);
  }
  return payload as T;
}

export async function checkSprintSession(): Promise<{ authenticated: boolean; configured: boolean }> {
  return request("/api/sprint/auth");
}

export async function unlockSprint(pin: string): Promise<void> {
  await request("/api/sprint/auth", { method: "POST", body: JSON.stringify({ pin }) });
}

export async function lockSprint(): Promise<void> {
  await request("/api/sprint/auth", { method: "DELETE" });
}

export async function loadSprint(): Promise<SprintSnapshot> {
  return request("/api/sprint/data");
}

export async function createSprintRecord<T>(type: RecordType, record: Record<string, unknown>, extra?: Record<string, unknown>): Promise<T> {
  const response = await request<{ data: T }>("/api/sprint/records", {
    method: "POST",
    body: JSON.stringify({ type, record, ...extra }),
  });
  return response.data;
}

export async function updateSprintRecord<T>(type: RecordType, id: string, updates: Record<string, unknown>): Promise<T> {
  const response = await request<{ data: T }>("/api/sprint/records", {
    method: "PATCH",
    body: JSON.stringify({ type, id, updates }),
  });
  return response.data;
}

export async function deleteSprintRecord<T>(type: RecordType, id: string): Promise<T> {
  const response = await request<{ data: T }>("/api/sprint/records", {
    method: "DELETE",
    body: JSON.stringify({ type, id }),
  });
  return response.data;
}

export interface BackupFile {
  app: "ansh-raj-portfolio-sprint-tracker";
  version: 1;
  exported_at: string;
  snapshot: SprintSnapshot;
}

export function createBackup(snapshot: SprintSnapshot): BackupFile {
  return {
    app: "ansh-raj-portfolio-sprint-tracker",
    version: 1,
    exported_at: new Date().toISOString(),
    snapshot,
  };
}

export function summarizeSnapshot(snapshot: SprintSnapshot): string {
  const sessions = snapshot.study_sessions;
  const sum = (track: Track) => sessions.filter((item) => item.track === track).reduce((total, item) => total + item.focused_minutes, 0);
  const totalMinutes = sessions.reduce((total, item) => total + item.focused_minutes, 0);
  const workMinutes = snapshot.engineering_work.reduce((total, item) => total + item.minutes_spent, 0);
  const completedTasks = snapshot.tasks.filter((task) => task.status === "completed");
  const pendingTasks = snapshot.tasks.filter((task) => task.status !== "completed");
  const reflections = snapshot.reflections.filter((reflection) => reflection.learned || reflection.clear_topics || reflection.difficult_topics || reflection.revisit || reflection.remarks);
  const topics = [...new Set(snapshot.tasks.filter((task) => task.status === "completed").map((task) => task.title))];
  const bullets = (items: string[]) => items.length ? items.map((item) => `- ${item}`).join("\n") : "- None recorded";
  return [
    `# ${snapshot.sprint.title}`,
    `${snapshot.sprint.start_date} to ${snapshot.sprint.end_date} (${snapshot.sprint.timezone})`,
    "",
    "## Focused learning time",
    `Total: ${(totalMinutes / 60).toFixed(1)} hours`,
    `Backend: ${(sum("backend") / 60).toFixed(1)} hours`,
    `AI: ${(sum("ai") / 60).toFixed(1)} hours`,
    `DSA: ${(sum("dsa") / 60).toFixed(1)} hours`,
    `Additional engineering work: ${(workMinutes / 60).toFixed(1)} hours (separate from learning allocation)`,
    "",
    `## Completed tasks (${completedTasks.length})`,
    bullets(completedTasks.map((task) => `Day ${snapshot.days.find((day) => day.id === task.day_id)?.day_number ?? "?"} · ${task.track.toUpperCase()} · ${task.title}`)),
    "",
    `## Incomplete tasks (${pendingTasks.length})`,
    bullets(pendingTasks.map((task) => `${task.scheduled_date} · ${task.track.toUpperCase()} · ${task.title}`)),
    "",
    "## Topics covered",
    bullets(topics),
    "",
    "## Daily reflections",
    ...reflections.map((reflection) => {
      const day = snapshot.days.find((item) => item.date === reflection.reflection_date);
      return `### Day ${day?.day_number ?? "?"} · ${reflection.reflection_date}\n${[
        reflection.learned && `Learned: ${reflection.learned}`,
        reflection.clear_topics && `Clear: ${reflection.clear_topics}`,
        reflection.difficult_topics && `Difficult: ${reflection.difficult_topics}`,
        reflection.revisit && `Revisit: ${reflection.revisit}`,
        reflection.tomorrow_focus && `Tomorrow: ${reflection.tomorrow_focus}`,
        reflection.remarks && `Remarks: ${reflection.remarks}`,
      ].filter(Boolean).join("\n")}`;
    }),
    "",
    "## Additional engineering work",
    bullets(snapshot.engineering_work.map((work: EngineeringWork) => `${work.work_date} · ${work.project_name}: ${work.title} (${work.minutes_spent} min)`)),
    "",
    "## Rescheduling history",
    bullets(snapshot.reschedules.map((item) => `${item.from_date} → ${item.to_date} · ${snapshot.tasks.find((task: SprintTask) => task.id === item.task_id)?.title ?? "Task"}`)),
  ].join("\n");
}
