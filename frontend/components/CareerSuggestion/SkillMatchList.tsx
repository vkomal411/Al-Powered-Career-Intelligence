import React, { useState } from "react";

interface SkillMatchListProps {
  matchingSkills: string[];
  missingSkills: string[];
}

export default function SkillMatchList({ matchingSkills, missingSkills }: SkillMatchListProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedMatching = showAll ? matchingSkills : matchingSkills.slice(0, 4);
  const displayedMissing = showAll ? missingSkills : missingSkills.slice(0, 3);
  const totalHidden = Math.max(0, matchingSkills.length - 4) + Math.max(0, missingSkills.length - 3);

  return (
    <div className="space-y-2 pt-1 text-xs">
      {/* Matching Skills row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 min-w-[70px]">You Have:</span>
        {matchingSkills.length === 0 ? (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">General foundation</span>
        ) : (
          displayedMatching.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-100 dark:border-emerald-500/25"
            >
              <span className="text-emerald-500">✓</span>
              <span>{skill}</span>
            </span>
          ))
        )}
      </div>

      {/* Missing Skills row */}
      {missingSkills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 min-w-[70px]">To Learn:</span>
          {displayedMissing.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50/80 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[11px] font-semibold border border-amber-200/60 dark:border-amber-500/25"
            >
              <span className="text-amber-500">+</span>
              <span>{skill}</span>
            </span>
          ))}

          {totalHidden > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors ml-1"
            >
              {showAll ? "Show less" : `+${totalHidden} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
