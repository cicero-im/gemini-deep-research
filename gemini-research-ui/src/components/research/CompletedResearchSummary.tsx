"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Zap,
  Globe,
  Brain,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";
import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Research } from "@/types";

interface CompletedResearchSummaryProps {
  research: Research;
  thoughtsHistory?: string[];
  className?: string;
}

/**
 * CompletedResearchSummary - Summary panel for completed research
 *
 * Shows:
 * - Completion status with checkmark
 * - Duration (from createdAt to updatedAt)
 * - Estimated token count
 * - Collapsible thinking history
 */
export function CompletedResearchSummary({
  research,
  thoughtsHistory = [],
  className,
}: CompletedResearchSummaryProps) {
  const [showThoughts, setShowThoughts] = useState(false);

  // Calculate duration
  const duration = useMemo(() => {
    if (!research.createdAt || !research.updatedAt) return "N/A";
    const start = new Date(research.createdAt).getTime();
    const end = new Date(research.updatedAt).getTime();
    const seconds = Math.floor((end - start) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [research.createdAt, research.updatedAt]);

  // Estimate tokens (rough: ~4 chars per token for English)
  const estimatedTokens = useMemo(() => {
    const content = research.content || "";
    return Math.round(content.length / 4);
  }, [research.content]);

  // Format date
  const completedDate = useMemo(() => {
    if (!research.updatedAt) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(research.updatedAt));
  }, [research.updatedAt]);

  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 space-y-6",
        "border border-white/5",
        className
      )}
    >
      {/* Header - Completed status */}
      <div className="flex items-center gap-3">
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <CheckCircle2 className="h-5 w-5 text-green-400" />
        </motion.div>
        <div>
          <h2 className="text-lg font-semibold text-white">Completed</h2>
          <p className="text-sm text-white/60">Research finished successfully</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Duration */}
        <StatCard icon={<Clock className="h-4 w-4" />} label="Duration">
          <span className="text-2xl font-bold tabular-nums text-white">
            {duration}
          </span>
        </StatCard>

        {/* Estimated tokens */}
        <StatCard icon={<Zap className="h-4 w-4" />} label="Est. Tokens">
          <span className="text-2xl font-bold tabular-nums text-white">
            {estimatedTokens.toLocaleString()}
          </span>
        </StatCard>
      </div>

      {/* Completion date */}
      <div className="flex items-center gap-2 text-sm text-white/50">
        <Calendar className="h-4 w-4" />
        <span>Completed {completedDate}</span>
      </div>

      {/* Research mode */}
      <div className="flex items-center gap-2 text-sm text-white/50">
        <Globe className="h-4 w-4" />
        <span>{research.mode === "web+files" ? "Web + Files" : "Web Only"}</span>
      </div>

      {/* Thinking history (collapsible) */}
      {thoughtsHistory.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <button
            onClick={() => setShowThoughts(!showThoughts)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Brain className="h-4 w-4" />
              <span>Research Process ({thoughtsHistory.length} steps)</span>
            </div>
            {showThoughts ? (
              <ChevronUp className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white/40" />
            )}
          </button>

          {showThoughts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 max-h-64 overflow-y-auto"
            >
              {thoughtsHistory.map((thought, i) => (
                <div
                  key={i}
                  className="text-xs text-white/50 pl-3 border-l-2 border-white/10 py-1 prose prose-xs prose-invert [&>p]:m-0 [&>strong]:text-white/70"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {thought}
                  </ReactMarkdown>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Stat card component
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function StatCard({ icon, label, children }: StatCardProps) {
  return (
    <div className="relative rounded-xl bg-white/[0.02] p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-white/40">{icon}</span>
        <span className="text-xs text-white/40 uppercase tracking-wider">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
