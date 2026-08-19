import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { getAICareerAdvice, regenerateResumeAdvice, AICareerAdvice } from "../lib/api";
import { ParsedResume } from "./ResumeReportCard";

interface AICareerAdviceCardProps {
  targetRole?: string | null;
  parsedResume?: ParsedResume | null;
  onOpenJobMatcher: () => void;
  onAdviceRegenerated?: (updated: ParsedResume) => void;
}

export default function AICareerAdviceCard({
  targetRole,
  parsedResume,
  onOpenJobMatcher,
  onAdviceRegenerated,
}: AICareerAdviceCardProps) {
  const router = useRouter();
  const [advice, setAdvice] = useState<AICareerAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullSummary, setShowFullSummary] = useState(false);

  const fetchAdvice = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAICareerAdvice(targetRole || undefined);
      setAdvice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load AI career advice.");
    } finally {
      setLoading(false);
    }
  }, [targetRole]);

  // Sync with parsedResume's stored AI advice if available
  useEffect(() => {
    let pollTimer: NodeJS.Timeout;
    let attempts = 0;
    let isMounted = true;

    if (parsedResume) {
      const status = parsedResume.advice_status || "ready";

      if (status === "ready" && parsedResume.ai_career_advice) {
        setAdvice(parsedResume.ai_career_advice as AICareerAdvice);
        setError(null);
        setLoading(false);
      } else if (status === "pending") {
        setAdvice(null);
        setError(null);
        setLoading(true);

        const poll = async () => {
          attempts++;
          try {
            const { getResume } = await import("../lib/api");
            const updated = await getResume(parsedResume.id);
            if (!isMounted) return;
            if (updated.advice_status === "ready" && updated.ai_career_advice) {
              setAdvice(updated.ai_career_advice as AICareerAdvice);
              setLoading(false);
              if (onAdviceRegenerated) onAdviceRegenerated(updated);
            } else if (updated.advice_status === "failed") {
              setLoading(false);
              setError("AI Career Guidance generation failed. Click retry to try again.");
            } else if (attempts < 10) {
              pollTimer = setTimeout(poll, 3000);
            } else {
              setLoading(false);
              setError("AI Career Guidance is taking longer than expected.");
            }
          } catch {
            if (!isMounted) return;
            if (attempts < 10) pollTimer = setTimeout(poll, 3000);
            else setLoading(false);
          }
        };

        pollTimer = setTimeout(poll, 3000);
      } else if (status === "failed") {
        setAdvice(null);
        setError("AI Career Guidance generation failed. Click retry to try again.");
        setLoading(false);
      } else {
        setAdvice(null);
        setError("AI Guidance not generated yet.");
        setLoading(false);
      }
    } else {
      fetchAdvice();
    }

    return () => {
      isMounted = false;
      clearTimeout(pollTimer);
    };
  }, [parsedResume, targetRole, fetchAdvice, onAdviceRegenerated]);

  async function handleRegenerate() {
    if (!parsedResume) {
      fetchAdvice();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedResume = await regenerateResumeAdvice(parsedResume.id);
      if (updatedResume.ai_career_advice) {
        setAdvice(updatedResume.ai_career_advice as AICareerAdvice);
      }
      if (onAdviceRegenerated) {
        onAdviceRegenerated(updatedResume);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate AI advice.");
    } finally {
      setLoading(false);
    }
  }

  function handleNavigateFullReport() {
    if (parsedResume?.id) {
      router.push(`/resume/${parsedResume.id}/audit`);
    } else {
      // If no resume ID yet, scroll to upload or prompt upload
      const uploadElem = document.getElementById("upload-card");
      if (uploadElem) {
        uploadElem.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  const atsScore = parsedResume?.ats?.score ?? 85;
  const improvementCount = advice?.improvement_areas?.length ?? 0;
  const rawSummary = advice?.summary || "";
  const isTruncated = rawSummary.length > 150;
  const displaySummary = showFullSummary || !isTruncated ? rawSummary : `${rawSummary.slice(0, 150)}...`;

  return (
    <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-card p-6 overflow-hidden relative transition-all animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.08] pb-4 mb-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-primary/20">
            {/* Lightning Bolt Icon */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base leading-tight">
                AI Career Intelligence Advisor
              </h3>
              <span className="inline-flex items-center gap-1 bg-primary-light dark:bg-indigo-500/15 text-primary-dark dark:text-indigo-300 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-primary/20 dark:border-indigo-500/25 shadow-2xs">
                ✦ AI Powered
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">
              {parsedResume
                ? `Persisted Resume Audit (${parsedResume.original_filename})`
                : "Real-time profile optimization & career roadmap"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {parsedResume && (
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all shadow-2xs disabled:opacity-50"
              title="Refresh AI Guidance"
              aria-label="Refresh AI Guidance"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin text-primary dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Body: Truncated Summary */}
      {loading ? (
        <div className="py-8 text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-3 border-primary dark:border-indigo-500 border-t-transparent"></div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Generating executive summary...</p>
        </div>
      ) : error && !advice ? (
        <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs p-3.5 rounded-xl border border-amber-200 dark:border-amber-500/30 flex items-center justify-between gap-3 mb-4">
          <span>{error}</span>
          <button
            onClick={handleRegenerate}
            className="bg-amber-600 text-white font-semibold text-xs px-3 py-1 rounded-lg hover:bg-amber-700 transition-all"
          >
            Retry
          </button>
        </div>
      ) : advice ? (
        <div className="space-y-4">
          <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {displaySummary}
              {isTruncated && (
                <button
                  type="button"
                  onClick={() => setShowFullSummary(!showFullSummary)}
                  className="ml-1.5 font-bold text-primary dark:text-indigo-400 hover:text-primary-dark dark:hover:text-indigo-300 hover:underline transition-colors focus:outline-none"
                >
                  {showFullSummary ? "Show less" : "Show more"}
                </button>
              )}
            </p>
          </div>

          {/* Metrics Row: Inline Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/30 shadow-2xs">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">ATS Score</span>
              <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">{atsScore}/100</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-500/30 shadow-2xs">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider font-semibold">Priority Fixes</span>
              <span className="text-sm font-extrabold text-amber-700 dark:text-amber-300">{improvementCount}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 px-3 py-1.5 text-xs font-bold text-indigo-800 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/30 shadow-2xs">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">Roadmap Steps</span>
              <span className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300">{advice.action_plan?.length || 0}</span>
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-white/[0.08] pt-4 mt-2">
            <button
              onClick={handleNavigateFullReport}
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <span>View Full Report</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <button
              onClick={onOpenJobMatcher}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-primary to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 ring-2 ring-indigo-300/40 dark:ring-indigo-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4 text-amber-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="tracking-wide">Match Job Description</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
