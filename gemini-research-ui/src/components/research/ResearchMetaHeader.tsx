"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Globe,
  Brain,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Research } from "@/types";

interface ResearchMetaHeaderProps {
  research: Research;
  thoughtsHistory?: string[];
  className?: string;
}

/**
 * ResearchMetaHeader - Top section showing research metadata
 *
 * Shows:
 * - Completion status
 * - Duration
 * - Research mode
 * - Collapsible thinking process steps
 */
export function ResearchMetaHeader({
  research,
  thoughtsHistory = [],
  className,
}: ResearchMetaHeaderProps) {
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

  // Extract sources from content (count markdown links)
  const sourcesCount = useMemo(() => {
    const content = research.content || "";
    const linkMatches = content.match(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g);
    return linkMatches?.length || 0;
  }, [research.content]);

  const isCompleted = research.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border border-white/10 bg-[#12121a]/60 backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b border-white/5">
        {/* Status */}
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          ) : (
            <motion.div
              className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
          <span className={cn(
            "text-sm font-medium",
            isCompleted ? "text-green-400" : "text-primary"
          )}>
            {isCompleted ? "Completed" : "In Progress"}
          </span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Clock className="h-4 w-4" />
          <span className="tabular-nums">{duration}</span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Sources */}
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Globe className="h-4 w-4" />
          <span>{sourcesCount} sources</span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Mode */}
        <div className="text-sm text-white/40">
          {research.mode === "web+files" ? "Web + Files" : "Web Only"}
        </div>
      </div>

      {/* Thinking process toggle */}
      {thoughtsHistory.length > 0 && (
        <>
          <button
            onClick={() => setShowThoughts(!showThoughts)}
            className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Brain className="h-4 w-4 text-violet-400" />
              <span>Research Process</span>
              <span className="text-white/40">({thoughtsHistory.length} steps)</span>
            </div>
            <motion.div
              animate={{ rotate: showThoughts ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-white/40" />
            </motion.div>
          </button>

          {/* Expandable thinking history */}
          <AnimatePresence>
            {showThoughts && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2 max-h-80 overflow-y-auto">
                  {thoughtsHistory.map((thought, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="flex items-center justify-center h-5 w-5 rounded-full bg-violet-500/20 shrink-0 mt-0.5">
                        <Sparkles className="h-3 w-3 text-violet-400" />
                      </div>
                      <div className="text-white/60 prose prose-xs prose-invert [&>p]:m-0 [&>strong]:text-white/80">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {thought}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
