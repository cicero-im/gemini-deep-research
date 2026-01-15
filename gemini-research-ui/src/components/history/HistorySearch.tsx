"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ResearchStatus, ResearchMode } from "@/types";

// Icons
const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
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

const ChevronDownIcon = () => (
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
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const FilterIcon = () => (
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
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const SortIcon = () => (
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
    <path d="m3 16 4 4 4-4" />
    <path d="M7 20V4" />
    <path d="m21 8-4-4-4 4" />
    <path d="M17 4v16" />
  </svg>
);

const CalendarIcon = () => (
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
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

// Sort options
type SortOrder = "newest" | "oldest" | "a-z" | "z-a";

const sortOptions: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "a-z", label: "A to Z" },
  { value: "z-a", label: "Z to A" },
];

// Status options
const statusOptions: { value: ResearchStatus | "all"; label: string; color: string }[] = [
  { value: "all", label: "All Status", color: "text-white/60" },
  { value: "completed", label: "Completed", color: "text-emerald-400" },
  { value: "in_progress", label: "In Progress", color: "text-cyan-400" },
  { value: "pending", label: "Pending", color: "text-amber-400" },
  { value: "failed", label: "Failed", color: "text-red-400" },
];

// Mode options
const modeOptions: { value: ResearchMode | "all"; label: string }[] = [
  { value: "all", label: "All Modes" },
  { value: "web", label: "Web Only" },
  { value: "web+files", label: "Web + Files" },
];

// Date range presets
type DateRange = "all" | "today" | "week" | "month" | "year";

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Past Week" },
  { value: "month", label: "Past Month" },
  { value: "year", label: "Past Year" },
];

interface HistorySearchProps {
  /** Current search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Current status filter */
  statusFilter?: ResearchStatus;
  /** Callback when status filter changes */
  onStatusChange: (status: ResearchStatus | undefined) => void;
  /** Current mode filter */
  modeFilter?: ResearchMode;
  /** Callback when mode filter changes */
  onModeChange: (mode: ResearchMode | undefined) => void;
  /** Current sort order */
  sortOrder: SortOrder;
  /** Callback when sort order changes */
  onSortChange: (order: SortOrder) => void;
  /** Current date range */
  dateRange?: DateRange;
  /** Callback when date range changes */
  onDateRangeChange?: (range: DateRange) => void;
  /** Total count of results */
  totalCount?: number;
  /** Class name */
  className?: string;
}

/**
 * HistorySearch - Search and filter component for research history
 *
 * Features:
 * - Search input with icon and clear button
 * - Status filter dropdown (All, Completed, In Progress, Failed)
 * - Mode filter dropdown (Web, Web+Files)
 * - Date range filter
 * - Sort by dropdown (Newest, Oldest, A-Z, Z-A)
 * - Clear filters button
 * - Shows active filter count
 */
