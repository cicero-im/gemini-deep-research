"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Icons
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
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const DownloadIcon = () => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const CheckSquareIcon = () => (
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
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const SquareIcon = () => (
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
    <rect width="18" height="18" x="3" y="3" rx="2" />
  </svg>
);

const XIcon = () => (
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
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const LoaderIcon = () => (
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
    className="animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

interface BatchActionsProps {
  /** Set of selected item IDs */
  selectedIds: Set<number>;
  /** Total number of items that can be selected */
  totalCount: number;
  /** Callback to delete selected items */
  onDelete: (ids: number[]) => Promise<void>;
  /** Callback to export selected items */
  onExport: (ids: number[]) => Promise<void>;
  /** Callback to select all items */
  onSelectAll: () => void;
  /** Callback to deselect all items */
  onDeselectAll: () => void;
  /** Class name */
  className?: string;
}

/**
 * BatchActions - Floating action bar for bulk operations
 *
 * Features:
 * - Shows when items are selected
 * - Delete selected items
 * - Export selected items
 * - Select all / Deselect all
 * - Item count badge
 * - Confirmation dialog for delete
 * - Smooth animations
 */
export function BatchActions({
  selectedIds,
  totalCount,
  onDelete,
  onExport,
  onSelectAll,
  onDeselectAll,
  className,
}: BatchActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedCount = selectedIds.size;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const hasSelection = selectedCount > 0;

  // Handle delete with confirmation
  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete(Array.from(selectedIds));
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  // Handle export
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await onExport(Array.from(selectedIds));
    } finally {
      setIsExporting(false);
    }
  }, [selectedIds, onExport]);

  // Handle select/deselect all
  const handleToggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  }, [isAllSelected, onSelectAll, onDeselectAll]);

  return (
    <>
      {/* Floating action bar */}
      <AnimatePresence>
        {hasSelection && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
              className
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 rounded-2xl border border-white/10 bg-[#12121a]/95 backdrop-blur-xl p-2",
                "shadow-2xl shadow-black/50"
              )}
            >
              {/* Selection count badge */}
              <div className="flex items-center gap-2 px-3">
                <div className="relative flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "flex h-7 min-w-7 items-center justify-center rounded-full px-2",
                      "bg-gradient-to-r from-violet-600 to-cyan-600",
                      "text-sm font-semibold text-white"
                    )}
                  >
                    {selectedCount}
                  </motion.div>
                </div>
                <span className="text-sm text-white/60">
                  {selectedCount === 1 ? "item" : "items"} selected
                </span>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-white/10" />

              {/* Select all / Deselect all */}
              <button
                onClick={handleToggleSelectAll}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2",
                  "text-sm text-white/70 transition-colors",
                  "hover:bg-white/5 hover:text-white",
                  "focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                )}
              >
                {isAllSelected ? <SquareIcon /> : <CheckSquareIcon />}
                <span className="hidden sm:inline">
                  {isAllSelected ? "Deselect All" : "Select All"}
                </span>
              </button>

              {/* Export button */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2",
                  "text-sm text-white/70 transition-colors",
                  "hover:bg-white/5 hover:text-white",
                  "focus:outline-none focus:ring-2 focus:ring-violet-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isExporting ? <LoaderIcon /> : <DownloadIcon />}
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Delete button */}
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2",
                  "text-sm text-red-400 transition-colors",
                  "hover:bg-red-500/10 hover:text-red-300",
                  "focus:outline-none focus:ring-2 focus:ring-red-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isDeleting ? <LoaderIcon /> : <TrashIcon />}
                <span className="hidden sm:inline">Delete</span>
              </button>

              {/* Divider */}
              <div className="h-8 w-px bg-white/10" />

              {/* Close / Cancel selection */}
              <button
                onClick={onDeselectAll}
                className={cn(
                  "rounded-xl p-2 text-white/50 transition-colors",
                  "hover:bg-white/5 hover:text-white",
                  "focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                )}
                title="Clear selection"
              >
                <XIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteConfirmModal
            count={selectedCount}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Delete confirmation modal
interface DeleteConfirmModalProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteConfirmModal({
  count,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12121a] p-6",
          "shadow-2xl shadow-black/50"
        )}
      >
        {/* Icon */}
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-red-500/20 p-2.5 text-red-400">
            <TrashIcon />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Delete {count} {count === 1 ? "Research" : "Researches"}?
          </h3>
        </div>

        {/* Description */}
        <p className="mb-6 text-white/60">
          This action cannot be undone. The selected research{count === 1 ? "" : "es"}{" "}
          and all associated data will be permanently deleted.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className={cn(
              "flex-1 rounded-xl border border-white/10 px-4 py-2.5",
              "text-sm font-medium text-white/60 transition-colors",
              "hover:bg-white/5 hover:text-white",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/30",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
              "text-sm font-medium text-white transition-all",
              "bg-gradient-to-r from-red-600 to-red-500",
              "hover:from-red-500 hover:to-red-400",
              "focus:outline-none focus:ring-2 focus:ring-red-500/50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isDeleting ? (
              <>
                <LoaderIcon />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <TrashIcon />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * BatchActionsProvider - Context provider for batch actions state
 * Provides shared state for selection across components
 */
export function useBatchSelection(allIds: number[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allIds));
  }, [allIds]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const setSelection = useCallback((ids: Set<number>) => {
    setSelectedIds(ids);
  }, []);

  const isSelected = useCallback(
    (id: number) => selectedIds.has(id),
    [selectedIds]
  );

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isAllSelected: selectedIds.size === allIds.length && allIds.length > 0,
    selectAll,
    deselectAll,
    toggleSelection,
    setSelection,
    isSelected,
  };
}
