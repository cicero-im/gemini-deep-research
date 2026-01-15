"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AuroraBackgroundProps {
  children: ReactNode;
  className?: string;
  showRadialGradient?: boolean;
}

/**
 * Aurora Background - Animated northern lights gradient mesh background
 *
 * Features:
 * - Multiple overlapping animated gradient layers
 * - Blur and noise texture overlay
 * - CSS variables for customization
 * - Smooth infinite animation
 */
export function AuroraBackground({
  children,
  className,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-[#0a0a0f]",
        className
      )}
    >
      {/* Base gradient layer */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Aurora gradient layers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="pointer-events-none absolute -inset-[10px] opacity-50"
        >
          {/* Primary aurora wave - violet to cyan */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(
                  125deg,
                  transparent 0%,
                  rgba(139, 92, 246, 0.15) 15%,
                  rgba(6, 182, 212, 0.2) 30%,
                  transparent 45%,
                  rgba(139, 92, 246, 0.1) 60%,
                  rgba(6, 182, 212, 0.15) 75%,
                  transparent 100%
                )
              `,
              backgroundSize: "200% 200%",
              filter: "blur(80px)",
            }}
          />

          {/* Secondary aurora wave - offset animation */}
          <motion.div
            animate={{
              backgroundPosition: ["100% 0%", "0% 100%", "100% 0%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(
                  -45deg,
                  transparent 0%,
                  rgba(6, 182, 212, 0.2) 20%,
                  rgba(139, 92, 246, 0.15) 40%,
                  transparent 60%,
                  rgba(6, 182, 212, 0.1) 80%,
                  transparent 100%
                )
              `,
              backgroundSize: "200% 200%",
              filter: "blur(100px)",
            }}
          />

          {/* Tertiary aurora layer - slow drift */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(
                  ellipse 80% 50% at 50% 0%,
                  rgba(139, 92, 246, 0.3) 0%,
                  transparent 50%
                ),
                radial-gradient(
                  ellipse 60% 40% at 30% 20%,
                  rgba(6, 182, 212, 0.2) 0%,
                  transparent 50%
                ),
                radial-gradient(
                  ellipse 50% 30% at 70% 30%,
                  rgba(139, 92, 246, 0.15) 0%,
                  transparent 50%
                )
              `,
              filter: "blur(60px)",
            }}
          />

          {/* Pulsing glow accents */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/4 top-1/4 h-[40vh] w-[40vh]"
            style={{
              background: `
                radial-gradient(
                  circle,
                  rgba(139, 92, 246, 0.4) 0%,
                  transparent 70%
                )
              `,
              filter: "blur(80px)",
            }}
          />

          <motion.div
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute right-1/4 top-1/3 h-[35vh] w-[35vh]"
            style={{
              background: `
                radial-gradient(
                  circle,
                  rgba(6, 182, 212, 0.35) 0%,
                  transparent 70%
                )
              `,
              filter: "blur(70px)",
            }}
          />
        </motion.div>

        {/* Radial fade to edges */}
        {showRadialGradient && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(
                  ellipse 100% 100% at 50% 50%,
                  transparent 0%,
                  transparent 40%,
                  rgba(10, 10, 15, 0.8) 70%,
                  rgb(10, 10, 15) 100%
                )
              `,
            }}
          />
        )}

        {/* Noise texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
