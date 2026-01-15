"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

interface SpotlightProps {
  className?: string;
  size?: number;
  color?: string;
  springConfig?: {
    stiffness?: number;
    damping?: number;
  };
}

/**
 * Spotlight - Mouse-following spotlight effect
 *
 * Features:
 * - Radial gradient that follows cursor
 * - Smooth interpolation using framer-motion springs
 * - Customizable size and color
 * - Fades on mouse leave
 */
export function Spotlight({
  className,
  size = 400,
  color = "rgba(139, 92, 246, 0.15)",
  springConfig = { stiffness: 200, damping: 30 },
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Raw mouse position values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const opacity = useMotionValue(0);

  // Smooth spring-animated values
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  const springOpacity = useSpring(opacity, { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseEnter = useCallback(() => {
    opacity.set(1);
  }, [opacity]);

  const handleMouseLeave = useCallback(() => {
    opacity.set(0);
  }, [opacity]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-auto absolute inset-0 overflow-hidden", className)}
    >
      <motion.div
        className="pointer-events-none absolute"
        style={{
          x: springX,
          y: springY,
          opacity: springOpacity,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
    </div>
  );
}

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightSize?: number;
  spotlightColor?: string;
  onClick?: () => void;
}

/**
 * SpotlightCard - Card component with integrated spotlight effect
 */
export function SpotlightCard({
  children,
  className,
  spotlightSize = 300,
  spotlightColor = "rgba(139, 92, 246, 0.12)",
  onClick,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const opacity = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });
  const springOpacity = useSpring(opacity, { stiffness: 400, damping: 40 });

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      mouseX.set(event.clientX - rect.left);
      mouseY.set(event.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12121a]",
        onClick && "cursor-pointer",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => opacity.set(1)}
      onMouseLeave={() => opacity.set(0)}
      onClick={onClick}
    >
      {/* Spotlight effect */}
      <motion.div
        className="pointer-events-none absolute"
        style={{
          x: springX,
          y: springY,
          opacity: springOpacity,
          width: spotlightSize,
          height: spotlightSize,
          marginLeft: -spotlightSize / 2,
          marginTop: -spotlightSize / 2,
          background: `radial-gradient(circle at center, ${spotlightColor} 0%, transparent 70%)`,
        }}
      />

      {/* Border glow on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          opacity: springOpacity,
          boxShadow: `inset 0 0 0 1px rgba(139, 92, 246, 0.2)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
