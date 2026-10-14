import React from "react";
import { MarketInfoSchema } from "../../lib/api";

interface MarketInfoProps {
  marketInfo: MarketInfoSchema;
  transitionDifficulty: string;
}

export default function MarketInfo({ marketInfo, transitionDifficulty }: MarketInfoProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "low":
        return "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200/80 dark:border-emerald-500/25";
      case "moderate":
        return "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border-amber-200/80 dark:border-amber-500/25";
      case "high":
        return "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/15 border-rose-200/80 dark:border-rose-500/25";
      default:
        return "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
      {/* Salary Pill */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200/60 dark:border-white/[0.08]">
        <span>💰</span>
        <span>{marketInfo.salary_display || "₹6.0L – ₹14.0L"}</span>
      </span>

      {/* Market Demand Pill */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-500/25">
        <span>📈</span>
        <span>{marketInfo.market_demand} Demand</span>
      </span>

      {/* Transition Effort Pill */}
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold border ${getDifficultyColor(transitionDifficulty)}`}>
        <span>⚡</span>
        <span>{transitionDifficulty} Effort</span>
      </span>
    </div>
  );
}
