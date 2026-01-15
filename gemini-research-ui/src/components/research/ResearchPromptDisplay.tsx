"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MessageSquareText, ChevronDown, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResearchPromptDisplayProps {
  /** The research prompt/topic */
  prompt: string;
  /** Whether the prompt section is collapsible */
  collapsible?: boolean;
  /** Initial collapsed state (if collapsible) */
  defaultCollapsed?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ResearchPromptDisplay - Shows the original research prompt
 *
 * Features:
 * - Full markdown rendering with proper formatting
 * - Collapsible for long prompts
 * - Copy to clipboard functionality
 * - Distinct visual styling to separate from output
 */
export function ResearchPromptDisplay({
  prompt,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: ResearchPromptDisplayProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  }, [prompt]);

  const showContent = !collapsible || !isCollapsed;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn(
        "rounded-xl border border-violet-500/20 bg-violet-500/5 backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3",
          collapsible && "cursor-pointer hover:bg-violet-500/10 transition-colors"
        )}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-violet-500/20">
            <MessageSquareText className="h-4 w-4 text-violet-400" />
          </div>
          <span className="text-sm font-medium text-white/80">Research Prompt</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
              copied
                ? "bg-green-500/20 text-green-400"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
            )}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>

          {/* Collapse toggle */}
          {collapsible && (
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-white/40" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={false}
        animate={{
          height: showContent ? "auto" : 0,
          opacity: showContent ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4">
          <div className={cn(
            "rounded-lg bg-[#0a0a0f]/50 border border-white/5 p-4",
            "prose prose-sm prose-invert max-w-none",
            // Markdown styling
            "[&>p]:text-white/80 [&>p]:leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0",
            "[&>ul]:text-white/70 [&>ol]:text-white/70",
            "[&>ul>li]:marker:text-violet-400 [&>ol>li]:marker:text-violet-400",
            "[&>h1]:text-white [&>h2]:text-white [&>h3]:text-white",
            "[&>blockquote]:border-violet-500/50 [&>blockquote]:text-white/60",
            "[&>code]:bg-violet-500/20 [&>code]:text-violet-300 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded",
            "[&>pre]:bg-[#0a0a0f] [&>pre]:border [&>pre]:border-white/10"
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{prompt}</ReactMarkdown>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
