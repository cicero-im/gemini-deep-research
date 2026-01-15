"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  FileText,
  Lightbulb,
  Search,
  GitCompare,
  List,
  BookOpen,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useRef, useCallback, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface QuickAction {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon component */
  icon: React.ElementType;
  /** The prompt to send */
  prompt: string;
  /** Optional color accent */
  color?: "violet" | "cyan" | "emerald" | "amber";
}

interface QuickActionsProps {
  /** Callback when an action is selected */
  onAction: (prompt: string) => void;
  /** Custom actions to display (overrides defaults) */
  actions?: QuickAction[];
  /** Whether the actions are disabled */
  disabled?: boolean;
  /** Current research topic for context */
  topic?: string;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Default Actions
// ============================================================================

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    id: "summarize",
    label: "Summarize",
    icon: FileText,
    prompt: "Please provide a concise summary of the key findings from this research.",
    color: "violet",
  },
  {
    id: "simplify",
    label: "Explain simpler",
    icon: Lightbulb,
    prompt: "Please explain the main points in simpler terms that anyone can understand.",
    color: "cyan",
  },
  {
    id: "more-details",
    label: "More details",
    icon: Search,
    prompt: "Can you provide more in-depth details and elaboration on the main topics?",
    color: "emerald",
  },
  {
    id: "key-points",
    label: "Key points",
    icon: List,
    prompt: "List the most important key points and takeaways from this research.",
    color: "amber",
  },
  {
    id: "sources",
    label: "Find sources",
    icon: BookOpen,
    prompt: "What are the primary sources and references for this information?",
    color: "violet",
  },
  {
    id: "compare",
    label: "Compare alternatives",
    icon: GitCompare,
    prompt: "Can you compare and contrast different viewpoints or alternatives mentioned?",
    color: "cyan",
  },
  {
    id: "actionable",
    label: "Make actionable",
    icon: Zap,
    prompt: "What are the actionable steps or recommendations based on this research?",
    color: "emerald",
  },
  {
    id: "continue",
    label: "Continue research",
    icon: ArrowRight,
    prompt: "Please continue with deeper research on the most important aspects.",
    color: "amber",
  },
];

// ============================================================================
// Color Configs
// ============================================================================

const colorConfigs = {
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
    hoverBg: "hover:bg-violet-500/20",
    hoverBorder: "hover:border-violet-500/40",
    glow: "rgba(139, 92, 246, 0.3)",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    hoverBg: "hover:bg-cyan-500/20",
    hoverBorder: "hover:border-cyan-500/40",
    glow: "rgba(6, 182, 212, 0.3)",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    hoverBg: "hover:bg-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/40",
    glow: "rgba(16, 185, 129, 0.3)",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    hoverBg: "hover:bg-amber-500/20",
    hoverBorder: "hover:border-amber-500/40",
    glow: "rgba(245, 158, 11, 0.3)",
  },
};

// ============================================================================
// Component
// ============================================================================

/**
 * QuickActions - Horizontal scrollable quick action buttons
 *
 * Features:
 * - Pill-shaped buttons with icons
 * - Horizontal scroll with gradient fade
 * - Custom color accents per action
 * - Subtle hover glow effects
 * - Keyboard accessible
 */
export function QuickActions({
  onAction,
  actions = DEFAULT_ACTIONS,
  disabled = false,
  topic,
  className,
}: QuickActionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  /**
   * Handle action click
   */
  const handleAction = useCallback(
    (action: QuickAction) => {
      if (disabled) return;

      // Optionally inject topic context into prompt
      let prompt = action.prompt;
      if (topic && prompt.includes("{topic}")) {
        prompt = prompt.replace("{topic}", topic);
      }

      onAction(prompt);
    },
    [disabled, onAction, topic]
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, action: QuickAction) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleAction(action);
      }
    },
    [handleAction]
  );

  return (
    <div className={cn("relative", className)}>
      {/* Label */}
      <p className="mb-2 text-xs font-medium text-white/40">Quick actions</p>

      {/* Scroll container */}
      <div className="relative">
        {/* Left fade gradient */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-[#0a0a0f] to-transparent" />

        {/* Right fade gradient */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent" />

        {/* Scrollable actions */}
        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-2 overflow-x-auto px-2 pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {actions.map((action) => {
            const color = action.color || "violet";
            const config = colorConfigs[color];
            const isHovered = hoveredAction === action.id;
            const Icon = action.icon;

            return (
              <motion.button
                key={action.id}
                onClick={() => handleAction(action)}
                onKeyDown={(e) => handleKeyDown(e, action)}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
                disabled={disabled}
                className={cn(
                  "group relative flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  config.bg,
                  config.border,
                  config.text,
                  config.hoverBg,
                  config.hoverBorder,
                  disabled && "cursor-not-allowed opacity-50"
                )}
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                style={{
                  boxShadow: isHovered && !disabled ? `0 0 20px ${config.glow}` : "none",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Contextual Actions Component
// ============================================================================

interface ContextualActionsProps {
  /** The selected text or context */
  context: string;
  /** Callback when an action is selected */
  onAction: (prompt: string) => void;
  /** Position for the popup */
  position?: { x: number; y: number };
  /** Whether to show the component */
  isVisible: boolean;
  /** Callback to close */
  onClose: () => void;
}

/**
 * ContextualActions - Popup quick actions based on selected text
 */
export function ContextualActions({
  context,
  onAction,
  position,
  isVisible,
  onClose,
}: ContextualActionsProps) {
  if (!isVisible || !position) return null;

  const contextualActions: QuickAction[] = [
    {
      id: "explain-selection",
      label: "Explain this",
      icon: Lightbulb,
      prompt: `Please explain the following in more detail: "${context}"`,
      color: "cyan",
    },
    {
      id: "sources-selection",
      label: "Find sources",
      icon: BookOpen,
      prompt: `What are the sources and references for: "${context}"`,
      color: "violet",
    },
    {
      id: "expand-selection",
      label: "Expand",
      icon: Search,
      prompt: `Please provide more information about: "${context}"`,
      color: "emerald",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="fixed z-50 flex gap-1 rounded-xl border border-white/10 bg-[#12121a]/95 p-1.5 shadow-xl backdrop-blur-md"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {contextualActions.map((action) => {
        const color = action.color || "violet";
        const config = colorConfigs[color];
        const Icon = action.icon;

        return (
          <button
            key={action.id}
            onClick={() => {
              onAction(action.prompt);
              onClose();
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
              config.bg,
              config.text,
              config.hoverBg
            )}
          >
            <Icon className="h-3 w-3" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}

// ============================================================================
// Custom Action Builder
// ============================================================================

/**
 * Helper function to create custom actions
 */
export function createQuickAction(
  id: string,
  label: string,
  prompt: string,
  icon: React.ElementType = Zap,
  color: QuickAction["color"] = "violet"
): QuickAction {
  return { id, label, icon, prompt, color };
}

export default QuickActions;
