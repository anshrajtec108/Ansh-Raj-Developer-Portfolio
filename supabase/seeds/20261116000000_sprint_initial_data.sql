begin;

insert into public.sprints (
  id, title, start_date, end_date, timezone, daily_target_minutes, default_allocations
)
values (
  'engineering-15-day-2026',
  '15-Day Engineering Sprint',
  date '2026-11-17',
  date '2026-12-01',
  'Asia/Kolkata',
  240,
  '{"backend":120,"ai":72,"dsa":48}'::jsonb
)
on conflict (id) do nothing;

insert into public.sprint_days (
  sprint_id, day_number, day_date, target_minutes, allocations
)
select
  'engineering-15-day-2026',
  day_number,
  date '2026-11-17' + (day_number - 1),
  240,
  '{"backend":120,"ai":72,"dsa":48}'::jsonb
from generate_series(1, 15) as days(day_number)
on conflict (sprint_id, day_number) do nothing;

with curriculum(day_number, track, title, topics) as (
  values
    (1, 'backend', 'Node.js internals', array['Runtime architecture', 'Call stack', 'Event loop', 'Event queue', 'Microtasks', 'Timers']::text[]),
    (1, 'ai', 'LLM fundamentals', array['What is an LLM?', 'Transformer overview', 'Inference']::text[]),
    (1, 'dsa', 'Arrays', array['Traversal', 'Searching', 'Frequency counting']::text[]),
    (2, 'backend', 'Asynchronous programming', array['Promises', 'async/await', 'Concurrency', 'Error propagation', 'Promise.all and related patterns']::text[]),
    (2, 'ai', 'Tokenization', array['Tokens', 'Token IDs', 'Token counting', 'Tokenization trade-offs']::text[]),
    (2, 'dsa', 'Strings', array['Character frequency', 'Palindrome', 'String manipulation']::text[]),
    (3, 'backend', 'API engineering', array['REST principles', 'HTTP methods', 'HTTP status codes', 'Request validation', 'Middleware', 'Error handling']::text[]),
    (3, 'ai', 'Context windows', array['Context limits', 'Input/output tokens', 'Context management', 'Truncation']::text[]),
    (3, 'dsa', 'Hashing', array['HashMap', 'HashSet', 'Duplicate detection']::text[]),
    (4, 'backend', 'Authentication and authorization', array['Password hashing', 'JWT', 'Access tokens', 'Refresh tokens', 'Authentication vs authorization']::text[]),
    (4, 'ai', 'Prompt engineering', array['System prompts', 'User prompts', 'Few-shot prompting', 'Prompt structure']::text[]),
    (4, 'dsa', 'Two pointers', array[]::text[]),
    (5, 'backend', 'Database engineering', array['Relational schema design', 'Relationships', 'Transactions', 'ACID properties', 'Constraints']::text[]),
    (5, 'ai', 'LLM APIs', array['Requests and responses', 'API parameters', 'Temperature', 'Error handling']::text[]),
    (5, 'dsa', 'Sliding window', array[]::text[]),
    (6, 'backend', 'Database performance', array['Indexes', 'Query execution', 'EXPLAIN', 'Query optimization', 'N+1 query problem']::text[]),
    (6, 'ai', 'Embeddings', array['Vector representations', 'Embedding models', 'Semantic meaning']::text[]),
    (6, 'dsa', 'Prefix sums', array[]::text[]),
    (7, 'backend', 'Redis', array['Caching', 'TTL', 'Cache-aside', 'Cache invalidation', 'Cache consistency']::text[]),
    (7, 'ai', 'Semantic search', array['Cosine similarity', 'Distance', 'Nearest neighbours', 'Similarity limitations']::text[]),
    (7, 'dsa', 'Binary search', array[]::text[]),
    (8, 'backend', 'Message queues', array['RabbitMQ architecture', 'Producers', 'Consumers', 'Acknowledgements', 'Message delivery']::text[]),
    (8, 'ai', 'Vector databases', array['Chroma', 'FAISS', 'Indexing', 'Metadata']::text[]),
    (8, 'dsa', 'Stack and queue', array['Stack', 'Queue', 'Monotonic stack basics']::text[]),
    (9, 'backend', 'Reliability engineering', array['Retries', 'Timeouts', 'Idempotency', 'Dead-letter queues', 'Failure handling']::text[]),
    (9, 'ai', 'Document processing', array['PDF extraction', 'Text extraction', 'Chunking', 'Chunk overlap']::text[]),
    (9, 'dsa', 'Linked lists', array['Traversal', 'Reversal', 'Cycle detection']::text[]),
    (10, 'backend', 'Docker', array['Images', 'Containers', 'Volumes', 'Networking', 'Docker Compose']::text[]),
    (10, 'ai', 'RAG architecture', array['Ingestion', 'Retrieval', 'Context injection', 'Generation']::text[]),
    (10, 'dsa', 'Recursion', array[]::text[]),
    (11, 'backend', 'Testing', array['Unit testing', 'Integration testing', 'API testing', 'Mocking', 'Test cases']::text[]),
    (11, 'ai', 'Retrieval quality', array['Top-K', 'Metadata filters', 'Reranking basics', 'Retrieval relevance']::text[]),
    (11, 'dsa', 'Trees', array['Traversals', 'DFS', 'BFS']::text[]),
    (12, 'backend', 'System design', array['Requirements', 'Capacity estimation', 'API design', 'Database design', 'Trade-offs']::text[]),
    (12, 'ai', 'Structured outputs', array['JSON outputs', 'Schemas', 'Validation', 'Tool calling']::text[]),
    (12, 'dsa', 'Binary search trees', array['Search', 'Insertion', 'Properties']::text[]),
    (13, 'backend', 'Distributed systems', array['Load balancing', 'Horizontal scaling', 'Bottlenecks', 'Stateless services', 'Distributed failure concepts']::text[]),
    (13, 'ai', 'Streaming', array['Token streaming', 'Async responses', 'API integration']::text[]),
    (13, 'dsa', 'Heaps', array['Priority queues', 'Top-K problems']::text[]),
    (14, 'backend', 'Real-time systems', array['WebSockets', 'Event-driven communication', 'Connection management', 'Reconnection', 'Real-time system trade-offs']::text[]),
    (14, 'ai', 'AI evaluation', array['Retrieval quality', 'Hallucinations', 'Grounding', 'Evaluation examples']::text[]),
    (14, 'dsa', 'Graphs', array['BFS', 'DFS', 'Visited sets']::text[]),
    (15, 'backend', 'Architecture review', array['Request lifecycle', 'System architecture', 'Bottlenecks', 'Failure scenarios', 'Engineering trade-offs']::text[]),
    (15, 'ai', 'AI application reliability', array['Token costs', 'Latency', 'Retries', 'Rate limits', 'Logging']::text[]),
    (15, 'dsa', 'Dynamic programming', array['Memoization', 'Tabulation', 'State transitions']::text[])
)
insert into public.tasks (
  sprint_id, day_id, track, title, description, sort_order, priority,
  original_scheduled_date, scheduled_date, is_predefined
)
select
  'engineering-15-day-2026',
  sprint_day.id,
  curriculum.track,
  curriculum.title,
  array_to_string(curriculum.topics, E'\n'),
  case curriculum.track when 'backend' then 0 when 'ai' then 1 else 2 end,
  'medium',
  sprint_day.day_date,
  sprint_day.day_date,
  true
from curriculum
join public.sprint_days as sprint_day
  on sprint_day.sprint_id = 'engineering-15-day-2026'
 and sprint_day.day_number = curriculum.day_number
on conflict do nothing;

commit;
