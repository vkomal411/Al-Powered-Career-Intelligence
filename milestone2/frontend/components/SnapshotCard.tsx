import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "../lib/api";

interface ChecklistItem {
  id: string;
  title: string;
  is_completed: boolean;
  action_tab: string;
  description: string;
}

interface AnalyticsData {
  resume_uploaded: boolean;
  resume_score: {
    score: number;
    label: string;
    explanation: string;
  };
  skill_coverage: {
    matched_count: number;
    total_target_count: number;
    coverage_percentage: number;
    matched_skills: string[];
    missing_skills: string[];
  };
  job_market_fit: {
    average_match_rate: number;
    total_available_matches: number;
  };
  profile_checklist: ChecklistItem[];
  what_to_do_next: {
    summary: string;
    primary_action_title: string;
    primary_action_tab: string;
  };
}

interface SnapshotCardProps {
  onNavigateTab?: (section: string, subtab?: string) => void;
}

export const SnapshotCard: React.FC<SnapshotCardProps> = ({ onNavigateTab }) => {
  if (onNavigateTab) void onNavigateTab;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<AnalyticsData>("/analytics/career-overview");
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not fetch career snapshot.");
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  const handleActionClick = (target: string) => {
    if (target === "profile") {
      router.push("/profile");
    } else if (target === "resume") {
      router.push("/resume-tools/ats-score-analysis");
    } else if (target === "improvements") {
      router.push("/resume-tools/resume-boost");
    } else if (target === "courses") {
      router.push("/career-tools/learning-level-up");
    } else if (target === "jobs") {
      router.push("/career-tools/job-recommendation");
    } else {
      router.push("/profile");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm animate-pulse space-y-6">
        <div className="h-6 w-48 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-100 rounded-2xl"></div>
          <div className="h-32 bg-slate-100 rounded-2xl"></div>
          <div className="h-32 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
        <p className="text-rose-500 text-sm mb-4">{error || "Snapshot unavailable."}</p>
        <button
          onClick={fetchAnalytics}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const completedCount = data.profile_checklist.filter((i) => i.is_completed).length;
  const totalCount = data.profile_checklist.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner: What To Do Next */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-indigo-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-xs font-semibold tracking-wide text-indigo-200 bg-indigo-800/80 px-3 py-1 rounded-full border border-indigo-600/40 inline-flex items-center gap-1.5">
              What To Do Next
            </span>
            <h2 className="text-xl font-bold text-white pt-1">Your Next Best Move</h2>
            <p className="text-sm text-indigo-100 leading-relaxed">
              {data.what_to_do_next.summary}
            </p>
          </div>

          <button
            onClick={() => handleActionClick(data.what_to_do_next.primary_action_tab)}
            className="flex-shrink-0 bg-white text-indigo-950 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] text-xs flex items-center gap-2 self-start md:self-auto"
          >
            {data.what_to_do_next.primary_action_title} →
          </button>
        </div>
      </div>

      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Resume Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Resume Score
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                {data.resume_score.label}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-4xl font-extrabold text-slate-800">
                {data.resume_score.score}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              How clearly your resume communicates your strengths to recruiters.
            </p>
          </div>

          <button
            onClick={() => handleActionClick("improvements")}
            className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100/80 py-2 rounded-xl text-center transition-colors"
          >
            Improve Resume Score ↗
          </button>
        </div>

        {/* 2. Skills You Have vs. Need */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Skills You Have vs. Need
              </span>
              <span className="text-xs font-semibold text-indigo-600">
                {data.skill_coverage.matched_count}/{data.skill_coverage.total_target_count} Skills
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold text-slate-800">
                {data.skill_coverage.coverage_percentage}%
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Match
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${data.skill_coverage.coverage_percentage}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={() => handleActionClick("courses")}
            className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100/80 py-2 rounded-xl text-center transition-colors"
          >
            See Courses to Grow ↗
          </button>
        </div>

        {/* 3. Job Alignment */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Job Alignment
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {data.job_market_fit.total_available_matches} Positions
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold text-slate-800">
                {data.job_market_fit.average_match_rate}%
              </span>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Avg Fit
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Alignment with open target job roles.
            </p>
          </div>

          <button
            onClick={() => handleActionClick("jobs")}
            className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100/80 py-2 rounded-xl text-center transition-colors"
          >
            Explore Matching Jobs ↗
          </button>
        </div>
      </div>

      {/* Profile Completion Checklist */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Profile Completion
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Complete your profile to unlock precision AI job matching and ATS scoring.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              {completedCount} of {totalCount} Completed ({completionPct}%)
            </span>
          </div>
        </div>

        {/* Completion Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {data.profile_checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => handleActionClick(item.action_tab)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                item.is_completed
                  ? "bg-slate-50/60 border-slate-100 hover:border-slate-200"
                  : "bg-indigo-50/30 border-indigo-100 hover:border-indigo-200 hover:shadow-sm"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  item.is_completed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {item.is_completed ? "✓" : "→"}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-800 mb-0.5">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-tight">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
