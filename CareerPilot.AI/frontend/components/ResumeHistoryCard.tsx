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
  if (score >= 80) return "text-emerald-600 font-bold bg-emerald-50 border-emerald-200";
  if (score >= 50) return "text-amber-600 font-bold bg-amber-50 border-amber-200";
  return "text-rose-600 font-bold bg-rose-50 border-rose-200";
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 animate-fade-in">
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-slate-900">{title}</h3>
            {resumes.length > 0 && (
              <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                {resumes.length} {resumes.length === 1 ? "Version" : "Versions"}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>

        {badgeMode === "skills" && resumes.length > 1 && onCompare && (
          <button
            type="button"
            onClick={onCompare}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-2xs"
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
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
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
            <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-8 text-center">
            <SparkleIcon className="h-5 w-5 text-slate-300" />
            <p className="text-xs text-slate-500 font-medium">{emptyStateMessage}</p>
            <p className="text-[11px] text-slate-400">Upload your first resume to get started!</p>
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
                    ? "border-indigo-600 bg-indigo-50/30 shadow-md ring-2 ring-indigo-600/20"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/70 shadow-2xs"
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
                          : "bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:bg-indigo-100"
                      }`}
                    >
                      <FileIcon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {resume.original_filename}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>
                          {new Date(resume.uploaded_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600">
                          {resume.extracted_skills?.length || 0} Skills Extracted
                        </span>
                      </div>

                      {/* Top Skill Pills Preview */}
                      {badgeMode === "skills" && topSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {topSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80"
                            >
                              {s}
                            </span>
                          ))}
                          {remainingCount > 0 && (
                            <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
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
                            : "bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white"
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
                          className="focus-ring rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
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
                          className="focus-ring rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                          aria-label="Replace resume"
                        >
                          <ReplaceIcon className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Delete resume"
                        onClick={() => onDelete(resume.id)}
                        className="focus-ring rounded-lg p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
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
