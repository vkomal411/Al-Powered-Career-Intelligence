import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Topbar from "../../../components/Topbar";
import JobMatcherModal from "../../../components/JobMatcherModal";
import { ParsedResume } from "../../../components/ResumeReportCard";
import {
  getResume,
  apiFetch,
  UserResponse,
  regenerateResumeAdvice,
  AICareerAdvice,
  logoutUser,
} from "../../../lib/api";

type TabId = "strengths" | "improvements" | "roadmap" | "certifications";

export default function ResumeAuditPage() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState<UserResponse | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("strengths");
  const [isJobMatcherOpen, setIsJobMatcherOpen] = useState(false);

  // Authenticate user
  useEffect(() => {
    apiFetch<UserResponse>("/auth/me")
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        router.replace("/login?redirect=" + encodeURIComponent(router.asPath));
      })
      .finally(() => {
        setCheckingSession(false);
      });
  }, [router]);

  // Load resume data by ID
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getResume(id)
      .then((data) => {
        if (isMounted) {
          setResume(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load resume audit:", err);
          setError(err instanceof Error ? err.message : "Could not load resume audit details.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    router.push("/login");
  }

  async function handleRefreshAdvice() {
    if (!resume) return;
    setRefreshing(true);
    try {
      const updated = await regenerateResumeAdvice(resume.id);
      setResume(updated);
    } catch (err) {
      console.error("Failed to refresh advice:", err);
    } finally {
      setRefreshing(false);
    }
  }

  if (checkingSession || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading full AI career audit...</p>
        </div>
      </div>
    );
  }

  if (!user || error || !resume) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <h2 className="font-display text-xl font-bold text-ink">Resume Audit Not Found</h2>
          <p className="mt-2 text-xs text-slate-500">{error || "Could not find the specified resume."}</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-primary-dark"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const advice: AICareerAdvice | null = (resume.ai_career_advice as AICareerAdvice) || null;
  const atsScore = resume.ats?.score ?? 85;

  return (
    <>
      <Head>
        <title>Full Resume Audit — {resume.original_filename} — CareerPilot.AI</title>
      </Head>

      <div className="min-h-screen bg-paper pb-16">
        <Topbar fullName={user.full_name} onLogout={handleLogout} />

        {/* Sticky Action Header */}
        <div className="sticky top-16 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-4 shadow-2xs">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/dashboard"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-ink transition-colors flex-shrink-0"
                title="Back to Dashboard"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-lg font-bold text-ink truncate">
                    AI Career Intelligence Advisor
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 bg-primary-light text-primary-dark font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-primary/20">
                    ✦ Full Interactive Report
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Persisted Resume Audit ({resume.original_filename})
                </p>
              </div>
            </div>

            {/* Header Sticky Actions */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleRefreshAdvice}
                disabled={refreshing}
                className="focus-ring flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                <svg
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : "text-slate-500"}`}
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
                <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsJobMatcherOpen(true)}
                className="focus-ring flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-primary to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs px-4 py-2 shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/40 ring-2 ring-indigo-300/40 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                <svg className="w-4 h-4 text-amber-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="tracking-wide">Match Job Description</span>
              </button>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-5xl px-6 pt-8 space-y-6">
          {/* Summary Section Highlight Banner */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>💡 Executive Audit Summary</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-200">
                ATS Optimization: {atsScore}%
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {advice?.summary || "Generating personalized AI career summary..."}
            </p>
          </div>

          {/* Content Tabs Navigation */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/60 p-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("strengths")}
                className={`flex-1 min-w-[160px] rounded-xl px-4 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "strengths"
                    ? "bg-white text-emerald-800 shadow-sm border border-emerald-100 font-bold"
                    : "text-slate-500 hover:text-ink"
                }`}
              >
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Key Profile Strengths ({advice?.key_strengths?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("improvements")}
                className={`flex-1 min-w-[160px] rounded-xl px-4 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "improvements"
                    ? "bg-white text-amber-800 shadow-sm border border-amber-100 font-bold"
                    : "text-slate-500 hover:text-ink"
                }`}
              >
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Priority Improvements ({advice?.improvement_areas?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("roadmap")}
                className={`flex-1 min-w-[160px] rounded-xl px-4 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "roadmap"
                    ? "bg-white text-purple-800 shadow-sm border border-purple-100 font-bold"
                    : "text-slate-500 hover:text-ink"
                }`}
              >
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Actionable Roadmap ({advice?.action_plan?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("certifications")}
                className={`flex-1 min-w-[160px] rounded-xl px-4 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "certifications"
                    ? "bg-white text-blue-800 shadow-sm border border-blue-100 font-bold"
                    : "text-slate-500 hover:text-ink"
                }`}
              >
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <span>Suggested Credentials ({advice?.suggested_certifications?.length || 0})</span>
              </button>
            </div>

            {/* Tab Body Content */}
            <div className="p-6">
              {/* Strengths Checklist */}
              {activeTab === "strengths" && (
                <div className="space-y-4 animate-fade-up">
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    Validated technical and analytical strengths extracted directly from your resume and candidate profile:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {advice?.key_strengths?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                          ✓
                        </span>
                        <span className="text-xs font-semibold text-slate-800 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority Improvements Checklist */}
              {activeTab === "improvements" && (
                <div className="space-y-4 animate-fade-up">
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    Recommended high-impact areas to optimize formatting, technical stack alignment, and ATS readability:
                  </p>
                  <div className="space-y-3">
                    {advice?.improvement_areas?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-2xs">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold text-xs mt-0.5">
                          ⚠️
                        </span>
                        <div>
                          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Priority Fix #{idx + 1}</span>
                          <span className="text-xs font-semibold text-slate-800 leading-relaxed">{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Career Roadmap (Vertical Stepper) */}
              {activeTab === "roadmap" && (
                <div className="space-y-4 animate-fade-up">
                  <p className="text-xs text-slate-500 font-medium mb-4">
                    Sequential, step-by-step career execution timeline designed to maximize interview call rates:
                  </p>
                  <div className="relative border-l-2 border-purple-200 ml-4 space-y-6 py-2">
                    {advice?.action_plan?.map((step, idx) => (
                      <div key={idx} className="relative pl-6">
                        <span className="absolute -left-[17px] top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white font-extrabold text-xs shadow-md shadow-purple-600/30">
                          {idx + 1}
                        </span>
                        <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4 shadow-2xs">
                          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
                            Phase {idx + 1} Action Item
                          </span>
                          <span className="text-xs font-medium text-slate-800 leading-relaxed block">{step}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Certifications Card List */}
              {activeTab === "certifications" && (
                <div className="space-y-4 animate-fade-up">
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    Top recognized industry credentials to boost profile domain authority:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {advice?.suggested_certifications?.map((cert, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-lg font-bold">
                            🎓
                          </span>
                          <span className="text-xs font-bold text-ink leading-tight">{cert}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          Domain credential suggestion
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Job Matcher Modal */}
      {isJobMatcherOpen && (
        <JobMatcherModal
          isOpen={isJobMatcherOpen}
          onClose={() => setIsJobMatcherOpen(false)}
        />
      )}
    </>
  );
}
