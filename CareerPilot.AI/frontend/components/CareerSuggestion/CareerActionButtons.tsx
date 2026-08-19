import React from "react";
import Link from "next/link";
import { RoadmapIcon, GapAnalysisIcon, JobIcon } from "../icons";

interface CareerActionButtonsProps {
  careerTitle: string;
  careerId: string;
  onSetTargetRole?: (role: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function CareerActionButtons({
  careerTitle,
  careerId,
  onSetTargetRole,
  isExpanded,
  onToggleExpand,
}: CareerActionButtonsProps) {
  const encodedRole = encodeURIComponent(careerTitle);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        {/* Primary Action: View Roadmap */}
        <Link
          href={`/career-tools/career-roadmap?role=${encodedRole}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-2xs"
        >
          <RoadmapIcon className="w-3.5 h-3.5" />
          <span>View Roadmap</span>
        </Link>

        {/* Skill Gap Analysis */}
        <Link
          href={`/resume-tools/gap-analysis?role=${encodedRole}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
        >
          <GapAnalysisIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Skill Gaps</span>
        </Link>

        {/* Matched Jobs */}
        <Link
          href={`/career-tools/job-recommendation?role=${encodedRole}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
        >
          <JobIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Jobs</span>
        </Link>

        {/* Toggle Details */}
        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 font-bold transition-colors"
          >
            <span>{isExpanded ? "Hide Details" : "Why You Fit"}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Set as Target Role button */}
      {onSetTargetRole && (
        <button
          type="button"
          onClick={() => onSetTargetRole(careerTitle)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 font-medium transition-colors ml-auto sm:ml-0"
          title={`Set ${careerTitle} as your target role`}
        >
          <span>🎯 Set as Target</span>
        </button>
      )}
    </div>
  );
}
