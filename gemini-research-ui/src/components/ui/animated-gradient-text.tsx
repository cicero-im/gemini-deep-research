"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
  gradientColors?: string[];
  animationDuration?: number;
  shimmer?: boolean;
}

/**
 * AnimatedGradientText - Text with animated gradient
 *
 * Features:
 * - Background gradient that animates horizontally
 * - Background-clip: text effect for gradient text
 * - Optional shimmer/shine animation overlay
 * - Customizable colors and animation speed
 */
export function AnimatedGradientText({
  children,
  className,
  gradientColors = ["#8b5cf6", "#06b6d4", "#8b5cf6"],
  animationDuration = 3,
  shimmer = true,
}: AnimatedGradientTextProps) {
  const gradientString = gradientColors.join(", ");

  return (
    <motion.span
      className={cn(
        "relative inline-block bg-clip-text text-transparent",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(90deg, ${gradientString})`,
        backgroundSize: "200% 100%",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: animationDuration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}

      {/* Shimmer overlay */}
      {shimmer && (
        <motion.span
          className="pointer-events-none absolute inset-0 bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(
              110deg,
              transparent 25%,
              rgba(255, 255, 255, 0.3) 50%,
              transparent 75%
            )`,
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["-200% 0%", "200% 0%"],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1,
          }}
          aria-hidden
        >
          {children}
        </motion.span>
      )}
    </motion.span>
  );
}

interface GradientTextBadgeProps {
  children: ReactNode;
  className?: string;
}

/**
 * GradientTextBadge - Pill-shaped badge with gradient border and text
 */
export function GradientTextBadge({
  children,
  className,
}: GradientTextBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-1.5 whitespace-nowrap",
        className
      )}
    >
      {/* Gradient border */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(90deg, #8b5cf6, #06b6d4, #8b5cf6)`,
          backgroundSize: "200% 100%",
          padding: "1px",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="h-full w-full rounded-full bg-[#0a0a0f]" />
      </motion.div>

      {/* Content */}
      <span className="relative z-10 inline-flex items-center gap-1.5 text-sm font-medium text-white/80">
        {children}
      </span>

      {/* Shine effect on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 -translate-x-full rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        whileHover={{
          translateX: "100%",
          transition: { duration: 0.5, ease: "easeInOut" },
        }}
      />
    </motion.div>
  );
}

interface GlowingTextProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

/**
 * GlowingText - Text with animated glow effect
 */
export function GlowingText({
  children,
  className,
  glowColor = "rgba(139, 92, 246, 0.5)",
}: GlowingTextProps) {
  return (
    <motion.span
      className={cn("relative inline-block", className)}
      animate={{
        textShadow: [
          `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
          `0 0 40px ${glowColor}, 0 0 80px ${glowColor}`,
          `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.span>
  );
}
