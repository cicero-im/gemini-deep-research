/**
 * Custom hook for research operations
 *
 * Provides functionality to:
 * - Start new research sessions (with streaming support)
 * - Resume existing research
 * - Save research to IndexedDB
 * - Retrieve research by ID
 */

import { useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import {
  createResearch as dbCreateResearch,
  updateResearch as dbUpdateResearch,
  getResearchById as dbGetResearchById,
  createMessage as dbCreateMessage,
  getMessagesByResearchId,
} from '@/lib/db';
import type {
  Research,
  Message,
  StartResearchParams,
  StreamChunk,
  ResearchStatus,
} from '@/types';
import { createResearch as createResearchData, createMessage as createMessageData } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface UseResearchReturn {
  /** Currently active research */
  currentResearch: Research | null;
  /** Whether streaming is in progress */
  isStreaming: boolean;
  /** Accumulated streaming content */
  streamingContent: string;
  /** Current progress information */
  progress: {
    status: string;
    sources: number;
    tokensUsed: number;
    thoughtSummary?: string;
  };
  /** Start a new research session */
  startResearch: (params: StartResearchParams) => Promise<Research>;
  /** Resume an existing research session */
  resumeResearch: (researchId: number, followUpQuery?: string) => Promise<void>;
  /** Stop the current streaming request */
  stopResearch: () => void;
  /** Load a research by ID (without starting it) */
  loadResearch: (researchId: number) => Promise<Research | undefined>;
  /** Save current streaming content to the research */
  saveCurrentContent: () => Promise<void>;
  /** Recover content for research with interactionId but no content */
  recoverContent: (researchId: number) => Promise<string>;
  /** Get all messages for the current research */
  getMessages: () => Promise<Message[]>;
  /** Add a user message to the current research */
  addUserMessage: (content: string) => Promise<Message>;
  /** Current error state */
  error: string | null;
  /** Clear the current error */
  clearError: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useResearch(): UseResearchReturn {
  const {
    currentResearch,
    isStreaming,
    streamingContent,
    progress,
    error,
    apiKey,
    setCurrentResearch,
    updateCurrentResearch,
    startStreaming,
    stopStreaming,
    appendStreamingContent,
    updateProgress,
    resetProgress,
    setError,
    clearError,
  } = useAppStore();

  // Track if we're currently saving to prevent double saves
  const isSaving = useRef(false);

  /**
   * Processes a stream response from the API
   */
  const processStream = useCallback(
    async (
      response: Response,
      abortController: AbortController,
      researchId: number
    ): Promise<string> => {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let interactionId: string | undefined;

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done || abortController.signal.aborted) {
            break;
          }

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n').filter((line) => line.trim());

          for (const line of lines) {
            try {
              // Handle SSE format (data: {...})
              const jsonStr = line.startsWith('data: ') ? line.slice(6) : line;
              if (!jsonStr || jsonStr === '[DONE]') continue;

              const chunk: StreamChunk = JSON.parse(jsonStr);

              switch (chunk.type) {
                case 'start':
                  // Capture interaction ID for resume capability
                  if (chunk.interactionId) {
                    interactionId = chunk.interactionId;
                  }
                  break;

                case 'content':
                  // API sends 'text' field, not 'content'
                  if (chunk.text) {
                    accumulatedContent += chunk.text;
                    appendStreamingContent(chunk.text);
                  }
                  break;

                case 'thinking':
                  // Update progress with thought summary
                  if (chunk.summary) {
                    updateProgress({ thoughtSummary: chunk.summary });
                  }
                  break;

                case 'status':
                  // Update status
                  if (chunk.status) {
                    updateProgress({ status: chunk.status });
                  }
                  break;

                case 'progress':
                  // API sends sources/tokens directly, not nested in progress object
                  updateProgress({
                    sources: chunk.sources ?? chunk.progress?.sources,
                    tokensUsed: chunk.tokens ?? chunk.progress?.tokensUsed,
                  });
                  break;

                case 'complete':
                  // Capture interaction ID and any final text
                  if (chunk.interactionId) {
                    interactionId = chunk.interactionId;
                  }
                  if (chunk.finalText && !accumulatedContent) {
                    accumulatedContent = chunk.finalText;
                    appendStreamingContent(chunk.finalText);
                  }
                  break;

                case 'error':
                  // API sends 'message' field, not 'error'
                  throw new Error(chunk.message || 'Unknown streaming error');
              }
            } catch (parseError) {
              // Skip lines that aren't valid JSON (like SSE comments)
              if (line.startsWith(':')) continue;
              console.warn('Failed to parse stream chunk:', line, parseError);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Update research with final content and interaction ID
      if (accumulatedContent || interactionId) {
        await dbUpdateResearch(researchId, {
          content: accumulatedContent,
          interactionId,
          status: 'completed' as ResearchStatus,
        });
      }

      return accumulatedContent;
    },
    [appendStreamingContent, updateProgress]
  );

  /**
   * Makes the API request to start research
   */
  const makeResearchRequest = useCallback(
    async (
      topic: string,
      mode: string,
      abortController: AbortController,
      interactionId?: string
    ): Promise<Response> => {
      if (!apiKey) {
        throw new Error('API key is required. Please set your Gemini API key in settings.');
      }

      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          topic,
          mode,
          interactionId,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      return response;
    },
    [apiKey]
  );

  /**
   * Starts a new research session
   */
  const startResearch = useCallback(
    async (params: StartResearchParams): Promise<Research> => {
      const { topic, mode, interactionId } = params;

      // Validate API key
      if (!apiKey) {
        const error = 'API key is required. Please set your Gemini API key in settings.';
        setError(error);
        throw new Error(error);
      }

      // Create research in DB first
      const researchData = createResearchData(topic, mode);
      const research = await dbCreateResearch({
        ...researchData,
        interactionId,
        status: 'in_progress',
      });

      // Set as current research
      setCurrentResearch(research);

      // Create initial user message
      await dbCreateMessage(createMessageData(research.id!, 'user', topic));

      // Start streaming
      const abortController = startStreaming();

      try {
        updateProgress({ status: 'Connecting to research API...' });

        const response = await makeResearchRequest(
          topic,
          mode,
          abortController,
          interactionId
        );

        updateProgress({ status: 'Receiving research data...' });

        const content = await processStream(response, abortController, research.id!);

        // Update research with final content
        const updatedResearch: Research = {
          ...research,
          content,
          status: 'completed',
          updatedAt: new Date(),
        };

        setCurrentResearch(updatedResearch);

        // Create assistant message with final content
        if (content) {
          await dbCreateMessage(createMessageData(research.id!, 'assistant', content));
        }

        return updatedResearch;
      } catch (err) {
        // Handle abort
        if (err instanceof Error && err.name === 'AbortError') {
          await dbUpdateResearch(research.id!, { status: 'pending' });
          updateCurrentResearch({ status: 'pending' });
          throw err;
        }

        // Handle other errors
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        await dbUpdateResearch(research.id!, { status: 'failed' });
        updateCurrentResearch({ status: 'failed' });
        throw err;
      } finally {
        stopStreaming();
        resetProgress();
      }
    },
    [
      apiKey,
      setError,
      setCurrentResearch,
      startStreaming,
      updateProgress,
      makeResearchRequest,
      processStream,
      updateCurrentResearch,
      stopStreaming,
      resetProgress,
    ]
  );

  /**
   * Resumes an existing research session
   */
  const resumeResearch = useCallback(
    async (researchId: number, followUpQuery?: string): Promise<void> => {
      // Load the research
      const research = await dbGetResearchById(researchId);
      if (!research) {
        throw new Error(`Research with id ${researchId} not found`);
      }

      if (!research.interactionId) {
        throw new Error('Cannot resume research without interaction ID');
      }

      // Set as current
      setCurrentResearch(research);

      // If there's a follow-up query, start a new request
      if (followUpQuery) {
        // Create user message for follow-up
        await dbCreateMessage(createMessageData(researchId, 'user', followUpQuery));

        // Start streaming
        const abortController = startStreaming();

        try {
          updateProgress({ status: 'Resuming research...' });

          // Update status to in_progress
          await dbUpdateResearch(researchId, { status: 'in_progress' });
          updateCurrentResearch({ status: 'in_progress' });

          const response = await makeResearchRequest(
            followUpQuery,
            research.mode,
            abortController,
            research.interactionId
          );

          const content = await processStream(response, abortController, researchId);

          // Update with new content appended
          const newContent = research.content + '\n\n---\n\n' + content;
          const updatedResearch: Research = {
            ...research,
            content: newContent,
            status: 'completed',
            updatedAt: new Date(),
          };

          await dbUpdateResearch(researchId, {
            content: newContent,
            status: 'completed',
          });
          setCurrentResearch(updatedResearch);

          // Create assistant message
          if (content) {
            await dbCreateMessage(createMessageData(researchId, 'assistant', content));
          }
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            const errorMessage = err.message;
            setError(errorMessage);
            await dbUpdateResearch(researchId, { status: 'failed' });
            updateCurrentResearch({ status: 'failed' });
          }
          throw err;
        } finally {
          stopStreaming();
          resetProgress();
        }
      }
    },
    [
      setCurrentResearch,
      startStreaming,
      updateProgress,
      updateCurrentResearch,
      makeResearchRequest,
      processStream,
      setError,
      stopStreaming,
      resetProgress,
    ]
  );

  /**
   * Stops the current research request
   */
  const stopResearch = useCallback(() => {
    stopStreaming();
    updateProgress({ status: 'Research stopped by user' });
  }, [stopStreaming, updateProgress]);

  /**
   * Loads a research by ID without starting it
   */
  const loadResearch = useCallback(
    async (researchId: number): Promise<Research | undefined> => {
      const research = await dbGetResearchById(researchId);
      if (research) {
        setCurrentResearch(research);
      }
      return research;
    },
    [setCurrentResearch]
  );

  /**
   * Saves the current streaming content to the research
   */
  const saveCurrentContent = useCallback(async (): Promise<void> => {
    if (!currentResearch?.id || isSaving.current) return;

    isSaving.current = true;
    try {
      const contentToSave = streamingContent || currentResearch.content;
      await dbUpdateResearch(currentResearch.id, {
        content: contentToSave,
      });
      updateCurrentResearch({ content: contentToSave });
    } finally {
      isSaving.current = false;
    }
  }, [currentResearch, streamingContent, updateCurrentResearch]);

  /**
   * Gets all messages for the current research
   */
  const getMessages = useCallback(async (): Promise<Message[]> => {
    if (!currentResearch?.id) return [];
    return getMessagesByResearchId(currentResearch.id);
  }, [currentResearch]);

  /**
   * Adds a user message to the current research
   */
  const addUserMessage = useCallback(
    async (content: string): Promise<Message> => {
      if (!currentResearch?.id) {
        throw new Error('No current research to add message to');
      }
      return dbCreateMessage(createMessageData(currentResearch.id, 'user', content));
    },
    [currentResearch]
  );

  /**
   * Recovers content for a research that has interactionId but no content
   * This is useful for researches that were completed but content was lost
   */
  const recoverContent = useCallback(
    async (researchId: number): Promise<string> => {
      // Validate API key
      if (!apiKey) {
        const error = 'API key is required. Please set your Gemini API key in settings.';
        setError(error);
        throw new Error(error);
      }

      // Load the research
      const research = await dbGetResearchById(researchId);
      if (!research) {
        throw new Error(`Research with id ${researchId} not found`);
      }

      if (!research.interactionId) {
        throw new Error('Cannot recover content without interaction ID');
      }

      // Start streaming for UI feedback
      const abortController = startStreaming();

      try {
        updateProgress({ status: 'Recovering content from Gemini...' });

        // Call the resume API
        const response = await fetch('/api/resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            interactionId: research.interactionId,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to recover content: ${response.status}`
          );
        }

        updateProgress({ status: 'Receiving recovered content...' });

        // Process the stream - reuse existing processStream logic
        const content = await processStream(response, abortController, researchId);

        // Update the research with recovered content
        const updatedResearch: Research = {
          ...research,
          content,
          status: 'completed',
          updatedAt: new Date(),
        };

        await dbUpdateResearch(researchId, {
          content,
          status: 'completed',
        });

        setCurrentResearch(updatedResearch);

        updateProgress({ status: 'Content recovered successfully!' });

        return content;
      } catch (err) {
        // Handle abort
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }

        // Handle other errors
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        stopStreaming();
        resetProgress();
      }
    },
    [
      apiKey,
      setError,
      startStreaming,
      updateProgress,
      processStream,
      setCurrentResearch,
      stopStreaming,
      resetProgress,
    ]
  );

  return {
    currentResearch,
    isStreaming,
    streamingContent,
    progress,
    startResearch,
    resumeResearch,
    stopResearch,
    loadResearch,
    saveCurrentContent,
    recoverContent,
    getMessages,
    addUserMessage,
    error,
    clearError,
  };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to get just the research content (streaming or final)
 */
export function useResearchContent(): string {
  const currentResearch = useAppStore((state) => state.currentResearch);
  const streamingContent = useAppStore((state) => state.streamingContent);
  const isStreaming = useAppStore((state) => state.isStreaming);

  // During streaming, return streaming content; otherwise return saved content
  return isStreaming ? streamingContent : (currentResearch?.content ?? '');
}

/**
 * Hook to get research progress information
 */
export function useResearchProgress() {
  return useAppStore((state) => ({
    isStreaming: state.isStreaming,
    progress: state.progress,
    status: state.currentResearch?.status ?? null,
  }));
}
