"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";
import { ShinyButton } from "@/components/ui/shiny-button";

// Icons
const EyeIcon = () => (
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
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
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
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </svg>
);

const CheckIcon = () => (
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
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const XIcon = () => (
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
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const LoaderIcon = () => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
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

const KeyIcon = () => (
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
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

type ConnectionStatus = "idle" | "testing" | "success" | "error";

interface ApiSettingsProps {
  onSave?: () => void;
}

const AVAILABLE_MODELS = [
  { id: "deep-research-pro-preview-12-2025", label: "Deep Research Pro (Preview)", description: "Latest deep research model" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", description: "Fast, multimodal model" },
  { id: "gemini-2.0-pro", label: "Gemini 2.0 Pro", description: "Advanced reasoning" },
];

/**
 * ApiSettings - API configuration section
 *
 * Features:
 * - API key input with mask/reveal toggle
 * - Test connection button with loading/success/error states
 * - Model selector dropdown
 * - Key validation feedback
 */
export function ApiSettings({ onSave }: ApiSettingsProps) {
  const { apiKey, setApiKey, isApiKeyValid } = useSettings();
  const [localApiKey, setLocalApiKey] = useState(apiKey ?? "");
  const [showKey, setShowKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasChanges = localApiKey !== (apiKey ?? "");

  const handleTestConnection = useCallback(async () => {
    if (!localApiKey.trim()) {
      setErrorMessage("Please enter an API key first");
      return;
    }

    setConnectionStatus("testing");
    setErrorMessage(null);

    try {
      // Test the API key by making a simple request
      const response = await fetch("/api/stores", {
        method: "GET",
        headers: {
          "X-Gemini-API-Key": localApiKey,
        },
      });

      if (response.ok) {
        setConnectionStatus("success");
        setTimeout(() => setConnectionStatus("idle"), 3000);
      } else {
        const data = await response.json();
        setConnectionStatus("error");
        setErrorMessage(data.message || "Failed to connect to API");
      }
    } catch (error) {
      setConnectionStatus("error");
      setErrorMessage("Network error. Please check your connection.");
    }
  }, [localApiKey]);

  const handleSaveKey = useCallback(async () => {
    if (!localApiKey.trim()) {
      setErrorMessage("API key cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      await setApiKey(localApiKey.trim());
      onSave?.();
    } catch (error) {
      setErrorMessage("Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  }, [localApiKey, setApiKey, onSave]);

  const handleClearKey = useCallback(async () => {
    setLocalApiKey("");
    await setApiKey(null);
    setConnectionStatus("idle");
    setErrorMessage(null);
  }, [setApiKey]);

  const toggleShowKey = useCallback(() => {
    setShowKey((prev) => !prev);
  }, []);

  return (
    <section id="api" className="scroll-mt-24">
      <div className="rounded-2xl border border-white/10 bg-[#12121a]/80 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 p-2.5">
              <KeyIcon />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">API Configuration</h2>
              <p className="text-sm text-white/50">Configure your Gemini API key and model preferences</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Key Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/80">
              API Key
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showKey ? "text" : "password"}
                value={localApiKey}
                onChange={(e) => {
                  setLocalApiKey(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Enter your Gemini API key"
                className={cn(
                  "w-full rounded-xl border bg-[#0a0a0f] px-4 py-3 pr-24 text-white placeholder-white/30",
                  "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50",
                  "transition-all duration-200",
                  errorMessage
                    ? "border-red-500/50"
                    : connectionStatus === "success"
                    ? "border-green-500/50"
                    : "border-white/10"
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={toggleShowKey}
                  className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white/60"
                  title={showKey ? "Hide" : "Show"}
                >
                  {showKey ? <EyeOffIcon /> : <EyeIcon />}
                </button>
                {localApiKey && (
                  <button
                    onClick={handleClearKey}
                    className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-red-400"
                    title="Clear"
                  >
                    <XIcon />
                  </button>
                )}
              </div>
            </div>

            {/* Validation/Error Message */}
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-red-400 flex items-center gap-2"
                >
                  <XIcon />
                  {errorMessage}
                </motion.p>
              )}
              {connectionStatus === "success" && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-green-400 flex items-center gap-2"
                >
                  <CheckIcon />
                  API key is valid and connected
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Model Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/80">
              Model
            </label>
            <div className="grid gap-2">
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={cn(
                    "relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all",
                    selectedModel === model.id
                      ? "border-violet-500/50 bg-violet-500/5"
                      : "border-white/10 bg-[#0a0a0f] hover:border-white/20"
                  )}
                >
                  {selectedModel === model.id && (
                    <motion.div
                      layoutId="model-check"
                      className="absolute right-4 top-4"
                    >
                      <div className="rounded-full bg-violet-500 p-1">
                        <CheckIcon />
                      </div>
                    </motion.div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-white">{model.label}</p>
                    <p className="text-sm text-white/50">{model.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={!localApiKey.trim() || connectionStatus === "testing"}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                connectionStatus === "testing"
                  ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                  : connectionStatus === "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : connectionStatus === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-white/10 text-white/60 hover:bg-white/5 hover:text-white",
                (!localApiKey.trim() || connectionStatus === "testing") &&
                  "cursor-not-allowed opacity-50"
              )}
            >
              {connectionStatus === "testing" ? (
                <>
                  <LoaderIcon />
                  Testing...
                </>
              ) : connectionStatus === "success" ? (
                <>
                  <CheckIcon />
                  Connected
                </>
              ) : connectionStatus === "error" ? (
                <>
                  <XIcon />
                  Failed
                </>
              ) : (
                "Test Connection"
              )}
            </button>

            <ShinyButton
              onClick={handleSaveKey}
              disabled={!hasChanges || isSaving}
              size="sm"
              className="min-w-[100px]"
            >
              {isSaving ? (
                <>
                  <LoaderIcon />
                  Saving...
                </>
              ) : (
                "Save Key"
              )}
            </ShinyButton>
          </div>

          {/* Usage Stats */}
          {isApiKeyValid && (
            <div className="mt-6 rounded-xl border border-white/5 bg-[#0a0a0f]/50 p-4">
              <h3 className="text-sm font-medium text-white/60 mb-3">API Usage</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-white">--</p>
                  <p className="text-xs text-white/40">Requests Today</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">--</p>
                  <p className="text-xs text-white/40">Tokens Used</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">--</p>
                  <p className="text-xs text-white/40">Researches</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-white/30">
                Usage statistics are tracked locally. Full metrics available in Google Cloud Console.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
