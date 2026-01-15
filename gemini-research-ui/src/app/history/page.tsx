"use client";

import { useCallback, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar, NavbarSpacer } from "@/components/layout/Navbar";
import { HistorySearch } from "@/components/history/HistorySearch";
import { HistoryGrid } from "@/components/history/HistoryGrid";
import { BatchActions } from "@/components/history/BatchActions";
import { Meteors, Particles, StarsBackground } from "@/components/ui/meteors";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { SpotlightCard } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import {
  useResearchCount,
  useResearchCountsByStatus,
  useInfiniteResearches,
} from "@/hooks/useHistory";
import { deleteResearch, exportAllData, getResearchById } from "@/lib/db";
import type { ResearchStatus, ResearchMode, Research } from "@/types";

// Icons
const FileTextIcon = () => (
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

const CheckCircleIcon = () => (
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
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const LoaderIcon = () => (
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
    className="animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const AlertCircleIcon = () => (
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
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

// Sort type
type SortOrder = "newest" | "oldest" | "a-z" | "z-a";

// Date range type
type DateRange = "all" | "today" | "week" | "month" | "year";

/**
 * History Page - Research history with search, filters, and batch actions
 *
 * Features:
 * - HistorySearch at top with filters
 * - Stats summary (total researches, by status)
 * - HistoryGrid in main area with infinite scroll
 * - BatchActions floating at bottom when items selected
 * - Responsive design with dark glass theme
 */
export default function HistoryPage() {
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResearchStatus | undefined>();
  const [modeFilter, setModeFilter] = useState<ResearchMode | undefined>();
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  // Selection state for batch actions
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Get stats from hooks
  const totalCount = useResearchCount();
  const statusCounts = useResearchCountsByStatus();

  // Get filtered researches for "select all" functionality
  const { researches } = useInfiniteResearches({
    limit: 1000, // Large limit to get all IDs
    status: statusFilter,
    mode: modeFilter,
    searchQuery: searchQuery.trim(),
  });

  // Get all visible research IDs
  const allVisibleIds = useMemo(
    () => researches.filter((r) => r.id !== undefined).map((r) => r.id as number),
    [researches]
  );

  // Handle delete single item
  const handleDelete = useCallback(async (id: number) => {
    await deleteResearch(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Handle batch delete
  const handleBatchDelete = useCallback(async (ids: number[]) => {
    await Promise.all(ids.map((id) => deleteResearch(id)));
    setSelectedIds(new Set());
  }, []);

  // Handle batch export
  const handleBatchExport = useCallback(async (ids: number[]) => {
    // Get all selected researches
    const researches = await Promise.all(
      ids.map((id) => getResearchById(id))
    );

    // Filter out undefined and create export data
    const validResearches = researches.filter(
      (r): r is Research => r !== undefined
    );

    // Create markdown export
    const exportContent = validResearches
      .map((r) => {
        return `# ${r.topic}\n\n**Status:** ${r.status}\n**Mode:** ${r.mode}\n**Created:** ${new Date(r.createdAt).toLocaleString()}\n**Updated:** ${new Date(r.updatedAt).toLocaleString()}\n\n---\n\n${r.content || "No content yet."}\n\n---\n\n`;
      })
      .join("\n\n");

    // Download as file
    const blob = new Blob([exportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-export-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(allVisibleIds));
  }, [allVisibleIds]);

  // Handle deselect all
  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Handle selection change
  const handleSelectionChange = useCallback((newSelectedIds: Set<number>) => {
    setSelectedIds(newSelectedIds);
  }, []);

  return (
    <>
      <Navbar />

      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <StarsBackground number={30} twinkle />
        <Meteors number={8} minDuration={5} maxDuration={15} />
        <Particles number={15} speed={20} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen">
        <NavbarSpacer />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="mb-2">
              <AnimatedGradientText
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                animationDuration={4}
              >
                Research History
              </AnimatedGradientText>
            </h1>
            <p className="text-white/50">
              Browse, search, and manage your research sessions
            </p>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard
              icon={<FileTextIcon />}
              label="Total Researches"
              value={totalCount}
              color="violet"
              index={0}
            />
            <StatCard
              icon={<CheckCircleIcon />}
              label="Completed"
              value={statusCounts.completed}
              color="emerald"
              index={1}
            />
            <StatCard
              icon={<LoaderIcon />}
              label="In Progress"
              value={statusCounts.in_progress}
              color="cyan"
              index={2}
            />
            <StatCard
              icon={<AlertCircleIcon />}
              label="Failed"
              value={statusCounts.failed}
              color="red"
              index={3}
            />
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <HistorySearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              modeFilter={modeFilter}
              onModeChange={setModeFilter}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              totalCount={researches.length}
            />
          </motion.div>

          {/* History Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <HistoryGrid
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              onDelete={handleDelete}
              statusFilter={statusFilter}
              modeFilter={modeFilter}
              searchQuery={searchQuery}
              sortOrder={sortOrder}
              itemsPerPage={12}
            />
          </motion.div>
        </div>
      </main>

      {/* Batch Actions */}
      <BatchActions
        selectedIds={selectedIds}
        totalCount={allVisibleIds.length}
        onDelete={handleBatchDelete}
        onExport={handleBatchExport}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
      />
    </>
  );
}

// Stat card component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "violet" | "emerald" | "cyan" | "red" | "amber";
  index: number;
}

const colorConfig = {
  violet: {
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    glow: "rgba(139, 92, 246, 0.15)",
  },
  emerald: {
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    glow: "rgba(52, 211, 153, 0.15)",
  },
  cyan: {
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    glow: "rgba(34, 211, 238, 0.15)",
  },
  red: {
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    glow: "rgba(248, 113, 113, 0.15)",
  },
  amber: {
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    glow: "rgba(251, 191, 36, 0.15)",
  },
};

function StatCard({ icon, label, value, color, index }: StatCardProps) {
  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
    >
      <SpotlightCard
        className="p-4"
        spotlightColor={config.glow}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              config.iconBg
            )}
          >
            <span className={config.iconColor}>{icon}</span>
          </div>
          <div>
            <p className="text-sm text-white/50">{label}</p>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.3 + index * 0.05,
                type: "spring",
                stiffness: 200,
              }}
              className="text-2xl font-bold text-white"
            >
              {value}
            </motion.p>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
