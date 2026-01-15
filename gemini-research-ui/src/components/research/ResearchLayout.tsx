"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { ArrowLeft, Share2, Download, BookmarkPlus, RotateCcw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { StreamingProgress } from "./StreamingProgress";
import { LivePreview } from "./LivePreview";
import { ResearchMetaHeader } from "./ResearchMetaHeader";
import { ResearchPromptDisplay } from "./ResearchPromptDisplay";
import { ShinyButton } from "@/components/ui/shiny-button";
import type { Research, ResearchStatus } from "@/types";

interface ResearchLayoutProps {
  research: Research | null;
  isStreaming: boolean;
  streamingContent: string;
  progress: {
    status: string;
    sources: number;
    tokensUsed: number;
    thoughtSummary?: string;
  };
  startTime?: number;
  thoughtsHistory?: string[];
  onCancel?: () => void;
  onSave?: () => Promise<void>;
  onExport?: () => void;
  onShare?: () => void;
  onRecoverContent?: () => Promise<void>;
  isRecovering?: boolean;
  className?: string;
}

/**
 * ResearchLayout - Split pane layout for research interface
 *
 * Features:
 * - Split pane: Progress (left 30%) | Preview (right 70%) during streaming
 * - Full width preview when complete
 * - Animated transitions between states
 * - Responsive: stack on mobile
 * - Spring physics for panel transitions
 */
