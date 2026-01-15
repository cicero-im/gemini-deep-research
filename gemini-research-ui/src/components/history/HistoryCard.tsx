"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Research, ResearchStatus, ResearchMode } from "@/types";

// Icons
const CheckCircleIcon = () => (
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
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const LoaderIcon = () => (
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
    className="animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

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

const AlertCircleIcon = () => (
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
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const GlobeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);

const TrashIcon = () => (
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
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

// Status configuration
const statusConfig: Record<
  ResearchStatus,
  { icon: React.ReactNode; label: string; className: string; glowColor: string }
> = {
  completed: {
    icon: <CheckCircleIcon />,
    label: "Completed",
    className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    glowColor: "rgba(52, 211, 153, 0.3)",
  },
  in_progress: {
    icon: <LoaderIcon />,
    label: "In Progress",
    className: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    glowColor: "rgba(34, 211, 238, 0.3)",
  },
  pending: {
    icon: <ClockIcon />,
    label: "Pending",
    className: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    glowColor: "rgba(251, 191, 36, 0.3)",
  },
  failed: {
    icon: <AlertCircleIcon />,
    label: "Failed",
    className: "text-red-400 bg-red-400/10 border-red-400/20",
    glowColor: "rgba(248, 113, 113, 0.3)",
  },
};

// Mode configuration
const modeConfig: Record<ResearchMode, { icon: React.ReactNode; label: string }> = {
  web: {
    icon: <GlobeIcon />,
    label: "Web",
  },
  "web+files": {
    icon: <FileIcon />,
    label: "Web + Files",
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
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// Format full date
function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

interface HistoryCardProps {
  research: Research;
  isSelected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
  onDelete?: (id: number) => void;
  index?: number;
}

/**
 * HistoryCard - Individual research card with 3D tilt effect
 *
 * Features:
 * - 3D tilt effect on hover using framer-motion
 * - Topic title, date, status badge
 * - Mode indicator (web/web+files)
 * - Preview of first 100 chars of content
 * - Delete button appears on hover
 * - Checkbox for batch selection
 * - Click navigates to /research/[id]
 * - Glow effect on hover matching status color
 */
export function HistoryCard({
  research,
  isSelected = false,
  onSelect,
  onDelete,
  index = 0,
}: HistoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Motion values for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring configuration for smooth movement
  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), springConfig);

  const status = statusConfig[research.status];
  const mode = modeConfig[research.mode];

  // Handle mouse move for 3D tilt effect
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      x.set(event.clientX - centerX);
      y.set(event.clientY - centerY);
    },
    [x, y]
  );

  // Reset tilt on mouse leave
  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }, [x, y]);

  // Handle checkbox change
  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (research.id && onSelect) {
        onSelect(research.id, e.target.checked);
      }
    },
    [research.id, onSelect]
  );

  // Handle delete
  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!research.id || !onDelete) return;

      setIsDeleting(true);
      try {
        await onDelete(research.id);
      } finally {
        setIsDeleting(false);
      }
    },
    [research.id, onDelete]
  );

  // Get content preview
  const contentPreview = research.content
    ? truncateText(research.content.replace(/[#*`>\[\]]/g, "").trim(), 100)
    : "No content yet...";

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <Link href={`/research/${research.id}`}>
        <div
          className={cn(
            "group relative overflow-hidden rounded-2xl border bg-[#12121a]/80 backdrop-blur-sm p-5 transition-all duration-300",
            isSelected
              ? "border-violet-500/50 ring-1 ring-violet-500/30"
              : "border-white/[0.08] hover:border-white/[0.15]",
            isDeleting && "opacity-50 pointer-events-none"
          )}
        >
          {/* Glow effect on hover */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${status.glowColor}, transparent 40%)`,
              boxShadow: `0 0 40px ${status.glowColor}`,
            }}
          />

          {/* Inner glow border */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.5 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              boxShadow: `inset 0 0 0 1px rgba(139, 92, 246, 0.3)`,
            }}
          />

          {/* Header with checkbox and status */}
          <div className="relative flex items-start justify-between gap-3 mb-3">
            {/* Checkbox */}
            {onSelect && (
              <div
                className={cn(
                  "flex-shrink-0 transition-opacity duration-200",
                  isHovered || isSelected ? "opacity-100" : "opacity-0"
                )}
              >
                <label className="relative flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    className="peer sr-only"
                  />
                  <div
                    className={cn(
                      "h-5 w-5 rounded-md border-2 transition-all duration-200",
                      "flex items-center justify-center",
                      isSelected
                        ? "border-violet-500 bg-violet-500"
                        : "border-white/30 bg-transparent hover:border-white/50"
                    )}
                  >
                    {isSelected && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-3 w-3 text-white"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M2 6l3 3 5-6" />
                      </motion.svg>
                    )}
                  </div>
                </label>
              </div>
            )}

            {/* Status badge */}
            <div
              className={cn(
                "ml-auto flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                status.className
              )}
            >
              {status.icon}
              <span>{status.label}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="relative mb-2 line-clamp-2 text-base font-semibold text-white transition-colors group-hover:text-violet-200">
            {research.topic}
          </h3>

          {/* Content preview */}
          <p className="relative mb-4 line-clamp-2 text-sm text-white/40 transition-colors group-hover:text-white/50">
            {contentPreview}
          </p>

          {/* Footer */}
          <div className="relative flex items-center justify-between">
            {/* Date and mode */}
            <div className="flex items-center gap-3">
              {/* Date */}
              <div
                className="flex items-center gap-1.5 text-xs text-white/40"
                title={formatFullDate(new Date(research.updatedAt))}
              >
                <ClockIcon />
                <span>{formatRelativeTime(new Date(research.updatedAt))}</span>
              </div>

              {/* Mode */}
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/50">
                {mode.icon}
                <span>{mode.label}</span>
              </div>
            </div>

            {/* Delete button */}
            {onDelete && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  scale: isHovered ? 1 : 0.8,
                }}
                transition={{ duration: 0.2 }}
                onClick={handleDelete}
                disabled={isDeleting}
                className={cn(
                  "rounded-lg p-1.5 transition-colors",
                  "text-white/40 hover:text-red-400 hover:bg-red-400/10",
                  "focus:outline-none focus:ring-2 focus:ring-red-400/30"
                )}
                title="Delete research"
              >
                {isDeleting ? (
                  <LoaderIcon />
                ) : (
                  <TrashIcon />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * HistoryCardSkeleton - Loading skeleton for history cards
 */
export function HistoryCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-2xl border border-white/[0.08] bg-[#12121a]/80 p-5"
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-5 rounded-md bg-white/5 animate-pulse" />
        <div className="h-6 w-24 rounded-full bg-white/5 animate-pulse" />
      </div>

      {/* Title skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-5 w-full rounded bg-white/5 animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-white/5 animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-white/5 animate-pulse" />
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-16 rounded bg-white/5 animate-pulse" />
          <div className="h-5 w-14 rounded-full bg-white/5 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
