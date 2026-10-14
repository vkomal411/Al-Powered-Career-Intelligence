import React, { useState } from "react";
import type { JobRecommendationItem } from "../lib/api";

interface JobDetailModalProps {
  job: JobRecommendationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleBookmark?: (job: JobRecommendationItem) => void;
}

export default function JobDetailModal({
  job,
  isOpen,
  onClose,
  onToggleBookmark,
}: JobDetailModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !job) return null;

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30";
    if (score >= 70) return "bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30";
    return "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700";
  };

  const handleCopyApplyLink = () => {
    if (job.apply_url) {
      navigator.clipboard.writeText(job.apply_url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-[#111726] rounded-2xl shadow-2xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] w-full max-w-3xl overflow-hidden animate-fade-up border border-slate-100 dark:border-white/[0.1] my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-ink via-ink-soft to-slate-900 dark:from-[#0d121f] dark:via-[#111726] dark:to-[#0d121f] px-6 py-5 text-white flex items-center justify-between border-b border-transparent dark:border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary-light border border-primary/30 shadow-xs font-bold text-xl">
              {job.company.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-lg leading-tight">{job.title}</h2>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${getScoreBadgeColor(job.overall_score)}`}>
                  {job.overall_score}% Match
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Opening
                </span>
              </div>
              <p className="text-slate-400 dark:text-slate-400 text-xs mt-0.5">
                {job.company} • {job.location} ({job.work_type})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
            title="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 dark:text-slate-300">
          {/* Key Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/[0.08] rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Salary Range</span>
              <span className="text-sm font-extrabold text-ink dark:text-white">{job.salary_range}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/[0.08] rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Experience</span>
              <span className="text-sm font-bold text-ink dark:text-white">{job.experience_level}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/[0.08] rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Work Type</span>
              <span className="text-sm font-bold text-ink dark:text-white">{job.work_type}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/[0.08] rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Posted</span>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{job.posted_date || "Recently"}</span>
            </div>
          </div>

          {/* AI Match Rationale Box */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-500/20 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>⚡ AI Match Insight</span>
            </h4>
            <p className="text-xs text-indigo-950 dark:text-indigo-200 font-medium leading-relaxed">
              {job.details.match_rationale}
            </p>
          </div>

          {/* Multi-Factor Score Breakdown */}
          <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Multi-Factor Assessment Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Skill Alignment</span>
                  <span className="text-primary dark:text-indigo-400 font-bold">{job.details.skill_score}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary dark:bg-indigo-500 transition-all duration-500" style={{ width: `${job.details.skill_score}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Qualification Match</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{job.details.qualification_score}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${job.details.qualification_score}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Experience Fit</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">{job.details.experience_score}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${job.details.experience_score}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/25 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>✓ Matched Required Skills ({job.details.matched_skills.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {job.details.matched_skills.length > 0 ? (
                  job.details.matched_skills.map((skill, idx) => (
                    <span key={idx} className="bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">No direct keyword overlap detected.</span>
                )}
              </div>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-500/25 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>+ Skill Gaps to Bridge ({job.details.missing_skills.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {job.details.missing_skills.length > 0 ? (
                  job.details.missing_skills.map((skill, idx) => (
                    <span key={idx} className="bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      + {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">All required skills covered!</span>
                )}
              </div>
            </div>
          </div>

          {/* Job Description & Requirements */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">Job Summary & Responsibilities</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] font-normal whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Qualification Specs */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Required Qualification Spec:</span>
            <span className="text-slate-600 dark:text-slate-400">{job.details.required_education}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-white/[0.08] px-6 py-4 flex items-center justify-between">
          {onToggleBookmark && (
            <button
              type="button"
              onClick={() => onToggleBookmark(job)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                job.is_saved
                  ? "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 hover:bg-amber-200 dark:hover:bg-amber-500/30"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <span>{job.is_saved ? "★ Saved Job" : "☆ Save Job"}</span>
            </button>
          )}

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleCopyApplyLink}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {copiedLink ? "Link Copied! ✓" : "Copy Apply URL"}
            </button>

            {job.apply_url ? (
              <a
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center space-x-1.5"
              >
                <span>Apply Now ↗</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
