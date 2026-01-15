"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, StopCircle, ChevronDown } from "lucide-react";
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type KeyboardEvent,
} from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { MessageBubble, StreamingMessage, MessageSkeleton } from "./MessageBubble";
import { QuickActions } from "./QuickActions";
import type { Message, Research } from "@/types";

// ============================================================================
// Types
// ============================================================================

interface FollowUpChatProps {
  /** The research session for this chat */
  research: Research;
  /** Callback to send a follow-up message */
  onSendMessage: (message: string) => Promise<void>;
  /** Whether a message is currently being sent/streamed */
  isStreaming?: boolean;
  /** Current streaming content (for live display) */
  streamingContent?: string;
  /** Callback to stop streaming */
  onStopStreaming?: () => void;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * FollowUpChat - Follow-up conversation interface for completed research
 *
 * Features:
 * - Message thread with user/assistant bubbles
 * - Live streaming response display
 * - Quick action buttons
 * - Auto-scroll to latest message
 * - Keyboard shortcuts (Enter to send, Shift+Enter for newline)
 * - IndexedDB message persistence
 */
export function FollowUpChat({
  research,
  onSendMessage,
  isStreaming = false,
  streamingContent = "",
  onStopStreaming,
  className,
}: FollowUpChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Live query for messages - automatically updates when DB changes
   */
  const messages = useLiveQuery(
    async () => {
      if (!research.id) return [];
      return db.messages
        .where("researchId")
        .equals(research.id)
        .sortBy("createdAt");
    },
    [research.id]
  );

  const isLoading = messages === undefined;

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  /**
   * Handle scroll to detect if user scrolled up
   */
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  /**
   * Auto-scroll when new messages arrive or streaming content updates
   */
  useEffect(() => {
    if (!showScrollButton) {
      scrollToBottom();
    }
  }, [messages, streamingContent, scrollToBottom, showScrollButton]);

  /**
   * Auto-resize textarea
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  /**
   * Send message handler
   */
  const handleSend = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isSending || isStreaming) return;

    setIsSending(true);
    setInputValue("");

    try {
      await onSendMessage(trimmedInput);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore input on error
      setInputValue(trimmedInput);
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, isStreaming, onSendMessage]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter to send (without shift)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  /**
   * Handle quick action selection
   */
  const handleQuickAction = useCallback(
    async (prompt: string) => {
      setInputValue(prompt);
      // Auto-send quick actions
      setIsSending(true);
      try {
        await onSendMessage(prompt);
      } catch (error) {
        console.error("Failed to send quick action:", error);
        setInputValue(prompt);
      } finally {
        setIsSending(false);
      }
    },
    [onSendMessage]
  );

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/80 backdrop-blur-sm",
        className
      )}
    >
      {/* Header */}
      <div className="border-b border-white/[0.08] px-4 py-3">
        <h3 className="font-semibold text-white">Follow-up Chat</h3>
        <p className="mt-0.5 text-xs text-white/50">
          Ask questions about the research
        </p>
      </div>

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-4">
            <MessageSkeleton role="user" />
            <MessageSkeleton role="assistant" />
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.createdAt}
                />
              ))}
            </AnimatePresence>

            {/* Streaming response */}
            {isStreaming && streamingContent && (
              <StreamingMessage content={streamingContent} />
            )}

            {/* Sending indicator */}
            {isSending && !isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs text-white/40"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Sending...</span>
              </motion.div>
            )}
          </div>
        ) : (
          // Empty state
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-violet-500/10 p-4">
              <Send className="h-6 w-6 text-violet-400" />
            </div>
            <h4 className="text-sm font-medium text-white/80">
              Start a conversation
            </h4>
            <p className="mt-1 max-w-[200px] text-xs text-white/50">
              Ask follow-up questions about your research or use the quick
              actions below.
            </p>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 rounded-full bg-violet-500/20 p-2 text-violet-400 backdrop-blur-sm transition-colors hover:bg-violet-500/30"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Quick actions */}
      <div className="border-t border-white/[0.08] px-4 pt-3">
        <QuickActions
          onAction={handleQuickAction}
          disabled={isStreaming || isSending}
          topic={research.topic}
        />
      </div>

      {/* Input area */}
      <div className="border-t border-white/[0.08] p-4">
        <div className="relative flex items-end gap-2">
          {/* Text input */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up question..."
              disabled={isStreaming}
              rows={1}
              className={cn(
                "w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 pr-12 text-sm text-white placeholder-white/30 transition-colors focus:border-violet-500/50 focus:bg-white/[0.05] focus:outline-none",
                isStreaming && "cursor-not-allowed opacity-50"
              )}
              style={{ maxHeight: "150px" }}
            />

            {/* Character count */}
            {inputValue.length > 100 && (
              <span
                className={cn(
                  "absolute bottom-1 right-12 text-[10px]",
                  inputValue.length > 500 ? "text-amber-400" : "text-white/30"
                )}
              >
                {inputValue.length}
              </span>
            )}
          </div>

          {/* Send/Stop button */}
          {isStreaming ? (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={onStopStreaming}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30"
              aria-label="Stop generating"
            >
              <StopCircle className="h-5 w-5" />
            </motion.button>
          ) : (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all",
                inputValue.trim() && !isSending
                  ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:opacity-90"
                  : "bg-white/[0.05] text-white/30"
              )}
              whileHover={{ scale: inputValue.trim() && !isSending ? 1.05 : 1 }}
              whileTap={{ scale: inputValue.trim() && !isSending ? 0.95 : 1 }}
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </motion.button>
          )}
        </div>

        {/* Keyboard hint */}
        <p className="mt-2 text-center text-[10px] text-white/30">
          Press <kbd className="rounded bg-white/10 px-1 py-0.5">Enter</kbd> to
          send,{" "}
          <kbd className="rounded bg-white/10 px-1 py-0.5">Shift + Enter</kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Floating Chat Button (for mobile)
// ============================================================================

interface FloatingChatButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
  className?: string;
}

/**
 * FloatingChatButton - Floating action button to open chat on mobile
 */
export function FloatingChatButton({
  onClick,
  hasUnread = false,
  className,
}: FloatingChatButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl md:hidden",
        "bg-gradient-to-r from-violet-500 to-cyan-500",
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="Open chat"
    >
      <Send className="h-6 w-6 text-white" />

      {/* Unread indicator */}
      {hasUnread && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
        >
          !
        </motion.span>
      )}

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(6, 182, 212, 0.5))",
          filter: "blur(15px)",
          zIndex: -1,
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  );
}

export default FollowUpChat;
