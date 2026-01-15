"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  Download,
  Clock,
  Globe,
  Calendar,
  List,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Research } from "@/types";

// ============================================================================
// Types
// ============================================================================

interface ResearchReportProps {
  /** The research data to display */
  research: Research;
  /** Additional class names */
  className?: string;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate slug from heading text for anchor links
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Extract headings from markdown content for TOC
 */
function extractHeadings(content: string): TOCItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({
      id: slugify(text),
      text,
      level,
    });
  }

  return headings;
}

/**
 * Format duration for display
 */
function formatDuration(start: Date, end: Date): string {
  const diff = end.getTime() - start.getTime();
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

// ============================================================================
// Code Block Component
// ============================================================================

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
  language?: string;
}

function CodeBlock({ children, className, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeContent = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [codeContent]);

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a0f]">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2">
        <span className="text-xs font-medium text-white/50">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white/60"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="overflow-x-auto p-4">
        <code className={cn("text-sm leading-relaxed text-white/80", className)}>
          {codeContent}
        </code>
      </pre>
    </div>
  );
}

// ============================================================================
// Table of Contents Component
// ============================================================================

interface TableOfContentsProps {
  headings: TOCItem[];
  activeId: string | null;
  onItemClick: (id: string) => void;
  className?: string;
}

