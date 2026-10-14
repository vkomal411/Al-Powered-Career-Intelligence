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
          <svg className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
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
          <svg className={`w-3.5 h-3.5 ${hasCustomPreferences ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
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
