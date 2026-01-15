"use client";

import React, { useEffect, useRef, useState, useCallback, memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronDown,
  Copy,
  Check,
  ArrowDown,
  FileText,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  processContent,
  CITATION_MARKER_PREFIX,
  CITATION_MARKER_SUFFIX,
  type CitationMap,
} from "@/lib/citations";
import { Citation, CitationMetadata } from "./Citation";

interface LivePreviewProps {
  content: string;
  isStreaming: boolean;
  className?: string;
  autoScroll?: boolean;
  showScrollButton?: boolean;
  maxHeight?: string;
}

/**
 * LivePreview - Real-time streaming markdown content viewer
 *
 * Features:
 * - Streaming markdown content with react-markdown
 * - Auto-scroll to bottom during streaming
 * - Syntax highlighting for code blocks
 * - Smooth scrolling container
 * - Copy code button for code blocks
 * - Scroll to bottom indicator
 */
export function LivePreview({
  content,
  isStreaming,
  className,
  autoScroll = true,
  showScrollButton = true,
  maxHeight = "calc(100vh - 200px)",
}: LivePreviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastScrollTop = useRef(0);
  const autoScrollEnabled = useRef(autoScroll);

  // Handle auto-scroll
  useEffect(() => {
    if (!autoScrollEnabled.current || isUserScrolling) return;

    const scrollContainer = scrollRef.current;
    if (scrollContainer && isStreaming) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [content, isStreaming, isUserScrolling]);

  // Detect user scrolling
  const handleScroll = useCallback(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    // If user scrolls up, disable auto-scroll
    if (scrollTop < lastScrollTop.current - 10) {
      setIsUserScrolling(true);
      autoScrollEnabled.current = false;
    }

    // If user scrolls to bottom, re-enable auto-scroll
    if (isNearBottom) {
      setIsUserScrolling(false);
      autoScrollEnabled.current = true;
    }

    setShowScrollIndicator(!isNearBottom && scrollHeight > clientHeight);
    lastScrollTop.current = scrollTop;
  }, []);

  // Reset auto-scroll when streaming starts
  useEffect(() => {
    if (isStreaming) {
      autoScrollEnabled.current = autoScroll;
      setIsUserScrolling(false);
    }
  }, [isStreaming, autoScroll]);

  const scrollToBottom = useCallback(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      });
      autoScrollEnabled.current = true;
      setIsUserScrolling(false);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl bg-card/50 border border-white/5",
        isFullscreen && "fixed inset-4 z-50 bg-card",
        className
      )}
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-white/80">
            Research Output
          </span>
          {isStreaming && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-0.5 rounded-full bg-primary/20 text-xs text-primary"
            >
              Live
            </motion.span>
          )}
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4 text-white/60" />
          ) : (
            <Maximize2 className="h-4 w-4 text-white/60" />
          )}
        </button>
      </div>

      {/* Content area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn(
          "overflow-y-auto overflow-x-hidden scroll-smooth",
          "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        )}
        style={{ maxHeight: isFullscreen ? "calc(100vh - 120px)" : maxHeight }}
      >
        <div className="p-6">
          {content ? (
            <MarkdownContent content={content} isStreaming={isStreaming} />
          ) : (
            <EmptyState isStreaming={isStreaming} />
          )}

          {/* Streaming cursor */}
          {isStreaming && content && (
            <motion.span
              className="inline-block h-5 w-0.5 bg-primary ml-1 align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            />
          )}
        </div>
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && showScrollIndicator && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className={cn(
              "absolute bottom-4 right-4 p-2 rounded-full",
              "bg-primary/90 hover:bg-primary text-white",
              "shadow-lg shadow-primary/20",
              "transition-colors"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowDown className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Gradient fade at bottom during scroll */}
      {showScrollIndicator && (
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-t from-card/80 to-transparent rounded-b-2xl" />
      )}
    </motion.div>
  );
}

// ============================================================================
// Markdown rendering component with syntax highlighting
// ============================================================================

interface MarkdownContentProps {
  content: string;
  isStreaming: boolean;
}

