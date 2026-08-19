import React, { useState } from "react";
import { DownloadIcon, FileIcon, ReplaceIcon, SparkleIcon, CheckCircleIcon, TrashIcon } from "./icons";
import { ResumeHistory } from "../lib/api";

interface ResumeHistoryCardProps {
  resumes: ResumeHistory[];
  loading: boolean;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload?: (id: string, filename: string) => void;
  onReplace?: (id: string) => void;
  onCompare?: () => void;
  activeResumeId?: string;
  title?: string;
  description?: string;
  emptyStateMessage?: string;
  badgeMode?: "ats" | "skills";
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/25";
  if (score >= 50) return "text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/25";
  return "text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/25";
}

export default function ResumeHistoryCard({
  resumes,
  loading,
  onView,
  onDelete,
  onDownload,
  onReplace,
  onCompare,
  activeResumeId,
  title = "Resume History & Version Control",
  description = "Select, manage, or compare uploaded resumes to run dedicated Skill Gap Analysis.",
  emptyStateMessage = "Your analyzed resumes will appear here.",
  badgeMode = "skills",
}: ResumeHistoryCardProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResumes = resumes.filter((r) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const matchesName = r.original_filename.toLowerCase().includes(q);
    const matchesSkills = r.extracted_skills?.some((s) => s.toLowerCase().includes(q));
    return matchesName || matchesSkills;
  });

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111726] p-6 shadow-sm space-y-4 animate-fade-in">
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">{title}</h3>
            {resumes.length > 0 && (
              <span className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/25">
                {resumes.length} {resumes.length === 1 ? "Version" : "Versions"}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>

        {badgeMode === "skills" && resumes.length > 1 && onCompare && (
          <button
            type="button"
            onClick={onCompare}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-500/15 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 hover:border-indigo-300 transition-all shadow-2xs"
          >
            <SparkleIcon className="h-3.5 w-3.5" />
            <span>Compare Resumes</span>
          </button>
        )}
      </div>

      {/* Search Input Filter */}
      {resumes.length > 3 && (
        <div className="relative">
          <input
            type="text"
            placeholder="Filter history by filename or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 px-3.5 py-2 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Resumes List */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-2">
            <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 py-8 text-center">
            <SparkleIcon className="h-5 w-5 text-slate-300 dark:text-slate-600" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{emptyStateMessage}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Upload your first resume to get started!</p>
          </div>
        ) : (
          filteredResumes.map((resume) => {
            const isActive = activeResumeId === resume.id;
            const topSkills = resume.extracted_skills?.slice(0, 4) || [];
            const remainingCount = (resume.extracted_skills?.length || 0) - topSkills.length;

            return (
              <div
                key={resume.id}
                className={`group relative rounded-xl border p-3.5 transition-all ${
                  isActive
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/10 shadow-md ring-2 ring-indigo-600/20 dark:ring-indigo-500/30"
                    : "border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-slate-50/70 dark:hover:bg-slate-800 shadow-2xs"
                }`}
              >
                {/* Active Source Tag */}
                {isActive && (
                  <div className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                    <CheckCircleIcon className="h-3 w-3" />
                    <span>ACTIVE SOURCE</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onView(resume.id)}
                    className="focus-ring flex min-w-0 flex-1 items-start gap-3 rounded-lg text-left"
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/25"
                      }`}
                    >
                      <FileIcon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {resume.original_filename}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-400">
                        <span>
                          {new Date(resume.uploaded_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {resume.extracted_skills?.length || 0} Skills Extracted
                        </span>
                      </div>

                      {/* Top Skill Pills Preview */}
                      {badgeMode === "skills" && topSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {topSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/80 dark:border-white/[0.06]"
                            >
                              {s}
                            </span>
                          ))}
                          {remainingCount > 0 && (
                            <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/25">
                              +{remainingCount} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Actions Column */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {badgeMode === "ats" ? (
                      <span className={`px-2 py-0.5 rounded border text-[11px] font-mono ${scoreColor(resume.ats_score ?? 0)}`}>
                        {resume.ats_score ?? 0}% ATS
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onView(resume.id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white"
                        }`}
                      >
                        {isActive ? "Selected" : "Select"}
                      </button>
                    )}

                    {/* Action Icon Buttons */}
                    <div className="flex items-center gap-1">
                      {onDownload && (
                        <button
                          type="button"
                          title="Download PDF/DOCX"
                          onClick={() => onDownload(resume.id, resume.original_filename)}
                          className="focus-ring rounded-lg p-1 text-slate-400 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400"
                          aria-label="Download resume"
                        >
                          <DownloadIcon className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {onReplace && (
                        <button
                          type="button"
                          title="Replace resume file"
                          onClick={() => onReplace(resume.id)}
                          className="focus-ring rounded-lg p-1 text-slate-400 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400"
                          aria-label="Replace resume"
                        >
                          <ReplaceIcon className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Delete resume"
                        onClick={() => onDelete(resume.id)}
                        className="focus-ring rounded-lg p-1 text-slate-400 dark:text-slate-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400"
                        aria-label="Delete resume"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
