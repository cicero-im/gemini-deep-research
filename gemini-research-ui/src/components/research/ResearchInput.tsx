"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { ShinyButton } from "@/components/ui/shiny-button";
import type { ResearchMode } from "@/types";

// Icons as inline SVGs for better control
const GlobeIcon = () => (
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
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const FileIcon = () => (
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
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const PaperclipIcon = () => (
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
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const SparklesIcon = () => (
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
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const LoaderIcon = () => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </motion.svg>
);

interface ResearchInputProps {
  onSubmit: (topic: string, mode: ResearchMode, files?: File[]) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * ResearchInput - Main research input component
 *
 * Features:
 * - Large textarea with glow effect on focus
 * - Mode selector: "Web Only" / "Web + Files"
 * - File attachment button (when Web+Files mode)
 * - ShinyButton submit with loading state
 */
export function ResearchInput({
  onSubmit,
  disabled = false,
  className,
}: ResearchInputProps) {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<ResearchMode>("web");
  const [files, setFiles] = useState<File[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStreaming = useAppStore((state) => state.isStreaming);
  const isLoading = isStreaming || disabled;

  const handleSubmit = useCallback(() => {
    if (!topic.trim() || isLoading) return;
    onSubmit(topic.trim(), mode, files.length > 0 ? files : undefined);
  }, [topic, mode, files, isLoading, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      setFiles((prev) => [...prev, ...selectedFiles]);
    },
    []
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn("w-full max-w-6xl", className)}>
      {/* Mode Selector */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <ModeButton
          active={mode === "web"}
          onClick={() => setMode("web")}
          icon={<GlobeIcon />}
          label="Web Only"
        />
        <ModeButton
          active={mode === "web+files"}
          onClick={() => setMode("web+files")}
          icon={<FileIcon />}
          label="Web + Files"
        />
      </div>

      {/* Main Input Container */}
      <motion.div
        className={cn(
          "relative overflow-hidden rounded-2xl border transition-all duration-300",
          isFocused
            ? "border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
            : "border-white/10"
        )}
        initial={false}
        animate={{
          boxShadow: isFocused
            ? "0 0 40px rgba(139, 92, 246, 0.25), 0 0 80px rgba(6, 182, 212, 0.15)"
            : "0 0 0 rgba(139, 92, 246, 0)",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Gradient border glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))`,
            opacity: isFocused ? 0.1 : 0,
          }}
          animate={{ opacity: isFocused ? 0.15 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Background */}
        <div className="absolute inset-0 bg-[#12121a]/80 backdrop-blur-xl" />

        {/* Content */}
        <div className="relative">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="What would you like to research today?"
            disabled={isLoading}
            rows={4}
            className={cn(
              "w-full resize-none bg-transparent px-6 py-5 text-lg text-white placeholder-white/40",
              "focus:outline-none focus:ring-0",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />

          {/* Bottom Bar */}
          <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
            {/* Left side - File attachment (when mode is web+files) */}
            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {mode === "web+files" && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={triggerFileInput}
                    disabled={isLoading}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60",
                      "transition-colors hover:bg-white/5 hover:text-white/80",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    <PaperclipIcon />
                    <span>Attach files</span>
                  </motion.button>
                )}
              </AnimatePresence>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md,.json,.csv"
              />
            </div>

            {/* Right side - Submit button */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30">
                {navigator.platform.includes("Mac") ? "Cmd" : "Ctrl"} + Enter
              </span>
              <ShinyButton
                onClick={handleSubmit}
                disabled={!topic.trim() || isLoading}
                size="md"
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon />
                    <span>Researching...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon />
                    <span>Research</span>
                  </>
                )}
              </ShinyButton>
            </div>
          </div>
        </div>
      </motion.div>

      {/* File Pills */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex flex-wrap gap-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/70"
              >
                <FileIcon />
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="rounded-full p-0.5 transition-colors hover:bg-white/10"
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mode button component
interface ModeButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function ModeButton({ active, onClick, icon, label }: ModeButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "text-white"
          : "text-white/50 hover:bg-white/5 hover:text-white/70"
      )}
      whileTap={{ scale: 0.98 }}
    >
      {/* Active background */}
      {active && (
        <motion.div
          layoutId="mode-bg"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}