const MarkdownContent = memo(function MarkdownContent({
  content,
  isStreaming,
}: MarkdownContentProps) {
  // Process content to extract citations and create markers
  const { processedContent, citationMap, metadataCache, setMetadataCache } =
    useCitationProcessing(content);

  // Helper to process children and replace citation patterns
  const processChildren = useCallback(
    (children: React.ReactNode): React.ReactNode => {
      return React.Children.map(children, (child) => {
        if (typeof child === "string") {
          return (
            <CitationText
              text={child}
              citationMap={citationMap}
              metadataCache={metadataCache}
              onMetadataLoaded={(url, meta) =>
                setMetadataCache((prev) => ({ ...prev, [url]: meta }))
              }
            />
          );
        }
        return child;
      });
    },
    [citationMap, metadataCache, setMetadataCache]
  );

  return (
    <div className="prose prose-invert prose-sm max-w-none">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings with gradient accents
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 gradient-text">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0 text-white">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-medium mb-2 mt-4 first:mt-0 text-white/90">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-medium mb-2 mt-3 first:mt-0 text-white/80">
            {children}
          </h4>
        ),

        // Paragraphs - process children for citations
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed text-white/75">
            {processChildren(children)}
          </p>
        ),

        // Lists
        ul: ({ children }) => (
          <ul className="mb-4 ml-4 space-y-1 list-disc list-outside text-white/75">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 ml-4 space-y-1 list-decimal list-outside text-white/75">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="pl-1">{processChildren(children)}</li>
        ),

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
          >
            {children}
          </a>
        ),

        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/50 pl-4 my-4 italic text-white/60">
            {children}
          </blockquote>
        ),

        // Code blocks
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match;

          if (isInline) {
            return (
              <code
                className="px-1.5 py-0.5 rounded bg-white/10 text-primary text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <CodeBlock language={match[1]}>
              {String(children).replace(/\n$/, "")}
            </CodeBlock>
          );
        },

        // Pre wrapper (used by code blocks)
        pre: ({ children }) => <>{children}</>,

        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
            <table className="w-full text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-white/5 border-b border-white/10">
            {children}
          </thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr className="border-b border-white/5 last:border-0">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left font-medium text-white/80">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-white/60">{children}</td>
        ),

        // Horizontal rule
        hr: () => <hr className="my-6 border-white/10" />,

        // Strong/Bold
        strong: ({ children }) => (
          <strong className="font-semibold text-white">{children}</strong>
        ),

        // Emphasis/Italic
        em: ({ children }) => (
          <em className="italic text-white/80">{children}</em>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
    </div>
  );
});

// ============================================================================
// Citation processing hook
// ============================================================================

function useCitationProcessing(content: string) {
  const [metadataCache, setMetadataCache] = useState<
    Record<string, CitationMetadata>
  >({});

  // Process content to extract citations and URL map
  const processed = useMemo(() => processContent(content), [content]);

  // Transform the content to replace Google grounding URLs with resolved URLs
  const transformedContent = useMemo(() => {
    if (Object.keys(metadataCache).length === 0) {
      return processed.content;
    }

    let result = processed.content;
    
    // Pattern 1: Replace Markdown links with resolved URLs
    // Matches: "38. [reddit.com](https://vertexaisearch.cloud.google.com/...)"
    const markdownLinkPattern = /^(\d+)\.\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gm;
    
    result = result.replace(markdownLinkPattern, (match, num, domain, url) => {
      const metadata = metadataCache[url];
      if (metadata && metadata.resolvedUrl) {
        const title = metadata.title || metadata.domain || domain;
        return `${num}. [${title}](${metadata.resolvedUrl})`;
      }
      return match;
    });

    // Pattern 2: Replace raw URLs (fallback for non-markdown format)
    // Matches: "1: https://..." or "1. https://..."
    const rawUrlPattern = /^(\d+)[:.]?\s*(https?:\/\/[^\s\n\)]+)(?!\))/gm;
    
    result = result.replace(rawUrlPattern, (match, num, url) => {
      const metadata = metadataCache[url];
      if (metadata && metadata.resolvedUrl) {
        const title = metadata.title || metadata.domain || "Source";
        return `${num}. [${title}](${metadata.resolvedUrl})`;
      }
      return match;
    });

    return result;
  }, [processed.content, metadataCache]);

  return {
    processedContent: transformedContent,
    citationMap: processed.citationMap,
    hasCitations: processed.hasCitations,
    metadataCache,
    setMetadataCache,
  };
}

