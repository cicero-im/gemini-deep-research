"use client";

import { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { HistoryCard, HistoryCardSkeleton } from "./HistoryCard";
import type { Research, ResearchStatus, ResearchMode } from "@/types";
import { useInfiniteResearches } from "@/hooks/useHistory";

// Icons
const SearchXIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
    <path d="m8 8 6 6" />
    <path d="m14 8-6 6" />
  </svg>
);

const FileTextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const LoaderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

interface HistoryGridProps {
  /** Selected item IDs for batch operations */
  selectedIds?: Set<number>;
  /** Callback when item selection changes */
  onSelectionChange?: (selectedIds: Set<number>) => void;
  /** Callback when delete is requested */
  onDelete?: (id: number) => Promise<void>;
  /** Status filter */
  statusFilter?: ResearchStatus;
  /** Mode filter */
  modeFilter?: ResearchMode;
  /** Search query */
  searchQuery?: string;
  /** Sort order */
  sortOrder?: "newest" | "oldest" | "a-z" | "z-a";
  /** Items per page for infinite scroll */
  itemsPerPage?: number;
  /** Class name for container */
  className?: string;
}

// Container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * HistoryGrid - Responsive grid layout for research history
 *
 * Features:
 * - Responsive masonry-style grid
 * - Staggered entrance animations
 * - Empty state when no results
 * - Uses useInfiniteResearches hook for data
 * - Infinite scroll / load more button
 */
export function HistoryGrid({
  selectedIds = new Set(),
  onSelectionChange,
  onDelete,
  statusFilter,
  modeFilter,
  searchQuery,
  sortOrder = "newest",
  itemsPerPage = 12,
  className,
}: HistoryGridProps) {
  // Fetch researches with infinite scroll
  const {
    researches: rawResearches,
    isLoading,
    hasMore,
    loadMore,
  } = useInfiniteResearches({
    limit: itemsPerPage,
    status: statusFilter,
    mode: modeFilter,
    searchQuery: searchQuery?.trim(),
  });

  // Apply local sorting
  const researches = useMemo(() => {
    const sorted = [...rawResearches];

    switch (sortOrder) {
      case "oldest":
        sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "a-z":
        sorted.sort((a, b) => a.topic.localeCompare(b.topic));
        break;
      case "z-a":
        sorted.sort((a, b) => b.topic.localeCompare(a.topic));
        break;
      case "newest":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
    }

    return sorted;
  }, [rawResearches, sortOrder]);

  // Handle item selection
  const handleSelect = useCallback(
    (id: number, selected: boolean) => {
      if (!onSelectionChange) return;

      const newSelectedIds = new Set(selectedIds);
      if (selected) {
        newSelectedIds.add(id);
      } else {
        newSelectedIds.delete(id);
      }
      onSelectionChange(newSelectedIds);
    },
    [selectedIds, onSelectionChange]
  );

  // Handle delete
  const handleDelete = useCallback(
    async (id: number) => {
      if (onDelete) {
        await onDelete(id);
        // Remove from selection if selected
        if (selectedIds.has(id) && onSelectionChange) {
          const newSelectedIds = new Set(selectedIds);
          newSelectedIds.delete(id);
          onSelectionChange(newSelectedIds);
        }
      }
    },
    [onDelete, selectedIds, onSelectionChange]
  );

  // Loading skeleton grid
  if (isLoading && researches.length === 0) {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <HistoryCardSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  // Empty state - no results for filters
  if (researches.length === 0 && (searchQuery || statusFilter || modeFilter)) {
    return (
      <EmptyState
        icon={<SearchXIcon />}
        title="No matching results"
        description="Try adjusting your search or filters to find what you're looking for."
        className={className}
      />
    );
  }

  // Empty state - no researches at all
  if (researches.length === 0) {
    return (
      <EmptyState
        icon={<FileTextIcon />}
        title="No researches yet"
        description="Start your first research to explore topics and generate comprehensive reports with AI."
        showCta
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {researches.map((research, index) => (
            <HistoryCard
              key={research.id}
              research={research}
              index={index}
              isSelected={research.id ? selectedIds.has(research.id) : false}
              onSelect={onSelectionChange ? handleSelect : undefined}
              onDelete={onDelete ? handleDelete : undefined}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load More */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-4"
        >
          <button
            onClick={loadMore}
            disabled={isLoading}
            className={cn(
              "group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3",
              "text-sm font-medium text-white/70 transition-all duration-200",
              "hover:bg-white/10 hover:border-white/20 hover:text-white",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/30",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <LoaderIcon />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Load More</span>
                <motion.span
                  className="transition-transform group-hover:translate-y-0.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </motion.span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* End of results indicator */}
      {!hasMore && researches.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-white/30 pt-4"
        >
          You&apos;ve reached the end
        </motion.p>
      )}
    </div>
  );
}

// Empty state component
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  showCta?: boolean;
  className?: string;
}

function EmptyState({ icon, title, description, showCta, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#12121a]/50 py-16 px-6 text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-5 text-white/30"
      >
        {icon}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-2 text-xl font-semibold text-white/80"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 max-w-sm text-sm text-white/40"
      >
        {description}
      </motion.p>

      {showCta && (
        <motion.a
          href="/"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-6 py-3",
            "bg-gradient-to-r from-violet-600 to-cyan-600",
            "text-sm font-medium text-white",
            "transition-opacity hover:opacity-90",
            "focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Start New Research
        </motion.a>
      )}
    </motion.div>
  );
}

/**
 * HistoryGridCompact - Compact list view variant
 */
export function HistoryGridCompact({
  researches,
  selectedIds = new Set(),
  onSelectionChange,
  onDelete,
  className,
}: {
  researches: Research[];
  selectedIds?: Set<number>;
  onSelectionChange?: (selectedIds: Set<number>) => void;
  onDelete?: (id: number) => Promise<void>;
  className?: string;
}) {
  const handleSelect = useCallback(
    (id: number, selected: boolean) => {
      if (!onSelectionChange) return;

      const newSelectedIds = new Set(selectedIds);
      if (selected) {
        newSelectedIds.add(id);
      } else {
        newSelectedIds.delete(id);
      }
      onSelectionChange(newSelectedIds);
    },
    [selectedIds, onSelectionChange]
  );

  if (researches.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <AnimatePresence mode="popLayout">
        {researches.map((research, index) => (
          <HistoryCard
            key={research.id}
            research={research}
            index={index}
            isSelected={research.id ? selectedIds.has(research.id) : false}
            onSelect={onSelectionChange ? handleSelect : undefined}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
