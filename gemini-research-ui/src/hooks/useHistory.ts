/**
 * Custom hook for research history operations
 *
 * Provides functionality to:
 * - Get all researches with pagination
 * - Search researches by topic
 * - Delete research
 * - Uses Dexie useLiveQuery for reactive updates
 */

import { useMemo, useCallback, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, deleteResearch as dbDeleteResearch } from '@/lib/db';
import type {
  Research,
  ResearchStatus,
  ResearchMode,
  PaginatedResult,
} from '@/types';

// ============================================================================
// Types
// ============================================================================

interface UseHistoryOptions {
  /** Number of items per page */
  limit?: number;
  /** Filter by status */
  status?: ResearchStatus;
  /** Filter by mode */
  mode?: ResearchMode;
  /** Search query for topic */
  searchQuery?: string;
}

interface UseHistoryReturn {
  /** List of researches for current page */
  researches: Research[];
  /** Total count of matching researches */
  total: number;
  /** Whether there are more items after current page */
  hasMore: boolean;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Delete a research by ID */
  deleteResearch: (id: number) => Promise<void>;
  /** Refresh the query */
  refresh: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useHistory(options: UseHistoryOptions = {}): UseHistoryReturn {
  const { limit = 20, status, mode, searchQuery } = options;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate offset based on current page
  const offset = (currentPage - 1) * limit;

  /**
   * Live query for researches with filtering and pagination
   * The query automatically re-runs when dependencies change
   */
  const queryResult = useLiveQuery<PaginatedResult<Research> | undefined>(
    async () => {
      // Build the query
      let collection = db.researches.orderBy('updatedAt').reverse();
      let items = await collection.toArray();

      // Apply filters
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        items = items.filter((r) => r.topic.toLowerCase().includes(lowerQuery));
      }
      if (status) {
        items = items.filter((r) => r.status === status);
      }
      if (mode) {
        items = items.filter((r) => r.mode === mode);
      }

      const total = items.length;
      const paginatedItems = items.slice(offset, offset + limit);

      return {
        items: paginatedItems,
        total,
        hasMore: offset + limit < total,
      };
    },
    // Dependencies - query re-runs when these change
    [offset, limit, status, mode, searchQuery, refreshKey]
  );

  // Derive values from query result
  const researches = queryResult?.items ?? [];
  const total = queryResult?.total ?? 0;
  const hasMore = queryResult?.hasMore ?? false;
  const isLoading = queryResult === undefined;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  /**
   * Navigate to next page
   */
  const nextPage = useCallback(() => {
    if (hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore]);

  /**
   * Navigate to previous page
   */
  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  /**
   * Navigate to specific page
   */
  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  /**
   * Delete a research by ID
   */
  const deleteResearch = useCallback(async (id: number): Promise<void> => {
    await dbDeleteResearch(id);
    // Dexie's useLiveQuery will automatically update the list
  }, []);

  /**
   * Force refresh the query
   */
  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [status, mode, searchQuery]);