// ============================================================================
// Citation text component - renders text with inline citations
// ============================================================================

interface CitationTextProps {
  text: string;
  citationMap: CitationMap;
  metadataCache: Record<string, CitationMetadata>;
  onMetadataLoaded: (url: string, metadata: CitationMetadata) => void;
}

function CitationText({
  text,
  citationMap,
  metadataCache,
  onMetadataLoaded,
}: CitationTextProps) {
  // Check if text contains citation markers
  const markerPattern = new RegExp(
    `${escapeRegex(CITATION_MARKER_PREFIX)}([\\d,]+)${escapeRegex(CITATION_MARKER_SUFFIX)}`,
    "g"
  );

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset lastIndex for the regex
  markerPattern.lastIndex = 0;

  while ((match = markerPattern.exec(text)) !== null) {
    // Add text before this marker
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Capture match index for use in closure
    const matchIndex = match.index;
    const matchLength = match[0].length;

    // Add citation component(s)
    const numbers = match[1].split(",").map((n) => n.trim());
    
    numbers.forEach((num, idx) => {
      const url = citationMap.urlMap[num];
      if (url) {
        parts.push(
          <Citation
            key={`cite-${num}-${matchIndex}-${idx}`}
            number={num}
            url={url}
            metadata={metadataCache[url]}
            onMetadataLoaded={onMetadataLoaded}
          />
        );
      } else {
        // No URL found for this citation number
        parts.push(
          <span
            key={`cite-missing-${num}-${matchIndex}-${idx}`}
            className="text-xs text-white/40"
          >
            [{num}]
          </span>
        );
      }
    });

    lastIndex = matchIndex + matchLength;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // If no citations found, return plain text
  if (parts.length === 0) {
    return <>{text}</>;
  }

  return <>{parts}</>;
}

/**
 * Escapes special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ============================================================================
// Code block with copy button
// ============================================================================

interface CodeBlockProps {
  children: string;
  language?: string;
}

function CodeBlock({ children, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden bg-black/40 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.02]">
        <span className="text-xs text-white/40 font-mono">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-xs",
            "transition-colors",
            copied
              ? "bg-green-500/20 text-green-400"
              : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
          )}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-white/80 whitespace-pre">
          {children}
        </code>
      </pre>
    </div>
  );
}

// ============================================================================
// Empty state
// ============================================================================

interface EmptyStateProps {
  isStreaming: boolean;
}

function EmptyState({ isStreaming }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <motion.div
        className="relative mb-4"
        animate={isStreaming ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <FileText className="h-8 w-8 text-primary/60" />
        </div>
        {isStreaming && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary/30"
            animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      <h3 className="text-lg font-medium text-white/80 mb-2">
        {isStreaming ? "Generating research..." : "No content yet"}
      </h3>
      <p className="text-sm text-white/50 max-w-xs">
        {isStreaming
          ? "Your research report will appear here as it's being generated."
          : "Start a research session to see the output here."}
      </p>
    </div>
  );
}

// ============================================================================
// Compact preview for thumbnails/cards
// ============================================================================

interface CompactPreviewProps {
  content: string;
  maxLines?: number;
  className?: string;
}

export function CompactPreview({
  content,
  maxLines = 3,
  className,
}: CompactPreviewProps) {
  // Strip markdown and truncate
  const plainText = content
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();

  return (
    <p
      className={cn(
        "text-sm text-white/60 leading-relaxed",
        className
      )}
      style={{
        display: "-webkit-box",
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {plainText || "No content"}
    </p>
  );
}
