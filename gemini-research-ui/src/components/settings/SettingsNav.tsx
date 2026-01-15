"use client";

import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Icons
const KeyIcon = () => (
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
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const PaletteIcon = () => (
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
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

const DatabaseIcon = () => (
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
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);

const FolderIcon = () => (
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
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
);

const InfoIcon = () => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sections: NavSection[] = [
  { id: "api", label: "API", icon: <KeyIcon /> },
  { id: "appearance", label: "Appearance", icon: <PaletteIcon /> },
  { id: "storage", label: "Storage", icon: <DatabaseIcon /> },
  { id: "file-stores", label: "File Stores", icon: <FolderIcon /> },
  { id: "about", label: "About", icon: <InfoIcon /> },
];

interface SettingsNavProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  className?: string;
}

/**
 * SettingsNav - Sidebar navigation for settings page
 *
 * Features:
 * - Sections with icons
 * - Active section indicator with animation
 * - Sticky on desktop
 * - Horizontal scroll on mobile (tabs)
 */
export function SettingsNav({
  activeSection,
  onSectionChange,
  className,
}: SettingsNavProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className={cn(
          "hidden md:block sticky top-20 h-fit w-56 shrink-0",
          className
        )}
      >
        <div className="rounded-2xl border border-white/10 bg-[#12121a]/80 backdrop-blur-xl p-3">
          <div className="space-y-1">
            {sections.map((section) => (
              <NavItem
                key={section.id}
                section={section}
                isActive={activeSection === section.id}
                onClick={() => onSectionChange(section.id)}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Tabs */}
      <div className="md:hidden sticky top-16 z-40 -mx-4 px-4 py-3 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-1">
          {sections.map((section) => (
            <MobileTab
              key={section.id}
              section={section}
              isActive={activeSection === section.id}
              onClick={() => onSectionChange(section.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

interface NavItemProps {
  section: NavSection;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ section, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
        isActive
          ? "text-white"
          : "text-white/50 hover:text-white/80 hover:bg-white/5"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="settings-nav-active"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/20"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{section.icon}</span>
      <span className="relative z-10">{section.label}</span>
    </button>
  );
}

function MobileTab({ section, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
        isActive
          ? "text-white"
          : "text-white/50 hover:text-white/80"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="settings-tab-active"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/20"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{section.icon}</span>
      <span className="relative z-10">{section.label}</span>
    </button>
  );
}

/**
 * Hook for managing settings navigation with URL hash
 */
export function useSettingsNavigation() {
  const [activeSection, setActiveSection] = useState("api");

  // Initialize from hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && sections.some((s) => s.id === hash)) {
      setActiveSection(hash);
    }
  }, []);

  const navigateToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    window.location.hash = sectionId;

    // Smooth scroll to section
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -100; // Account for sticky nav
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  return {
    activeSection,
    navigateToSection,
  };
}
