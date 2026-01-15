/**
 * Research Components Barrel Export
 *
 * Exports all research-related components for:
 * - Research input and initiation
 * - Live streaming progress
 * - Completed research view with follow-up chat
 */

// Input and initiation
export { ResearchInput } from "./ResearchInput";
export { QuickStats, QuickStatsCompact } from "./QuickStats";
export { RecentResearches, RecentResearchesList } from "./RecentResearches";

// Streaming and progress
export { StreamingProgress, CompactProgress } from "./StreamingProgress";
export { LivePreview, CompactPreview } from "./LivePreview";
export {
  ThinkingBubble,
  ThinkingBubbleStack,
  PulsingThinkingIndicator,
} from "./ThinkingBubble";

// Message components
export {
  MessageBubble,
  StreamingMessage,
  MessageSkeleton,
} from "./MessageBubble";

// Quick action components
export {
  QuickActions,
  ContextualActions,
  createQuickAction,
  type QuickAction,
} from "./QuickActions";

// Follow-up chat
export {
  FollowUpChat,
  FloatingChatButton,
} from "./FollowUpChat";

// Research report display
export {
  ResearchReport,
  ReportPreview,
} from "./ResearchReport";

// Combined completed view
export {
  CompletedResearchView,
  CompletedResearchSkeleton,
} from "./CompletedResearchView";

// Layout
export { ResearchLayout, MobileResearchLayout } from "./ResearchLayout";

// Meta components
export { ResearchMetaHeader } from "./ResearchMetaHeader";
export { CompletedResearchSummary } from "./CompletedResearchSummary";
export { ResearchPromptDisplay } from "./ResearchPromptDisplay";

// Citation components
export {
  Citation,
  CitationGroup,
  CitationProvider,
  useCitationContext,
  type CitationMetadata,
} from "./Citation";