function TableOfContents({
  headings,
  activeId,
  onItemClick,
  className,
}: TableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <nav
      className={cn(
        "sticky top-4 rounded-xl border border-white/[0.08] bg-[#12121a]/80 p-4 backdrop-blur-sm",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
        <List className="h-4 w-4" />
        <span>Contents</span>
      </div>

      <ul className="space-y-1">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            <button
              onClick={() => onItemClick(heading.id)}
              className={cn(
                "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                activeId === heading.id
                  ? "bg-violet-500/10 text-violet-400"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <ChevronRight
                className={cn(
                  "h-3 w-3 shrink-0 transition-transform",
                  activeId === heading.id ? "rotate-90 text-violet-400" : ""
                )}
              />
              <span className="line-clamp-1">{heading.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ResearchReport - Full research report view with markdown rendering
 *
 * Features:
 * - Complete markdown rendering with react-markdown + remark-gfm
 * - Table of contents sidebar (auto-generated from headings)
 * - Smooth scroll to sections
 * - Code blocks with syntax highlighting and copy button
 * - Export to Markdown and Copy All functionality
 * - Research metadata display (date, mode, duration)
 * - Glass effect container with subtle animations
 */
export function ResearchReport({ research, className }: ResearchReportProps) {
  const [copied, setCopied] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /**
   * Extract headings for TOC
   */
  const headings = useMemo(
    () => extractHeadings(research.content),
    [research.content]
  );

  /**
   * Calculate duration if available
   */
  const duration = useMemo(() => {
    if (research.createdAt && research.updatedAt) {
      return formatDuration(
        new Date(research.createdAt),
        new Date(research.updatedAt)
      );
    }
    return null;
  }, [research.createdAt, research.updatedAt]);

  /**
   * Format date for display
   */
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(research.createdAt));
  }, [research.createdAt]);

  /**
   * Handle scroll spy for active heading
   */
  useEffect(() => {
    const container = contentRef.current;
    if (!container || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    // Observe all heading elements
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  /**
   * Handle TOC item click - smooth scroll
   */
  const handleTOCClick = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveHeadingId(id);
    }
  }, []);

  /**
   * Copy all content to clipboard
   */
  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(research.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [research.content]);

  /**
   * Export as markdown file
   */
  const handleExportMarkdown = useCallback(() => {
    const blob = new Blob([research.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(research.topic)}-research.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [research.content, research.topic]);

  return (
    <div className={cn("flex gap-6", className)}>
      {/* Table of Contents - Sidebar */}
      {headings.length > 2 && (
        <aside className="hidden w-64 shrink-0 lg:block">
          <TableOfContents
            headings={headings}
            activeId={activeHeadingId}
            onItemClick={handleTOCClick}
          />
        </aside>
      )}

      {/* Main Report Content */}
      <div className="min-w-0 flex-1">
        {/* Glass container */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12121a]/60 backdrop-blur-md">
          {/* Header */}
          <div className="border-b border-white/[0.08] p-6">
            {/* Title */}
            <h1 className="text-2xl font-bold leading-tight text-white">
              {research.topic}
            </h1>

            {/* Metadata */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/50">
              {/* Date */}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>

              {/* Mode */}
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                <span className="capitalize">{research.mode} research</span>
              </div>

              {/* Duration */}
              {duration && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{duration}</span>
                </div>
              )}

              {/* Status badge */}
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  research.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : research.status === "in_progress"
                    ? "bg-amber-500/10 text-amber-400"
                    : research.status === "failed"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-white/10 text-white/60"
                )}
              >
                {research.status.replace("_", " ")}
              </span>
            </div>

            {/* Export buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy All</span>
                  </>
                )}
              </button>

              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Download className="h-4 w-4" />
                <span>Export MD</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="p-6">
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Headings with IDs for TOC linking
                  h1: ({ children }) => {
                    const text = String(children);
                    const id = slugify(text);
                    return (
                      <h1
                        id={id}
                        className="mb-4 mt-8 scroll-mt-4 text-3xl font-bold text-white first:mt-0"
                      >
                        {children}
                      </h1>
                    );
                  },
                  h2: ({ children }) => {
                    const text = String(children);
                    const id = slugify(text);
                    return (
                      <h2
                        id={id}
                        className="mb-3 mt-8 scroll-mt-4 border-b border-white/[0.08] pb-2 text-2xl font-semibold text-white"
                      >
                        {children}
                      </h2>
                    );
                  },
                  h3: ({ children }) => {
                    const text = String(children);
                    const id = slugify(text);
                    return (
                      <h3
                        id={id}
                        className="mb-2 mt-6 scroll-mt-4 text-xl font-semibold text-white"
                      >
                        {children}
                      </h3>
                    );
                  },
                  h4: ({ children }) => {
                    const text = String(children);
                    const id = slugify(text);
                    return (
                      <h4
                        id={id}
                        className="mb-2 mt-4 scroll-mt-4 text-lg font-medium text-white"
                      >
                        {children}
                      </h4>
                    );
                  },

                  // Paragraphs
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed text-white/80">
                      {children}
                    </p>
                  ),

                  // Code blocks and inline code
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isBlock = match || String(children).includes("\n");

                    if (isBlock) {
                      return (
                        <CodeBlock language={match?.[1]} className={className}>
                          {children}
                        </CodeBlock>
                      );
                    }

                    return (
                      <code
                        className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-cyan-300"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <>{children}</>,

                  // Links
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 underline decoration-cyan-400/30 underline-offset-2 transition-colors hover:text-cyan-300 hover:decoration-cyan-300/50"
                    >
                      {children}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ),

                  // Lists
                  ul: ({ children }) => (
                    <ul className="mb-4 ml-6 list-disc space-y-2 text-white/80 marker:text-violet-400">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 ml-6 list-decimal space-y-2 text-white/80 marker:text-violet-400">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),

                  // Blockquotes
                  blockquote: ({ children }) => (
                    <blockquote className="my-4 border-l-4 border-violet-500/50 bg-violet-500/5 py-2 pl-4 pr-4 italic text-white/70">
                      {children}
                    </blockquote>
                  ),

                  // Tables
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto rounded-xl border border-white/[0.08]">
                      <table className="min-w-full divide-y divide-white/[0.08]">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-white/[0.03]">{children}</thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-white/[0.08]">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => <tr>{children}</tr>,
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-sm text-white/70">
                      {children}
                    </td>
                  ),

                  // Horizontal rule
                  hr: () => (
                    <hr className="my-8 border-t border-white/[0.08]" />
                  ),

                  // Strong/Bold
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">
                      {children}
                    </strong>
                  ),

                  // Emphasis/Italic
                  em: ({ children }) => (
                    <em className="italic text-white/90">{children}</em>
                  ),

                  // Images
                  img: ({ src, alt }) => (
                    <figure className="my-6">
                      <img
                        src={src}
                        alt={alt}
                        className="rounded-xl border border-white/[0.08]"
                        loading="lazy"
                      />
                      {alt && (
                        <figcaption className="mt-2 text-center text-sm text-white/50">
                          {alt}
                        </figcaption>
                      )}
                    </figure>
                  ),
                }}
              >
                {research.content || "*No content available*"}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Compact Report Preview
// ============================================================================

interface ReportPreviewProps {
  research: Research;
  maxLength?: number;
  className?: string;
}

/**
 * ReportPreview - Compact preview of a research report
 */
export function ReportPreview({
  research,
  maxLength = 300,
  className,
}: ReportPreviewProps) {
  const preview = useMemo(() => {
    const content = research.content || "";
    if (content.length <= maxLength) return content;

    // Find a good breaking point
    let breakPoint = content.lastIndexOf(" ", maxLength);
    if (breakPoint === -1) breakPoint = maxLength;

    return content.slice(0, breakPoint) + "...";
  }, [research.content, maxLength]);

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[#12121a]/60 p-4",
        className
      )}
    >
      <h3 className="mb-2 font-semibold text-white line-clamp-1">
        {research.topic}
      </h3>
      <p className="text-sm text-white/60 line-clamp-3">{preview}</p>
    </div>
  );
}

export default ResearchReport;
