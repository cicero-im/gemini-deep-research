"use client";

import { cn } from "@/lib/utils";
import { motion, useAnimate, useInView } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

interface TextGenerateEffectProps {
  text: string;
  className?: string;
  wordClassName?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  cursorClassName?: string;
  onComplete?: () => void;
}

/**
 * TextGenerateEffect - Typewriter text reveal
 *
 * Features:
 * - Character-by-character animation
 * - Staggered delay per character
 * - Optional blinking cursor
 * - Props for speed control
 * - Auto-triggers when in view
 */
export function TextGenerateEffect({
  text,
  className,
  wordClassName,
  speed = 0.03,
  delay = 0,
  cursor = true,
  cursorClassName,
  onComplete,
}: TextGenerateEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { once: true, margin: "-100px" });

  const animateText = useCallback(async () => {
    if (!isInView) return;

    // Initial delay
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    }

    // Animate character by character
    for (let i = 0; i <= text.length; i++) {
      setDisplayedText(text.slice(0, i));
      await new Promise((resolve) => setTimeout(resolve, speed * 1000));
    }

    setIsComplete(true);
    onComplete?.();
  }, [text, speed, delay, isInView, onComplete]);

  useEffect(() => {
    animateText();
  }, [animateText]);

  return (
    <span ref={scope} className={cn("inline-block", className)}>
      <span className={wordClassName}>{displayedText}</span>
      {cursor && (
        <motion.span
          className={cn(
            "ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.1em] bg-current",
            cursorClassName
          )}
          animate={{
            opacity: isComplete ? [1, 0] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: isComplete ? Infinity : 0,
            repeatType: "reverse",
          }}
        />
      )}
    </span>
  );
}

interface WordsGenerateEffectProps {
  text: string;
  className?: string;
  wordClassName?: string;
  duration?: number;
  staggerDelay?: number;
  blur?: boolean;
}

/**
 * WordsGenerateEffect - Word-by-word reveal animation
 */
export function WordsGenerateEffect({
  text,
  className,
  wordClassName,
  duration = 0.5,
  staggerDelay = 0.1,
  blur = true,
}: WordsGenerateEffectProps) {
  const words = text.split(" ");
  const [scope] = useAnimate();
  const isInView = useInView(scope, { once: true, margin: "-100px" });

  return (
    <span ref={scope} className={cn("inline-block", className)}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className={cn("mr-[0.25em] inline-block", wordClassName)}
          initial={{
            opacity: 0,
            y: 10,
            filter: blur ? "blur(8px)" : "none",
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }
              : {}
          }
          transition={{
            duration,
            delay: index * staggerDelay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

interface TypewriterProps {
  texts: string[];
  className?: string;
  speed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  cursor?: boolean;
}

/**
 * Typewriter - Multi-text cycling typewriter effect
 */
export function Typewriter({
  texts,
  className,
  speed = 0.05,
  deleteSpeed = 0.03,
  pauseDuration = 2,
  loop = true,
  cursor = true,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[currentIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (displayedText.length < currentText.length) {
            setDisplayedText(currentText.slice(0, displayedText.length + 1));
          } else {
            // Pause before deleting
            setTimeout(() => setIsDeleting(true), pauseDuration * 1000);
          }
        } else {
          // Deleting
          if (displayedText.length > 0) {
            setDisplayedText(displayedText.slice(0, -1));
          } else {
            setIsDeleting(false);
            if (loop || currentIndex < texts.length - 1) {
              setCurrentIndex((prev) => (prev + 1) % texts.length);
            }
          }
        }
      },
      isDeleting ? deleteSpeed * 1000 : speed * 1000
    );

    return () => clearTimeout(timeout);
  }, [
    displayedText,
    currentIndex,
    isDeleting,
    texts,
    speed,
    deleteSpeed,
    pauseDuration,
    loop,
  ]);

  return (
    <span className={cn("inline-block", className)}>
      {displayedText}
      {cursor && (
        <motion.span
          className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.1em] bg-current"
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      )}
    </span>
  );
}

interface LettersPullUpProps {
  text: string;
  className?: string;
  letterClassName?: string;
  delay?: number;
}

/**
 * LettersPullUp - Letters pull up from below with stagger
 */
export function LettersPullUp({
  text,
  className,
  letterClassName,
  delay = 0.03,
}: LettersPullUpProps) {
  const letters = text.split("");
  const [scope] = useAnimate();
  const isInView = useInView(scope, { once: true, margin: "-100px" });

  return (
    <span ref={scope} className={cn("inline-block", className)}>
      {letters.map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          className={cn("inline-block", letterClassName)}
          initial={{ y: "100%", opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{
            duration: 0.4,
            delay: index * delay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
}
