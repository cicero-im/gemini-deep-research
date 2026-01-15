"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Clock,
  Zap,
  XCircle,
  Loader2,
  Globe,
  BookOpen,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { NumberTicker, PercentageRing } from "@/components/ui";
import { ThinkingBubble, PulsingThinkingIndicator } from "./ThinkingBubble";
import { ShinyButton } from "@/components/ui/shiny-button";

interface StreamingProgressProps {
  status: string;
  sources: number;
  tokensUsed: number;
  maxTokens?: number;
  thoughtSummary?: string;
  isStreaming: boolean;
  onCancel?: () => void;
  className?: string;
  startTime?: number;
}

/**
 * StreamingProgress - Live progress panel during research
 *
 * Features:
 * - Pulsing "Researching..." header with animated dots
 * - ThinkingBubble for thought summaries
 * - Circular progress ring (animated SVG)
 * - Sources found counter (NumberTicker)
 * - Time elapsed (live updating)
 * - Token usage meter
 * - Cancel button
 */
export function StreamingProgress({
  status,
  sources,
  tokensUsed,
  maxTokens = 100000,
  thoughtSummary,
  isStreaming,
  onCancel,
  className,
  startTime,
}: StreamingProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track thoughts
  useEffect(() => {
    if (thoughtSummary && !thoughts.includes(thoughtSummary)) {
      setThoughts((prev) => [...prev, thoughtSummary]);
    }
  }, [thoughtSummary, thoughts]);

  // Clear thoughts when not streaming
  useEffect(() => {
    if (!isStreaming) {
      setThoughts([]);
    }
  }, [isStreaming]);

  // Time elapsed counter
  useEffect(() => {
    if (isStreaming) {
      const start = startTime || Date.now();
      setElapsedTime(Math.floor((Date.now() - start) / 1000));

      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStreaming, startTime]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const tokenPercentage = Math.min((tokensUsed / maxTokens) * 100, 100);

  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 space-y-6",
        "border border-white/5",
        className
      )}
    >
      {/* Header with animated status */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {isStreaming ? (
            <motion.div
              key="streaming"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3"
            >
              {/* Animated loader */}
              <motion.div
                className="relative flex h-10 w-10 items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <Search className="h-4 w-4 text-primary" />
              </motion.div>

              <div>
                <h2 className="flex items-center text-lg font-semibold text-white">
                  Researching
                  <AnimatedDots />
                </h2>
                <p className="text-sm text-white/60">{status || "Starting..."}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                <BookOpen className="h-5 w-5 text-white/60" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Ready</h2>
                <p className="text-sm text-white/60">Waiting to start research</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thinking bubble */}
      <AnimatePresence>
        {isStreaming && thoughtSummary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ThinkingBubble
              thought={thoughtSummary}
              icon="sparkles"
              variant="default"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Sources found */}
        <StatCard
          icon={<Globe className="h-4 w-4" />}
          label="Sources"
          isActive={isStreaming}
        >
          <NumberTicker
            value={sources}
            className="text-2xl font-bold text-white"
            springConfig={{ stiffness: 100, damping: 20 }}
          />
        </StatCard>

        {/* Time elapsed */}
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Elapsed"
          isActive={isStreaming}
        >
          <span className="text-2xl font-bold tabular-nums text-white">
            {formatTime(elapsedTime)}
          </span>
        </StatCard>
      </div>

      {/* Token usage meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-white/60">
            <Zap className="h-4 w-4" />
            <span>Token Usage</span>
          </div>
          <span className="tabular-nums text-white/80">
            {tokensUsed.toLocaleString()} / {maxTokens.toLocaleString()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--primary), var(--secondary))",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${tokenPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          {/* Shimmer effect when active */}
          {isStreaming && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </div>
      </div>

      {/* Progress ring */}
      <div className="flex justify-center py-2">
        <ProgressRing
          value={tokenPercentage}
          isActive={isStreaming}
          sources={sources}
        />
      </div>

      {/* Cancel button */}
      <AnimatePresence>
        {isStreaming && onCancel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <ShinyButton
              variant="outline"
              size="md"
              className="w-full"
              onClick={onCancel}
              gradientFrom="#ef4444"
              gradientTo="#f97316"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Research
            </ShinyButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thought history (optional, for debugging/visibility) */}
      {isStreaming && thoughts.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-4 border-t border-white/5"
        >
          <p className="text-xs text-white/40 mb-2">
            Previous insights ({thoughts.length - 1})
          </p>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {thoughts.slice(0, -1).map((t, i) => (
              <div key={i} className="text-xs text-white/30 line-clamp-2 prose prose-xs prose-invert [&>p]:m-0 [&>strong]:text-white/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{t}</ReactMarkdown>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function AnimatedDots() {
  return (
    <span className="ml-1 inline-flex">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="text-primary"
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  isActive?: boolean;
}

function StatCard({ icon, label, children, isActive }: StatCardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-xl bg-white/[0.02] p-4 border border-white/5",
        "transition-colors duration-300",
        isActive && "border-primary/20"
      )}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Active indicator glow */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-20"
          style={{
            background:
              "radial-gradient(circle at center, var(--primary), transparent 70%)",
          }}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("text-white/40", isActive && "text-primary/80")}>
            {icon}
          </span>
          <span className="text-xs text-white/40 uppercase tracking-wider">
            {label}
          </span>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

interface ProgressRingProps {
  value: number;
  isActive: boolean;
  sources: number;
}

function ProgressRing({ value, isActive, sources }: ProgressRingProps) {
  const size = 100;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const gradientId = "progress-ring-gradient";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={{ filter: isActive ? "drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))" : "none" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--secondary)" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/5"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Animated glow when active */}
        {isActive && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth + 4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="opacity-30"
            style={{ filter: "blur(4px)" }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <FileText className={cn("h-6 w-6", isActive ? "text-primary" : "text-white/40")} />
        </motion.div>
        <span className="text-xs text-white/60 mt-1">{sources} found</span>
      </div>
    </div>
  );
}

// ============================================================================
// Compact variant for smaller spaces
// ============================================================================

interface CompactProgressProps {
  status: string;
  sources: number;
  isStreaming: boolean;
  className?: string;
}

export function CompactProgress({
  status,
  sources,
  isStreaming,
  className,
}: CompactProgressProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-lg glass",
        className
      )}
    >
      {isStreaming ? (
        <>
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
          <span className="text-sm text-white/80 flex-1 truncate">{status}</span>
          <span className="text-xs text-white/40">{sources} sources</span>
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 text-white/40" />
          <span className="text-sm text-white/60">Ready</span>
        </>
      )}
    </div>
  );
}
