"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useInView,
  useSpring,
  useTransform,
  type SpringOptions,
} from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

interface NumberTickerProps {
  value: number;
  className?: string;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  formatOptions?: Intl.NumberFormatOptions;
  springConfig?: SpringOptions;
}

/**
 * NumberTicker - Animated number counter
 *
 * Features:
 * - Smooth counting animation
 * - Framer Motion spring physics
 * - Automatic number formatting with commas
 * - Triggers on scroll into view
 * - Customizable spring config for different feels
 */
export function NumberTicker({
  value,
  className,
  direction = "up",
  delay = 0,
  duration,
  formatOptions = {},
  springConfig,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  // Default spring config based on duration or use provided config
  const defaultSpring: SpringOptions = duration
    ? { duration: duration, bounce: 0 }
    : { stiffness: 75, damping: 30, mass: 1 };

  const spring = useSpring(direction === "up" ? 0 : value, {
    ...defaultSpring,
    ...springConfig,
  });

  const display = useTransform(spring, (current) => {
    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...formatOptions,
    });
    return formatter.format(Math.round(current));
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      const timeout = setTimeout(() => {
        spring.set(direction === "up" ? value : 0);
        setHasAnimated(true);
      }, delay * 1000);

      return () => clearTimeout(timeout);
    }
  }, [isInView, hasAnimated, spring, value, direction, delay]);

  return (
    <motion.span
      ref={ref}
      className={cn("tabular-nums", className)}
    >
      {display}
    </motion.span>
  );
}

interface NumberTickerWithLabelProps extends NumberTickerProps {
  label: string;
  labelClassName?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * NumberTickerWithLabel - Number ticker with accompanying label
 */
export function NumberTickerWithLabel({
  label,
  labelClassName,
  prefix,
  suffix,
  className,
  ...props
}: NumberTickerWithLabelProps) {
  return (
    <div className="flex flex-col items-center">
      <span className={cn("text-4xl font-bold", className)}>
        {prefix}
        <NumberTicker {...props} />
        {suffix}
      </span>
      <span className={cn("mt-2 text-sm text-white/60", labelClassName)}>
        {label}
      </span>
    </div>
  );
}

interface AnimatedCounterProps {
  from: number;
  to: number;
  className?: string;
  duration?: number;
  formatter?: (value: number) => string;
}

/**
 * AnimatedCounter - Simple counter with custom formatting
 */
export function AnimatedCounter({
  from,
  to,
  className,
  duration = 2,
  formatter = (v) => v.toLocaleString(),
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    const range = to - from;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + range * eased;

      setDisplayValue(current);

      if (now < endTime) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(to);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {formatter(Math.round(displayValue))}
    </span>
  );
}

interface PercentageRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  showValue?: boolean;
}

/**
 * PercentageRing - Animated circular progress with number
 */
export function PercentageRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  gradientFrom = "#8b5cf6",
  gradientTo = "#06b6d4",
  showValue = true,
}: PercentageRingProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const gradientId = useId();

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        ref={ref}
        width={size}
        height={size}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: offset } : {}}
          transition={{
            duration: 1.5,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.2,
          }}
        />
      </svg>

      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <NumberTicker
            value={value}
            className="text-2xl font-bold"
            delay={0.2}
          />
          <span className="text-lg text-white/60">%</span>
        </div>
      )}
    </div>
  );
}
