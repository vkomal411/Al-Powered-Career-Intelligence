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

        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
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
