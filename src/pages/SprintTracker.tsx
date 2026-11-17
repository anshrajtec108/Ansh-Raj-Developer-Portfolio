import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import {
  Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, BarChart3, BookOpen, Check, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, Circle, Clock3, Cloud, Download, FileText, FolderKanban,
  LockKeyhole, LogOut, Menu, Plus, RefreshCw, ShieldCheck, Trash2, Upload, X,
} from "lucide-react";
import {
  DAILY_TARGET_MINUTES, DEFAULT_ALLOCATIONS, SPRINT_END, SPRINT_ID, SPRINT_START, SPRINT_TIME_ZONE,
  type DailyReflection, type EngineeringWork, type RecoveryEvent, type SprintDay, type SprintSnapshot,
  type SprintTask, type Track, type TrackAllocations,
} from "@shared/sprint";
import {
  checkSprintSession, createBackup, createSprintRecord, deleteSprintRecord, loadSprint, lockSprint,
  summarizeSnapshot, unlockSprint, updateSprintRecord, type BackupFile,
} from "@/lib/sprint-api";
import "./sprint-tracker.css";

type Section = "overview" | "planner" | "backend" | "ai" | "dsa" | "time" | "work" | "notes" | "report";
type SyncStatus = "loading" | "synced" | "saving" | "offline";
type Draft = Pick<DailyReflection, "learned" | "clear_topics" | "difficult_topics" | "revisit" | "tomorrow_focus" | "remarks">;
type TaskForm = Pick<SprintTask, "title" | "description" | "track" | "priority" | "scheduled_date" | "notes">;
type StudyForm = { study_date: string; track: Track; focused_minutes: string; notes: string };
type WorkForm = Pick<EngineeringWork, "work_date" | "project_name" | "title" | "description" | "implementation" | "technologies" | "bugs" | "experiments" | "learning_outcomes" | "minutes_spent" | "notes">;

const TRACKS: Track[] = ["backend", "ai", "dsa"];
const TRACK_LABEL: Record<Track, string> = { backend: "Backend", ai: "AI Engineering", dsa: "DSA" };
const TRACK_CLASS: Record<Track, string> = { backend: "backend", ai: "ai", dsa: "dsa" };
const NAV: { id: Section; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "planner", label: "15-Day Planner", icon: BookOpen },
  { id: "backend", label: "Backend Engineering", icon: Circle },
  { id: "ai", label: "AI Engineering", icon: Circle },
  { id: "dsa", label: "DSA", icon: Circle },
  { id: "time", label: "Study Hours", icon: Clock3 },
  { id: "work", label: "Additional Work", icon: FolderKanban },
  { id: "notes", label: "Notes & Reflections", icon: FileText },
  { id: "report", label: "Final Report", icon: BarChart3 },
];
const EMPTY_DRAFT: Draft = { learned: "", clear_topics: "", difficult_topics: "", revisit: "", tomorrow_focus: "", remarks: "" };
const EMPTY_TASK: TaskForm = { title: "", description: "", track: "backend", priority: "medium", scheduled_date: SPRINT_START, notes: "" };
const EMPTY_STUDY: StudyForm = { study_date: SPRINT_START, track: "backend", focused_minutes: "", notes: "" };
const EMPTY_WORK: WorkForm = {
  work_date: SPRINT_START, project_name: "", title: "", description: "", implementation: "",
  technologies: [], bugs: "", experiments: "", learning_outcomes: "", minutes_spent: 0, notes: "",
};

function todayInKolkata(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SPRINT_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function dateLabel(date: string, options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }): string {
  return new Intl.DateTimeFormat("en-IN", { ...options, timeZone: SPRINT_TIME_ZONE }).format(new Date(`${date}T12:00:00+05:30`));
}

function dayName(day: SprintDay): string {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: SPRINT_TIME_ZONE }).format(new Date(`${day.date}T12:00:00+05:30`));
}

function minutesLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h ${remainder ? `${remainder}m` : ""}`.trim() : `${remainder}m`;
}

function minutesForTrack(snapshot: SprintSnapshot, track: Track): number {
  return snapshot.study_sessions.filter((entry) => entry.track === track).reduce((sum, entry) => sum + entry.focused_minutes, 0);
}

function Modal({ title, children, onClose, tone = "" }: { title: string; children: ReactNode; onClose: () => void; tone?: string }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  return (
    <div className="sprint-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`sprint-modal ${tone}`} role="dialog" aria-modal="true" aria-labelledby="sprint-modal-title">
        <div className="sprint-modal-heading">
          <h2 id="sprint-modal-title">{title}</h2>
          <button className="sprint-icon-button" type="button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function TrackBadge({ track }: { track: Track }) {
  return <span className={`sprint-track-badge ${TRACK_CLASS[track]}`}>{TRACK_LABEL[track]}</span>;
}

function ProgressBar({ value, total, track }: { value: number; total: number; track: Track }) {
  const percent = total ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="sprint-progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${TRACK_LABEL[track]} completion`}>
      <span className={`sprint-progress-fill ${TRACK_CLASS[track]}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

function formatInputDate(date: string): string {
  return date || SPRINT_START;
}

export default function SprintTracker() {
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [snapshot, setSnapshot] = useState<SprintSnapshot | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [selectedDate, setSelectedDate] = useState(SPRINT_START);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [taskEditor, setTaskEditor] = useState<{ id?: string; form: TaskForm } | null>(null);
  const [studyForm, setStudyForm] = useState<StudyForm>(EMPTY_STUDY);
  const [editingStudy, setEditingStudy] = useState<string | null>(null);
  const [workForm, setWorkForm] = useState<WorkForm>(EMPTY_WORK);
  const [editingWork, setEditingWork] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [reflectionStatus, setReflectionStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [retryDraft, setRetryDraft] = useState(0);
  const [completionDay, setCompletionDay] = useState<number | null>(null);
  const [recoveryDate, setRecoveryDate] = useState<string | null>(null);
  const [dismissedRecoveryDate, setDismissedRecoveryDate] = useState<string | null>(null);
  const [recoveryReason, setRecoveryReason] = useState("");
  const [carryTaskIds, setCarryTaskIds] = useState<string[]>([]);
  const [backupPreview, setBackupPreview] = useState<BackupFile | null>(null);
  const [report, setReport] = useState("");
  const today = todayInKolkata();

  const refresh = useCallback(async (): Promise<SprintSnapshot | null> => {
    try {
      const fresh = await loadSprint();
      setSnapshot(fresh);
      setSyncStatus("synced");
      setErrorMessage("");
      return fresh;
    } catch (error) {
      setSyncStatus("offline");
      setErrorMessage(error instanceof Error ? error.message : "Could not sync tracker data.");
      return null;
    }
  }, []);

  useEffect(() => {
    document.title = "15-Day Engineering Sprint | Ansh Raj";
    let active = true;
    void checkSprintSession()
      .then(async (session) => {
        if (!active) return;
        setConfigured(session.configured);
        setAuthenticated(session.authenticated);
        if (session.authenticated) await refresh();
      })
      .catch(() => { if (active) setLoginError("Could not reach the tracker service. Check your connection and retry."); })
      .finally(() => { if (active) setInitializing(false); });
    return () => { active = false; };
  }, [refresh]);

  useEffect(() => {
    if (!authenticated) return;
    const poll = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 30_000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [authenticated, refresh]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const days = snapshot?.days ?? [];
  const selectedDay = days.find((day) => day.date === selectedDate) ?? days[0] ?? null;
  const sortedTasks = useMemo(() => [...(snapshot?.tasks ?? [])].sort((a, b) =>
    a.scheduled_date.localeCompare(b.scheduled_date) || a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)), [snapshot?.tasks]);
  const selectedTasks = sortedTasks.filter((task) => task.scheduled_date === selectedDate);
  const sectionTrack = section === "backend" || section === "ai" || section === "dsa" ? section : null;
  const visibleTasks = sectionTrack ? selectedTasks.filter((task) => task.track === sectionTrack) : selectedTasks;
  const taskCount = snapshot?.tasks.length ?? 0;
  const completedCount = snapshot?.tasks.filter((task) => task.status === "completed").length ?? 0;
  const totalLearningMinutes = snapshot?.study_sessions.reduce((sum, entry) => sum + entry.focused_minutes, 0) ?? 0;
  const additionalMinutes = snapshot?.engineering_work.reduce((sum, entry) => sum + entry.minutes_spent, 0) ?? 0;
  const daysCompleted = snapshot?.days.filter((day) => day.status === "completed").length ?? 0;
  const overallPercent = taskCount ? Math.round((completedCount / taskCount) * 100) : 0;
  const sprintDay = days.find((day) => day.date === today)?.day_number ?? (today < SPRINT_START ? 0 : today > SPRINT_END ? 15 : 0);
  const selectedDaySessions = snapshot?.study_sessions.filter((entry) => entry.study_date === selectedDate) ?? [];
  const selectedDayMinutes = selectedDaySessions.reduce((sum, entry) => sum + entry.focused_minutes, 0);
  const currentReflection = snapshot?.reflections.find((item) => item.reflection_date === selectedDate);
  const activeDraft = drafts[selectedDate] ?? {
    learned: currentReflection?.learned ?? "",
    clear_topics: currentReflection?.clear_topics ?? "",
    difficult_topics: currentReflection?.difficult_topics ?? "",
    revisit: currentReflection?.revisit ?? "",
    tomorrow_focus: currentReflection?.tomorrow_focus ?? "",
    remarks: currentReflection?.remarks ?? "",
  };
  const missedDays = (snapshot?.days ?? []).filter((day) =>
    day.date < today && !day.is_leave && sortedTasks.some((task) => task.scheduled_date === day.date && task.status !== "completed"));
  const unreviewedMissed = missedDays.find((day) => !snapshot?.recovery_events.some((item) => item.missed_date === day.date));

  useEffect(() => {
    if (!authenticated || !snapshot || !unreviewedMissed || recoveryDate || dismissedRecoveryDate === unreviewedMissed.date) return;
    setRecoveryDate(unreviewedMissed.date);
    setCarryTaskIds(sortedTasks.filter((task) => task.scheduled_date === unreviewedMissed.date && task.status !== "completed").map((task) => task.id));
  }, [authenticated, snapshot, unreviewedMissed, recoveryDate, dismissedRecoveryDate, sortedTasks]);

  useEffect(() => {
    if (!snapshot) return;
    setReport(summarizeSnapshot(snapshot));
  }, [snapshot]);

  const changeSection = (next: Section) => {
    setSection(next);
    setMobileNavOpen(false);
  };

  const showError = (error: unknown) => {
    const message = error instanceof Error ? error.message : "The change could not be saved.";
    setToast(message);
    setErrorMessage(message);
  };

  const submitPin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError("");
    try {
      await unlockSprint(pin);
      setAuthenticated(true);
      setPin("");
      await refresh();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "PIN verification failed.");
    }
  };

  const logout = async () => {
    try {
      await lockSprint();
      setAuthenticated(false);
      setSnapshot(null);
      setSection("overview");
    } catch (error) {
      showError(error);
    }
  };

  const saveTask = async (event: FormEvent) => {
    event.preventDefault();
    if (!taskEditor || !taskEditor.form.title.trim()) return;
    setSyncStatus("saving");
    try {
      if (taskEditor.id) await updateSprintRecord("tasks", taskEditor.id, taskEditor.form);
      else await createSprintRecord("tasks", taskEditor.form);
      await refresh();
      setTaskEditor(null);
      setToast(taskEditor.id ? "Task updated." : "Task added.");
    } catch (error) {
      setSyncStatus("offline");
      showError(error);
    }
  };

  const toggleTask = async (task: SprintTask) => {
    setSyncStatus("saving");
    try {
      const previousCompleted = completedCount;
      const fresh = await updateSprintRecord<SprintTask>("tasks", task.id, { status: task.status === "completed" ? "pending" : "completed" });
      void fresh;
      const updated = await refresh();
      const scheduledDayTasks = updated?.tasks.filter((item) => item.scheduled_date === task.scheduled_date) ?? [];
      if (task.status !== "completed" && scheduledDayTasks.length > 0 && scheduledDayTasks.every((item) => item.status === "completed")) {
        setCompletionDay(days.find((day) => day.date === task.scheduled_date)?.day_number ?? selectedDay?.day_number ?? null);
      } else if (task.status !== "completed" && updated && updated.tasks.filter((item) => item.status === "completed").length > previousCompleted) {
        setToast("Task completion saved.");
      } else {
        setToast(task.status === "completed" ? "Task reopened." : "Task completed.");
      }
    } catch (error) {
      setSyncStatus("offline");
      showError(error);
    }
  };

  const editTask = (task: SprintTask) => setTaskEditor({
    id: task.id,
    form: {
      title: task.title, description: task.description, track: task.track,
      priority: task.priority, scheduled_date: task.scheduled_date, notes: task.notes,
    },
  });

  const removeTask = async (task: SprintTask) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try {
      await deleteSprintRecord("tasks", task.id);
      await refresh();
      setToast("Task deleted.");
    } catch (error) { showError(error); }
  };

  const moveTask = async (task: SprintTask, direction: -1 | 1) => {
    const currentIndex = days.findIndex((day) => day.date === task.scheduled_date);
    const targetDay = days[currentIndex + direction];
    if (!targetDay) return;
    try {
      await updateSprintRecord("tasks", task.id, { scheduled_date: targetDay.date });
      await refresh();
      setToast(`Task moved to ${dateLabel(targetDay.date)}.`);
    } catch (error) { showError(error); }
  };

  const reorderTask = async (task: SprintTask, direction: -1 | 1) => {
    const sameTrack = visibleTasks.filter((item) => item.track === task.track);
    const index = sameTrack.findIndex((item) => item.id === task.id);
    const neighbor = sameTrack[index + direction];
    if (!neighbor) return;
    try {
      await Promise.all([
        updateSprintRecord("tasks", task.id, { sort_order: neighbor.sort_order }),
        updateSprintRecord("tasks", neighbor.id, { sort_order: task.sort_order }),
      ]);
      await refresh();
    } catch (error) { showError(error); }
  };

  const saveStudy = async (event: FormEvent) => {
    event.preventDefault();
    const minutes = Number(studyForm.focused_minutes);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
      setToast("Enter focused minutes between 1 and 1,440.");
      return;
    }
    try {
      if (editingStudy) await updateSprintRecord("study_sessions", editingStudy, {
        study_date: studyForm.study_date, track: studyForm.track, focused_minutes: minutes, notes: studyForm.notes,
      });
      else await createSprintRecord("study_sessions", {
        study_date: studyForm.study_date, track: studyForm.track, focused_minutes: minutes, notes: studyForm.notes,
      });
      await refresh();
      setStudyForm({ ...EMPTY_STUDY, study_date: selectedDate });
      setEditingStudy(null);
      setToast("Study time saved.");
    } catch (error) { showError(error); }
  };

  const editStudy = (entry: SprintSnapshot["study_sessions"][number]) => {
    setEditingStudy(entry.id);
    setStudyForm({ study_date: entry.study_date, track: entry.track, focused_minutes: String(entry.focused_minutes), notes: entry.notes });
  };

  const removeStudy = async (id: string) => {
    if (!window.confirm("Delete this study-time entry?")) return;
    try {
      await deleteSprintRecord("study_sessions", id);
      await refresh();
    } catch (error) { showError(error); }
  };

  const saveWork = async (event: FormEvent) => {
    event.preventDefault();
    if (!workForm.project_name.trim() || !workForm.title.trim()) {
      setToast("Project name and work title are required.");
      return;
    }
    try {
      if (editingWork) await updateSprintRecord("engineering_work", editingWork, { ...workForm });
      else await createSprintRecord("engineering_work", { ...workForm });
      await refresh();
      setWorkForm({ ...EMPTY_WORK, work_date: selectedDate });
      setEditingWork(null);
      setToast("Additional engineering work saved.");
    } catch (error) { showError(error); }
  };

  const editWork = (work: EngineeringWork) => {
    setEditingWork(work.id);
    setWorkForm({ ...work });
  };

  const removeWork = async (work: EngineeringWork) => {
    if (!window.confirm(`Delete "${work.title}"?`)) return;
    try {
      await deleteSprintRecord("engineering_work", work.id);
      await refresh();
    } catch (error) { showError(error); }
  };

  const changeReflection = (key: keyof Draft, value: string) => {
    setDrafts((existing) => ({
      ...existing,
      [selectedDate]: { ...activeDraft, [key]: value },
    }));
    setReflectionStatus("idle");
  };

  useEffect(() => {
    if (!authenticated || !snapshot) return;
    const hasText = Object.values(activeDraft).some(Boolean);
    if (!hasText && !currentReflection) return;
    setReflectionStatus("saving");
    const timer = window.setTimeout(async () => {
      try {
        if (currentReflection?.id) {
          await updateSprintRecord("daily_reflections", currentReflection.id, { ...activeDraft });
        } else {
          await createSprintRecord("daily_reflections", { ...activeDraft }, { reflection_date: selectedDate });
        }
        await refresh();
        setReflectionStatus("saved");
      } catch {
        setReflectionStatus("failed");
      }
    }, retryDraft ? 0 : 800);
    return () => window.clearTimeout(timer);
    // Saving is intentionally keyed to the selected date and text values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, selectedDate, activeDraft.learned, activeDraft.clear_topics, activeDraft.difficult_topics, activeDraft.revisit, activeDraft.tomorrow_focus, activeDraft.remarks, retryDraft]);

  const saveDaySettings = async (updates: Partial<SprintDay>) => {
    if (!selectedDay) return;
    try {
      const safeUpdates: Record<string, unknown> = {};
      if (updates.is_leave !== undefined) safeUpdates.is_leave = updates.is_leave;
      if (updates.target_minutes !== undefined) safeUpdates.target_minutes = updates.target_minutes;
      if (updates.allocations !== undefined) safeUpdates.allocations = updates.allocations;
      if (updates.notes !== undefined) safeUpdates.notes = updates.notes;
      await updateSprintRecord("sprint_days", selectedDay.id, safeUpdates);
      await refresh();
      setToast("Day settings saved.");
    } catch (error) { showError(error); }
  };

  const confirmRecovery = async () => {
    if (!snapshot || !recoveryDate) return;
    const missed = days.find((day) => day.date === recoveryDate);
    const nextDay = days.find((day) => day.day_number === (missed?.day_number ?? 0) + 1);
    try {
      if (nextDay) {
        const selected = snapshot.tasks.filter((task) => carryTaskIds.includes(task.id) && task.status !== "completed");
        for (const task of selected) await updateSprintRecord("tasks", task.id, { scheduled_date: nextDay.date });
      }
      await createSprintRecord<RecoveryEvent>("recovery_events", {
        missed_date: recoveryDate, reason: recoveryReason, recovery_date: nextDay?.date ?? null,
      });
      await refresh();
      setDismissedRecoveryDate(recoveryDate);
      setRecoveryDate(null);
      setRecoveryReason("");
      setToast("Recovery plan recorded. The missed day remains in your history.");
    } catch (error) { showError(error); }
  };

  const dismissRecovery = () => {
    if (recoveryDate) setDismissedRecoveryDate(recoveryDate);
    setRecoveryDate(null);
  };

  const createExport = () => {
    if (!snapshot) return;
    const backup = createBackup(snapshot);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `engineering-sprint-${SPRINT_START}-backup.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast("JSON backup exported.");
  };

  const readBackup = async (file?: File) => {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (typeof parsed !== "object" || parsed === null || !("app" in parsed) || !("version" in parsed) || !("snapshot" in parsed)) {
        throw new Error("This file is not a recognized sprint backup.");
      }
      const candidate = parsed as BackupFile;
      const backup = candidate.snapshot as unknown as Record<string, unknown>;
      if (candidate.app !== "ansh-raj-portfolio-sprint-tracker" || candidate.version !== 1 ||
          backup.sprint === null || typeof backup.sprint !== "object" ||
          !Array.isArray(backup.days) || !Array.isArray(backup.tasks) ||
          !Array.isArray(backup.study_sessions) || !Array.isArray(backup.engineering_work) ||
          !Array.isArray(backup.reflections) || !Array.isArray(backup.reschedules) ||
          !Array.isArray(backup.recovery_events) ||
          (backup.sprint as { id?: string }).id !== SPRINT_ID) {
        throw new Error("The backup structure or sprint identity is invalid.");
      }
      setBackupPreview(candidate);
    } catch (error) {
      showError(error);
    }
  };

  const applyBackup = async () => {
    if (!backupPreview) return;
    try {
      await fetch("/api/sprint/import", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(backupPreview),
      }).then(async (response) => {
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Import failed.");
      });
      await refresh();
      setBackupPreview(null);
      setToast("Backup merged with the tracker.");
    } catch (error) { showError(error); }
  };

  if (initializing) {
    return <main className="sprint-shell sprint-centered"><div className="sprint-loader" aria-label="Loading tracker" /><span>Checking private access…</span></main>;
  }

  if (!authenticated) {
    return (
      <main className="sprint-shell sprint-access-screen">
        <div className="sprint-access-card">
          <a className="sprint-brand-mark" href="/" aria-label="Back to portfolio">AR<span>.</span></a>
          <div className="sprint-access-icon"><LockKeyhole size={21} /></div>
          <p className="sprint-eyebrow">PRIVATE WORKSPACE / 01</p>
          <h1>Engineering sprint</h1>
          <p className="sprint-muted">A private learning log for deliberate engineering practice.</p>
          {!configured ? (
            <div className="sprint-config-notice" role="status">
              <ShieldCheck size={18} />
              <p>Server access is not configured yet. Add the required server-only environment variables from <code>.env.example</code>, then restart the app.</p>
            </div>
          ) : (
            <form className="sprint-form-stack" onSubmit={submitPin}>
              <label className="sprint-field">
                <span>Access PIN</span>
                <input autoComplete="current-password" autoFocus type="password" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="Enter your private PIN" />
              </label>
              {loginError && <p className="sprint-form-error" role="alert">{loginError}</p>}
              <button className="sprint-button primary full" type="submit" disabled={!pin}>Unlock private tracker <ArrowRight size={16} /></button>
            </form>
          )}
          <p className="sprint-access-foot"><LockKeyhole size={13} /> Server-verified access · 12-hour secure session</p>
          <a href="/" className="sprint-back-link"><ArrowLeft size={14} /> Return to portfolio</a>
        </div>
      </main>
    );
  }

  return (
    <main className="sprint-shell">
      <aside className={`sprint-sidebar ${mobileNavOpen ? "open" : ""}`}>
        <a className="sprint-brand" href="/" aria-label="Ansh Raj portfolio">AR<span>.</span><small>ENGINEERING LOG</small></a>
        <div className="sprint-sprint-tag"><span className="sprint-live-dot" />PRIVATE SPRINT <span>15D</span></div>
        <nav className="sprint-nav" aria-label="Sprint sections">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button type="button" key={id} className={`sprint-nav-link ${section === id ? "active" : ""}`} onClick={() => changeSection(id)}>
              <Icon size={16} className={id === "backend" || id === "ai" || id === "dsa" ? TRACK_CLASS[id] : ""} />
              <span>{label}</span>{section === id && <span className="sprint-nav-active" />}
            </button>
          ))}
        </nav>
        <div className="sprint-sidebar-bottom">
          <div className="sprint-sidebar-sync"><span className={`sprint-sync-dot ${syncStatus}`} />{syncStatus === "synced" ? "Synced" : syncStatus === "saving" ? "Saving changes" : syncStatus === "offline" ? "Sync issue" : "Loading"}<span>·</span> {SPRINT_TIME_ZONE}</div>
          <button type="button" className="sprint-nav-link" onClick={logout}><LogOut size={16} /><span>Lock tracker</span></button>
          <a className="sprint-back-link" href="/"><ArrowLeft size={14} /> Back to portfolio</a>
        </div>
      </aside>
      {mobileNavOpen && <button className="sprint-mobile-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}

      <section className="sprint-main">
        <header className="sprint-topbar">
          <button type="button" className="sprint-icon-button sprint-mobile-menu" onClick={() => setMobileNavOpen((open) => !open)} aria-label="Toggle navigation"><Menu size={19} /></button>
          <div className="sprint-breadcrumb"><span>SPRINT-15</span><ChevronRight size={13} /><strong>{NAV.find((item) => item.id === section)?.label}</strong></div>
          <div className="sprint-topbar-right">
            <span className={`sprint-status-label ${syncStatus}`}><span className={`sprint-sync-dot ${syncStatus}`} />{syncStatus === "synced" ? "All changes synced" : syncStatus === "saving" ? "Saving…" : syncStatus === "offline" ? "Needs attention" : "Syncing"}</span>
            <button type="button" className="sprint-icon-button" onClick={() => void refresh()} aria-label="Refresh tracker data"><RefreshCw size={16} /></button>
            <span className="sprint-owner-chip">AR</span>
          </div>
        </header>

        <div className="sprint-content">
          {errorMessage && (
            <div className="sprint-error-banner" role="alert">
              <span><Cloud size={17} /> {errorMessage}</span>
              <button type="button" className="sprint-text-button" onClick={() => void refresh()}>Retry</button>
            </div>
          )}
          {section === "overview" && snapshot && (
            <Overview snapshot={snapshot} today={today} sprintDay={sprintDay} totalMinutes={totalLearningMinutes} additionalMinutes={additionalMinutes}
              completedCount={completedCount} taskCount={taskCount} daysCompleted={daysCompleted} percent={overallPercent}
              onOpenDay={(date) => { setSelectedDate(date); changeSection("planner"); }} onSection={changeSection} />
          )}
          {(section === "planner" || sectionTrack) && snapshot && selectedDay && (
            <Planner snapshot={snapshot} selectedDay={selectedDay} selectedDate={selectedDate} visibleTasks={visibleTasks} allTasks={sortedTasks}
              sessions={selectedDaySessions} dayMinutes={selectedDayMinutes} sectionTrack={sectionTrack}
              onChooseDay={setSelectedDate} onTaskDone={toggleTask} onEditTask={editTask} onDeleteTask={removeTask}
              onMoveTask={moveTask} onReorderTask={reorderTask} onAddTask={() => setTaskEditor({ form: { ...EMPTY_TASK, scheduled_date: selectedDate, track: sectionTrack ?? "backend" } })}
              onDaySettings={saveDaySettings} onNavigate={changeSection} />
          )}
          {section === "time" && snapshot && (
            <StudyHours snapshot={snapshot} totalMinutes={totalLearningMinutes} selectedDate={selectedDate} form={studyForm} editingId={editingStudy}
              setSelectedDate={setSelectedDate} setForm={setStudyForm} onSave={saveStudy} onEdit={editStudy} onDelete={removeStudy} onCancel={() => { setEditingStudy(null); setStudyForm({ ...EMPTY_STUDY, study_date: selectedDate }); }} />
          )}
          {section === "work" && snapshot && (
            <AdditionalWork snapshot={snapshot} totalMinutes={additionalMinutes} selectedDate={selectedDate}
              form={workForm} editingId={editingWork} filter={projectFilter} setFilter={setProjectFilter} setForm={setWorkForm}
              onSave={saveWork} onEdit={editWork} onDelete={removeWork} onCancel={() => { setEditingWork(null); setWorkForm({ ...EMPTY_WORK, work_date: selectedDate }); }} />
          )}
          {section === "notes" && snapshot && (
            <Reflections selectedDay={selectedDay} selectedDate={selectedDate} draft={activeDraft} status={reflectionStatus}
              onChooseDate={setSelectedDate} onChange={changeReflection} onRetry={() => setRetryDraft((count) => count + 1)} />
          )}
          {section === "report" && snapshot && (
            <FinalReport snapshot={snapshot} report={report} setReport={setReport} onExport={createExport} onImport={readBackup} />
          )}
          {section === "overview" && !snapshot && <LoadingState onRetry={() => void refresh()} />}
        </div>
      </section>

      {taskEditor && (
        <Modal title={taskEditor.id ? "Edit task" : "Add a task"} onClose={() => setTaskEditor(null)}>
          <form className="sprint-form-stack" onSubmit={saveTask}>
            <label className="sprint-field"><span>Task title</span><input autoFocus required maxLength={200} value={taskEditor.form.title} onChange={(event) => setTaskEditor({ ...taskEditor, form: { ...taskEditor.form, title: event.target.value } })} /></label>
            <label className="sprint-field"><span>Description / topics</span><textarea rows={4} value={taskEditor.form.description} onChange={(event) => setTaskEditor({ ...taskEditor, form: { ...taskEditor.form, description: event.target.value } })} /></label>
            <div className="sprint-form-grid">
              <label className="sprint-field"><span>Track</span><select value={taskEditor.form.track} onChange={(event) => setTaskEditor({ ...taskEditor, form: { ...taskEditor.form, track: event.target.value as Track } })}>{TRACKS.map((track) => <option key={track} value={track}>{TRACK_LABEL[track]}</option>)}</select></label>
              <label className="sprint-field"><span>Priority</span><select value={taskEditor.form.priority} onChange={(event) => setTaskEditor({ ...taskEditor, form: { ...taskEditor.form, priority: event.target.value as TaskForm["priority"] } })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
            </div>
            <label className="sprint-field"><span>Scheduled date</span><select value={taskEditor.form.scheduled_date} onChange={(event) => setTaskEditor({ ...taskEditor, form: { ...taskEditor.form, scheduled_date: event.target.value } })}>{days.map((day) => <option key={day.id} value={day.date}>Day {day.day_number} · {dateLabel(day.date)}</option>)}</select></label>
            <label className="sprint-field"><span>Personal notes</span><textarea rows={2} value={taskEditor.form.notes} onChange={(event) => setTaskEditor({ ...taskEditor, form: { ...taskEditor.form, notes: event.target.value } })} /></label>
            <div className="sprint-modal-actions"><button type="button" className="sprint-button subtle" onClick={() => setTaskEditor(null)}>Cancel</button><button type="submit" className="sprint-button primary">Save task</button></div>
          </form>
        </Modal>
      )}

      {completionDay !== null && (
        <Modal title={`Day ${completionDay} recorded`} onClose={() => setCompletionDay(null)} tone="success">
          <div className="sprint-completion-mark"><CheckCircle2 size={26} /></div>
          <p className="sprint-modal-copy">Concept understood. Experiment completed. Progress saved.</p>
          <p className="sprint-muted">Your work for this sprint day is recorded in your learning history.</p>
          <div className="sprint-modal-actions"><button type="button" className="sprint-button primary" onClick={() => setCompletionDay(null)}>Continue</button></div>
        </Modal>
      )}

      {recoveryDate && snapshot && (
        <Modal title="A day needs a recovery plan" onClose={dismissRecovery} tone="recovery">
          <p className="sprint-recovery-date">{dateLabel(recoveryDate, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          <p className="sprint-modal-copy">You missed a planned study day. You cannot recover yesterday’s hours by pretending they happened. Review the unfinished work, choose what genuinely matters, and make a realistic plan for the next day.</p>
          <p className="sprint-recovery-note">Your goal is to become employable as a backend engineer. Take responsibility for the next action.</p>
          <div className="sprint-recovery-summary">
            <span>Planned</span><strong>{minutesLabel((days.find((day) => day.date === recoveryDate)?.target_minutes ?? DAILY_TARGET_MINUTES))}</strong>
            <span>Recorded</span><strong>{minutesLabel(snapshot.study_sessions.filter((item) => item.study_date === recoveryDate).reduce((sum, item) => sum + item.focused_minutes, 0))}</strong>
          </div>
          <div className="sprint-field">
            <span>Choose tasks to carry to the next day</span>
            {sortedTasks.filter((task) => task.scheduled_date === recoveryDate && task.status !== "completed").map((task) => (
              <label className="sprint-checkbox-row" key={task.id}>
                <input type="checkbox" checked={carryTaskIds.includes(task.id)} onChange={(event) => setCarryTaskIds((values) => event.target.checked ? [...values, task.id] : values.filter((id) => id !== task.id))} />
                <span>{task.title} <small>{TRACK_LABEL[task.track]}</small></span>
              </label>
            ))}
            {(!days.find((day) => day.date === recoveryDate) || days.findIndex((day) => day.date === recoveryDate) >= days.length - 1) &&
              <p className="sprint-muted">This is the final sprint day; selected tasks will remain on the missed date unless you reschedule them manually.</p>}
          </div>
          <label className="sprint-field"><span>Reason (optional)</span><textarea rows={2} value={recoveryReason} onChange={(event) => setRecoveryReason(event.target.value)} placeholder="A short note for your record" /></label>
          <div className="sprint-modal-actions"><button type="button" className="sprint-button subtle" onClick={dismissRecovery}>Review later</button><button type="button" className="sprint-button primary" onClick={() => void confirmRecovery()}>Confirm recovery plan</button></div>
        </Modal>
      )}

      {backupPreview && (
        <Modal title="Review backup import" onClose={() => setBackupPreview(null)}>
          <p className="sprint-modal-copy">This backup will be merged into the current sprint. Matching record IDs may be updated; records absent from the backup will not be deleted.</p>
          <div className="sprint-recovery-summary">
            <span>Tasks</span><strong>{backupPreview.snapshot.tasks.length}</strong>
            <span>Study entries</span><strong>{backupPreview.snapshot.study_sessions.length}</strong>
            <span>Project entries</span><strong>{backupPreview.snapshot.engineering_work.length}</strong>
            <span>Reflections</span><strong>{backupPreview.snapshot.reflections.length}</strong>
          </div>
          <div className="sprint-modal-actions"><button type="button" className="sprint-button subtle" onClick={() => setBackupPreview(null)}>Cancel</button><button type="button" className="sprint-button primary" onClick={() => void applyBackup()}>Confirm merge</button></div>
        </Modal>
      )}

      {toast && <div className="sprint-toast" role="status"><Check size={15} />{toast}<button type="button" onClick={() => setToast("")} aria-label="Dismiss notification"><X size={14} /></button></div>}
    </main>
  );
}

function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="sprint-page-heading"><div><p className="sprint-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="sprint-muted">{description}</p></div>{actions && <div className="sprint-heading-actions">{actions}</div>}</div>;
}

function Overview(props: {
  snapshot: SprintSnapshot; today: string; sprintDay: number; totalMinutes: number; additionalMinutes: number;
  completedCount: number; taskCount: number; daysCompleted: number; percent: number;
  onOpenDay: (date: string) => void; onSection: (section: Section) => void;
}) {
  const { snapshot, today, sprintDay, totalMinutes, additionalMinutes, completedCount, taskCount, daysCompleted, percent, onOpenDay, onSection } = props;
  const todayDay = snapshot.days.find((day) => day.date === today);
  const todayTasks = snapshot.tasks.filter((task) => task.scheduled_date === today);
  const nextTasks = snapshot.tasks.filter((task) => task.status !== "completed" && task.scheduled_date >= today).slice(0, 5);
  const recent = [...snapshot.study_sessions].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4);
  const currentPercent = snapshot.sprint.daily_target_minutes * snapshot.days.length
    ? Math.min(100, Math.round((totalMinutes / (snapshot.sprint.daily_target_minutes * snapshot.days.length)) * 100)) : 0;
  const remaining = snapshot.days.filter((day) => day.date >= today);
  return (
    <>
      <PageHeading eyebrow="PRIVATE ENGINEERING COMMAND CENTRE" title="15-day sprint" description="A focused plan for backend engineering, applied AI, and problem-solving." actions={<span className="sprint-date-range">{dateLabel(snapshot.sprint.start_date, { month: "short", day: "numeric" })} — {dateLabel(snapshot.sprint.end_date, { month: "short", day: "numeric", year: "numeric" })}</span>} />
      <section className="sprint-hero-panel">
        <div className="sprint-hero-grid" />
        <div className="sprint-hero-copy"><p className="sprint-eyebrow">SPRINT STATUS <span className="sprint-live-dot" /></p><h2>{sprintDay ? `Day ${sprintDay} of 15` : today < SPRINT_START ? "Sprint begins soon" : "Sprint complete"}</h2><p>{todayDay ? dayName(todayDay) : today < SPRINT_START ? `Starts ${dateLabel(SPRINT_START, { month: "long", day: "numeric" })}` : "Review your learning history and export a report."}</p></div>
        <div className="sprint-hero-progress">
              <div className="sprint-ring" style={{ "--progress": `${percent}%` } as CSSProperties}><span><strong>{percent}%</strong><small>tasks</small></span></div>
          <div><strong>{completedCount}<span> / {taskCount}</span></strong><small>tasks completed</small><span className="sprint-subtle-line">{daysCompleted} of 15 days complete</span></div>
        </div>
        <div className="sprint-hero-foot"><span><Clock3 size={14} /> 2:00–6:00 AM · Asia/Kolkata</span><span>{todayDay ? `${todayTasks.filter((task) => task.status === "completed").length}/${todayTasks.length} today’s tasks` : "Daily target 4 hours"}</span></div>
      </section>

      <section className="sprint-stat-grid">
        <StatCard label="FOCUSED LEARNING" value={`${(totalMinutes / 60).toFixed(1)}h`} detail={`${(totalMinutes / 3600 * 100).toFixed(0)}% of 60h target`} icon={<Clock3 size={16} />} />
        <StatCard label="BACKEND" value={`${(minutesForTrack(snapshot, "backend") / 60).toFixed(1)}h`} detail={`${snapshot.tasks.filter((task) => task.track === "backend" && task.status === "completed").length} tasks complete`} accent="backend" />
        <StatCard label="AI ENGINEERING" value={`${(minutesForTrack(snapshot, "ai") / 60).toFixed(1)}h`} detail={`${snapshot.tasks.filter((task) => task.track === "ai" && task.status === "completed").length} tasks complete`} accent="ai" />
        <StatCard label="DSA" value={`${(minutesForTrack(snapshot, "dsa") / 60).toFixed(1)}h`} detail={`${snapshot.tasks.filter((task) => task.track === "dsa" && task.status === "completed").length} tasks complete`} accent="dsa" />
      </section>

      <div className="sprint-overview-columns">
        <section className="sprint-card sprint-track-card">
          <div className="sprint-card-heading"><div><p className="sprint-eyebrow">LEARNING MIX</p><h2>Track progress</h2></div><button className="sprint-text-button" type="button" onClick={() => onSection("time")}>Study hours <ArrowRight size={14} /></button></div>
          {TRACKS.map((track) => {
            const tasks = snapshot.tasks.filter((task) => task.track === track);
            const done = tasks.filter((task) => task.status === "completed").length;
            const time = minutesForTrack(snapshot, track);
            const target = track === "backend" ? 30 * 60 : track === "ai" ? 18 * 60 : 12 * 60;
            return <div className="sprint-track-progress-row" key={track}><div className="sprint-track-progress-label"><TrackBadge track={track} /><span>{done}/{tasks.length} tasks</span><strong>{minutesLabel(time)} <small>/ {target / 60}h</small></strong></div><ProgressBar value={done} total={tasks.length} track={track} /><p>{time ? `${Math.round(time / target * 100)}% of track time target` : "No study time logged yet"}</p></div>;
          })}
          <div className="sprint-focus-target"><div><span>Overall study time</span><strong>{minutesLabel(totalMinutes)} <small>/ 60h target</small></strong></div><div className="sprint-mini-bar"><span style={{ width: `${currentPercent}%` }} /></div></div>
        </section>
        <section className="sprint-card sprint-next-card">
          <div className="sprint-card-heading"><div><p className="sprint-eyebrow">UP NEXT</p><h2>{todayDay ? "Today’s focus" : "Upcoming tasks"}</h2></div><button className="sprint-icon-button" onClick={() => onSection("planner")} aria-label="Open planner"><ArrowUpRight size={16} /></button></div>
          {(todayTasks.length ? todayTasks.filter((task) => task.status !== "completed") : nextTasks).slice(0, 5).map((task) => (
            <button type="button" className="sprint-next-task" key={task.id} onClick={() => onOpenDay(task.scheduled_date)}>
              <span className={`sprint-task-marker ${TRACK_CLASS[task.track]}`} /><span className="sprint-next-task-main"><strong>{task.title}</strong><small>{dateLabel(task.scheduled_date)} · {TRACK_LABEL[task.track]}</small></span><ChevronRight size={15} />
            </button>
          ))}
          {todayTasks.every((task) => task.status === "completed") && todayTasks.length > 0 && <p className="sprint-empty-small">Today’s planned tasks are complete.</p>}
          {!nextTasks.length && !todayTasks.length && <p className="sprint-empty-small">No scheduled tasks yet. Open the planner to add work.</p>}
          <button type="button" className="sprint-outline-link" onClick={() => onSection("planner")}>Open 15-day planner <ArrowRight size={14} /></button>
        </section>
      </div>

      <div className="sprint-overview-columns lower">
        <section className="sprint-card">
          <div className="sprint-card-heading"><div><p className="sprint-eyebrow">SPRINT CALENDAR</p><h2>Day selector</h2></div><span className="sprint-muted sprint-small">{daysCompleted}/15 complete</span></div>
          <div className="sprint-day-grid">
            {snapshot.days.map((day) => {
              const status = day.status === "completed" ? "complete" : day.date < today && !day.is_leave && snapshot.tasks.some((task) => task.scheduled_date === day.date && task.status !== "completed") ? "missed" : day.date === today ? "today" : "";
              return <button type="button" key={day.id} className={`sprint-day-tile ${status}`} onClick={() => onOpenDay(day.date)} aria-label={`Day ${day.day_number}, ${day.date}, ${status || day.status}`}><small>{day.date.slice(8)}</small><span>{day.day_number}</span><i /></button>;
            })}
          </div>
        </section>
        <section className="sprint-card sprint-activity-card">
          <div className="sprint-card-heading"><div><p className="sprint-eyebrow">SEPARATE FROM STUDY TIME</p><h2>Engineering work</h2></div><button className="sprint-icon-button" onClick={() => onSection("work")} aria-label="Open additional work"><ArrowUpRight size={16} /></button></div>
          <div className="sprint-additional-metric"><strong>{(additionalMinutes / 60).toFixed(1)}<small>h</small></strong><span>Additional engineering hours</span></div>
          <p className="sprint-muted">Project and debugging time is tracked separately from your learning allocation.</p>
          <button type="button" className="sprint-outline-link" onClick={() => onSection("work")}>Log practical work <Plus size={14} /></button>
          {recent.length > 0 && <div className="sprint-recent-activity"><span>RECENT STUDY</span>{recent.slice(0, 2).map((entry) => <div key={entry.id}><TrackBadge track={entry.track} /><strong>{minutesLabel(entry.focused_minutes)}</strong><small>{dateLabel(entry.study_date)}</small></div>)}</div>}
        </section>
      </div>
      <p className="sprint-overview-footnote">Study time: {minutesLabel(totalMinutes)} actual · Additional work: {minutesLabel(additionalMinutes)} separate · Remaining sprint days: {remaining.length}</p>
    </>
  );
}

