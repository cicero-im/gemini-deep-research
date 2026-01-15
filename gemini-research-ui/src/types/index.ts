/**
 * Shared TypeScript types for Gemini Deep Research UI
 */

/**
 * Research mode - determines what sources are used for research
 * - 'web': Web-only research using search and browse
 * - 'web+files': Web research combined with uploaded files
 */
export type ResearchMode = 'web' | 'web+files';

/**
 * Research status - tracks the lifecycle of a research request
 */
export type ResearchStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * Message role - identifies the sender of a message in the conversation
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Theme preference for the application
 */
export type Theme = 'dark' | 'light';

/**
 * Research entity - represents a single research session
 */
export interface Research {
  /** Auto-generated primary key (undefined before first save) */
  id?: number;
  /** The research topic/query submitted by the user */
  topic: string;
  /** The accumulated research content/report */
  content: string;
  /** Research mode used */
  mode: ResearchMode;
  /** Current status of the research */
  status: ResearchStatus;
  /** Interaction ID from the Gemini API for resuming sessions */
  interactionId?: string;
  /** Timestamp when the research was created */
  createdAt: Date;
  /** Timestamp when the research was last updated */
  updatedAt: Date;
}

/**
 * Message entity - represents a single message in the research conversation
 */
export interface Message {
  /** Auto-generated primary key (undefined before first save) */
  id?: number;
  /** Foreign key reference to the parent research */
  researchId: number;
  /** Who sent this message */
  role: MessageRole;
  /** The message content */
  content: string;
  /** Timestamp when the message was created */
  createdAt: Date;
}

/**
 * Settings entity - key-value store for application settings
 */
export interface Setting {
  /** Setting key (primary key) */
  key: string;
  /** Setting value (serialized as JSON string for complex values) */
  value: string;
}

/**
 * Progress information during streaming research
 */
export interface StreamProgress {
  /** Current status message (e.g., "Searching...", "Analyzing sources...") */
  status: string;
  /** Number of sources found/processed */
  sources: number;
  /** Tokens used so far */
  tokensUsed: number;
  /** Summary of the current thinking/reasoning process */
  thoughtSummary?: string;
}

/**
 * API response chunk during streaming
 * These types match the events sent by gemini.ts SSE stream
 */
export interface StreamChunk {
  /** Type of chunk - matches API event types */
  type: 'start' | 'thinking' | 'status' | 'progress' | 'content' | 'complete' | 'error';
  /** Timestamp of the event */
  timestamp?: number;
  /** Interaction ID (sent with 'start' and 'complete' types) */
  interactionId?: string;
  /** Thinking summary for 'thinking' type */
  summary?: string;
  /** Status value for 'status' type */
  status?: string;
  /** Progress data for 'progress' type chunks */
  progress?: Partial<StreamProgress>;
  /** Sources count for 'progress' type */
  sources?: number;
  /** Tokens count for 'progress' type */
  tokens?: number;
  /** Text content for 'content' type chunks */
  text?: string;
  /** Final text for 'complete' type */
  finalText?: string;
  /** Error message for 'error' type chunks */
  message?: string;
  /** Error code for 'error' type */
  code?: string;
}

/**
 * Parameters for starting a new research session
 */
export interface StartResearchParams {
  /** The research topic/query */
  topic: string;
  /** Research mode to use */
  mode: ResearchMode;
  /** Optional interaction ID to resume a previous session */
  interactionId?: string;
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  /** Number of items per page */
  limit: number;
  /** Number of items to skip */
  offset: number;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  /** The items for the current page */
  items: T[];
  /** Total count of all items matching the query */
  total: number;
  /** Whether there are more items after this page */
  hasMore: boolean;
}

/**
 * Search parameters for research history
 */
export interface SearchResearchParams extends PaginationParams {
  /** Search query to filter by topic */
  query?: string;
  /** Filter by status */
  status?: ResearchStatus;
  /** Filter by mode */
  mode?: ResearchMode;
}

/**
 * Error type for database operations
 */
export interface DatabaseError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Original error object */
  cause?: unknown;
}

/**
 * Type guard to check if an error is a DatabaseError
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as DatabaseError).code === 'string' &&
    typeof (error as DatabaseError).message === 'string'
  );
}

/**
 * Creates a new Research object with default values
 */
export function createResearch(
  topic: string,
  mode: ResearchMode = 'web'
): Omit<Research, 'id'> {
  const now = new Date();
  return {
    topic,
    content: '',
    mode,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates a new Message object with default values
 */
export function createMessage(
  researchId: number,
  role: MessageRole,
  content: string
): Omit<Message, 'id'> {
  return {
    researchId,
    role,
    content,
    createdAt: new Date(),
  };
}
