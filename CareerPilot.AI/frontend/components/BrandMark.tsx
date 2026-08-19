import React from "react";

interface BrandMarkProps {
  variant?: "light" | "dark";
  subtitle?: string;
}

export default function BrandMark({ variant = "dark", subtitle }: BrandMarkProps) {
  const isLight = variant === "light";
  return (
    <div className="flex items-center gap-3 select-none group">
      {/* Humanized Career Compass & Guiding Spark Emblem */}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-md shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-105">
        {/* Soft Ambient Inner Glow */}
        <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor">
          {/* Gentle Ascending Human Path */}
          <path
            d="M5 19.5c2.5-3 4-6 4-10.5M19 19.5c-2.5-3-4-6-4-10.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="opacity-70"
          />
          {/* Luminous Central Upward Career Arrow / Compass Pin */}
          <path
            d="M12 4.5l-3.2 7.5L12 10.5l3.2 1.5L12 4.5Z"
            fill="currentColor"
            strokeWidth="0.5"
          />
          {/* Guiding Spark of Intelligence */}
          <circle cx="12" cy="3.5" r="1.5" fill="#FDE047" className="animate-pulse" />
          {/* Base Foundation Ground Curve */}
          <path
            d="M4 19.5h16"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div>
        <p
          className={`font-display text-lg font-bold leading-none tracking-tight ${
            isLight ? "text-white" : "text-slate-900 dark:text-white"
          }`}
        >
          CareerPilot<span className="text-indigo-600 dark:text-indigo-400">.</span>AI
        </p>
        {subtitle && (
          <p className={`mt-1 text-xs font-medium ${isLight ? "text-white/70" : "text-slate-500 dark:text-slate-400"}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
