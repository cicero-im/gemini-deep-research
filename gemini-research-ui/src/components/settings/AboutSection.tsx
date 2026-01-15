"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Icons
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const BookIcon = () => (
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
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
  </svg>
);

const SparklesIcon = () => (
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
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const KeyboardIcon = () => (
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
    <path d="M10 8h.01" />
    <path d="M12 12h.01" />
    <path d="M14 8h.01" />
    <path d="M16 12h.01" />
    <path d="M18 8h.01" />
    <path d="M6 8h.01" />
    <path d="M7 16h10" />
    <path d="M8 12h.01" />
    <rect width="20" height="16" x="2" y="4" rx="2" />
  </svg>
);

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const APP_VERSION = "1.0.0";

const SHORTCUTS = [
  { keys: ["Cmd/Ctrl", "K"], description: "Quick search" },
  { keys: ["Cmd/Ctrl", "Enter"], description: "Start research" },
  { keys: ["Cmd/Ctrl", "N"], description: "New research" },
  { keys: ["Cmd/Ctrl", ","], description: "Open settings" },
  { keys: ["Esc"], description: "Close modal/dialog" },
  { keys: ["?"], description: "Show shortcuts" },
];

const LINKS = [
  {
    label: "GitHub Repository",
    href: "https://github.com/your-username/gemini-deep-research",
    icon: <GithubIcon />,
  },
  {
    label: "Documentation",
    href: "https://ai.google.dev/gemini-api/docs",
    icon: <BookIcon />,
  },
  {
    label: "Gemini API",
    href: "https://ai.google.dev/",
    icon: <SparklesIcon />,
  },
];

interface AboutSectionProps {
  className?: string;
}

/**
 * AboutSection - Application information
 *
 * Features:
 * - App version
 * - Links to GitHub, docs
 * - Keyboard shortcuts reference
 * - Credits
 */
export function AboutSection({ className }: AboutSectionProps) {
  const [copiedVersion, setCopiedVersion] = useState(false);

  const handleCopyVersion = useCallback(() => {
    navigator.clipboard.writeText(`Gemini Deep Research v${APP_VERSION}`);
    setCopiedVersion(true);
    setTimeout(() => setCopiedVersion(false), 2000);
  }, []);

  return (
    <section id="about" className={cn("scroll-mt-24", className)}>
      <div className="rounded-2xl border border-white/10 bg-[#12121a]/80 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 p-2.5">
              <InfoIcon />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">About</h2>
              <p className="text-sm text-white/50">Application information and resources</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Version Info */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0a0a0f] p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 p-3">
                <SparklesIcon />
              </div>
              <div>
                <h3 className="font-semibold text-white">Gemini Deep Research</h3>
                <p className="text-sm text-white/50">Version {APP_VERSION}</p>
              </div>
            </div>
            <button
              onClick={handleCopyVersion}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-all hover:border-white/20 hover:text-white"
            >
              {copiedVersion ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
              <BookIcon />
              Resources
            </h3>
            <div className="grid gap-2">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-3 text-white/70 transition-all hover:border-white/20 hover:text-white hover:bg-white/5"
                >
                  <span className="text-white/50">{link.icon}</span>
                  <span className="flex-1 font-medium">{link.label}</span>
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
                    className="text-white/30"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" x2="21" y1="14" y2="3" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
              <KeyboardIcon />
              Keyboard Shortcuts
            </h3>
            <div className="rounded-xl border border-white/10 bg-[#0a0a0f] overflow-hidden">
              <div className="divide-y divide-white/5">
                {SHORTCUTS.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm text-white/60">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-xs font-medium text-white/70">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-white/30">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="rounded-xl border border-white/5 bg-white/5 p-5 text-center">
            <p className="text-sm text-white/50">
              Built with{" "}
              <span className="inline-flex items-center gap-1 text-red-400">
                <HeartIcon />
              </span>{" "}
              using Next.js, React, and the Gemini API
            </p>
            <p className="mt-2 text-xs text-white/30">
              2024-2026 Gemini Deep Research. Open source under MIT License.
            </p>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap justify-center gap-2">
            {["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Framer Motion", "Dexie.js"].map(
              (tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
