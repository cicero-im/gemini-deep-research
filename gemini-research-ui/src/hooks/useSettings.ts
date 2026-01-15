/**
 * Custom hook for settings management
 *
 * Provides functionality to:
 * - Get/set API key (persisted to IndexedDB)
 * - Get/set theme preference (persisted to IndexedDB)
 * - Sync settings between IndexedDB and Zustand store
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSetting, setSetting, deleteSetting, getAllSettings } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import type { Theme } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const SETTINGS_KEYS = {
  API_KEY: 'gemini_api_key',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
} as const;

// ============================================================================
// Types
// ============================================================================

interface UseSettingsReturn {
  /** Current API key (null if not set) */
  apiKey: string | null;
  /** Current theme */
  theme: Theme;
  /** Whether settings are loading */
  isLoading: boolean;
  /** Whether the sidebar is collapsed */
  sidebarCollapsed: boolean;
  /** Set the API key (pass null to remove) */
  setApiKey: (key: string | null) => Promise<void>;
  /** Set the theme */
  setTheme: (theme: Theme) => Promise<void>;
  /** Set sidebar collapsed state */
  setSidebarCollapsed: (collapsed: boolean) => Promise<void>;
  /** Check if API key is valid (non-empty and properly formatted) */
  isApiKeyValid: boolean;
  /** Clear all settings */
  clearSettings: () => Promise<void>;
  /** Export settings as JSON */
  exportSettings: () => Promise<string>;
  /** Import settings from JSON */
  importSettings: (json: string) => Promise<void>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSettings(): UseSettingsReturn {
  const {
    apiKey: storeApiKey,
    theme: storeTheme,
    sidebarCollapsed: storeSidebarCollapsed,
    setApiKey: setStoreApiKey,
    setTheme: setStoreTheme,
    setSidebarCollapsed: setStoreSidebarCollapsed,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  /**
   * Live query to watch settings changes in IndexedDB
   * This ensures we sync if settings are changed from another tab
   */
  const dbSettings = useLiveQuery(async () => {
    const settings = await db.settings.toArray();
    return settings.reduce(
      (acc, { key, value }) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );
  });

  /**
   * Initialize settings from IndexedDB on mount
   */
  useEffect(() => {
    if (isInitialized.current) return;

    const initializeSettings = async () => {
      try {
        // Load API key
        const savedApiKey = await getSetting<string>(SETTINGS_KEYS.API_KEY);
        if (savedApiKey) {
          setStoreApiKey(savedApiKey);
        }

        // Load theme
        const savedTheme = await getSetting<Theme>(SETTINGS_KEYS.THEME);
        if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
          setStoreTheme(savedTheme);
        } else {
          // Default to system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setStoreTheme(prefersDark ? 'dark' : 'light');
        }

        // Load sidebar state
        const savedSidebarCollapsed = await getSetting<boolean>(SETTINGS_KEYS.SIDEBAR_COLLAPSED);
        if (typeof savedSidebarCollapsed === 'boolean') {
          setStoreSidebarCollapsed(savedSidebarCollapsed);
        }

        isInitialized.current = true;
      } catch (error) {
        console.error('Failed to initialize settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSettings();
  }, [setStoreApiKey, setStoreTheme, setStoreSidebarCollapsed]);

  /**
   * Sync IndexedDB changes to store (for cross-tab sync)
   */
  useEffect(() => {
    if (!dbSettings || !isInitialized.current) return;

    // Sync API key
    const dbApiKey = dbSettings[SETTINGS_KEYS.API_KEY];
    if (dbApiKey !== storeApiKey && dbApiKey !== undefined) {
      setStoreApiKey(dbApiKey || null);
    }

    // Sync theme
    const dbTheme = dbSettings[SETTINGS_KEYS.THEME] as Theme | undefined;
    if (dbTheme && dbTheme !== storeTheme && (dbTheme === 'dark' || dbTheme === 'light')) {
      setStoreTheme(dbTheme);
    }

    // Sync sidebar
    const dbSidebar = dbSettings[SETTINGS_KEYS.SIDEBAR_COLLAPSED];
    if (dbSidebar !== undefined) {
      const collapsed = dbSidebar === 'true';
      if (collapsed !== storeSidebarCollapsed) {
        setStoreSidebarCollapsed(collapsed);
      }
    }
  }, [dbSettings, storeApiKey, storeTheme, storeSidebarCollapsed, setStoreApiKey, setStoreTheme, setStoreSidebarCollapsed]);

  /**
   * Set API key (persisted to IndexedDB and store)
   */
  const setApiKey = useCallback(
    async (key: string | null): Promise<void> => {
      try {
        if (key) {
          await setSetting(SETTINGS_KEYS.API_KEY, key);
        } else {
          await deleteSetting(SETTINGS_KEYS.API_KEY);
        }
        setStoreApiKey(key);
      } catch (error) {
        console.error('Failed to set API key:', error);
        throw error;
      }
    },
    [setStoreApiKey]
  );

  /**
   * Set theme (persisted to IndexedDB and store)
   */
  const setTheme = useCallback(
    async (theme: Theme): Promise<void> => {
      try {
        await setSetting(SETTINGS_KEYS.THEME, theme);
        setStoreTheme(theme);
      } catch (error) {
        console.error('Failed to set theme:', error);
        throw error;
      }
    },
    [setStoreTheme]
  );

  /**
   * Set sidebar collapsed state (persisted to IndexedDB and store)
   */
  const setSidebarCollapsed = useCallback(
    async (collapsed: boolean): Promise<void> => {
      try {
        await setSetting(SETTINGS_KEYS.SIDEBAR_COLLAPSED, collapsed.toString());
        setStoreSidebarCollapsed(collapsed);
      } catch (error) {
        console.error('Failed to set sidebar state:', error);
        throw error;
      }
    },
    [setStoreSidebarCollapsed]
  );

  /**
   * Check if API key is valid
   */
  const isApiKeyValid = Boolean(
    storeApiKey &&
      storeApiKey.length > 0 &&
      // Basic validation for Gemini API key format (starts with AI...)
      (storeApiKey.startsWith('AI') || storeApiKey.length >= 20)
  );

  /**
   * Clear all settings
   */
  const clearSettings = useCallback(async (): Promise<void> => {
    try {
      await db.settings.clear();
      setStoreApiKey(null);
      setStoreTheme('dark');
      setStoreSidebarCollapsed(false);
    } catch (error) {
      console.error('Failed to clear settings:', error);
      throw error;
    }
  }, [setStoreApiKey, setStoreTheme, setStoreSidebarCollapsed]);

  /**
   * Export settings as JSON string
   */
  const exportSettings = useCallback(async (): Promise<string> => {
    try {
      const settings = await getAllSettings();
      // Remove sensitive data from export (API key)
      const safeSettings = { ...settings };
      delete safeSettings[SETTINGS_KEYS.API_KEY];
      return JSON.stringify(safeSettings, null, 2);
    } catch (error) {
      console.error('Failed to export settings:', error);
      throw error;
    }
  }, []);

  /**
   * Import settings from JSON string
   */
  const importSettings = useCallback(
    async (json: string): Promise<void> => {
      try {
        const settings = JSON.parse(json) as Record<string, unknown>;

        // Import theme if valid
        if (settings[SETTINGS_KEYS.THEME] === 'dark' || settings[SETTINGS_KEYS.THEME] === 'light') {
          await setTheme(settings[SETTINGS_KEYS.THEME] as Theme);
        }

        // Import sidebar state if valid
        const sidebarValue = settings[SETTINGS_KEYS.SIDEBAR_COLLAPSED];
        if (typeof sidebarValue === 'boolean') {
          await setSidebarCollapsed(sidebarValue);
        }
      } catch (error) {
        console.error('Failed to import settings:', error);
        throw error;
      }
    },
    [setTheme, setSidebarCollapsed]
  );

  return {
    apiKey: storeApiKey,
    theme: storeTheme,
    isLoading,
    sidebarCollapsed: storeSidebarCollapsed,
    setApiKey,
    setTheme,
    setSidebarCollapsed,
    isApiKeyValid,
    clearSettings,
    exportSettings,
    importSettings,
  };
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for just API key management
 */
export function useApiKey(): {
  apiKey: string | null;
  setApiKey: (key: string | null) => Promise<void>;
  isValid: boolean;
  isLoading: boolean;
} {
  const { apiKey, setApiKey, isApiKeyValid, isLoading } = useSettings();

  return {
    apiKey,
    setApiKey,
    isValid: isApiKeyValid,
    isLoading,
  };
}

/**
 * Hook for just theme management
 */
export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
  isDark: boolean;
} {
  const { theme, setTheme } = useSettings();

  const toggleTheme = useCallback(async () => {
    await setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}

/**
 * Hook to initialize theme on app load (call once at app root)
 */
export function useThemeInitializer(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initTheme = async () => {
      try {
        const savedTheme = await getSetting<Theme>(SETTINGS_KEYS.THEME);
        const theme = savedTheme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        // Apply theme to document
        document.documentElement.classList.toggle('dark', theme === 'dark');
      } catch (error) {
        console.error('Failed to initialize theme:', error);
        // Default to dark on error
        document.documentElement.classList.add('dark');
      } finally {
        setIsReady(true);
      }
    };

    initTheme();
  }, []);

  return isReady;
}

/**
 * Hook to listen for system theme changes
 */
export function useSystemThemeListener(followSystem: boolean = false): void {
  const { setTheme } = useSettings();

  useEffect(() => {
    if (!followSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [followSystem, setTheme]);
}
