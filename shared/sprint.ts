export const SPRINT_ID = "engineering-15-day-2026";
export const SPRINT_START = "2026-11-17";
export const SPRINT_END = "2026-12-01";
export const SPRINT_TIME_ZONE = "Asia/Kolkata";
export const DAILY_TARGET_MINUTES = 240;

export type Track = "backend" | "ai" | "dsa";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed";

export interface TrackAllocations {
  backend: number;
  ai: number;
  dsa: number;
}

export interface SprintDay {
  id: string;
  sprint_id: string;
  day_number: number;
  date: string;
  status: "planned" | "completed" | "missed" | "leave";
  is_leave: boolean;
  target_minutes: number;
  allocations: TrackAllocations;
  notes: string;
  completion_at: string | null;
  updated_at: string;
}

export interface SprintTask {
  id: string;
  sprint_id: string;
  day_id: string;
  track: Track;
  title: string;
  description: string;
  sort_order: number;
  priority: TaskPriority;
  status: TaskStatus;
  completion_at: string | null;
  original_scheduled_date: string;
  scheduled_date: string;
  rescheduled_from_date: string | null;
  is_predefined: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  sprint_id: string;
  study_date: string;
  track: Track;
  focused_minutes: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface EngineeringWork {
  id: string;
  sprint_id: string;
  work_date: string;
  project_name: string;
  title: string;
  description: string;
  implementation: string;
  technologies: string[];
  bugs: string;
  experiments: string;
  learning_outcomes: string;
  minutes_spent: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface DailyReflection {
  id: string;
  sprint_id: string;
  reflection_date: string;
  learned: string;
  clear_topics: string;
  difficult_topics: string;
  revisit: string;
  tomorrow_focus: string;
  remarks: string;
  updated_at: string;
}

export interface TaskReschedule {
  id: string;
  task_id: string;
  from_date: string;
  to_date: string;
  reason: string;
  created_at: string;
}

export interface RecoveryEvent {
  id: string;
  sprint_id: string;
  missed_date: string;
  reason: string;
  recovery_date: string | null;
  reviewed_at: string;
  created_at: string;
}

export interface SprintSnapshot {
  sprint: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    timezone: string;
    daily_target_minutes: number;
    default_allocations: TrackAllocations;
  };
  days: SprintDay[];
  tasks: SprintTask[];
  study_sessions: StudySession[];
  engineering_work: EngineeringWork[];
  reflections: DailyReflection[];
  reschedules: TaskReschedule[];
  recovery_events: RecoveryEvent[];
}

export interface CurriculumDay {
  backend: { title: string; topics: string[] };
  ai: { title: string; topics: string[] };
  dsa: { title: string; topics: string[] };
}

export const CURRICULUM: CurriculumDay[] = [
  {
    backend: { title: "Node.js internals", topics: ["Runtime architecture", "Call stack", "Event loop", "Event queue", "Microtasks", "Timers"] },
    ai: { title: "LLM fundamentals", topics: ["What is an LLM?", "Transformer overview", "Inference"] },
    dsa: { title: "Arrays", topics: ["Traversal", "Searching", "Frequency counting"] },
  },
  {
    backend: { title: "Asynchronous programming", topics: ["Promises", "async/await", "Concurrency", "Error propagation", "Promise.all and related patterns"] },
    ai: { title: "Tokenization", topics: ["Tokens", "Token IDs", "Token counting", "Tokenization trade-offs"] },
    dsa: { title: "Strings", topics: ["Character frequency", "Palindrome", "String manipulation"] },
  },
  {
    backend: { title: "API engineering", topics: ["REST principles", "HTTP methods", "HTTP status codes", "Request validation", "Middleware", "Error handling"] },
    ai: { title: "Context windows", topics: ["Context limits", "Input/output tokens", "Context management", "Truncation"] },
    dsa: { title: "Hashing", topics: ["HashMap", "HashSet", "Duplicate detection"] },
  },
  {
    backend: { title: "Authentication and authorization", topics: ["Password hashing", "JWT", "Access tokens", "Refresh tokens", "Authentication vs authorization"] },
    ai: { title: "Prompt engineering", topics: ["System prompts", "User prompts", "Few-shot prompting", "Prompt structure"] },
    dsa: { title: "Two pointers", topics: [] },
  },
  {
    backend: { title: "Database engineering", topics: ["Relational schema design", "Relationships", "Transactions", "ACID properties", "Constraints"] },
    ai: { title: "LLM APIs", topics: ["Requests and responses", "API parameters", "Temperature", "Error handling"] },
    dsa: { title: "Sliding window", topics: [] },
  },
  {
    backend: { title: "Database performance", topics: ["Indexes", "Query execution", "EXPLAIN", "Query optimization", "N+1 query problem"] },
    ai: { title: "Embeddings", topics: ["Vector representations", "Embedding models", "Semantic meaning"] },
    dsa: { title: "Prefix sums", topics: [] },
  },
  {
    backend: { title: "Redis", topics: ["Caching", "TTL", "Cache-aside", "Cache invalidation", "Cache consistency"] },
    ai: { title: "Semantic search", topics: ["Cosine similarity", "Distance", "Nearest neighbours", "Similarity limitations"] },
    dsa: { title: "Binary search", topics: [] },
  },
  {
    backend: { title: "Message queues", topics: ["RabbitMQ architecture", "Producers", "Consumers", "Acknowledgements", "Message delivery"] },
    ai: { title: "Vector databases", topics: ["Chroma", "FAISS", "Indexing", "Metadata"] },
    dsa: { title: "Stack and queue", topics: ["Stack", "Queue", "Monotonic stack basics"] },
  },
  {
    backend: { title: "Reliability engineering", topics: ["Retries", "Timeouts", "Idempotency", "Dead-letter queues", "Failure handling"] },
    ai: { title: "Document processing", topics: ["PDF extraction", "Text extraction", "Chunking", "Chunk overlap"] },
    dsa: { title: "Linked lists", topics: ["Traversal", "Reversal", "Cycle detection"] },
  },
  {
    backend: { title: "Docker", topics: ["Images", "Containers", "Volumes", "Networking", "Docker Compose"] },
    ai: { title: "RAG architecture", topics: ["Ingestion", "Retrieval", "Context injection", "Generation"] },
    dsa: { title: "Recursion", topics: [] },
  },
  {
    backend: { title: "Testing", topics: ["Unit testing", "Integration testing", "API testing", "Mocking", "Test cases"] },
    ai: { title: "Retrieval quality", topics: ["Top-K", "Metadata filters", "Reranking basics", "Retrieval relevance"] },
    dsa: { title: "Trees", topics: ["Traversals", "DFS", "BFS"] },
  },
  {
    backend: { title: "System design", topics: ["Requirements", "Capacity estimation", "API design", "Database design", "Trade-offs"] },
    ai: { title: "Structured outputs", topics: ["JSON outputs", "Schemas", "Validation", "Tool calling"] },
    dsa: { title: "Binary search trees", topics: ["Search", "Insertion", "Properties"] },
  },
  {
    backend: { title: "Distributed systems", topics: ["Load balancing", "Horizontal scaling", "Bottlenecks", "Stateless services", "Distributed failure concepts"] },
    ai: { title: "Streaming", topics: ["Token streaming", "Async responses", "API integration"] },
    dsa: { title: "Heaps", topics: ["Priority queues", "Top-K problems"] },
  },
  {
    backend: { title: "Real-time systems", topics: ["WebSockets", "Event-driven communication", "Connection management", "Reconnection", "Real-time system trade-offs"] },
    ai: { title: "AI evaluation", topics: ["Retrieval quality", "Hallucinations", "Grounding", "Evaluation examples"] },
    dsa: { title: "Graphs", topics: ["BFS", "DFS", "Visited sets"] },
  },
  {
    backend: { title: "Architecture review", topics: ["Request lifecycle", "System architecture", "Bottlenecks", "Failure scenarios", "Engineering trade-offs"] },
    ai: { title: "AI application reliability", topics: ["Token costs", "Latency", "Retries", "Rate limits", "Logging"] },
    dsa: { title: "Dynamic programming", topics: ["Memoization", "Tabulation", "State transitions"] },
  },
];

export const DEFAULT_ALLOCATIONS: TrackAllocations = { backend: 120, ai: 72, dsa: 48 };

export function sprintDate(dayNumber: number): string {
  const date = new Date(`${SPRINT_START}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + dayNumber - 1);
  return date.toISOString().slice(0, 10);
}
