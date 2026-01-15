/**
 * useSSE Hook
 *
 * A generic React hook for consuming Server-Sent Events (SSE) streams.
 * Provides connection management, automatic reconnection, and proper cleanup.
 *
 * @example
 * ```tsx
 * const { data, error, isConnected, connect, disconnect } = useSSE<StreamEvent>({
 *   url: '/api/research',
 *   method: 'POST',
 *   body: { topic: 'AI developments', mode: 'web' },
 *   onEvent: (event) => console.log('Received:', event),
 *   onComplete: () => console.log('Stream complete'),
 *   onError: (error) => console.error('Error:', error),
 * });
 * ```
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// =============================================================================
// TYPES
// =============================================================================

/** Configuration options for the useSSE hook */
export interface UseSSEOptions<T> {
  /** The URL to connect to */
  url: string;

  /** HTTP method (default: 'GET') */
  method?: "GET" | "POST";

  /** Request body for POST requests */
  body?: Record<string, unknown>;

  /** Additional headers to send with the request */
  headers?: Record<string, string>;

  /** Callback fired for each event received */
  onEvent?: (event: T) => void;

  /** Callback fired when the stream completes normally */
  onComplete?: () => void;

  /** Callback fired when an error occurs */
  onError?: (error: Error) => void;

  /** Callback fired when connection status changes */
  onConnectionChange?: (isConnected: boolean) => void;

  /** Whether to automatically connect on mount (default: false) */
  autoConnect?: boolean;

  /** Whether to automatically reconnect on error (default: false) */
  autoReconnect?: boolean;

  /** Delay before reconnecting in ms (default: 3000) */
  reconnectDelay?: number;

  /** Maximum number of reconnection attempts (default: 3) */
  maxReconnectAttempts?: number;

  /** Parse events as JSON (default: true) */
  parseJson?: boolean;
}

/** Return type for the useSSE hook */
export interface UseSSEReturn<T> {
  /** Array of all received events */
  data: T[];

  /** The most recent event received */
  lastEvent: T | null;

  /** Current error, if any */
  error: Error | null;

  /** Whether the connection is currently active */
  isConnected: boolean;

  /** Whether a connection attempt is in progress */
  isConnecting: boolean;

  /** Number of reconnection attempts made */
  reconnectAttempts: number;

  /** Connect to the SSE stream */
  connect: () => void;

  /** Disconnect from the SSE stream */
  disconnect: () => void;

  /** Clear all received data */
  clearData: () => void;

  /** Reset error state */
  clearError: () => void;
}

/** Internal state for the hook */
interface SSEState<T> {
  data: T[];
  lastEvent: T | null;
  error: Error | null;
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * React hook for consuming Server-Sent Events (SSE) streams.
 *
 * @param options - Configuration options for the SSE connection
 * @returns Object containing state and control functions
 */
export function useSSE<T = unknown>(options: UseSSEOptions<T>): UseSSEReturn<T> {
  const {
    url,
    method = "GET",
    body,
    headers = {},
    onEvent,
    onComplete,
    onError,
    onConnectionChange,
    autoConnect = false,
    autoReconnect = false,
    reconnectDelay = 3000,
    maxReconnectAttempts = 3,
    parseJson = true,
  } = options;

  // State
  const [state, setState] = useState<SSEState<T>>({
    data: [],
    lastEvent: null,
    error: null,
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
  });

  // Refs for cleanup and tracking
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);

  // Stable callback refs
  const onEventRef = useRef(onEvent);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const onConnectionChangeRef = useRef(onConnectionChange);

  // Update callback refs
  useEffect(() => {
    onEventRef.current = onEvent;
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
    onConnectionChangeRef.current = onConnectionChange;
  }, [onEvent, onComplete, onError, onConnectionChange]);

  /**
   * Updates state safely, only if component is still mounted.
   */
  const safeSetState = useCallback(
    (updater: Partial<SSEState<T>> | ((prev: SSEState<T>) => SSEState<T>)) => {
      if (isMountedRef.current) {
        setState((prev) =>
          typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
        );
      }
    },
    []
  );

