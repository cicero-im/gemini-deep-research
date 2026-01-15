"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar, NavbarSpacer } from "@/components/layout/Navbar";
import {
  SettingsNav,
  useSettingsNavigation,
} from "@/components/settings/SettingsNav";
import { ApiSettings } from "@/components/settings/ApiSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { StorageSettings } from "@/components/settings/StorageSettings";
import { FileStoresSettings } from "@/components/settings/FileStoresSettings";
import { AboutSection } from "@/components/settings/AboutSection";
import { Particles, StarsBackground } from "@/components/ui/meteors";

// Toast icons
const CheckIcon = () => (
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
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const XIcon = () => (
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
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

/**
 * Settings Page - Central configuration hub
 *
 * Features:
 * - SettingsNav sidebar (or tabs on mobile)
 * - All settings sections
 * - Toast notifications for actions
 * - Smooth section navigation
 */
export default function SettingsPage() {
  const { activeSection, navigateToSection } = useSettingsNavigation();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSave = useCallback(() => {
    showToast("Settings saved successfully", "success");
  }, [showToast]);

  return (
    <>
      <Navbar />

      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <StarsBackground number={30} twinkle />
        <Particles number={15} speed={10} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen">
        <NavbarSpacer />

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="mt-2 text-white/50">
              Configure your API, preferences, and data management
            </p>
          </motion.div>

          {/* Settings Layout */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Navigation Sidebar */}
            <SettingsNav
              activeSection={activeSection}
              onSectionChange={navigateToSection}
            />

            {/* Settings Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 space-y-8"
            >
              <ApiSettings onSave={handleSave} />
              <AppearanceSettings onSave={handleSave} />
              <StorageSettings onNotify={showToast} />
              <FileStoresSettings onNotify={showToast} />
              <AboutSection />

              {/* Footer Spacing */}
              <div className="h-16" />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-xl ${
                toast.type === "success"
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            >
              {toast.type === "success" ? <CheckIcon /> : <XIcon />}
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="ml-2 rounded-lg p-1 transition-colors hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
