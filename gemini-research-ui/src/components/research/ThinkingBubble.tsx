"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Lightbulb, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ThinkingBubbleProps {
  thought: string;
  className?: string;
  icon?: "brain" | "lightbulb" | "sparkles";
  variant?: "default" | "compact" | "minimal";
  autoFade?: boolean;
  fadeDuration?: number;
}

const iconComponents = {
  brain: Brain,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
};

/**
 * ThinkingBubble - Glass card displaying AI thinking/reasoning
 *
 * Features:
 * - Animated pulsing border with gradient glow
 * - Fades in/out with each new thought
 * - Multiple icon options (brain, lightbulb, sparkles)
 * - Glass morphism effect
 * - Auto-fade option for transient thoughts
 */
export function ThinkingBubble({
  thought,
  className,
  icon = "brain",
  variant = "default",
  autoFade = false,
  fadeDuration = 8000,
}: ThinkingBubbleProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [key, setKey] = useState(0);
  const Icon = iconComponents[icon];

  // Trigger re-animation when thought changes
  useEffect(() => {
    setKey((prev) => prev + 1);
    setIsVisible(true);

    if (autoFade && fadeDuration > 0) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, fadeDuration);
      return () => clearTimeout(timeout);
    }
  }, [thought, autoFade, fadeDuration]);

  if (!thought) return null;

  if (variant === "minimal") {
    return (
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex items-start gap-2 text-sm text-white/70",
              className
            )}
          >
            <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span className="prose-sm prose-invert [&>p]:m-0 [&>strong]:text-white/90">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{thought}</ReactMarkdown>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === "compact") {
    return (
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
              "glass rounded-lg px-3 py-2 text-sm",
              className
            )}
          >
            <div className="flex items-start gap-2">
              <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span className="text-white/80 prose-sm prose-invert [&>p]:m-0 [&>strong]:text-white/90">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{thought}</ReactMarkdown>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Default variant - Full glass card with animated border
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className={cn("relative", className)}
        >
          {/* Animated glow background */}
          <motion.div
            className="absolute -inset-0.5 rounded-xl opacity-75"
            style={{
              background:
                "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3), rgba(139, 92, 246, 0.3))",
              backgroundSize: "200% 200%",
              filter: "blur(8px)",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Pulsing border effect */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--secondary), var(--primary))",
              backgroundSize: "200% 200%",
              padding: "1.5px",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="h-full w-full rounded-xl bg-card" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 rounded-xl bg-card/90 backdrop-blur-sm p-4">
            <div className="flex items-start gap-3">
              {/* Animated icon */}
              <motion.div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Icon className="h-4 w-4 text-primary" />
              </motion.div>

              {/* Thought text */}
              <div className="flex-1 min-w-0">
                <motion.div
                  className="text-sm leading-relaxed text-white/85 prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>strong]:text-white [&>em]:text-violet-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{thought}</ReactMarkdown>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ThinkingBubbleStackProps {
  thoughts: string[];
  className?: string;
  maxVisible?: number;
  icon?: "brain" | "lightbulb" | "sparkles";
}

/**
 * ThinkingBubbleStack - Displays multiple thoughts with stacking
 */
export function ThinkingBubbleStack({
  thoughts,
  className,
  maxVisible = 3,
  icon = "brain",
}: ThinkingBubbleStackProps) {
  const visibleThoughts = thoughts.slice(-maxVisible);

  return (
    <div className={cn("space-y-2", className)}>
      <AnimatePresence mode="popLayout">
        {visibleThoughts.map((thought, index) => (
          <motion.div
            key={`${thought.slice(0, 20)}-${index}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1 - (visibleThoughts.length - 1 - index) * 0.2,
              y: 0,
              scale: 1,
            }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <ThinkingBubble
              thought={thought}
              icon={icon}
              variant={index < visibleThoughts.length - 1 ? "compact" : "default"}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

interface PulsingThinkingIndicatorProps {
  label?: string;
  className?: string;
}

/**
 * PulsingThinkingIndicator - Simple pulsing dot indicator
 */
export function PulsingThinkingIndicator({
  label = "Thinking",
  className,
}: PulsingThinkingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      {label && <span className="text-sm text-white/60">{label}</span>}
    </div>
  );
}