  /**
   * Disconnects from the SSE stream.
   */
  const disconnect = useCallback(() => {
    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Abort the current connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    safeSetState({
      isConnected: false,
      isConnecting: false,
    });

    onConnectionChangeRef.current?.(false);
  }, [safeSetState]);

  /**
   * Connects to the SSE stream.
   */
  const connect = useCallback(async () => {
    // Disconnect any existing connection
    disconnect();

    // Reset reconnect attempts on manual connect
    reconnectAttemptsRef.current = 0;

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    safeSetState({
      isConnecting: true,
      error: null,
      reconnectAttempts: 0,
    });

    try {
      // Build request options
      const requestInit: RequestInit = {
        method,
        headers: {
          Accept: "text/event-stream",
          ...headers,
        },
        signal: abortControllerRef.current.signal,
      };

      // Add body for POST requests
      if (method === "POST" && body) {
        requestInit.headers = {
          ...requestInit.headers,
          "Content-Type": "application/json",
        };
        requestInit.body = JSON.stringify(body);
      }

      // Make the request
      const response = await fetch(url, requestInit);

      // Check for errors
      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.message || errorBody.error || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }
        throw new Error(errorMessage);
      }

      // Verify we got an SSE stream
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("text/event-stream")) {
        throw new Error(`Expected text/event-stream but got ${contentType}`);
      }

      // Update connection state
      safeSetState({
        isConnecting: false,
        isConnected: true,
      });
      onConnectionChangeRef.current?.(true);

      // Get the reader
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Stream ended normally
          onCompleteRef.current?.();
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete events (separated by double newlines)
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? ""; // Keep incomplete event in buffer

        for (const eventText of events) {
          if (!eventText.trim()) continue;

          // Parse SSE format
          const lines = eventText.split("\n");
          let eventData = "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              eventData += line.slice(6);
            } else if (line.startsWith("data:")) {
              eventData += line.slice(5);
            }
          }

          if (!eventData) continue;

          // Parse and emit the event
          let parsedEvent: T;
          if (parseJson) {
            try {
              parsedEvent = JSON.parse(eventData) as T;
            } catch {
              console.warn("Failed to parse SSE event as JSON:", eventData);
              continue;
            }
          } else {
            parsedEvent = eventData as unknown as T;
          }

          // Update state with new event
          safeSetState((prev) => ({
            ...prev,
            data: [...prev.data, parsedEvent],
            lastEvent: parsedEvent,
          }));

          // Fire callback
          onEventRef.current?.(parsedEvent);

          // Check if this is a complete or error event
          const eventType = (parsedEvent as { type?: string }).type;
          if (eventType === "complete") {
            onCompleteRef.current?.();
          } else if (eventType === "error") {
            const errorMessage =
              (parsedEvent as { message?: string }).message ?? "Unknown error";
            const error = new Error(errorMessage);
            safeSetState({ error });
            onErrorRef.current?.(error);
          }
        }
      }

      // Stream completed
      safeSetState({
        isConnected: false,
        isConnecting: false,
      });
      onConnectionChangeRef.current?.(false);
    } catch (error) {
      // Handle abort (not an error)
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      const err = error instanceof Error ? error : new Error(String(error));

      safeSetState({
        error: err,
        isConnected: false,
        isConnecting: false,
      });
      onConnectionChangeRef.current?.(false);
      onErrorRef.current?.(err);

      // Attempt reconnection if enabled
      if (
        autoReconnect &&
        reconnectAttemptsRef.current < maxReconnectAttempts &&
        isMountedRef.current
      ) {
        reconnectAttemptsRef.current++;
        safeSetState({ reconnectAttempts: reconnectAttemptsRef.current });

        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            connect();
          }
        }, reconnectDelay);
      }
    }
  }, [
    url,
    method,
    body,
    headers,
    parseJson,
    autoReconnect,
    maxReconnectAttempts,
    reconnectDelay,
    disconnect,
    safeSetState,
  ]);

  /**
   * Clears all received data.
   */
  const clearData = useCallback(() => {
    safeSetState({
      data: [],
      lastEvent: null,
    });
  }, [safeSetState]);

  /**
   * Clears the current error.
   */
  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
  }, [autoConnect, connect]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [disconnect]);

  return {
    data: state.data,
    lastEvent: state.lastEvent,
    error: state.error,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    reconnectAttempts: state.reconnectAttempts,
    connect,
    disconnect,
    clearData,
    clearError,
  };
}

