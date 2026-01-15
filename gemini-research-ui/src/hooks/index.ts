/**
 * Hooks barrel export
 *
 * Re-exports all custom hooks for convenient importing:
 * import { useResearch, useHistory, useSettings } from '@/hooks';
 */

// Research operations
export {
  useResearch,
  useResearchContent,
  useResearchProgress,
} from './useResearch';

// History and search
export {
  useHistory,
  useRecentResearches,
  useResearchesByStatus,
  useResearchCount,
  useResearchCountsByStatus,
  useSearchResearches,
  useResearchById,
  useInfiniteResearches,
} from './useHistory';

// Settings management
export {
  useSettings,
  useApiKey,
  useTheme,
  useThemeInitializer,
  useSystemThemeListener,
} from './useSettings';
