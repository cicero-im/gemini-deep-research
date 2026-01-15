"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";
import { ShinyButton } from "@/components/ui/shiny-button";
import type { FileSearchStore } from "@/lib/gemini";

// Icons
const FolderIcon = () => (
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
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
);

const PlusIcon = () => (
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
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
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
  </svg>
);

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);

const UploadCloudIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const LoaderIcon = () => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
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

interface FileStoresSettingsProps {
  onNotify?: (message: string, type: "success" | "error") => void;
}

/**
 * FileStoresSettings - Gemini file stores management
 *
 * Features:
 * - List existing file stores from API
 * - Create new store form
 * - Delete store button
 * - File count per store
 * - Drag-drop upload zone (placeholder)
 */
export function FileStoresSettings({ onNotify }: FileStoresSettingsProps) {
  const { apiKey, isApiKeyValid } = useSettings();
  const [stores, setStores] = useState<FileSearchStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingStore, setDeletingStore] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch stores on mount and when API key changes
  const fetchStores = useCallback(async () => {
    if (!isApiKeyValid || !apiKey) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/stores", {
        headers: {
          "X-Gemini-API-Key": apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStores(data.stores ?? []);
      } else {
        const error = await response.json();
        onNotify?.(error.message || "Failed to fetch stores", "error");
      }
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      onNotify?.("Failed to fetch file stores", "error");
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, isApiKeyValid, onNotify]);

  useEffect(() => {
    if (isApiKeyValid) {
      fetchStores();
    }
  }, [isApiKeyValid, fetchStores]);

  const handleCreateStore = useCallback(async () => {
    if (!newStoreName.trim() || !apiKey) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Gemini-API-Key": apiKey,
        },
        body: JSON.stringify({ name: newStoreName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setStores((prev) => [...prev, data.store]);
        setNewStoreName("");
        setShowCreateForm(false);
        onNotify?.("File store created successfully", "success");
      } else {
        const error = await response.json();
        onNotify?.(error.message || "Failed to create store", "error");
      }
    } catch (error) {
      console.error("Failed to create store:", error);
      onNotify?.("Failed to create file store", "error");
    } finally {
      setIsCreating(false);
    }
  }, [newStoreName, apiKey, onNotify]);

  const handleDeleteStore = useCallback(
    async (storeName: string) => {
      if (!apiKey) return;

      setDeletingStore(storeName);
      try {
        const response = await fetch("/api/stores", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-Gemini-API-Key": apiKey,
          },
          body: JSON.stringify({ storeName }),
        });

        if (response.ok) {
          setStores((prev) => prev.filter((s) => s.name !== storeName));
          onNotify?.("File store deleted", "success");
        } else {
          const error = await response.json();
          onNotify?.(error.message || "Failed to delete store", "error");
        }
      } catch (error) {
        console.error("Failed to delete store:", error);
        onNotify?.("Failed to delete file store", "error");
      } finally {
        setDeletingStore(null);
      }
    },
    [apiKey, onNotify]
  );

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (!isApiKeyValid) {
    return (
      <section id="file-stores" className="scroll-mt-24">
        <div className="rounded-2xl border border-white/10 bg-[#12121a]/80 backdrop-blur-xl overflow-hidden">
          <div className="border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 p-2.5">
                <FolderIcon />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">File Stores</h2>
                <p className="text-sm text-white/50">Manage Gemini file search stores</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
              <p className="text-amber-400">
                Configure your API key in the API section to manage file stores.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="file-stores" className="scroll-mt-24">
      <div className="rounded-2xl border border-white/10 bg-[#12121a]/80 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 p-2.5">
                <FolderIcon />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">File Stores</h2>
                <p className="text-sm text-white/50">Manage Gemini file search stores</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchStores}
                disabled={isLoading}
                className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                title="Refresh"
              >
                <motion.div animate={isLoading ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}>
                  <RefreshIcon />
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Create New Store */}
          <AnimatePresence mode="wait">
            {showCreateForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4"
              >
                <h3 className="text-sm font-medium text-white mb-3">Create New Store</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="Store name"
                    className="flex-1 rounded-lg border border-white/10 bg-[#0a0a0f] px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateStore()}
                  />
                  <ShinyButton
                    onClick={handleCreateStore}
                    disabled={!newStoreName.trim() || isCreating}
                    size="sm"
                  >
                    {isCreating ? <LoaderIcon /> : "Create"}
                  </ShinyButton>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewStoreName("");
                    }}
                    className="rounded-lg px-4 py-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 py-4 text-sm font-medium text-white/60 transition-all hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-white"
              >
                <PlusIcon />
                Create New File Store
              </motion.button>
            )}
          </AnimatePresence>

          {/* Stores List */}
          <div className="space-y-3">
            {isLoading && stores.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <LoaderIcon />
                <span className="ml-2 text-white/50">Loading stores...</span>
              </div>
            ) : stores.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-[#0a0a0f] p-8 text-center">
                <FolderIcon />
                <p className="mt-3 text-white/50">No file stores yet</p>
                <p className="text-sm text-white/30">
                  Create a store to use Web + Files research mode
                </p>
              </div>
            ) : (
              stores.map((store) => (
                <motion.div
                  key={store.name}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-white/10 bg-[#0a0a0f] p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400">
                        <FolderIcon />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{store.displayName}</h4>
                        <p className="text-xs text-white/40 font-mono truncate max-w-[200px] sm:max-w-none">
                          {store.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteStore(store.name)}
                      disabled={deletingStore === store.name}
                      className="rounded-lg p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                      title="Delete store"
                    >
                      {deletingStore === store.name ? <LoaderIcon /> : <TrashIcon />}
                    </button>
                  </div>

                  {/* Store Stats */}
                  <div className="mt-4 flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-white/50">
                      <FileIcon />
                      <span>{store.activeDocumentsCount ?? 0} files</span>
                    </div>
                    {(store.pendingDocumentsCount ?? 0) > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-400/70">
                        <LoaderIcon />
                        <span>{store.pendingDocumentsCount} pending</span>
                      </div>
                    )}
                    {store.sizeBytes && store.sizeBytes > 0 && (
                      <div className="text-white/40">{formatBytes(store.sizeBytes)}</div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Upload Zone (Placeholder) */}
          {stores.length > 0 && (
            <div
              className={cn(
                "rounded-xl border-2 border-dashed p-8 text-center transition-all",
                isDragging
                  ? "border-violet-500/50 bg-violet-500/10"
                  : "border-white/10 bg-white/5"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                onNotify?.("File upload coming soon!", "success");
              }}
            >
              <div className="flex flex-col items-center">
                <div className="text-white/30 mb-3">
                  <UploadCloudIcon />
                </div>
                <p className="text-white/60 font-medium">Drop files to upload</p>
                <p className="text-sm text-white/40 mt-1">
                  or click to browse (coming soon)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