// =============================================================================
// TYPED HOOK FOR RESEARCH EVENTS
// =============================================================================

import type { StreamEvent } from "@/lib/gemini";

/** Options specific to research SSE connections */
export interface UseResearchSSEOptions
  extends Omit<UseSSEOptions<StreamEvent>, "parseJson"> {
  /** Callback fired when research starts */
  onStart?: (interactionId: string) => void;

  /** Callback fired for thinking summaries */
  onThinking?: (summary: string) => void;

  /** Callback fired for status changes */
  onStatus?: (status: string) => void;

  /** Callback fired for content deltas */
  onContent?: (text: string) => void;

  /** Callback fired when research completes with final text */
  onResearchComplete?: (finalText?: string) => void;

  /** Callback fired on research error */
  onResearchError?: (message: string, code?: string) => void;
}

/** Return type with accumulated content */
export interface UseResearchSSEReturn extends UseSSEReturn<StreamEvent> {
  /** The accumulated content text */
  content: string;

  /** The current interaction ID */
  interactionId: string | null;

  /** The current status */
  status: string | null;

  /** Array of thinking summaries */
  thinkingSummaries: string[];
}

/**
 * Specialized hook for consuming research SSE streams with typed events.
 *
 * @param options - Configuration options for the research SSE connection
 * @returns Object containing state, accumulated content, and control functions
 */
export function useResearchSSE(
  options: UseResearchSSEOptions
): UseResearchSSEReturn {
  const {
    onStart,
    onThinking,
    onStatus,
    onContent,
    onResearchComplete,
    onResearchError,
    onEvent: userOnEvent,
    ...sseOptions
  } = options;

  // Accumulated state
  const [content, setContent] = useState("");
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [thinkingSummaries, setThinkingSummaries] = useState<string[]>([]);

  // Refs for stable callbacks
  const onStartRef = useRef(onStart);
  const onThinkingRef = useRef(onThinking);
  const onStatusRef = useRef(onStatus);
  const onContentRef = useRef(onContent);
  const onResearchCompleteRef = useRef(onResearchComplete);
  const onResearchErrorRef = useRef(onResearchError);

  useEffect(() => {
    onStartRef.current = onStart;
    onThinkingRef.current = onThinking;
    onStatusRef.current = onStatus;
    onContentRef.current = onContent;
    onResearchCompleteRef.current = onResearchComplete;
    onResearchErrorRef.current = onResearchError;
  }, [onStart, onThinking, onStatus, onContent, onResearchComplete, onResearchError]);

  // Handle events with type-specific callbacks
  const handleEvent = useCallback(
    (event: StreamEvent) => {
      userOnEvent?.(event);

      switch (event.type) {
        case "start":
          setInteractionId(event.interactionId);
          onStartRef.current?.(event.interactionId);
          break;

        case "thinking":
          setThinkingSummaries((prev) => [...prev, event.summary]);
          onThinkingRef.current?.(event.summary);
          break;

        case "status":
          setStatus(event.status);
          onStatusRef.current?.(event.status);
          break;

        case "content":
          setContent((prev) => prev + event.text);
          onContentRef.current?.(event.text);
          break;

        case "complete":
          onResearchCompleteRef.current?.(event.finalText);
          break;

        case "error":
          onResearchErrorRef.current?.(event.message, event.code);
          break;
      }
    },
    [userOnEvent]
  );

  // Use the base SSE hook
  const sseReturn = useSSE<StreamEvent>({
    ...sseOptions,
    parseJson: true,
    onEvent: handleEvent,
  });

  // Extended clear function
  const clearData = useCallback(() => {
    sseReturn.clearData();
    setContent("");
    setInteractionId(null);
    setStatus(null);
    setThinkingSummaries([]);
  }, [sseReturn]);

  return {
    ...sseReturn,
    clearData,
    content,
    interactionId,
    status,
    thinkingSummaries,
  };
}

export default useSSE;
