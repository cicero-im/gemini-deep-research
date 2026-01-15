"use client";

import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface ShinyButtonProps {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

const shimmerVariants: Variants = {
  initial: { x: "-100%", opacity: 0 },
  hover: {
    x: "100%",
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

/**
 * ShinyButton - Button with moving shine effect
 *
 * Features:
 * - Diagonal shimmer animation on hover
 * - Gradient border
 * - Scale on press
 * - Framer Motion animations
 * - Multiple variants and sizes
 */
export function ShinyButton({
  children,
  className,
  shimmerColor = "rgba(255, 255, 255, 0.2)",
  gradientFrom = "#8b5cf6",
  gradientTo = "#06b6d4",
  variant = "default",
  size = "md",
  disabled,
  onClick,
  type = "button",
}: ShinyButtonProps) {
  if (variant === "outline") {
    return (
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileHover={disabled ? undefined : "hover"}
        whileTap={disabled ? undefined : "tap"}
        className={cn(
          "group relative overflow-hidden rounded-xl font-medium transition-colors",
          sizeClasses[size],
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        disabled={disabled}
        onClick={onClick}
        type={type}
      >
        {/* Animated gradient border */}
        <motion.span
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo}, ${gradientFrom})`,
            backgroundSize: "200% 200%",
            padding: "1.5px",
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
          <span className="block h-full w-full rounded-xl bg-[#0a0a0f]" />
        </motion.span>

        {/* Shimmer effect */}
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(110deg, transparent 30%, ${shimmerColor} 50%, transparent 70%)`,
          }}
          variants={shimmerVariants}
        />

        {/* Content with gradient text */}
        <span
          className="relative z-10 bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          }}
        >
          {children}
        </span>
      </motion.button>
    );
  }

  if (variant === "ghost") {
    return (
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileHover={disabled ? undefined : "hover"}
        whileTap={disabled ? undefined : "tap"}
        className={cn(
          "group relative overflow-hidden rounded-xl font-medium text-white/80 transition-colors hover:text-white",
          sizeClasses[size],
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        disabled={disabled}
        onClick={onClick}
        type={type}
      >
        {/* Hover background */}
        <motion.span className="absolute inset-0 rounded-xl bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Shimmer effect */}
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(110deg, transparent 30%, ${shimmerColor} 50%, transparent 70%)`,
          }}
          variants={shimmerVariants}
        />

        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }

  // Default variant - solid gradient button
  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "tap"}
      className={cn(
        "group relative overflow-hidden rounded-xl font-medium text-white shadow-lg transition-shadow hover:shadow-xl",
        sizeClasses[size],
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      style={{
        boxShadow: `0 0 20px ${gradientFrom}33, 0 4px 20px ${gradientTo}22`,
      }}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {/* Gradient background */}
      <motion.span
        className="absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          backgroundSize: "200% 200%",
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

      {/* Shimmer effect */}
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(110deg, transparent 20%, ${shimmerColor} 50%, transparent 80%)`,
        }}
        variants={shimmerVariants}
      />

      {/* Inner glow */}
      <span
        className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 20px rgba(255, 255, 255, 0.2)`,
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

/**
 * MagneticButton - Button that attracts to cursor on hover
 */
export function MagneticButton({
  children,
  className,
  disabled,
  onClick,
  type = "button",
}: MagneticButtonProps) {
  return (
    <motion.button
      className={cn(
        "relative rounded-xl bg-white/10 px-6 py-3 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/15",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      whileHover={{
        scale: 1.05,
      }}
      whileTap={{
        scale: 0.95,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </motion.button>
  );
}
