import React, { useState, useEffect, useRef } from "react";
import { useTheme, ThemeMode } from "../context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, isDark, systemTheme, setTheme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const handleSelectMode = (mode: ThemeMode) => {
    setTheme(mode);
    setMenuOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative inline-flex items-center">
      {/* Primary Toggle Action Button */}
      <button
        type="button"
        role="button"
        onClick={toggleTheme}
        aria-label={
          isDark
            ? "Switch to light theme (Currently Dark)"
            : "Switch to dark theme (Currently Light)"
        }
        aria-pressed={isDark}
        title={
          theme === "system"
            ? `System Auto (${systemTheme === "dark" ? "Dark Active" : "Light Active"}) — Click to toggle`
            : isDark
            ? "Dark Mode — Click to switch to Light"
            : "Light Mode — Click to switch to Dark"
        }
        className={`group relative inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-200 focus-ring cursor-pointer select-none ${
          isDark
            ? "bg-slate-900/90 border-slate-700/80 text-amber-300 hover:bg-slate-800 hover:border-slate-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            : "bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-2xs"
        } ${className}`}
      >
        {/* Humanized Icon Container with smooth spring transition */}
        <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
          {/* Friendly Sun Icon for Light Mode */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
              isDark
                ? "opacity-0 scale-50 -rotate-90 pointer-events-none"
                : "opacity-100 scale-100 rotate-0"
            }`}
          >
            <svg
              className="w-4 h-4 text-amber-500 group-hover:text-amber-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Luminous Sun Center */}
              <circle cx="12" cy="12" r="4.5" fill="currentColor" fillOpacity="0.2" strokeWidth="1.75" />
              {/* Warm Gentle Organic Sun Rays */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 2.5v2.2m0 14.6v2.2m9.5-9.5h-2.2M4.7 12H2.5m16.26-6.76l-1.56 1.56M6.8 17.2l-1.56 1.56m14.26 0l-1.56-1.56M6.8 6.8L5.24 5.24"
              />
            </svg>
          </div>

          {/* Friendly Crescent Moon with Companion Star for Dark Mode */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
              isDark
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-50 rotate-90 pointer-events-none"
            }`}
          >
            <svg
              className="w-4 h-4 text-amber-300 drop-shadow-[0_0_4px_rgba(252,211,77,0.45)] group-hover:rotate-12 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Organic Crescent Moon Curve */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                fill="currentColor"
                fillOpacity="0.25"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
              {/* Tiny Companion Sparkle Star */}
              <circle cx="17" cy="6" r="1" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Optional Label / Indicator */}
        {showLabel ? (
          <span
            className={`text-xs font-semibold tracking-wide transition-colors duration-150 ${
              isDark
                ? "text-slate-300 group-hover:text-white"
                : "text-slate-700 group-hover:text-slate-900"
            }`}
          >
            {theme === "system" ? "Auto" : isDark ? "Dark" : "Light"}
          </span>
        ) : theme === "system" ? (
          <span
            className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0 shadow-sm"
            title="System theme auto-adaptation active"
          />
        ) : null}
      </button>

      {/* Options Trigger Chevron Button */}
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Theme mode options"
        aria-haspopup="true"
        aria-expanded={menuOpen}
        title="Choose theme (Light / Dark / System Auto)"
        className={`ml-1 p-1 rounded-lg border transition-all duration-150 ${
          isDark
            ? "border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
        }`}
      >
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Options for Light / Dark / System Auto with Humanized SVG Icons */}
      {menuOpen && (
        <div
          className={`absolute right-0 top-full mt-1.5 w-44 rounded-2xl border shadow-xl p-1.5 z-50 animate-fade-in backdrop-blur-xl ${
            isDark
              ? "bg-[#111726]/95 border-white/[0.1] shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
              : "bg-white/95 border-slate-200 shadow-xl"
          }`}
        >
          <button
            type="button"
            onClick={() => handleSelectMode("light")}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              theme === "light"
                ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
                  <path strokeLinecap="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m17.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m14.14 0l-1.41-1.41M6.34 6.34L4.93 4.93" />
                </svg>
              </span>
              <span>Light Mode</span>
            </span>
            {theme === "light" && <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>}
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode("dark")}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              theme === "dark"
                ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-400 dark:text-amber-300 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" fillOpacity="0.3" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </span>
              <span>Dark Mode</span>
            </span>
            {theme === "dark" && <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>}
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode("system")}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              theme === "system"
                ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2.5" />
                  <path strokeLinecap="round" d="M8 21h8m-4-4v4" />
                </svg>
              </span>
              <span>System Auto</span>
            </span>
            {theme === "system" && <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
