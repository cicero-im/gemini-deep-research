"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/ui/spotlight";
import { useRecentResearches } from "@/hooks/useHistory";
import type { Research, ResearchStatus } from "@/types";

// Icons
const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = () => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const LoaderIcon = () => (
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
    className="animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const AlertCircleIcon = () => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const ArrowRightIcon = () => (
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
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const FileTextIcon = () => (
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
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

// Status badge configuration
const statusConfig: Record<
  ResearchStatus,
  { icon: React.ReactNode; label: string; className: string }
> = {
  completed: {
    icon: <CheckCircleIcon />,
    label: "Completed",
    className: "text-emerald-400 bg-emerald-400/10",
  },
  in_progress: {
    icon: <LoaderIcon />,
    label: "In Progress",
    className: "text-cyan-400 bg-cyan-400/10",
  },
  pending: {
    icon: <ClockIcon />,
    label: "Pending",
    className: "text-amber-400 bg-amber-400/10",
  },
  failed: {
    icon: <AlertCircleIcon />,
    label: "Failed",
    className: "text-red-400 bg-red-400/10",
  },
};

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface ResearchCardProps {
  research: Research;
  onClick: (research: Research) => void;
  index: number;
}

function ResearchCard({ research, onClick, index }: ResearchCardProps) {
  const status = statusConfig[research.status];
  const handleClick = useCallback(() => onClick(research), [research, onClick]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <SpotlightCard
        className="group cursor-pointer p-4 transition-transform hover:scale-[1.02]"
        spotlightColor="rgba(139, 92, 246, 0.12)"
        onClick={handleClick}
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          {/* Icon */}
          <div className="rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 p-2">
            <span className="text-violet-400">
              <FileTextIcon />
            </span>
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              status.className
            )}
          >
            {status.icon}
            <span>{status.label}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-base font-medium text-white group-hover:text-violet-200 transition-colors">
          {research.topic}
        </h3>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <ClockIcon />
            <span>{formatRelativeTime(new Date(research.updatedAt))}</span>
          </div>

          {/* Arrow indicator */}
          <motion.div
            className="text-white/30 transition-colors group-hover:text-violet-400"
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
          >
            <ArrowRightIcon />
          </motion.div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

interface RecentResearchesProps {
  count?: number;
  onClick?: (research: Research) => void;
  className?: string;
}

/**
 * RecentResearches - Recent 3-5 researches component
 *
 * Features:
 * - Card for each with title, date, status
 * - Hover effects with Spotlight
 * - Click to resume/view
 */
export function RecentResearches({
  count = 5,
  onClick,
  className,
}: RecentResearchesProps) {
  const researches = useRecentResearches(count);

  const handleClick = useCallback(
    (research: Research) => {
      if (onClick) {
        onClick(research);
      }
    },
    [onClick]
  );

  // Show empty state if no researches
  if (researches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#12121a]/50 py-12 px-6 text-center",
          className
        )}
      >
        <div className="mb-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-4">
          <FileTextIcon />
        </div>
        <h3 className="mb-2 text-lg font-medium text-white/80">
          No researches yet
        </h3>
        <p className="max-w-sm text-sm text-white/40">
          Start your first research to explore topics and generate comprehensive
          reports with AI.
        </p>
      </motion.div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-lg font-semibold text-white">Recent Researches</h2>
        <motion.a
          href="/history"
          className="flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-violet-400"
          whileHover={{ x: 2 }}
        >
          <span>View all</span>
          <ArrowRightIcon />
        </motion.a>
      </motion.div>

      {/* Grid of cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {researches.map((research, index) => (
            <ResearchCard
              key={research.id}
              research={research}
              onClick={handleClick}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * RecentResearchesList - Vertical list variant
 */
export function RecentResearchesList({
  count = 3,
  onClick,
  className,
}: RecentResearchesProps) {
  const researches = useRecentResearches(count);

  const handleClick = useCallback(
    (research: Research) => {
      if (onClick) {
        onClick(research);
      }
    },
    [onClick]
  );

  if (researches.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {researches.map((research, index) => {
        const status = statusConfig[research.status];
        return (
          <motion.button
            key={research.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => handleClick(research)}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
          >
            <div className={cn("rounded-full p-1", status.className)}>
              {status.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white/80 group-hover:text-white">
                {research.topic}
              </p>
              <p className="text-xs text-white/40">
                {formatRelativeTime(new Date(research.updatedAt))}
              </p>
            </div>
            <motion.div
              className="text-white/20 group-hover:text-violet-400"
              initial={{ opacity: 0, x: -5 }}
              whileHover={{ opacity: 1, x: 0 }}
            >
              <ArrowRightIcon />
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
}