export function ResearchLayout({
  research,
  isStreaming,
  streamingContent,
  progress,
  startTime,
  thoughtsHistory = [],
  onCancel,
  onSave,
  onExport,
  onShare,
  onRecoverContent,
  isRecovering = false,
  className,
}: ResearchLayoutProps) {
  const [isSaving, setIsSaving] = useState(false);

  const isComplete = research?.status === "completed";
  // Always prefer streamingContent if available, then fall back to saved content
  const content = streamingContent || research?.content || "";
  // Show sidebar during streaming or when research is pending/in_progress
  const showStreamingSidebar = isStreaming || research?.status === "in_progress" || research?.status === "pending";
  // Check if content can be recovered (has interactionId but no content)
  const canRecoverContent = !isStreaming && research?.interactionId && !content;

  const handleSave = useCallback(async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave();
      } finally {
        setIsSaving(false);
      }
    }
  }, [onSave]);

  return (
    <div className={cn("min-h-screen", className)}>
      {/* Header */}
      <ResearchHeader
        research={research}
        isStreaming={isStreaming}
        isComplete={isComplete}
        isSaving={isSaving}
        onSave={handleSave}
        onExport={onExport}
        onShare={onShare}
      />

      {/* Main content area */}
      <div className="container mx-auto px-4 py-6">
        {isComplete && research ? (
          /* Completed research - full width with meta header */
          <div className="space-y-4">
            <ResearchMetaHeader
              research={research}
              thoughtsHistory={thoughtsHistory}
            />

            {/* Research Prompt Display */}
            <ResearchPromptDisplay
              prompt={research.topic}
              collapsible={research.topic.length > 300}
              defaultCollapsed={research.topic.length > 300}
            />

            {/* Content or Recovery Option */}
            {canRecoverContent ? (
              <NoContentRecovery
                hasInteractionId={true}
                onRecover={onRecoverContent}
                isRecovering={isRecovering}
              />
            ) : (
              <LivePreview
                content={content}
                isStreaming={false}
                autoScroll={false}
                maxHeight="calc(100vh - 380px)"
              />
            )}
          </div>
        ) : (
          /* Streaming/In Progress - split layout */
          <div className="space-y-4">
            {/* Research Prompt Display (collapsed by default during streaming) */}
            {research && (
              <ResearchPromptDisplay
                prompt={research.topic}
                collapsible={true}
                defaultCollapsed={true}
              />
            )}

            <motion.div
              layout
              className="flex flex-col lg:flex-row gap-6"
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 30,
              }}
            >
              {/* Progress panel - shows during streaming */}
              <AnimatePresence mode="wait">
                {showStreamingSidebar && (
                  <motion.div
                    key="progress-panel"
                    initial={{ opacity: 0, width: 0, x: -20 }}
                    animate={{ opacity: 1, width: "auto", x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -20 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    className="w-full lg:w-[30%] lg:min-w-[320px] lg:max-w-[400px] shrink-0"
                  >
                    <div className="lg:sticky lg:top-20">
                      <StreamingProgress
                        status={progress.status || "Waiting to start research..."}
                        sources={progress.sources}
                        tokensUsed={progress.tokensUsed}
                        thoughtSummary={progress.thoughtSummary}
                        isStreaming={isStreaming}
                        onCancel={onCancel}
                        startTime={startTime}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Preview panel */}
              <motion.div
                layout
                className="flex-1 min-w-0"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                {canRecoverContent ? (
                  <NoContentRecovery
                    hasInteractionId={true}
                    onRecover={onRecoverContent}
                    isRecovering={isRecovering}
                  />
                ) : (
                  <LivePreview
                    content={content}
                    isStreaming={isStreaming}
                    autoScroll={isStreaming}
                    maxHeight="calc(100vh - 260px)"
                  />
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Header component
// ============================================================================

interface ResearchHeaderProps {
  research: Research | null;
  isStreaming: boolean;
  isComplete: boolean;
  isSaving: boolean;
  onSave?: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

function ResearchHeader({
  research,
  isStreaming,
  isComplete,
  isSaving,
  onSave,
  onExport,
  onShare,
}: ResearchHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Back button + Title */}
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/"
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-lg",
                "bg-white/5 hover:bg-white/10 transition-colors"
              )}
            >
              <ArrowLeft className="h-5 w-5 text-white/70" />
            </Link>

            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-white truncate">
                {research?.topic || "New Research"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <StatusBadge
                  status={research?.status || "pending"}
                  isStreaming={isStreaming}
                />
                {research?.mode && (
                  <span className="text-white/30">
                    {research.mode === "web+files" ? "Web + Files" : "Web Only"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Save button */}
            {isComplete && onSave && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <ShinyButton
                  variant="ghost"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                >
                  <BookmarkPlus className="h-4 w-4 mr-1" />
                  {isSaving ? "Saving..." : "Save"}
                </ShinyButton>
              </motion.div>
            )}

            {/* Export button */}
            {isComplete && onExport && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
              >
                <ShinyButton variant="ghost" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </ShinyButton>
              </motion.div>
            )}

            {/* Share button */}
            {isComplete && onShare && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <ShinyButton variant="ghost" size="sm" onClick={onShare}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </ShinyButton>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// Status badge
// ============================================================================

interface StatusBadgeProps {
  status: ResearchStatus;
  isStreaming: boolean;
}

function StatusBadge({ status, isStreaming }: StatusBadgeProps) {
  const getStatusConfig = () => {
    if (isStreaming) {
      return {
        label: "In Progress",
        color: "text-primary",
        bgColor: "bg-primary/20",
        pulse: true,
      };
    }

    switch (status) {
      case "completed":
        return {
          label: "Completed",
          color: "text-green-400",
          bgColor: "bg-green-400/20",
          pulse: false,
        };
      case "failed":
        return {
          label: "Failed",
          color: "text-red-400",
          bgColor: "bg-red-400/20",
          pulse: false,
        };
      case "pending":
      default:
        return {
          label: "Pending",
          color: "text-yellow-400",
          bgColor: "bg-yellow-400/20",
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs",
        config.bgColor,
        config.color
      )}
    >
      {config.pulse && (
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-current"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {config.label}
    </span>
  );
}

// ============================================================================
// Mobile-first responsive layout variant
// ============================================================================

interface MobileResearchLayoutProps extends ResearchLayoutProps {
  showProgressPanel?: boolean;
  onToggleProgressPanel?: () => void;
}

export function MobileResearchLayout({
  showProgressPanel = true,
  onToggleProgressPanel,
  ...props
}: MobileResearchLayoutProps) {
  const { isStreaming, research, progress, streamingContent, startTime, onCancel } = props;
  const content = isStreaming ? streamingContent : research?.content || "";

  return (
    <div className="min-h-screen">
      {/* Mobile tabs */}
      <div className="lg:hidden sticky top-0 z-30 border-b border-white/5 bg-background/95 backdrop-blur-lg">
        <div className="flex">
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              showProgressPanel
                ? "text-primary border-b-2 border-primary"
                : "text-white/50"
            )}
            onClick={() => onToggleProgressPanel?.()}
          >
            Progress
          </button>
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              !showProgressPanel
                ? "text-primary border-b-2 border-primary"
                : "text-white/50"
            )}
            onClick={() => onToggleProgressPanel?.()}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            {showProgressPanel ? (
              <motion.div
                key="progress"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StreamingProgress
                  status={progress.status}
                  sources={progress.sources}
                  tokensUsed={progress.tokensUsed}
                  thoughtSummary={progress.thoughtSummary}
                  isStreaming={isStreaming}
                  onCancel={onCancel}
                  startTime={startTime}
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <LivePreview
                  content={content}
                  isStreaming={isStreaming}
                  maxHeight="calc(100vh - 160px)"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:block">
          <ResearchLayout {...props} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// No Content Recovery Component
// ============================================================================

interface NoContentRecoveryProps {
  hasInteractionId: boolean;
  onRecover?: () => Promise<void>;
  isRecovering?: boolean;
}

function NoContentRecovery({
  hasInteractionId,
  onRecover,
  isRecovering = false,
}: NoContentRecoveryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm p-8 text-center"
    >
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-amber-400" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">
        Content Not Available
      </h3>

      <p className="text-white/60 mb-6 max-w-md mx-auto">
        {hasInteractionId
          ? "The research content was not saved locally. However, it can be recovered from Gemini using the interaction ID."
          : "The research content was not saved and cannot be recovered."}
      </p>

      {hasInteractionId && onRecover && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ShinyButton
            onClick={onRecover}
            disabled={isRecovering}
            gradientFrom="#f59e0b"
            gradientTo="#eab308"
          >
            {isRecovering ? (
              <>
                <motion.div
                  className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Recovering...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Recover Content from Gemini
              </>
            )}
          </ShinyButton>
        </motion.div>
      )}

      {!hasInteractionId && (
        <p className="text-xs text-white/40">
          No interaction ID available for recovery
        </p>
      )}
    </motion.div>
  );
}
