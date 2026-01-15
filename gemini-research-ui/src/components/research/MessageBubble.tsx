"use client";

import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { Copy, Check, User, Sparkles } from "lucide-react";
import { useCallback, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { MessageRole } from "@/types";

// ============================================================================
// Types
// ============================================================================

interface MessageBubbleProps {
  /** Message role - determines styling */
  role: MessageRole;
  /** Message content (supports markdown) */
  content: string;
  /** When the message was created */
  timestamp?: Date;
  /** Whether this message is currently streaming */
  isStreaming?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Animation Variants
// ============================================================================

const bubbleVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
};

const cursorVariants: Variants = {
  blink: {
    opacity: [1, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

// ============================================================================
// Component
// ============================================================================

/**
 * MessageBubble - Individual message in the chat UI
 *
 * Features:
 * - User messages: Glass effect with right alignment
 * - Assistant messages: Animated gradient border with left alignment
 * - Streaming support with typing cursor
 * - Markdown rendering for assistant messages
 * - Copy button on hover
 * - Timestamp tooltip on hover
 */
export function MessageBubble({
  role,
  content,
  timestamp,
  isStreaming = false,
  className,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isUser = role === "user";

  /**
   * Copy message content to clipboard
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [content]);

  /**
   * Format timestamp for display
   */
  const formattedTime = useMemo(() => {
    if (!timestamp) return null;
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(timestamp);
  }, [timestamp]);

  if (isUser) {
    return (
      <motion.div
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "flex w-full justify-end",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex max-w-[80%] items-end gap-2">
          {/* Copy button - shows on hover */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.8,
            }}
            transition={{ duration: 0.15 }}
            onClick={handleCopy}
            className="mb-2 rounded-lg bg-white/5 p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/60"
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </motion.button>

          {/* Message bubble */}
          <div className="relative">
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-2xl opacity-40 blur-xl"
              style={{
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.2))",
              }}
            />

            {/* Glass card */}
            <div className="relative rounded-2xl rounded-br-md bg-white/[0.08] px-4 py-3 backdrop-blur-sm">
              {/* Subtle gradient border */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl rounded-br-md"
                style={{
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.1))",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                }}
              />

              <p className="text-sm leading-relaxed text-white/90">{content}</p>

              {/* Timestamp */}
              {formattedTime && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 0.5 : 0 }}
                  className="mt-1 block text-right text-[10px] text-white/50"
                >
                  {formattedTime}
                </motion.span>
              )}
            </div>
          </div>

          {/* User avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
            <User className="h-4 w-4 text-white/70" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Assistant message
  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex w-full justify-start",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex max-w-[85%] items-start gap-3">
        {/* Assistant avatar with animated gradient */}
        <div className="relative shrink-0">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4, #8b5cf6)",
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0f]" style={{ margin: "1px" }}>
            <Sparkles className="h-4 w-4 text-violet-400" />
          </div>
        </div>

        {/* Message bubble with animated gradient border */}
        <div className="relative flex-1">
          {/* Animated gradient border */}
          <motion.div
            className="absolute inset-0 rounded-2xl rounded-tl-md"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4, #8b5cf6)",
              backgroundSize: "200% 200%",
              padding: "1px",
            }}
            animate={
              isStreaming
                ? {
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="h-full w-full rounded-2xl rounded-tl-md bg-[#12121a]" />
          </motion.div>

          {/* Content */}
          <div className="relative rounded-2xl rounded-tl-md bg-[#12121a] px-4 py-3">
            {/* Markdown content */}
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom paragraph styling
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 text-white/90 leading-relaxed">
                      {children}
                    </p>
                  ),
                  // Code blocks
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match;

                    if (isInline) {
                      return (
                        <code
                          className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-cyan-300"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <code className={cn("text-xs", className)} {...props}>
                        {children}
                      </code>
                    );
                  },
                  // Links
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline decoration-cyan-400/30 underline-offset-2 transition-colors hover:text-cyan-300 hover:decoration-cyan-300/50"
                    >
                      {children}
                    </a>
                  ),
                  // Lists
                  ul: ({ children }) => (
                    <ul className="mb-2 ml-4 list-disc space-y-1 text-white/80">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-2 ml-4 list-decimal space-y-1 text-white/80">
                      {children}
                    </ol>
                  ),
                  // Strong/Bold
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">{children}</strong>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>

              {/* Streaming cursor */}
              {isStreaming && (
                <motion.span
                  variants={cursorVariants}
                  animate="blink"
                  className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-violet-400"
                />
              )}
            </div>

            {/* Timestamp and copy button row */}
            <div className="mt-2 flex items-center justify-between">
              {/* Timestamp */}
              {formattedTime && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 0.5 : 0 }}
                  className="text-[10px] text-white/50"
                >
                  {formattedTime}
                </motion.span>
              )}

              {/* Copy button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isHovered && !isStreaming ? 1 : 0,
                  scale: isHovered && !isStreaming ? 1 : 0.8,
                }}
                transition={{ duration: 0.15 }}
                onClick={handleCopy}
                disabled={isStreaming}
                className="rounded-lg bg-white/5 p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Copy message"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Streaming Message Component
// ============================================================================

interface StreamingMessageProps {
  /** Current streamed content */
  content: string;
  /** Additional class names */
  className?: string;
}

/**
 * StreamingMessage - A message that's actively being streamed
 */
export function StreamingMessage({ content, className }: StreamingMessageProps) {
  return (
    <MessageBubble
      role="assistant"
      content={content}
      isStreaming={true}
      timestamp={new Date()}
      className={className}
    />
  );
}

// ============================================================================
// Message Skeleton for Loading
// ============================================================================

interface MessageSkeletonProps {
  role: MessageRole;
  className?: string;
}

/**
 * MessageSkeleton - Loading placeholder for messages
 */
export function MessageSkeleton({ role, className }: MessageSkeletonProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "flex items-start gap-3",
          isUser ? "flex-row-reverse max-w-[80%]" : "max-w-[85%]"
        )}
      >
        {/* Avatar skeleton */}
        <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-white/10" />

        {/* Content skeleton */}
        <div
          className={cn(
            "flex flex-col gap-2 rounded-2xl p-4",
            isUser ? "bg-white/[0.08]" : "bg-[#12121a]"
          )}
        >
          <div className="h-3 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-36 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
