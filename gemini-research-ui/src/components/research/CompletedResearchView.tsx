"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelRightClose,
  PanelRightOpen,
  MessageSquare,
  X,
  Sparkles,
} from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { ResearchReport } from "./ResearchReport";
import { FollowUpChat, FloatingChatButton } from "./FollowUpChat";
import type { Research } from "@/types";

// ============================================================================
// Types
// ============================================================================

interface CompletedResearchViewProps {
  /** The completed research to display */
  research: Research;
  /** Callback to send a follow-up message */
  onSendFollowUp: (message: string) => Promise<void>;
  /** Whether a message is currently being streamed */
  isStreaming?: boolean;
  /** Current streaming content */
  streamingContent?: string;
  /** Callback to stop streaming */
  onStopStreaming?: () => void;
  /** Whether this is the first time viewing (triggers confetti) */
  isFirstView?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Confetti Effect Component
// ============================================================================

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  color: string;
  size: number;
}

function Confetti({ isActive }: { isActive: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      const colors = [
        "#8b5cf6", // violet
        "#06b6d4", // cyan
        "#10b981", // emerald
        "#f59e0b", // amber
        "#ec4899", // pink
      ];

      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: Math.random() * 2 + 2,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      }));

      setPieces(newPieces);

      // Clear confetti after animation
      const timeout = setTimeout(() => {
        setPieces([]);
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [isActive]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: -20,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
          }}
          initial={{
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: "100vh",
            rotate: piece.rotation,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Celebration Banner
// ============================================================================

interface CelebrationBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
}

function CelebrationBanner({ isVisible, onDismiss }: CelebrationBannerProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative mb-6 overflow-hidden rounded-2xl"
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))",
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Content */}
          <div className="relative flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>

              <div>
                <h3 className="font-semibold text-white">
                  Research Complete!
                </h3>
                <p className="text-sm text-white/60">
                  Your deep research has finished. Ask follow-up questions to
                  learn more.
                </p>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white/60"
              aria-label="Dismiss banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Border glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              border: "1px solid rgba(139, 92, 246, 0.3)",
              boxShadow:
                "inset 0 0 20px rgba(139, 92, 246, 0.1), 0 0 30px rgba(139, 92, 246, 0.1)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * CompletedResearchView - Combined view with report and follow-up chat
 *
 * Features:
 * - Split panel layout (60% report / 40% chat)
 * - Toggle to hide/show chat panel
 * - Responsive: Full width report + floating chat on mobile
 * - Confetti celebration on first view
 * - Animated panel transitions
 * - Keyboard shortcut: Cmd+K to toggle chat
 */
export function CompletedResearchView({
  research,
  onSendFollowUp,
  isStreaming = false,
  streamingContent = "",
  onStopStreaming,
  isFirstView = false,
  className,
}: CompletedResearchViewProps) {
  const [chatVisible, setChatVisible] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(isFirstView);
  const [showConfetti, setShowConfetti] = useState(isFirstView);
  const firstRender = useRef(true);

  /**
   * Toggle chat panel visibility
   */
  const toggleChat = useCallback(() => {
    setChatVisible((prev) => !prev);
  }, []);

  /**
   * Handle keyboard shortcut (Cmd/Ctrl + K)
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleChat();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleChat]);

  /**
   * Trigger confetti only once on first view
   */
  useEffect(() => {
    if (firstRender.current && isFirstView) {
      firstRender.current = false;
      // Slight delay for dramatic effect
      const timeout = setTimeout(() => {
        setShowConfetti(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isFirstView]);

  /**
   * Dismiss celebration banner
   */
  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  return (
    <>
      {/* Confetti overlay */}
      <Confetti isActive={showConfetti} />

      <div className={cn("flex h-full flex-col", className)}>
        {/* Celebration banner */}
        <CelebrationBanner
          isVisible={showCelebration}
          onDismiss={dismissCelebration}
        />

        {/* Main content area */}
        <div className="relative flex flex-1 gap-6 overflow-hidden">
          {/* Research Report Panel */}
          <motion.div
            className="flex-1 overflow-y-auto"
            animate={{
              flex: chatVisible ? "1 1 60%" : "1 1 100%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <ResearchReport research={research} />
          </motion.div>

          {/* Chat Toggle Button (Desktop) */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={toggleChat}
            className={cn(
              "absolute right-4 top-4 z-20 hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all md:flex",
              chatVisible
                ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                : "bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-white hover:from-violet-500/30 hover:to-cyan-500/30"
            )}
            style={{
              boxShadow: !chatVisible
                ? "0 0 20px rgba(139, 92, 246, 0.2)"
                : "none",
            }}
          >
            {chatVisible ? (
              <>
                <PanelRightClose className="h-4 w-4" />
                <span>Hide Chat</span>
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                <span>Show Chat</span>
              </>
            )}
            <kbd className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/40">
              Cmd+K
            </kbd>
          </motion.button>

          {/* Follow-up Chat Panel (Desktop) */}
          <AnimatePresence mode="popLayout">
            {chatVisible && (
              <motion.div
                initial={{ opacity: 0, width: 0, x: 50 }}
                animate={{ opacity: 1, width: "40%", x: 0 }}
                exit={{ opacity: 0, width: 0, x: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="hidden h-full min-w-[320px] max-w-[500px] md:block"
              >
                <FollowUpChat
                  research={research}
                  onSendMessage={onSendFollowUp}
                  isStreaming={isStreaming}
                  streamingContent={streamingContent}
                  onStopStreaming={onStopStreaming}
                  className="h-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile floating chat button */}
        <FloatingChatButton
          onClick={() => setMobileSheetOpen(true)}
          hasUnread={isStreaming}
        />

        {/* Mobile chat sheet */}
        <AnimatePresence>
          {mobileSheetOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSheetOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              />

              {/* Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-x-0 bottom-0 z-50 h-[80vh] md:hidden"
              >
                {/* Handle */}
                <div className="flex justify-center pb-2 pt-3">
                  <div className="h-1 w-12 rounded-full bg-white/20" />
                </div>

                {/* Close button */}
                <button
                  onClick={() => setMobileSheetOpen(false)}
                  className="absolute right-4 top-4 rounded-lg bg-white/5 p-2 text-white/60"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Chat content */}
                <div className="h-full overflow-hidden rounded-t-3xl bg-[#0a0a0f] pt-2">
                  <FollowUpChat
                    research={research}
                    onSendMessage={onSendFollowUp}
                    isStreaming={isStreaming}
                    streamingContent={streamingContent}
                    onStopStreaming={onStopStreaming}
                    className="h-full"
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

/**
 * CompletedResearchSkeleton - Loading state for the completed view
 */
export function CompletedResearchSkeleton() {
  return (
    <div className="flex h-full gap-6">
      {/* Report skeleton */}
      <div className="flex-1 rounded-2xl border border-white/[0.08] bg-[#12121a]/60 p-6">
        {/* Title skeleton */}
        <div className="mb-4 h-8 w-2/3 animate-pulse rounded-lg bg-white/10" />

        {/* Meta skeleton */}
        <div className="mb-6 flex gap-4">
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-white/10" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-full animate-pulse rounded bg-white/10" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
        </div>
      </div>

      {/* Chat skeleton */}
      <div className="hidden w-[40%] min-w-[320px] max-w-[500px] rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/80 p-4 md:block">
        {/* Header */}
        <div className="mb-4 h-12 animate-pulse rounded-lg bg-white/10" />

        {/* Messages area */}
        <div className="flex-1 space-y-4">
          <div className="ml-auto h-16 w-2/3 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-24 w-3/4 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default CompletedResearchView;