export function HistorySearch({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  modeFilter,
  onModeChange,
  sortOrder,
  onSortChange,
  dateRange = "all",
  onDateRangeChange,
  totalCount,
  className,
}: HistorySearchProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Count active filters
  const activeFilterCount = [
    statusFilter,
    modeFilter,
    dateRange !== "all" ? dateRange : undefined,
  ].filter(Boolean).length;

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    onSearchChange("");
    onStatusChange(undefined);
    onModeChange(undefined);
    onSortChange("newest");
    onDateRangeChange?.("all");
  }, [onSearchChange, onStatusChange, onModeChange, onSortChange, onDateRangeChange]);

  // Handle search input
  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    onSearchChange("");
    searchInputRef.current?.focus();
  }, [onSearchChange]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <div
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors",
              isSearchFocused && "text-violet-400"
            )}
          >
            <SearchIcon />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search researches..."
            className={cn(
              "w-full rounded-xl border bg-[#12121a]/80 backdrop-blur-sm",
              "pl-12 pr-12 py-3 text-white placeholder-white/40",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2",
              isSearchFocused
                ? "border-violet-500/50 ring-violet-500/20"
                : "border-white/10 ring-transparent hover:border-white/20"
            )}
          />

          {/* Clear button */}
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/40 hover:text-white transition-colors"
              >
                <XIcon />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Keyboard hint */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <AnimatePresence>
              {!searchQuery && !isSearchFocused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hidden sm:flex items-center gap-1 text-xs text-white/30"
                >
                  <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono">
                    Cmd
                  </kbd>
                  <span>+</span>
                  <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono">
                    K
                  </kbd>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sort dropdown */}
        <Dropdown
          value={sortOrder}
          onChange={onSortChange}
          options={sortOptions}
          icon={<SortIcon />}
          className="w-full sm:w-40"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter icon */}
        <div className="flex items-center gap-2 text-sm text-white/50">
          <FilterIcon />
          <span>Filters:</span>
        </div>

        {/* Status filter */}
        <Dropdown
          value={statusFilter ?? "all"}
          onChange={(value) =>
            onStatusChange(value === "all" ? undefined : (value as ResearchStatus))
          }
          options={statusOptions}
          className="w-36"
        />

        {/* Mode filter */}
        <Dropdown
          value={modeFilter ?? "all"}
          onChange={(value) =>
            onModeChange(value === "all" ? undefined : (value as ResearchMode))
          }
          options={modeOptions}
          className="w-32"
        />

        {/* Date range filter */}
        {onDateRangeChange && (
          <Dropdown
            value={dateRange}
            onChange={onDateRangeChange}
            options={dateRangeOptions}
            icon={<CalendarIcon />}
            className="w-36"
          />
        )}

        {/* Clear filters button */}
        <AnimatePresence>
          {(activeFilterCount > 0 || searchQuery) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleClearFilters}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2",
                "text-sm text-white/60 transition-colors",
                "hover:bg-white/5 hover:text-white",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              )}
            >
              <XIcon />
              <span>Clear{activeFilterCount > 0 && ` (${activeFilterCount})`}</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Results count */}
        {totalCount !== undefined && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-auto text-sm text-white/40"
          >
            {totalCount} {totalCount === 1 ? "result" : "results"}
          </motion.span>
        )}
      </div>
    </div>
  );
}

// Generic dropdown component
interface DropdownProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; color?: string }[];
  icon?: React.ReactNode;
  className?: string;
}

function Dropdown<T extends string>({
  value,
  onChange,
  options,
  icon,
  className,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2",
          "bg-[#12121a]/80 backdrop-blur-sm text-sm",
          "transition-all duration-200",
          isOpen
            ? "border-violet-500/50 ring-2 ring-violet-500/20"
            : "border-white/10 hover:border-white/20",
          selectedOption?.color || "text-white/80"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {icon}
          {selectedOption?.label}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/40"
        >
          <ChevronDownIcon />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute left-0 right-0 top-full z-50 mt-1",
              "rounded-lg border border-white/10 bg-[#12121a] shadow-xl backdrop-blur-xl",
              "overflow-hidden"
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                  "transition-colors",
                  option.value === value
                    ? "bg-violet-500/10 text-violet-300"
                    : cn("text-white/70 hover:bg-white/5 hover:text-white", option.color)
                )}
              >
                {option.value === value && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-4 w-4 text-violet-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </motion.svg>
                )}
                <span className={option.value === value ? "" : "ml-6"}>
                  {option.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * HistorySearchCompact - Compact search variant for smaller spaces
 */
export function HistorySearchCompact({
  searchQuery,
  onSearchChange,
  className,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            className="flex items-center"
          >
            <div className="absolute left-3 text-white/40">
              <SearchIcon />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onBlur={() => !searchQuery && setIsExpanded(false)}
              placeholder="Search..."
              className={cn(
                "w-full rounded-lg border border-white/10 bg-white/5",
                "pl-10 pr-8 py-2 text-sm text-white placeholder-white/40",
                "focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 text-white/40 hover:text-white"
              >
                <XIcon />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="rounded-lg p-2 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <SearchIcon />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