function StatCard({ label, value, detail, icon, accent = "" }: { label: string; value: string; detail: string; icon?: ReactNode; accent?: string }) {
  return <article className={`sprint-stat-card ${accent ? `accent-${accent}` : ""}`}><div className="sprint-stat-top"><span>{label}</span>{icon ?? <span className="sprint-stat-accent" />}</div><strong>{value}</strong><small>{detail}</small></article>;
}

function Planner(props: {
  snapshot: SprintSnapshot; selectedDay: SprintDay; selectedDate: string; visibleTasks: SprintTask[]; allTasks: SprintTask[];
  sessions: SprintSnapshot["study_sessions"]; dayMinutes: number; sectionTrack: Track | null;
  onChooseDay: (date: string) => void; onTaskDone: (task: SprintTask) => void; onEditTask: (task: SprintTask) => void;
  onDeleteTask: (task: SprintTask) => void; onMoveTask: (task: SprintTask, direction: -1 | 1) => void;
  onReorderTask: (task: SprintTask, direction: -1 | 1) => void; onAddTask: () => void; onDaySettings: (updates: Partial<SprintDay>) => void;
  onNavigate: (section: Section) => void;
}) {
  const { snapshot, selectedDay, selectedDate, visibleTasks, allTasks, sessions, dayMinutes, sectionTrack, onChooseDay, onTaskDone, onEditTask, onDeleteTask, onMoveTask, onReorderTask, onAddTask, onDaySettings, onNavigate } = props;
  const dayIndex = snapshot.days.findIndex((day) => day.id === selectedDay.id);
  const taskDone = visibleTasks.filter((task) => task.status === "completed").length;
  const dayTasks = allTasks.filter((task) => task.scheduled_date === selectedDate);
  const leaveAllocations = selectedDay.allocations ?? DEFAULT_ALLOCATIONS;
  return (
    <>
      <PageHeading eyebrow={`DAY ${String(selectedDay.day_number).padStart(2, "0")} / 15 · ${dayName(selectedDay).toUpperCase()}`} title={sectionTrack ? TRACK_LABEL[sectionTrack] : "Day planner"} description={`${dateLabel(selectedDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · Plan your focused work, adjust the day, and keep a record of what changed.`} actions={<button className="sprint-button primary" onClick={onAddTask}><Plus size={15} /> Add task</button>} />
      <div className="sprint-day-picker">
        <button type="button" className="sprint-icon-button" disabled={dayIndex <= 0} onClick={() => onChooseDay(snapshot.days[dayIndex - 1]?.date)} aria-label="Previous day"><ChevronLeft size={17} /></button>
        <div className="sprint-day-picker-scroll">
          {snapshot.days.map((day) => <button key={day.id} type="button" className={`sprint-day-chip ${day.id === selectedDay.id ? "active" : ""} ${day.status === "completed" ? "complete" : ""}`} onClick={() => onChooseDay(day.date)}><small>DAY {String(day.day_number).padStart(2, "0")}</small><strong>{dateLabel(day.date, { month: "short", day: "numeric" })}</strong><span>{day.status === "completed" ? "Complete" : day.is_leave ? "Leave" : `${allTasks.filter((task) => task.scheduled_date === day.date && task.status === "completed").length}/${allTasks.filter((task) => task.scheduled_date === day.date).length} done`}</span></button>)}
        </div>
        <button type="button" className="sprint-icon-button" disabled={dayIndex >= snapshot.days.length - 1} onClick={() => onChooseDay(snapshot.days[dayIndex + 1]?.date)} aria-label="Next day"><ChevronRight size={17} /></button>
      </div>

      <div className="sprint-planner-layout">
        <section className="sprint-card sprint-task-list-card">
          <div className="sprint-card-heading"><div><p className="sprint-eyebrow">{sectionTrack ? TRACK_LABEL[sectionTrack].toUpperCase() : "PLANNED WORK"} · {taskDone}/{visibleTasks.length} COMPLETE</p><h2>{sectionTrack ? `${visibleTasks.length} tasks on Day ${selectedDay.day_number}` : `${dayName(selectedDay)} plan`}</h2></div><span className="sprint-day-target"><Clock3 size={14} /> {minutesLabel(dayMinutes)} / {selectedDay.target_minutes}m</span></div>
          {visibleTasks.length ? <div className="sprint-task-list">
            {visibleTasks.map((task, index) => {
              const allIndex = dayTasks.findIndex((item) => item.id === task.id);
              const topics = task.description.split("\n").filter(Boolean);
              return <article key={task.id} className={`sprint-task-card ${task.status === "completed" ? "completed" : ""}`}>
                <button type="button" className={`sprint-task-check ${task.status === "completed" ? "checked" : ""}`} onClick={() => onTaskDone(task)} aria-label={task.status === "completed" ? `Undo ${task.title}` : `Complete ${task.title}`}>{task.status === "completed" && <Check size={14} />}</button>
                <div className="sprint-task-content"><div className="sprint-task-title-row"><TrackBadge track={task.track} /><span className={`sprint-priority ${task.priority}`}>{task.priority}</span>{task.is_predefined && <span className="sprint-curriculum-label">CURRICULUM</span>}</div><h3>{task.title}</h3>{topics.length > 0 && <ul className="sprint-topic-list">{topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>}{task.notes && <p className="sprint-task-note">{task.notes}</p>}{task.completion_at && <small className="sprint-task-completed-at">Completed {new Intl.DateTimeFormat("en-IN", { timeZone: SPRINT_TIME_ZONE, hour: "2-digit", minute: "2-digit" }).format(new Date(task.completion_at))}</small>}</div>
                <div className="sprint-task-actions">
                  <button type="button" className="sprint-icon-button" title="Move up" aria-label={`Move ${task.title} up`} disabled={index === 0} onClick={() => onReorderTask(task, -1)}><ArrowUp size={14} /></button>
                  <button type="button" className="sprint-icon-button" title="Move down" aria-label={`Move ${task.title} down`} disabled={index === visibleTasks.length - 1} onClick={() => onReorderTask(task, 1)}><ArrowDown size={14} /></button>
                  <button type="button" className="sprint-icon-button" title="Previous day" aria-label={`Move ${task.title} to previous day`} disabled={allIndex < 0 || !snapshot.days.some((day) => day.date === task.scheduled_date && day.day_number > 1)} onClick={() => onMoveTask(task, -1)}><ArrowLeft size={14} /></button>
                  <button type="button" className="sprint-icon-button" title="Next day" aria-label={`Move ${task.title} to next day`} disabled={!snapshot.days.some((day) => day.date === task.scheduled_date && day.day_number < 15)} onClick={() => onMoveTask(task, 1)}><ArrowRight size={14} /></button>
                  <button type="button" className="sprint-icon-button" title="Edit task" aria-label={`Edit ${task.title}`} onClick={() => onEditTask(task)}><FileText size={14} /></button>
                  <button type="button" className="sprint-icon-button danger" title="Delete task" aria-label={`Delete ${task.title}`} onClick={() => onDeleteTask(task)}><Trash2 size={14} /></button>
                </div>
              </article>;
            })}
          </div> : <div className="sprint-empty-state"><BookOpen size={22} /><strong>No tasks in this view</strong><span>Add a custom task or choose a different track.</span><button type="button" className="sprint-button subtle" onClick={onAddTask}><Plus size={15} /> Add task</button></div>}
          {dayTasks.some((task) => task.scheduled_date !== task.original_scheduled_date) && <div className="sprint-reschedule-strip"><RefreshCw size={14} /><span>{dayTasks.filter((task) => task.scheduled_date !== task.original_scheduled_date).length} task(s) were rescheduled to this day. Original dates are preserved.</span></div>}
        </section>

        <aside className="sprint-planner-side">
          <section className="sprint-card sprint-day-settings">
            <p className="sprint-eyebrow">DAY SETTINGS</p>
            <h2>Time allocation</h2>
            <label className="sprint-toggle-row"><span><strong>Leave day</strong><small>Adjust this date only</small></span><input type="checkbox" checked={selectedDay.is_leave} onChange={(event) => onDaySettings({ is_leave: event.target.checked, status: event.target.checked ? "leave" : "planned" })} /></label>
            <label className="sprint-field compact"><span>Daily target · minutes</span><input type="number" min="0" max="1440" value={selectedDay.target_minutes} onChange={(event) => onDaySettings({ target_minutes: Math.min(1440, Math.max(0, Number(event.target.value))) })} /></label>
            {TRACKS.map((track) => <label className={`sprint-field compact allocation-field ${TRACK_CLASS[track]}`} key={track}><span>{TRACK_LABEL[track]} · minutes</span><input type="number" min="0" max="1440" value={leaveAllocations[track]} onChange={(event) => onDaySettings({ allocations: { ...leaveAllocations, [track]: Math.min(1440, Math.max(0, Number(event.target.value))) } })} /></label>)}
            <p className="sprint-muted sprint-small">Overrides apply only to this day. Saved study entries are never changed.</p>
          </section>
          <section className="sprint-card sprint-day-time-card"><p className="sprint-eyebrow">ACTUAL FOCUSED TIME</p><h2>{minutesLabel(dayMinutes)}</h2>{TRACKS.map((track) => <div className="sprint-day-time-row" key={track}><TrackBadge track={track} /><span>{minutesLabel(sessions.filter((entry) => entry.track === track).reduce((sum, entry) => sum + entry.focused_minutes, 0))}</span></div>)}<button type="button" className="sprint-outline-link" onClick={() => onNavigate("time")}>Add study entry <Plus size={14} /></button></section>
          <section className="sprint-window-card"><Clock3 size={15} /><span>Primary study window<strong>02:00 — 06:00 IST</strong></span></section>
        </aside>
      </div>
    </>
  );
}

function StudyHours(props: {
  snapshot: SprintSnapshot; totalMinutes: number; selectedDate: string; form: StudyForm; editingId: string | null;
  setSelectedDate: (date: string) => void; setForm: (form: StudyForm) => void;   onSave: (event: FormEvent) => void;
  onEdit: (entry: SprintSnapshot["study_sessions"][number]) => void; onDelete: (id: string) => void; onCancel: () => void;
}) {
  const { snapshot, totalMinutes, selectedDate, form, editingId, setSelectedDate, setForm, onSave, onEdit, onDelete, onCancel } = props;
  const dailyTotals = snapshot.days.map((day) => ({ day, minutes: snapshot.study_sessions.filter((entry) => entry.study_date === day.date).reduce((sum, entry) => sum + entry.focused_minutes, 0) }));
  const maxMinutes = Math.max(240, ...dailyTotals.map((item) => item.minutes));
  const weekOne = dailyTotals.slice(0, 7).reduce((sum, item) => sum + item.minutes, 0);
  const weekTwo = dailyTotals.slice(7).reduce((sum, item) => sum + item.minutes, 0);
  const average = snapshot.days.length ? Math.round(totalMinutes / snapshot.days.length) : 0;
  const target = snapshot.sprint.daily_target_minutes * snapshot.days.length;
  const sessions = snapshot.study_sessions.filter((item) => item.study_date === selectedDate);
  return (
    <>
      <PageHeading eyebrow="FOCUSED LEARNING · MANUAL ENTRIES" title="Study hours" description="Record focused minutes by track. Multiple entries are supported; actual time stays separate from your suggested allocations." />
      <div className="sprint-stat-grid three">
        <StatCard label="SPRINT TOTAL" value={minutesLabel(totalMinutes)} detail={`${(totalMinutes / 60).toFixed(1)} of ${(target / 60).toFixed(0)} target hours`} icon={<Clock3 size={16} />} />
        <StatCard label="DAILY AVERAGE" value={minutesLabel(average)} detail="Across all 15 sprint days" />
        <StatCard label="ADDITIONAL WORK" value={`${(snapshot.engineering_work.reduce((sum, item) => sum + item.minutes_spent, 0) / 60).toFixed(1)}h`} detail="Excluded from learning totals" />
      </div>
      <section className="sprint-card sprint-chart-card">
        <div className="sprint-card-heading"><div><p className="sprint-eyebrow">PLANNED 240 MIN / DAY</p><h2>Daily focused minutes</h2></div><span className="sprint-muted sprint-small">Week 1 · {minutesLabel(weekOne)} &nbsp; / &nbsp; Week 2 · {minutesLabel(weekTwo)}</span></div>
        <div className="sprint-bar-chart" role="img" aria-label="Daily focused study minutes">
          {dailyTotals.map(({ day, minutes }) => <button key={day.id} type="button" className="sprint-bar-column" onClick={() => setSelectedDate(day.date)} aria-label={`Day ${day.day_number}, ${minutes} focused minutes`}>
            <span className="sprint-bar-value">{minutes || ""}</span><span className={`sprint-stacked-bar ${day.date === selectedDate ? "selected" : ""}`} style={{ height: `${Math.max(3, minutes / maxMinutes * 100)}%` }}>
              {TRACKS.map((track) => { const trackMinutes = snapshot.study_sessions.filter((entry) => entry.study_date === day.date && entry.track === track).reduce((sum, entry) => sum + entry.focused_minutes, 0); return <i key={track} className={TRACK_CLASS[track]} style={{ height: `${minutes ? trackMinutes / minutes * 100 : 0}%` }} />; })}
            </span><span className="sprint-bar-label">D{day.day_number}</span>
          </button>)}
        </div>
        <div className="sprint-chart-legend">{TRACKS.map((track) => <span key={track}><i className={TRACK_CLASS[track]} />{TRACK_LABEL[track]}</span>)}<span className="sprint-chart-target"><i />240m target</span></div>
      </section>
      <div className="sprint-data-layout">
        <section className="sprint-card">
          <div className="sprint-card-heading"><div><p className="sprint-eyebrow">DAY {snapshot.days.find((day) => day.date === selectedDate)?.day_number ?? "—"} · {dateLabel(selectedDate).toUpperCase()}</p><h2>Time entries</h2></div><span className="sprint-day-target">{minutesLabel(sessions.reduce((sum, entry) => sum + entry.focused_minutes, 0))} total</span></div>
          {sessions.length ? <div className="sprint-entry-list">{sessions.map((entry) => <div className="sprint-entry-row" key={entry.id}><TrackBadge track={entry.track} /><strong>{minutesLabel(entry.focused_minutes)}</strong><span>{entry.notes || "No session note"}</span><button type="button" className="sprint-icon-button" onClick={() => onEdit(entry)} aria-label="Edit entry"><FileText size={14} /></button><button type="button" className="sprint-icon-button danger" onClick={() => onDelete(entry.id)} aria-label="Delete entry"><Trash2 size={14} /></button></div>)}</div> : <p className="sprint-empty-small">No time logged for this day yet.</p>}
        </section>
        <section className="sprint-card sprint-form-card">
          <div className="sprint-card-heading"><div><p className="sprint-eyebrow">{editingId ? "UPDATE ENTRY" : "MANUAL LOG"}</p><h2>{editingId ? "Edit study time" : "Add study time"}</h2></div></div>
          <form className="sprint-form-stack" onSubmit={onSave}>
            <label className="sprint-field"><span>Date</span><select value={form.study_date} onChange={(event) => { setSelectedDate(event.target.value); setForm({ ...form, study_date: event.target.value }); }}>{snapshot.days.map((day) => <option key={day.id} value={day.date}>Day {day.day_number} · {dateLabel(day.date)}</option>)}</select></label>
            <label className="sprint-field"><span>Track</span><select value={form.track} onChange={(event) => setForm({ ...form, track: event.target.value as Track })}>{TRACKS.map((track) => <option key={track} value={track}>{TRACK_LABEL[track]}</option>)}</select></label>
            <label className="sprint-field"><span>Focused minutes</span><input type="number" min="1" max="1440" required value={form.focused_minutes} onChange={(event) => setForm({ ...form, focused_minutes: event.target.value })} placeholder="e.g. 60" /></label>
            <label className="sprint-field"><span>Session note</span><textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="What did you focus on?" /></label>
            <div className="sprint-form-actions"><button type="submit" className="sprint-button primary">{editingId ? "Update entry" : "Save time entry"}</button>{editingId && <button type="button" className="sprint-button subtle" onClick={onCancel}>Cancel</button>}</div>
          </form>
        </section>
      </div>
    </>
  );
}

function AdditionalWork(props: {
  snapshot: SprintSnapshot; totalMinutes: number; selectedDate: string; form: WorkForm; editingId: string | null;
  filter: string; setFilter: (filter: string) => void; setForm: (form: WorkForm) => void;
  onSave: (event: FormEvent) => void; onEdit: (work: EngineeringWork) => void; onDelete: (work: EngineeringWork) => void; onCancel: () => void;
}) {
  const { snapshot, totalMinutes, selectedDate, form, editingId, filter, setFilter, setForm, onSave, onEdit, onDelete, onCancel } = props;
  const [dateFilter, setDateFilter] = useState("");
  const projects = [...new Set(snapshot.engineering_work.map((work) => work.project_name))];
  const entries = snapshot.engineering_work.filter((work) => (!filter || work.project_name === filter) && (!dateFilter || work.work_date === dateFilter));
  const updateText = (key: keyof WorkForm, value: string) => setForm({ ...form, [key]: value });
  return (
    <>
      <PageHeading eyebrow="PRACTICAL ENGINEERING · SEPARATE METRIC" title="Additional engineering work" description="Log project implementation, experiments, debugging, and lessons outside your 50/30/20 learning allocation." actions={<span className="sprint-date-range">{(totalMinutes / 60).toFixed(1)}h logged</span>} />
      <div className="sprint-data-layout work-layout">
        <section className="sprint-card">
          <div className="sprint-card-heading"><div><p className="sprint-eyebrow">{snapshot.engineering_work.length} ENTRIES · {projects.length} PROJECTS</p><h2>Work log</h2></div><div className="sprint-filter-wrap"><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter by project"><option value="">All projects</option>{projects.map((name) => <option key={name}>{name}</option>)}</select><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filter by date"><option value="">All dates</option>{snapshot.days.map((day) => <option key={day.id} value={day.date}>{dateLabel(day.date)}</option>)}</select></div></div>
          {entries.length ? <div className="sprint-work-list">{entries.map((work) => <article className="sprint-work-entry" key={work.id}><div className="sprint-work-top"><div><span className="sprint-project-label">{work.project_name}</span><h3>{work.title}</h3></div><div className="sprint-work-meta"><span>{dateLabel(work.work_date)}</span><strong>{minutesLabel(work.minutes_spent)}</strong></div></div>{work.description && <p>{work.description}</p>}{work.implementation && <div className="sprint-work-detail"><strong>IMPLEMENTED</strong><span>{work.implementation}</span></div>}{work.technologies.length > 0 && <div className="sprint-tech-tags">{work.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div>}{work.bugs && <div className="sprint-work-detail"><strong>BUG / PROBLEM</strong><span>{work.bugs}</span></div>}{work.experiments && <div className="sprint-work-detail"><strong>EXPERIMENT</strong><span>{work.experiments}</span></div>}{work.learning_outcomes && <div className="sprint-work-detail"><strong>LEARNED</strong><span>{work.learning_outcomes}</span></div>}{work.notes && <p className="sprint-task-note">{work.notes}</p>}<div className="sprint-work-actions"><button type="button" className="sprint-text-button" onClick={() => onEdit(work)}>Edit</button><button type="button" className="sprint-text-button danger-text" onClick={() => onDelete(work)}>Delete</button></div></article>)}</div> : <div className="sprint-empty-state"><FolderKanban size={22} /><strong>No additional work logged</strong><span>Record practical project time here. It stays separate from study totals.</span></div>}
        </section>
        <section className="sprint-card sprint-form-card">
          <div className="sprint-card-heading"><div><p className="sprint-eyebrow">{editingId ? "UPDATE ENTRY" : "PROJECT LOG"}</p><h2>{editingId ? "Edit work" : "Add engineering work"}</h2></div></div>
          <form className="sprint-form-stack" onSubmit={onSave}>
            <div className="sprint-form-grid"><label className="sprint-field"><span>Project name</span><input required maxLength={160} value={form.project_name} onChange={(event) => updateText("project_name", event.target.value)} placeholder="e.g. API rate limiter" /></label><label className="sprint-field"><span>Date</span><select value={form.work_date} onChange={(event) => updateText("work_date", event.target.value)}>{snapshot.days.map((day) => <option key={day.id} value={day.date}>{dateLabel(day.date)}</option>)}</select></label></div>
            <label className="sprint-field"><span>Work title</span><input required maxLength={200} value={form.title} onChange={(event) => updateText("title", event.target.value)} /></label>
            <label className="sprint-field"><span>What I worked on</span><textarea rows={2} value={form.description} onChange={(event) => updateText("description", event.target.value)} /></label>
            <label className="sprint-field"><span>What I implemented</span><textarea rows={2} value={form.implementation} onChange={(event) => updateText("implementation", event.target.value)} /></label>
            <label className="sprint-field"><span>Technologies · comma separated</span><input value={form.technologies.join(", ")} onChange={(event) => setForm({ ...form, technologies: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} placeholder="Node.js, PostgreSQL" /></label>
            <div className="sprint-form-grid"><label className="sprint-field"><span>Bug / problem</span><textarea rows={2} value={form.bugs} onChange={(event) => updateText("bugs", event.target.value)} /></label><label className="sprint-field"><span>Experiment</span><textarea rows={2} value={form.experiments} onChange={(event) => updateText("experiments", event.target.value)} /></label></div>
            <label className="sprint-field"><span>Learning outcomes</span><textarea rows={2} value={form.learning_outcomes} onChange={(event) => updateText("learning_outcomes", event.target.value)} /></label>
            <div className="sprint-form-grid"><label className="sprint-field"><span>Time · minutes</span><input type="number" min="0" max="1440" value={form.minutes_spent} onChange={(event) => setForm({ ...form, minutes_spent: Number(event.target.value) })} /></label><label className="sprint-field"><span>Personal remarks</span><input value={form.notes} onChange={(event) => updateText("notes", event.target.value)} /></label></div>
            <div className="sprint-form-actions"><button className="sprint-button primary" type="submit">{editingId ? "Update work" : "Save work entry"}</button>{editingId && <button type="button" className="sprint-button subtle" onClick={onCancel}>Cancel</button>}</div>
          </form>
        </section>
      </div>
    </>
  );
}

function Reflections(props: {
  selectedDay: SprintDay | null; selectedDate: string; draft: Draft; status: "idle" | "saving" | "saved" | "failed";
  onChooseDate: (date: string) => void; onChange: (key: keyof Draft, value: string) => void; onRetry: () => void;
}) {
  const { selectedDay, selectedDate, draft, status, onChooseDate, onChange, onRetry } = props;
  const fields: { key: keyof Draft; label: string; hint: string }[] = [
    { key: "learned", label: "What I learned today", hint: "Capture new concepts, systems, and mental models." },
    { key: "clear_topics", label: "What I understood clearly", hint: "What can you now explain or implement confidently?" },
    { key: "difficult_topics", label: "What confused me", hint: "Be specific about the gap or question." },
    { key: "revisit", label: "What I need to revise", hint: "A short revisit list for future sessions." },
    { key: "tomorrow_focus", label: "Tomorrow’s focus", hint: "Choose the next useful action." },
    { key: "remarks", label: "Additional remarks", hint: "Context, decisions, or a note to your future self." },
  ];
  return <>
    <PageHeading eyebrow="DAILY LEARNING JOURNAL" title="Notes & reflections" description="Your notes autosave to the shared tracker. Switch days at any time; drafts remain tied to their date." actions={<span className={`sprint-reflection-status ${status}`}>{status === "saving" ? "Saving…" : status === "saved" ? <><Check size={14} /> Saved</> : status === "failed" ? <><Cloud size={14} /> Save failed <button type="button" onClick={onRetry}>Retry</button></> : "Autosave enabled"}</span>} />
    <div className="sprint-day-picker reflection-days"><div className="sprint-day-picker-scroll">{(props.selectedDay ? [props.selectedDay] : []).length === 0 ? null : null}{/* date selector below includes every sprint day */}</div></div>
    <label className="sprint-field sprint-reflection-date"><span>Reflection date</span><select value={selectedDate} onChange={(event) => onChooseDate(event.target.value)}>{Array.from({ length: 15 }, (_, index) => { const date = new Date(`${SPRINT_START}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + index); const iso = date.toISOString().slice(0, 10); return <option key={iso} value={iso}>Day {index + 1} · {dateLabel(iso, { weekday: "long", month: "short", day: "numeric" })}</option>; })}</select><small>{selectedDay ? `${dayName(selectedDay)} · Day ${selectedDay.day_number}` : "Select a sprint day"}</small></label>
    <div className="sprint-reflection-grid">{fields.map(({ key, label, hint }) => <label className="sprint-card sprint-reflection-field" key={key}><span>{label}</span><small>{hint}</small><textarea rows={key === "learned" || key === "remarks" ? 5 : 4} value={draft[key]} onChange={(event) => onChange(key, event.target.value)} placeholder="Write a short reflection…" /></label>)}</div>
    <div className="sprint-reflection-footer"><ShieldCheck size={15} /> Reflections are private and stored on the server. Last change: {status === "saved" ? "synced" : status === "failed" ? "not synced" : "pending"}.</div>
  </>;
}

function FinalReport(props: { snapshot: SprintSnapshot; report: string; setReport: (value: string) => void; onExport: () => void; onImport: (file?: File) => void }) {
  const { snapshot, report, setReport, onExport, onImport } = props;
  const [copied, setCopied] = useState(false);
  const [selectedReportFile, setSelectedReportFile] = useState<File | undefined>();
  const total = snapshot.study_sessions.reduce((sum, item) => sum + item.focused_minutes, 0);
  const extra = snapshot.engineering_work.reduce((sum, item) => sum + item.minutes_spent, 0);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return <>
    <PageHeading eyebrow="SPRINT CLOSEOUT · EXPORTABLE HISTORY" title="Final report" description="Review the saved learning record, copy a human-readable report, or export a complete JSON backup." actions={<button className="sprint-button primary" onClick={onExport}><Download size={15} /> Export JSON</button>} />
    <div className="sprint-report-metrics"><span><strong>{(total / 60).toFixed(1)}h</strong>focused learning</span>{TRACKS.map((track) => <span key={track}><strong>{(minutesForTrack(snapshot, track) / 60).toFixed(1)}h</strong>{TRACK_LABEL[track]}</span>)}<span><strong>{(extra / 60).toFixed(1)}h</strong>additional work</span></div>
    <div className="sprint-report-actions">
      <label className="sprint-button subtle sprint-upload-button"><Upload size={15} /> Choose JSON backup<input type="file" accept=".json,application/json" onChange={(event) => { const file = event.target.files?.[0]; setSelectedReportFile(file); onImport(file); event.currentTarget.value = ""; }} /></label>
      <span className="sprint-muted sprint-small">Import validates structure, previews changes, then asks before merging.</span>
      {selectedReportFile && <span className="sprint-muted sprint-small">{selectedReportFile.name}</span>}
    </div>
    <section className="sprint-card sprint-report-card"><div className="sprint-card-heading"><div><p className="sprint-eyebrow">HUMAN-READABLE · EDITABLE</p><h2>Learning summary</h2></div><button type="button" className="sprint-button subtle" onClick={() => void copy()}><FileText size={15} />{copied ? "Copied" : "Copy report"}</button></div><textarea className="sprint-report-text" value={report} onChange={(event) => setReport(event.target.value)} aria-label="Human-readable sprint report" /></section>
    <p className="sprint-report-note">This report reflects saved tracker data only. It does not invent activity for days without entries.</p>
  </>;
}

function LoadingState({ onRetry }: { onRetry: () => void }) {
  return <div className="sprint-empty-state large"><Cloud size={24} /><strong>Tracker data is not available</strong><span>Check your server configuration or network connection, then try again.</span><button type="button" className="sprint-button subtle" onClick={onRetry}><RefreshCw size={15} /> Retry sync</button></div>;
}