  return {
    researches,
    total,
    hasMore,
    isLoading,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    deleteResearch,
    refresh,
  };
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook to get recent researches (last N items)
 */
export function useRecentResearches(count: number = 5): Research[] {
  const researches = useLiveQuery(
    async () => {
      return db.researches.orderBy('updatedAt').reverse().limit(count).toArray();
    },
    [count]
  );

  return researches ?? [];
}

/**
 * Hook to get researches by status
 */
export function useResearchesByStatus(status: ResearchStatus): Research[] {
  const researches = useLiveQuery(
    async () => {
      return db.researches
        .where('status')
        .equals(status)
        .reverse()
        .sortBy('updatedAt');
    },
    [status]
  );

  return researches ?? [];
}

/**
 * Hook to get research count
 */
export function useResearchCount(): number {
  const count = useLiveQuery(async () => {
    return db.researches.count();
  });

  return count ?? 0;
}

/**
 * Hook to get counts by status
 */
export function useResearchCountsByStatus(): Record<ResearchStatus, number> {
  const counts = useLiveQuery(async () => {
    const all = await db.researches.toArray();
    return {
      pending: all.filter((r) => r.status === 'pending').length,
      in_progress: all.filter((r) => r.status === 'in_progress').length,
      completed: all.filter((r) => r.status === 'completed').length,
      failed: all.filter((r) => r.status === 'failed').length,
    };
  });

  return (
    counts ?? {
      pending: 0,
      in_progress: 0,
      completed: 0,
      failed: 0,
    }
  );
}

/**
 * Hook to search researches by topic with debouncing built-in
 * (Call this with debounced search query)
 */
export function useSearchResearches(query: string): Research[] {
  const researches = useLiveQuery(
    async () => {
      if (!query.trim()) {
        return [];
      }

      const lowerQuery = query.toLowerCase();
      const all = await db.researches.orderBy('updatedAt').reverse().toArray();
      return all.filter((r) => r.topic.toLowerCase().includes(lowerQuery));
    },
    [query]
  );

  return researches ?? [];
}

/**
 * Hook to get a single research by ID (reactive)
 */
export function useResearchById(id: number | null): Research | undefined {
  const research = useLiveQuery(
    async () => {
      if (id === null) return undefined;
      return db.researches.get(id);
    },
    [id]
  );

  return research;
}

/**
 * Hook to get real statistics from all researches
 * Calculates actual tokens, storage, and weekly counts
 */
export function useResearchStats(): {
  totalResearches: number;
  estimatedTokens: number;
  estimatedStorageKB: number;
  thisWeekCount: number;
  isLoading: boolean;
} {
  const stats = useLiveQuery(async () => {
    const all = await db.researches.toArray();

    // Calculate estimated tokens (roughly 4 chars per token)
    const totalChars = all.reduce((sum, r) => sum + (r.content?.length || 0), 0);
    const estimatedTokens = Math.round(totalChars / 4);

    // Calculate storage (content + topic as rough estimate)
    const totalBytes = all.reduce((sum, r) => {
      const contentBytes = (r.content?.length || 0) * 2; // UTF-16 chars = 2 bytes
      const topicBytes = (r.topic?.length || 0) * 2;
      return sum + contentBytes + topicBytes;
    }, 0);
    const estimatedStorageKB = Math.round(totalBytes / 1024);

    // Count researches from this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekCount = all.filter(r =>
      r.createdAt && new Date(r.createdAt) >= oneWeekAgo
    ).length;

    return {
      totalResearches: all.length,
      estimatedTokens,
      estimatedStorageKB,
      thisWeekCount,
    };
  });

  return {
    totalResearches: stats?.totalResearches ?? 0,
    estimatedTokens: stats?.estimatedTokens ?? 0,
    estimatedStorageKB: stats?.estimatedStorageKB ?? 0,
    thisWeekCount: stats?.thisWeekCount ?? 0,
    isLoading: stats === undefined,
  };
}

/**
 * Hook for infinite scroll pagination
 */
export function useInfiniteResearches(options: {
  limit?: number;
  status?: ResearchStatus;
  mode?: ResearchMode;
  searchQuery?: string;
} = {}): {
  researches: Research[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
} {
  const { limit = 20, status, mode, searchQuery } = options;
  const [loadedCount, setLoadedCount] = useState(limit);

  const queryResult = useLiveQuery(
    async () => {
      let items = await db.researches.orderBy('updatedAt').reverse().toArray();

      // Apply filters
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        items = items.filter((r) => r.topic.toLowerCase().includes(lowerQuery));
      }
      if (status) {
        items = items.filter((r) => r.status === status);
      }
      if (mode) {
        items = items.filter((r) => r.mode === mode);
      }

      const total = items.length;
      return {
        items: items.slice(0, loadedCount),
        total,
        hasMore: loadedCount < total,
      };
    },
    [loadedCount, status, mode, searchQuery]
  );

  const loadMore = useCallback(() => {
    setLoadedCount((prev) => prev + limit);
  }, [limit]);

  const reset = useCallback(() => {
    setLoadedCount(limit);
  }, [limit]);

  // Reset when filters change
  useMemo(() => {
    setLoadedCount(limit);
  }, [status, mode, searchQuery, limit]);

  return {
    researches: queryResult?.items ?? [],
    isLoading: queryResult === undefined,
    hasMore: queryResult?.hasMore ?? false,
    loadMore,
    reset,
  };
}
