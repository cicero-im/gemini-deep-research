"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";
import { SpotlightCard } from "@/components/ui/spotlight";
import { useResearchStats } from "@/hooks/useHistory";

// Icons as inline SVGs
const SearchIcon = () => (
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
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const CoinsIcon = () => (
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
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);

const DatabaseIcon = () => (
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
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);

const TrendingUpIcon = () => (
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
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  delay?: number;
  className?: string;
}

function StatCard({
  title,
  value,
  suffix,
  icon,
  gradientFrom,
  gradientTo,
  delay = 0,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <SpotlightCard
        className={cn("p-6", className)}
        spotlightColor={`${gradientFrom}22`}
      >
        {/* Icon with gradient background */}
        <div
          className="mb-4 inline-flex rounded-xl p-3"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}22, ${gradientTo}22)`,
          }}
        >
          <span
            style={{
              color: gradientFrom,
            }}
          >
            {icon}
          </span>
        </div>

        {/* Value */}
        <div className="mb-1 flex items-baseline gap-1">
          <NumberTicker
            value={value}
            className="text-3xl font-bold text-white"
            delay={delay + 0.2}
          />
          {suffix && (
            <span className="text-lg font-medium text-white/50">{suffix}</span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm text-white/50">{title}</p>
      </SpotlightCard>
    </motion.div>
  );
}

interface QuickStatsProps {
  className?: string;
}

/**
 * QuickStats - Stats bento grid component
 *
 * Features:
 * - Recent researches count (NumberTicker)
 * - Total tokens used (estimated from content)
 * - Storage used (estimated from content)
 * - This week count (actual)
 * - Uses useResearchStats hook for real data
 */
export function QuickStats({ className }: QuickStatsProps) {
  const { totalResearches, estimatedTokens, estimatedStorageKB, thisWeekCount } =
    useResearchStats();

  // Format tokens for display (show in K if > 1000)
  const displayTokens = estimatedTokens >= 1000
    ? Math.round(estimatedTokens / 1000)
    : estimatedTokens;
  const tokenSuffix = estimatedTokens >= 1000 ? "K" : "";

  // Format storage for display (show in MB if > 1000KB)
  const displayStorage = estimatedStorageKB >= 1000
    ? Math.round(estimatedStorageKB / 100) / 10  // Round to 1 decimal
    : estimatedStorageKB;
  const storageSuffix = estimatedStorageKB >= 1000 ? "MB" : "KB";

  const stats = [
    {
      title: "Total Researches",
      value: totalResearches,
      icon: <SearchIcon />,
      gradientFrom: "#8b5cf6",
      gradientTo: "#06b6d4",
    },
    {
      title: "Tokens Used",
      value: displayTokens,
      suffix: tokenSuffix,
      icon: <CoinsIcon />,
      gradientFrom: "#f59e0b",
      gradientTo: "#ef4444",
    },
    {
      title: "Storage Used",
      value: displayStorage,
      suffix: storageSuffix,
      icon: <DatabaseIcon />,
      gradientFrom: "#10b981",
      gradientTo: "#06b6d4",
    },
    {
      title: "This Week",
      value: thisWeekCount,
      icon: <TrendingUpIcon />,
      gradientFrom: "#ec4899",
      gradientTo: "#8b5cf6",
    },
  ];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}

/**
 * QuickStatsCompact - Compact horizontal version for smaller spaces
 */
export function QuickStatsCompact({ className }: { className?: string }) {
  const { totalResearches, estimatedTokens, thisWeekCount, isLoading } = useResearchStats();

  // Format tokens for display
  const displayTokens = estimatedTokens >= 1000
    ? Math.round(estimatedTokens / 1000)
    : estimatedTokens;
  const tokenSuffix = estimatedTokens >= 1000 ? "K" : "";

  // Don't show zeros while loading - show actual values or nothing
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "flex items-center justify-center gap-8 text-sm text-white/30",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <SearchIcon />
          <span className="animate-pulse">Loading...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn(
        "flex items-center justify-center gap-8 text-sm text-white/50",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <SearchIcon />
        <span>
          {/* Key forces re-render when value changes */}
          <NumberTicker
            key={`research-count-${totalResearches}`}
            value={totalResearches}
            className="font-medium text-white"
          />{" "}
          researches
        </span>
      </div>
      <div className="h-4 w-px bg-white/10" />
      <div className="flex items-center gap-2">
        <CoinsIcon />
        <span>
          <NumberTicker
            key={`token-count-${displayTokens}`}
            value={displayTokens}
            className="font-medium text-white"
          />
          {tokenSuffix} tokens
        </span>
      </div>
      <div className="h-4 w-px bg-white/10" />
      <div className="flex items-center gap-2">
        <TrendingUpIcon />
        <span className={thisWeekCount > 0 ? "text-emerald-400" : "text-white/40"}>
          {thisWeekCount > 0 ? "Active" : "Inactive"}
        </span>
      </div>
    </motion.div>
  );
}
