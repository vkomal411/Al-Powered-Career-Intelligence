import React from "react";
import type { SavedJobResponse, JobRecommendationItem } from "../lib/api";

interface SavedJobsListProps {
  savedJobs: SavedJobResponse[];
  loading: boolean;
  onRemoveBookmark: (jobId: string) => void;
  onSelectJob?: (jobData: JobRecommendationItem) => void;
}


export default function SavedJobsList({
  savedJobs,
  loading,
  onRemoveBookmark,
  onSelectJob,
}: SavedJobsListProps) {
  if (loading) {
    return (
      <div className="p-8 text-center space-y-3 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
        <div className="h-4 w-64 bg-slate-100 rounded mx-auto" />
      </div>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
          ★
        </div>
        <h3 className="font-display font-bold text-slate-800 text-base">No Saved Jobs Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Bookmark jobs from your AI Job Recommendations feed to save them here for quick access and tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-slate-900 text-sm">
          Saved Job Bookmarks ({savedJobs.length})
        </h3>
        <span className="text-xs text-slate-400">
          Saved in your candidate intelligence profile
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedJobs.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    {item.company}
                  </span>
                  <h4 className="font-display font-bold text-slate-900 text-base leading-snug">
                    {item.job_title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveBookmark(item.job_id)}
                  className="text-amber-500 hover:text-red-500 transition-colors p-1"
                  title="Remove bookmark"
                >
                  ★
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">📍 {item.location}</span>
                {item.work_type && <span className="bg-slate-100 px-2.5 py-1 rounded-lg">{item.work_type}</span>}
                {item.salary_range && (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold px-2.5 py-1 rounded-lg">
                    💰 {item.salary_range}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Saved {new Date(item.saved_at).toLocaleDateString()}
              </span>

              {onSelectJob && item.job_data && (
                <button
                  type="button"
                  onClick={() => onSelectJob(item.job_data as unknown as JobRecommendationItem)}
                  className="text-xs font-bold text-primary hover:text-primary-dark hover:underline transition-colors"
                >
                  View Details →
                </button>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
