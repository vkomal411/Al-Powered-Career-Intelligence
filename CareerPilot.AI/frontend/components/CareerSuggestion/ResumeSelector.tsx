import React from "react";
import { ResumeHistory } from "../../lib/api";

interface ResumeSelectorProps {
  resumes: ResumeHistory[];
  selectedResumeId?: string;
  onSelectResume: (resumeId: string) => void;
  onOpenUpload: () => void;
  onOpenPreferences: () => void;
  hasCustomPreferences?: boolean;
  onRefresh: () => void;
  loading?: boolean;
}

export default function ResumeSelector({
  resumes,
  selectedResumeId,
  onSelectResume,
  onOpenUpload,
  onOpenPreferences,
  hasCustomPreferences = false,
  onRefresh,
  loading = false,
}: ResumeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xs text-xs">
      {/* Active Resume Selection */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Resume:</span>
        {resumes.length === 0 ? (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 italic">No resume on file</span>
        ) : (
          <select
            value={selectedResumeId || ""}
            disabled={loading}
            onChange={(e) => onSelectResume(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none max-w-xs cursor-pointer"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.original_filename} (ATS: {r.ats_score || "N/A"})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenUpload}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors border border-transparent dark:border-white/[0.06]"
        >
          <span>📤</span>
          <span>Upload New</span>
        </button>

        <button
          type="button"
          onClick={onOpenPreferences}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-colors ${
            hasCustomPreferences
              ? "bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300"
              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          <span>⚙️</span>
          <span>Preferences</span>
          {hasCustomPreferences && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Refresh Analysis"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
