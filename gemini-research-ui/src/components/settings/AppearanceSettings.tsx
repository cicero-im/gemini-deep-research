"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme, useSystemThemeListener } from "@/hooks/useSettings";

// Icons
const SunIcon = () => (
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
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
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
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const MonitorIcon = () => (
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
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

const PaletteIcon = () => (
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
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

type ThemeOption = "dark" | "light" | "system";
type AnimationIntensity = "off" | "subtle" | "full";

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
  { value: "dark", label: "Dark", icon: <MoonIcon /> },
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "system", label: "System", icon: <MonitorIcon /> },
];

const ACCENT_COLORS = [
  { id: "violet", color: "#8b5cf6", label: "Violet" },
  { id: "cyan", color: "#06b6d4", label: "Cyan" },
  { id: "emerald", color: "#10b981", label: "Emerald" },
  { id: "amber", color: "#f59e0b", label: "Amber" },
  { id: "rose", color: "#f43f5e", label: "Rose" },
  { id: "blue", color: "#3b82f6", label: "Blue" },
];

const ANIMATION_OPTIONS: { value: AnimationIntensity; label: string; description: string }[] = [
  { value: "off", label: "Off", description: "Disable all animations" },
  { value: "subtle", label: "Subtle", description: "Reduced motion effects" },
  { value: "full", label: "Full", description: "All animations enabled" },
];

interface AppearanceSettingsProps {
  onSave?: () => void;
}

/**
 * AppearanceSettings - Theme and visual customization
 *
 * Features:
 * - Theme toggle: Dark / Light / System
 * - Accent color picker (preset colors)
 * - Animation intensity slider
 * - Live preview panel
 */
export function AppearanceSettings({ onSave }: AppearanceSettingsProps) {
  const { theme, setTheme, isDark } = useTheme();
  const [themeOption, setThemeOption] = useState<ThemeOption>(theme === "dark" ? "dark" : "light");
  const [followSystem, setFollowSystem] = useState(false);
  const [accentColor, setAccentColor] = useState("violet");
  const [animationIntensity, setAnimationIntensity] = useState<AnimationIntensity>("full");

  // Listen for system theme changes when "system" is selected
  useSystemThemeListener(followSystem);

  const handleThemeChange = useCallback(async (option: ThemeOption) => {
    setThemeOption(option);

    if (option === "system") {
      setFollowSystem(true);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      await setTheme(prefersDark ? "dark" : "light");
    } else {
      setFollowSystem(false);
      await setTheme(option);
    }
    onSave?.();
  }, [setTheme, onSave]);

  const handleAccentChange = useCallback((colorId: string) => {
    setAccentColor(colorId);
    // In a full implementation, this would update CSS variables
    onSave?.();
  }, [onSave]);

  const handleAnimationChange = useCallback((intensity: AnimationIntensity) => {
    setAnimationIntensity(intensity);
    // In a full implementation, this would toggle animation classes
    onSave?.();
  }, [onSave]);

  return (
    <section id="appearance" className="scroll-mt-24">
      <div className="rounded-2xl border border-white/10 bg-[#12121a]/80 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 p-2.5">
              <PaletteIcon />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Appearance</h2>
              <p className="text-sm text-white/50">Customize the look and feel of the application</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Theme Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white/80">
              Theme
            </label>
            <div className="flex flex-wrap gap-3">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl border px-5 py-3 transition-all",
                    themeOption === option.value
                      ? "border-violet-500/50 bg-violet-500/10 text-white"
                      : "border-white/10 bg-[#0a0a0f] text-white/60 hover:border-white/20 hover:text-white"
                  )}
                >
                  {themeOption === option.value && (
                    <motion.div
                      layoutId="theme-indicator"
                      className="absolute inset-0 rounded-xl border-2 border-violet-500"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{option.icon}</span>
                  <span className="relative z-10 font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white/80">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map((colorOption) => (
                <button
                  key={colorOption.id}
                  onClick={() => handleAccentChange(colorOption.id)}
                  className={cn(
                    "relative group rounded-xl p-1 transition-all",
                    accentColor === colorOption.id && "ring-2 ring-white/50"
                  )}
                  title={colorOption.label}
                >
                  <motion.div
                    className="w-10 h-10 rounded-lg"
                    style={{ backgroundColor: colorOption.color }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                  {accentColor === colorOption.id && (
                    <motion.div
                      layoutId="accent-check"
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-black"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Intensity */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white/80">
              Animation Intensity
            </label>
            <div className="grid gap-2">
              {ANIMATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnimationChange(option.value)}
                  className={cn(
                    "relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all",
                    animationIntensity === option.value
                      ? "border-violet-500/50 bg-violet-500/5"
                      : "border-white/10 bg-[#0a0a0f] hover:border-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                      animationIntensity === option.value
                        ? "border-violet-500 bg-violet-500"
                        : "border-white/30"
                    )}
                  >
                    {animationIntensity === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-1.5 h-1.5 rounded-full bg-white"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{option.label}</p>
                    <p className="text-sm text-white/50">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white/80">
              Preview
            </label>
            <div className="rounded-xl border border-white/10 bg-[#0a0a0f] p-6 overflow-hidden">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${
                      ACCENT_COLORS.find((c) => c.id === accentColor)?.color ?? "#8b5cf6"
                    }, #06b6d4)`,
                  }}
                />
                <div>
                  <p className="font-semibold text-white">Sample Research</p>
                  <p className="text-sm text-white/50">Preview of theme settings</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div
                  className="h-2 flex-1 rounded-full"
                  style={{
                    backgroundColor: ACCENT_COLORS.find((c) => c.id === accentColor)?.color ?? "#8b5cf6",
                    opacity: 0.5,
                  }}
                />
                <div
                  className="h-2 w-1/4 rounded-full"
                  style={{
                    backgroundColor: ACCENT_COLORS.find((c) => c.id === accentColor)?.color ?? "#8b5cf6",
                    opacity: 0.3,
                  }}
                />
              </div>
              {animationIntensity !== "off" && (
                <motion.div
                  className="mt-4 h-1 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scaleX: [0.95, 1, 0.95],
                  }}
                  transition={{
                    duration: animationIntensity === "subtle" ? 3 : 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
