"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface MeteorConfig {
  id: number;
  left: string;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

interface MeteorsProps {
  number?: number;
  className?: string;
  minDuration?: number;
  maxDuration?: number;
  color?: string;
}

/**
 * Meteors - Falling meteors/particles background
 *
 * Features:
 * - Random positioned falling lines
 * - Various speeds and delays
 * - Subtle and not distracting
 * - Performant with CSS animations
 */
export function Meteors({
  number = 20,
  className,
  minDuration = 2,
  maxDuration = 8,
  color = "rgba(139, 92, 246, 0.6)",
}: MeteorsProps) {
  const [meteors, setMeteors] = useState<MeteorConfig[]>([]);

  useEffect(() => {
    setMeteors(
      Array.from({ length: number }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: Math.random() * (maxDuration - minDuration) + minDuration,
        size: Math.random() * 80 + 40,
        opacity: Math.random() * 0.4 + 0.2,
      }))
    );
  }, [number, minDuration, maxDuration]);

  if (meteors.length === 0) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {meteors.map((meteor) => (
        <motion.span
          key={meteor.id}
          className="absolute block rotate-[215deg]"
          style={{
            left: meteor.left,
            top: "-20%",
            width: "1px",
            height: `${meteor.size}px`,
            background: `linear-gradient(to bottom, ${color}, transparent)`,
            opacity: meteor.opacity,
          }}
          initial={{ y: "-100vh", opacity: 0 }}
          animate={{
            y: "200vh",
            opacity: [0, meteor.opacity, meteor.opacity, 0],
          }}
          transition={{
            duration: meteor.duration,
            delay: meteor.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Meteor head glow */}
          <span
            className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full"
            style={{
              width: "4px",
              height: "4px",
              background: color,
              boxShadow: `0 0 8px 2px ${color}`,
            }}
          />
        </motion.span>
      ))}
    </div>
  );
}

interface StarConfig {
  id: number;
  left: string;
  top: string;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
}

interface StarsBackgroundProps {
  number?: number;
  className?: string;
  twinkle?: boolean;
}

/**
 * StarsBackground - Subtle twinkling stars
 */
export function StarsBackground({
  number = 50,
  className,
  twinkle = true,
}: StarsBackgroundProps) {
  const [stars, setStars] = useState<StarConfig[]>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: number }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 2,
      }))
    );
  }, [number]);

  if (stars.length === 0) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
          }}
          initial={{ opacity: star.opacity }}
          animate={
            twinkle
              ? {
                  opacity: [star.opacity, star.opacity * 0.3, star.opacity],
                  scale: [1, 0.8, 1],
                }
              : {}
          }
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

interface ParticleConfig {
  id: number;
  left: string;
  startY: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
  drift: number;
}

interface ParticlesProps {
  number?: number;
  className?: string;
  color?: string;
  size?: number;
  speed?: number;
}

/**
 * Particles - Floating particles that drift upward
 */
export function Particles({
  number = 30,
  className,
  color = "rgba(139, 92, 246, 0.5)",
  size = 4,
  speed = 10,
}: ParticlesProps) {
  const [particles, setParticles] = useState<ParticleConfig[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: number }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        startY: Math.random() * 100,
        size: Math.random() * size + 1,
        opacity: Math.random() * 0.4 + 0.1,
        delay: Math.random() * speed,
        duration: Math.random() * (speed * 0.5) + speed,
        drift: (Math.random() - 0.5) * 100,
      }))
    );
  }, [number, size, speed]);

  if (particles.length === 0) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            bottom: "-10%",
            width: particle.size,
            height: particle.size,
            background: color,
            opacity: particle.opacity,
            filter: "blur(1px)",
          }}
          animate={{
            y: [0, "-120vh"],
            x: [0, particle.drift],
            opacity: [0, particle.opacity, particle.opacity, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

interface GridBackgroundProps {
  className?: string;
  gridSize?: number;
  lineColor?: string;
  dotColor?: string;
  showDots?: boolean;
  fade?: boolean;
}

/**
 * GridBackground - Subtle grid pattern background
 */
export function GridBackground({
  className,
  gridSize = 40,
  lineColor = "rgba(255, 255, 255, 0.03)",
  dotColor = "rgba(139, 92, 246, 0.3)",
  showDots = true,
  fade = true,
}: GridBackgroundProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${lineColor} 1px, transparent 1px),
            linear-gradient(90deg, ${lineColor} 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />

      {/* Grid intersection dots */}
      {showDots && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      )}

      {/* Radial fade */}
      {fade && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 80% 80% at 50% 50%,
                transparent 0%,
                rgba(10, 10, 15, 0.8) 80%,
                rgb(10, 10, 15) 100%
              )
            `,
          }}
        />
      )}
    </div>
  );
}
