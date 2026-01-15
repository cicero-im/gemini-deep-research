"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useResearch } from "@/hooks/useResearch";
import { useSettings } from "@/hooks/useSettings";
import { Navbar, NavbarSpacer } from "@/components/layout/Navbar";
import { ResearchInput } from "@/components/research/ResearchInput";
import { QuickStats, QuickStatsCompact } from "@/components/research/QuickStats";
import { RecentResearches } from "@/components/research/RecentResearches";
import { AnimatedGradientText, GradientTextBadge } from "@/components/ui/animated-gradient-text";
import { Meteors, Particles, StarsBackground } from "@/components/ui/meteors";
import type { ResearchMode, Research } from "@/types";

// Typewriter text component
function TypewriterText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    const timeoutId = setTimeout(() => {
      const intervalId = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(intervalId);
          setIsComplete(true);
        }
      }, 30);

      return () => clearInterval(intervalId);
    }, delay * 1000);

    return () => clearTimeout(timeoutId);
  }, [text, delay]);

  return (
    <span className={className}>
      {displayText}
      <AnimatePresence>
        {!isComplete && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-block w-0.5 h-[1em] ml-1 bg-violet-400 align-middle"
            style={{
              animation: "blink 1s infinite",
            }}
          />
        )}
      </AnimatePresence>
    </span>
  );
}

// API Key Warning Modal
function ApiKeyWarning({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12121a] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/20 p-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-400"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">API Key Required</h3>
        </div>

        <p className="mb-6 text-white/60">
          Please configure your Gemini API key in settings before starting a
          research session.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Go to Settings
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Home Page - Main research landing page
 *
 * Features:
 * - Animated title with AnimatedGradientText
 * - Subtitle with typewriter effect
 * - ResearchInput centered
 * - QuickStats and RecentResearches below in bento grid
 * - Meteors/particles in background
 */
export default function Home() {
  const router = useRouter();
  const { startResearch, error, clearError } = useResearch();
  const { isApiKeyValid, isLoading: settingsLoading } = useSettings();
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);

  // Handle research submission
  const handleSubmit = useCallback(
    async (topic: string, mode: ResearchMode, _files?: File[]) => {
      // Check for API key
      if (!isApiKeyValid) {
        setShowApiKeyWarning(true);
        return;
      }

      try {
        const research = await startResearch({
          topic,
          mode,
        });

        // Navigate to research page
        if (research.id) {
          router.push(`/research/${research.id}`);
        }
      } catch (err) {
        console.error("Failed to start research:", err);
      }
    },
    [isApiKeyValid, startResearch, router]
  );

  // Handle clicking on recent research
  const handleResearchClick = useCallback(
    (research: Research) => {
      if (research.id) {
        router.push(`/research/${research.id}`);
      }
    },
    [router]
  );

  // Close API key warning
  const closeApiKeyWarning = useCallback(() => {
    setShowApiKeyWarning(false);
  }, []);

  return (
    <>
      <Navbar />

      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <StarsBackground number={40} twinkle />
        <Meteors number={15} minDuration={3} maxDuration={10} />
        <Particles number={20} speed={15} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen">
        <NavbarSpacer />

        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center pb-16 pt-12 text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <GradientTextBadge>
                <span className="mr-1.5 whitespace-nowrap">Powered by Google Gemini</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </GradientTextBadge>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-4"
            >
              <AnimatedGradientText
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                animationDuration={4}
              >
                Deep Research
              </AnimatedGradientText>
            </motion.h1>

            {/* Subtitle with typewriter */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-12 max-w-2xl text-lg text-white/60 sm:text-xl"
            >
              <TypewriterText
                text="Explore any topic with AI-powered research. Get comprehensive, well-sourced reports in minutes."
                delay={0.8}
              />
            </motion.p>

            {/* Research Input */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="w-full"
            >
              <ResearchInput
                onSubmit={handleSubmit}
                disabled={settingsLoading}
              />
            </motion.div>

            {/* Quick Stats Compact */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-8"
            >
              <QuickStatsCompact />
            </motion.div>
          </motion.section>

          {/* Bento Grid Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="space-y-8 pb-20"
          >
            {/* Quick Stats Grid */}
            <QuickStats />

            {/* Recent Researches */}
            <RecentResearches
              count={6}
              onClick={handleResearchClick}
            />
          </motion.section>
        </div>
      </main>

      {/* API Key Warning Modal */}
      <AnimatePresence>
        {showApiKeyWarning && <ApiKeyWarning onClose={closeApiKeyWarning} />}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 backdrop-blur-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span className="text-sm">{error}</span>
              <button
                onClick={clearError}
                className="ml-2 rounded-lg p-1 transition-colors hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom styles for cursor blink animation */}
      <style jsx global>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
