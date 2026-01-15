"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Loader2 } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

export interface CitationMetadata {
  resolvedUrl: string;
  title: string;
  description: string;
  favicon: string;
  domain: string;
}

interface CitationProps {
  /** Citation number(s) - can be single "1" or multiple "1, 2, 3" */
  number: string;
  /** Original grounding URL */
  url: string;
  /** Pre-resolved metadata (optional, for SSR or cache) */
  metadata?: CitationMetadata;
  /** Callback when metadata is loaded */
  onMetadataLoaded?: (url: string, metadata: CitationMetadata) => void;
  /** Additional CSS classes */
  className?: string;
}

interface CitationGroupProps {
  /** Array of citation numbers */
  numbers: string[];
  /** Map of citation number to URL */
  urlMap: Record<string, string>;
  /** Map of URL to metadata (shared cache) */
  metadataCache: Record<string, CitationMetadata>;
  /** Callback when metadata is loaded */
  onMetadataLoaded?: (url: string, metadata: CitationMetadata) => void;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// CITATION COMPONENT
// =============================================================================

/**
 * Single citation with tooltip
 */
export function Citation({
  number,
  url,
  metadata: initialMetadata,
  onMetadataLoaded,
  className,
}: CitationProps) {
  const [metadata, setMetadata] = useState<CitationMetadata | null>(
    initialMetadata || null
  );
  const [isLoading, setIsLoading] = useState(!initialMetadata);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipSide, setTooltipSide] = useState<"top" | "bottom">("top");
  const citationRef = useRef<HTMLAnchorElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure we're on client for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch metadata on mount
  useEffect(() => {
    if (initialMetadata) {
      setMetadata(initialMetadata);
      setIsLoading(false);
      return;
    }

    // Don't fetch if no URL
    if (!url || !url.startsWith("http")) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchMetadata() {
      try {
        const response = await fetch("/api/resolve-citation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) throw new Error("Failed to resolve citation");

        const data: CitationMetadata = await response.json();

        if (!cancelled) {
          setMetadata(data);
          setIsLoading(false);
          onMetadataLoaded?.(url, data);
        }
      } catch (error) {
        console.error("Failed to fetch citation metadata:", error);
        if (!cancelled) {
          setIsLoading(false);
          // Set fallback metadata
          try {
            setMetadata({
              resolvedUrl: url,
              title: new URL(url).hostname,
              description: "",
              favicon: "",
              domain: new URL(url).hostname,
            });
          } catch {
            setMetadata({
              resolvedUrl: url,
              title: "Unknown source",
              description: "",
              favicon: "",
              domain: "unknown",
            });
          }
        }
      }
    }

    fetchMetadata();

    return () => {
      cancelled = true;
    };
  }, [url, initialMetadata, onMetadataLoaded]);

  // Calculate tooltip position (absolute for portal)
  const handleMouseEnter = useCallback(() => {
    // Clear any pending hide timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    if (citationRef.current) {
      const rect = citationRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const tooltipWidth = 288; // w-72 = 18rem = 288px
      const tooltipHeight = 180; // Approximate tooltip height

      // Calculate horizontal position (centered, but clamped to viewport)
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));

      // Show tooltip below if not enough space above
      const showBelow = spaceAbove < tooltipHeight + 16;
      setTooltipSide(showBelow ? "bottom" : "top");
      setTooltipPosition({
        top: showBelow ? rect.bottom + 8 : rect.top - 8,
        left,
      });
    }
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Delay hiding to allow moving to tooltip
    hoverTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 100);
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    // Cancel hide timeout when entering tooltip
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const displayUrl = metadata?.resolvedUrl || url;

  return (
    <span className={cn("inline", className)}>
      <a
        ref={citationRef}
        href={displayUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "inline-flex items-center justify-center",
          "text-[0.65em] font-medium",
          "min-w-[1.2em] h-[1.2em] px-[0.3em]",
          "rounded-sm align-super",
          "bg-violet-500/20 text-violet-400",
          "hover:bg-violet-500/30 hover:text-violet-300",
          "transition-colors cursor-pointer",
          "no-underline"
        )}
      >
        {number}
      </a>

      {/* Tooltip via Portal - AnimatePresence wraps the conditional */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                key="citation-tooltip"
                initial={{ opacity: 0, y: tooltipSide === "top" ? 5 : -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: tooltipSide === "top" ? 5 : -5 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "fixed",
                  top: tooltipSide === "bottom" ? tooltipPosition.top : undefined,
                  bottom:
                    tooltipSide === "top"
                      ? window.innerHeight - tooltipPosition.top
                      : undefined,
                  left: tooltipPosition.left,
                  zIndex: 9999,
                }}
                className={cn(
                  "w-72",
                  "bg-[#1a1a24] border border-white/10 rounded-lg shadow-xl",
                  "overflow-hidden pointer-events-auto"
                )}
                onMouseEnter={handleTooltipMouseEnter}
                onMouseLeave={handleTooltipMouseLeave}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                    <span className="ml-2 text-sm text-white/40">Loading...</span>
                  </div>
                ) : (
                  <>
                    {/* Header with favicon and domain */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                      {metadata?.favicon && (
                        <img
                          src={metadata.favicon}
                          alt=""
                          className="w-4 h-4 rounded-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <span className="text-xs text-white/50 truncate">
                        {metadata?.domain}
                      </span>
                    </div>

                    {/* Title and description */}
                    <div className="p-3 space-y-1.5">
                      <h4 className="text-sm font-medium text-white leading-tight line-clamp-2">
                        {metadata?.title || "Unknown source"}
                      </h4>
                      {metadata?.description && (
                        <p className="text-xs text-white/50 leading-relaxed line-clamp-3">
                          {metadata.description}
                        </p>
                      )}
                    </div>

                    {/* Link footer */}
                    <a
                      href={displayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 border-t border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3 text-violet-400" />
                      <span className="text-xs text-violet-400 truncate">
                        {metadata?.resolvedUrl
                          ? (() => {
                              try {
                                return new URL(metadata.resolvedUrl).hostname +
                                  new URL(metadata.resolvedUrl).pathname.slice(0, 30);
                              } catch {
                                return metadata.resolvedUrl.slice(0, 40);
                              }
                            })()
                          : "Visit source"}
                      </span>
                    </a>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </span>
  );
}

// =============================================================================
// CITATION GROUP COMPONENT
// =============================================================================

/**
 * Renders multiple citations grouped together (e.g., [1, 2, 3])
 */
export function CitationGroup({
  numbers,
  urlMap,
  metadataCache,
  onMetadataLoaded,
  className,
}: CitationGroupProps) {
  return (
    <span className={cn("inline-flex gap-0.5", className)}>
      {numbers.map((num, idx) => (
        <Citation
          key={`${num}-${idx}`}
          number={num}
          url={urlMap[num] || ""}
          metadata={metadataCache[urlMap[num]]}
          onMetadataLoaded={onMetadataLoaded}
        />
      ))}
    </span>
  );
}

// =============================================================================
// CITATION CONTEXT PROVIDER
// =============================================================================

import { createContext, useContext, ReactNode } from "react";

interface CitationContextValue {
  urlMap: Record<string, string>;
  metadataCache: Record<string, CitationMetadata>;
  setMetadata: (url: string, metadata: CitationMetadata) => void;
}

const CitationContext = createContext<CitationContextValue | null>(null);

export function useCitationContext() {
  const context = useContext(CitationContext);
  if (!context) {
    throw new Error("useCitationContext must be used within CitationProvider");
  }
  return context;
}

interface CitationProviderProps {
  /** Map of citation number to URL */
  urlMap: Record<string, string>;
  /** Children to render */
  children: ReactNode;
}

export function CitationProvider({ urlMap, children }: CitationProviderProps) {
  const [metadataCache, setMetadataCache] = useState<Record<string, CitationMetadata>>({});

  const setMetadata = useCallback((url: string, metadata: CitationMetadata) => {
    setMetadataCache((prev) => ({ ...prev, [url]: metadata }));
  }, []);

  return (
    <CitationContext.Provider value={{ urlMap, metadataCache, setMetadata }}>
      {children}
    </CitationContext.Provider>
  );
}
