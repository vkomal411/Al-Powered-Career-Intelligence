import React from "react";

interface CareerScoreProps {
  score: number;
  matchLevel: string;
  size?: "sm" | "md" | "lg";
}

export default function CareerScore({ score, matchLevel, size = "md" }: CareerScoreProps) {
  const roundedScore = Math.round(score);

  const getTheme = (val: number) => {
    if (val >= 80) {
      return {
        badge: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/25",
        pill: "bg-emerald-500 text-white",
        text: "text-emerald-700 dark:text-emerald-300",
      };
    }
    if (val >= 65) {
      return {
        badge: "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-500/25",
        pill: "bg-indigo-600 text-white",
        text: "text-indigo-700 dark:text-indigo-300",
      };
    }
    if (val >= 50) {
      return {
        badge: "bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/25",
        pill: "bg-amber-500 text-white",
        text: "text-amber-700 dark:text-amber-300",
      };
    }
    return {
      badge: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      pill: "bg-slate-500 text-white",
      text: "text-slate-600 dark:text-slate-400",
    };
  };

  const theme = getTheme(roundedScore);

  if (size === "sm") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${theme.badge}`}>
        <span>{roundedScore}% Match</span>
        <span className="opacity-60">• {matchLevel}</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border ${theme.badge} shadow-2xs`}>
      <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold ${theme.pill}`}>
        {roundedScore}%
      </span>
      <div className="flex flex-col text-left">
        <span className="text-xs font-bold leading-tight">{matchLevel}</span>
        <span className="text-[10px] opacity-70 font-medium leading-none">Match Fit</span>
      </div>
    </div>
  );
}
