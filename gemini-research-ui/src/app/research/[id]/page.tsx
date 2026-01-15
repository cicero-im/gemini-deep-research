"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw, ArrowLeft, Download, Share2, RotateCcw } from "lucide-react";
import Link from "next/link";

import { useResearch, useResearchContent, useResearchProgress } from "@/hooks/useResearch";
import { useResearchSSE } from "@/hooks/useSSE";
import { useAppStore } from "@/lib/store";
import { ResearchLayout } from "@/components/research/ResearchLayout";
import { ShinyButton } from "@/components/ui/shiny-button";
import { cn } from "@/lib/utils";
import type { Research, StreamProgress } from "@/types";

/**
 * Research Page - Dynamic route for viewing/streaming research
 *
 * Routes:
 * - /research/[id] - View existing research by ID
 * - /research/new?topic=... - Start new research (handled by query params)
 *
 * Features:
 * - Loads research by ID from IndexedDB
 * - If research is pending/in_progress: show StreamingProgress + LivePreview
 * - If completed: show full preview with export options
 * - Handles SSE streaming connection
 * - Save/export functionality
 */
export default function ResearchPage() {
  const params = useParams();
  const router = useRouter();
  const researchId = params.id as string;

  const {
    currentResearch,
    isStreaming,
    streamingContent,
    progress,
    loadResearch,
    stopResearch,
    saveCurrentContent,
    recoverContent,
    error,
    clearError,
  } = useResearch();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | undefined>();
  const [isRecovering, setIsRecovering] = useState(false);
  const hasLoadedRef = useRef(false);

  // Load research on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    async function loadData() {
      // Handle "new" research case
      if (researchId === "new") {
        setIsLoading(false);
        return;
      }

      const id = parseInt(researchId, 10);
      if (isNaN(id)) {
        setLoadError("Invalid research ID");
        setIsLoading(false);
        return;
      }

      try {
        const research = await loadResearch(id);
        if (!research) {
          setLoadError("Research not found");
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load research");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [researchId, loadResearch]);

  // Track start time when streaming begins
  useEffect(() => {
    if (isStreaming && !startTime) {
      setStartTime(Date.now());
    }
    if (!isStreaming) {
      setStartTime(undefined);
    }
  }, [isStreaming, startTime]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    stopResearch();
  }, [stopResearch]);

  // Handle save
  const handleSave = useCallback(async () => {
    await saveCurrentContent();
  }, [saveCurrentContent]);

  // Handle export as markdown
  const handleExport = useCallback(() => {
    const content = currentResearch?.content || streamingContent;
    if (!content) return;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentResearch?.topic?.slice(0, 50) || "research"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentResearch, streamingContent]);

  // Handle share (copy to clipboard)
  const handleShare = useCallback(async () => {
    const content = currentResearch?.content || streamingContent;
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }, [currentResearch, streamingContent]);

  // Handle content recovery for researches with interactionId but no content
  const handleRecover = useCallback(async () => {
    if (!currentResearch?.id) return;

    setIsRecovering(true);
    try {
      await recoverContent(currentResearch.id);
    } catch (err) {
      console.error("Failed to recover content:", err);
      setLoadError(err instanceof Error ? err.message : "Failed to recover content");
    } finally {
      setIsRecovering(false);
    }
  }, [currentResearch, recoverContent]);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (loadError) {
    return <ErrorState error={loadError} onRetry={() => router.refresh()} />;
  }

  // New research flow (placeholder - would integrate with search/form)
  if (researchId === "new") {
    return <NewResearchPlaceholder />;
  }

  // Main research view
  return (
    <ResearchLayout
      research={currentResearch}
      isStreaming={isStreaming}
      streamingContent={streamingContent}
      progress={{
        status: progress.status,
        sources: progress.sources,
        tokensUsed: progress.tokensUsed,
        thoughtSummary: progress.thoughtSummary,
      }}
      startTime={startTime}
      onCancel={handleCancel}
      onSave={handleSave}
      onExport={handleExport}
      onShare={handleShare}
      onRecoverContent={handleRecover}
      isRecovering={isRecovering}
    />
  );
}

// ============================================================================
// Loading state
// ============================================================================

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Animated loader */}
        <div className="relative h-16 w-16">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-white/60">Loading research...</p>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Error state
// ============================================================================

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="glass rounded-2xl p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">
          Failed to Load Research
        </h2>
        <p className="text-white/60 mb-6">{error}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <ShinyButton variant="ghost" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </ShinyButton>

          <Link href="/">
            <ShinyButton variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </ShinyButton>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// New research placeholder
// ============================================================================

function NewResearchPlaceholder() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="glass rounded-2xl p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-white mb-2">
          Start New Research
        </h2>
        <p className="text-white/60 mb-6">
          Enter a topic or question to begin your research session.
        </p>

        {/* Search input placeholder */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="What would you like to research?"
            className={cn(
              "w-full px-4 py-3 rounded-xl",
              "bg-white/5 border border-white/10",
              "text-white placeholder-white/40",
              "focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30",
              "transition-colors"
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value;
                if (value.trim()) {
                  // Would redirect to start research with this topic
                  console.log("Start research:", value);
                }
              }
            }}
          />
        </div>

        <Link href="/">
          <ShinyButton variant="ghost" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </ShinyButton>
        </Link>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Streaming research view (alternative compact view)
// ============================================================================

interface StreamingResearchViewProps {
  research: Research;
  content: string;
  progress: StreamProgress;
  isStreaming: boolean;
  onCancel: () => void;
}

function StreamingResearchView({
  research,
  content,
  progress,
  isStreaming,
  onCancel,
}: StreamingResearchViewProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white/70" />
            </Link>
            <div>
              <h1 className="font-semibold text-white truncate max-w-[200px] sm:max-w-md">
                {research.topic}
              </h1>
              {isStreaming && (
                <p className="text-xs text-primary">
                  Researching... {progress.sources} sources found
                </p>
              )}
            </div>
          </div>

          {isStreaming && (
            <ShinyButton
              variant="outline"
              size="sm"
              onClick={onCancel}
              gradientFrom="#ef4444"
              gradientTo="#f97316"
            >
              Cancel
            </ShinyButton>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Progress indicators */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap gap-4"
          >
            <div className="glass rounded-lg px-4 py-2">
              <span className="text-xs text-white/40">Sources</span>
              <p className="text-lg font-semibold text-white">
                {progress.sources}
              </p>
            </div>
            <div className="glass rounded-lg px-4 py-2">
              <span className="text-xs text-white/40">Tokens</span>
              <p className="text-lg font-semibold text-white">
                {progress.tokensUsed.toLocaleString()}
              </p>
            </div>
            {progress.thoughtSummary && (
              <div className="glass rounded-lg px-4 py-2 flex-1 min-w-[200px]">
                <span className="text-xs text-white/40">Current Task</span>
                <p className="text-sm text-white/80 truncate">
                  {progress.thoughtSummary}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Research content */}
        <div className="glass rounded-2xl p-6">
          {content ? (
            <article className="prose prose-invert prose-sm max-w-none">
              {/* Would render markdown here */}
              <pre className="whitespace-pre-wrap text-white/80">{content}</pre>
            </article>
          ) : (
            <div className="text-center py-12">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                </div>
              </motion.div>
              <p className="text-white/60">Gathering research...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
