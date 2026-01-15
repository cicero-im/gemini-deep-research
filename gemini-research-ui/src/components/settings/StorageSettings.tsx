"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { db, exportAllData, importData, clearAllData } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

// Icons
const DatabaseIcon = () => (
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
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);

const DownloadIcon = () => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const UploadIcon = () => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const TrashIcon = () => (
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
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const AlertIcon = () => (
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
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
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

interface StorageSettingsProps {
  onNotify?: (message: string, type: "success" | "error") => void;
}

/**
 * StorageSettings - Data management section
 *
 * Features:
 * - Storage usage visualization
 * - IndexedDB statistics
 * - Clear cache button with confirmation
 * - Export all data as JSON
 * - Import data from file
 * - Danger zone styling for destructive actions
 */
export function StorageSettings({ onNotify }: StorageSettingsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get stats from IndexedDB
  const stats = useLiveQuery(async () => {
    const researches = await db.researches.count();
    const messages = await db.messages.count();
    const settings = await db.settings.count();
    return { researches, messages, settings };
  }, []);

  // Estimate storage size
  const estimateStorageSize = useCallback(async () => {
    if (!navigator.storage?.estimate) return null;
    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage ?? 0,
        quota: estimate.quota ?? 0,
      };
    } catch {
      return null;
    }
  }, []);

  const [storageEstimate, setStorageEstimate] = useState<{
    used: number;
    quota: number;
  } | null>(null);

  // Fetch storage estimate on mount
  useEffect(() => {
    estimateStorageSize().then(setStorageEstimate);
  }, [estimateStorageSize]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gemini-research-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onNotify?.("Data exported successfully", "success");
    } catch (error) {
      console.error("Export failed:", error);
      onNotify?.("Failed to export data", "error");
    } finally {
      setIsExporting(false);
    }
  }, [onNotify]);

  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data, false); // Don't clear existing data
      onNotify?.("Data imported successfully", "success");
    } catch (error) {
      console.error("Import failed:", error);
      onNotify?.("Failed to import data. Make sure the file is valid.", "error");
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [onNotify]);

  const handleClearData = useCallback(async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      setShowClearConfirm(false);
      onNotify?.("All data cleared", "success");
    } catch (error) {
      console.error("Clear data failed:", error);
      onNotify?.("Failed to clear data", "error");
    } finally {
      setIsClearing(false);
    }
  }, [onNotify]);

  const usagePercentage = storageEstimate
    ? Math.round((storageEstimate.used / storageEstimate.quota) * 100)
    : 0;

  return (
    <section id="storage" className="scroll-mt-24">
      <div className="rounded-2xl border border-white/10 bg-[#12121a]/80 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 p-2.5">
              <DatabaseIcon />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Storage</h2>
              <p className="text-sm text-white/50">Manage local data and backups</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Storage Usage Visualization */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white/80">
              Storage Usage
            </label>
            <div className="rounded-xl border border-white/10 bg-[#0a0a0f] p-5">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-white/60">
                    {storageEstimate ? formatBytes(storageEstimate.used) : "Calculating..."}
                  </span>
                  <span className="text-sm text-white/40">
                    {storageEstimate ? formatBytes(storageEstimate.quota) : ""}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/40">
                  {usagePercentage}% of available storage used
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {stats?.researches ?? "-"}
                  </p>
                  <p className="text-xs text-white/40">Researches</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {stats?.messages ?? "-"}
                  </p>
                  <p className="text-xs text-white/40">Messages</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {stats?.settings ?? "-"}
                  </p>
                  <p className="text-xs text-white/40">Settings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Export/Import Actions */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white/80">
              Data Management
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-3 text-sm font-medium text-white/70 transition-all",
                  "hover:border-white/20 hover:text-white hover:bg-white/5",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isExporting ? (
                  <>
                    <LoaderIcon />
                    Exporting...
                  </>
                ) : (
                  <>
                    <DownloadIcon />
                    Export All Data
                  </>
                )}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-3 text-sm font-medium text-white/70 transition-all",
                  "hover:border-white/20 hover:text-white hover:bg-white/5",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isImporting ? (
                  <>
                    <LoaderIcon />
                    Importing...
                  </>
                ) : (
                  <>
                    <UploadIcon />
                    Import Data
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
            <p className="text-xs text-white/40">
              Export creates a JSON backup of all your researches, messages, and settings.
              Import will merge data with existing records.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-red-400/80">
              Danger Zone
            </label>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
                  <AlertIcon />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">Clear All Data</h3>
                  <p className="mt-1 text-sm text-white/50">
                    Permanently delete all researches, messages, and settings. This action cannot be undone.
                  </p>
                  <AnimatePresence mode="wait">
                    {showClearConfirm ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 flex items-center gap-3"
                      >
                        <p className="text-sm text-red-400">Are you sure?</p>
                        <button
                          onClick={handleClearData}
                          disabled={isClearing}
                          className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          {isClearing ? (
                            <>
                              <LoaderIcon />
                              Clearing...
                            </>
                          ) : (
                            <>
                              <TrashIcon />
                              Yes, Clear All
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
                        >
                          Cancel
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="trigger"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={() => setShowClearConfirm(true)}
                        className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
                      >
                        <TrashIcon />
                        Clear All Data
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
