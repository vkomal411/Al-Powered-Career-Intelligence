import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Topbar from "../components/Topbar";
import SystemAlertBanner from "../components/SystemAlertBanner";
import { SnapshotCard } from "../components/SnapshotCard";
import {
  apiFetch,
  logoutUser,
  UserResponse,
} from "../lib/api";
import {
  AtsScoreIcon,
  ResumeBoostIcon,
  ResumeBuilderIcon,
  LearningIcon,
  JobIcon,
  CourseIcon,
  RoadmapIcon,
  InterviewIcon,
  ResumeToolsIcon,
  CareerToolsIcon,
  CareerSuggestionIcon,
} from "../components/icons";

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

export default function OverviewPage() {
  const router = useRouter();

  // Session & Analytics State
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Navigation State
  const [targetRoleGoal, setTargetRoleGoal] = useState<string>("Software Engineer");
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([
      apiFetch<UserResponse>("/auth/me"),
      apiFetch<AnalyticsData>("/analytics/career-overview").catch(() => null),
    ])
      .then(([userData, analyticsData]) => {
        setUser(userData);
        setTargetRoleGoal(userData.target_role || "Software Engineer");
        if (analyticsData) {
          setAnalytics(analyticsData);
        }
      })
      .catch(() => {
        router.push("/login?redirect=/overview");
      })
      .finally(() => {
        setLoadingSession(false);
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.push("/login");
    }
  };

  const handleSaveGoal = async (newRole: string) => {
    try {
      await apiFetch<UserResponse>("/auth/profile", {
        method: "PUT",
        body: { target_role: newRole },
      });
      const updatedAnalytics = await apiFetch<AnalyticsData>("/analytics/career-overview");
      setAnalytics(updatedAnalytics);
    } catch (err) {
      console.error("Failed to update target role:", err);
    }
  };

  const toggleEditGoal = () => {
    if (isEditingGoal) {
      handleSaveGoal(targetRoleGoal);
    }
    setIsEditingGoal(!isEditingGoal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditingGoal(false);
      handleSaveGoal(targetRoleGoal);
    }
  };

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] dark:bg-[#090d16] font-sans text-slate-800 dark:text-slate-100 antialiased">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Career Intelligence Dashboard - AI Career Assistant</title>
        <meta name="description" content="Personalized career intelligence dashboard." />
      </Head>

      <div className="min-h-screen bg-[#f7f8fb] dark:bg-[#090d16] font-sans text-slate-800 dark:text-slate-100 antialiased transition-colors duration-200">
        <Topbar fullName={user?.full_name} user={user || undefined} onLogout={handleLogout} activeMenu="home" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
          {/* Active System Broadcast Alerts */}
          <SystemAlertBanner />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Career Intelligence Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real-time career roadmap, ATS resume scoring, target skill gaps, and AI recommendations.
              </p>
            </div>
          </div>

          {/* COLD-START GUIDED BANNER */}
          {analytics && !analytics.resume_uploaded && (
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm">
                  <span>✨</span> Welcome to CareerPilot AI
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Unlock Your Personalized AI Career Dashboard in 30 Seconds
                </h2>
                <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                  Upload your primary resume to calculate your live ATS Resume Score, discover skill gaps for your target role, and match open jobs instantly.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    href="/resume-tools/resume-boost"
                    className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-extrabold hover:bg-indigo-50 transition-all shadow-md active:scale-95"
                  >
                    🚀 Upload First Resume
                  </Link>
                  <Link
                    href="/career-tools/career-roadmap"
                    className="px-5 py-2.5 rounded-xl bg-indigo-700/50 hover:bg-indigo-700 text-white text-xs font-bold transition-all border border-indigo-500/30"
                  >
                    🎯 Set Target Role
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TOP METRIC CARDS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: TARGET GOAL */}
            <div className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  TARGET GOAL
                </span>
                <button
                  onClick={toggleEditGoal}
                  className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors flex items-center gap-1"
                >
                  <span>{isEditingGoal ? "Save" : "Edit"}</span>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </button>
              </div>

              <div>
                {isEditingGoal ? (
                  <input
                    type="text"
                    value={targetRoleGoal}
                    onChange={(e) => setTargetRoleGoal(e.target.value)}
                    onBlur={() => {
                      setIsEditingGoal(false);
                      handleSaveGoal(targetRoleGoal);
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full text-lg font-bold text-slate-900 dark:text-white bg-transparent border-b border-indigo-500 outline-none pb-0.5"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
                      {targetRoleGoal}
                    </h3>
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/20 flex-shrink-0">
                      Target Role
                    </span>
                  </div>
                )}
              </div>

              <Link
                href="/career-tools/career-roadmap"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
              >
                <span>View Career Roadmap</span>
                <span>→</span>
              </Link>
            </div>

            {/* Metric 2: ATS RESUME SCORE */}
            <Link
              href="/resume-tools/ats-score-analysis"
              className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  ATS Resume Score
                </span>
                <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <AtsScoreIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {analytics && analytics.resume_uploaded ? `${analytics.resume_score.score} / 100` : "— / 100"}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${analytics && analytics.resume_uploaded ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-100 dark:border-emerald-500/20" : "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"}`}>
                  {analytics && analytics.resume_uploaded ? analytics.resume_score.label : "Needs Upload"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">View detailed ATS Score Analysis →</p>
            </Link>

            {/* Metric 3: TARGET SKILL FIT */}
            <Link
              href="/career-tools/learning-level-up"
              className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Target Skill Fit
                </span>
                <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <LearningIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {analytics ? `${analytics.skill_coverage.coverage_percentage}%` : "—%"}
                </span>
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                  {analytics ? `${analytics.skill_coverage.total_target_count - analytics.skill_coverage.matched_count} Skills Gap` : "— Gap"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">View Learning & Level Up →</p>
            </Link>

            {/* Metric 4: MATCHED OPENINGS */}
            <Link
              href="/career-tools/job-recommendation"
              className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Matched Openings
                </span>
                <span className="p-1.5 rounded-xl bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400">
                  <JobIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {analytics ? `${analytics.job_market_fit.total_available_matches} Jobs` : "— Jobs"}
                </span>
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-500/20">
                  {analytics ? `${analytics.job_market_fit.average_match_rate}%+ Match` : "— Match"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">View Job Recommendations →</p>
            </Link>
          </div>

          {/* GROUP 1: RESUME TOOLS SECTION RESULTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <ResumeToolsIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Resume Tools Results</span>
              </h2>
              <Link href="/resume-tools/ats-score-analysis" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Explore Resume Tools →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tool 1: ATS Score Analysis */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-500/20">
                      <AtsScoreIcon className="w-3.5 h-3.5" />
                      ATS Score Analysis
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Parser Result</span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">ATS Compatibility Summary</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Resume formatting, contact info, and keyword frequency analyzed for ATS filters.
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/[0.06] space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Contact Details Audit:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Verified</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Primary Skill Term Count:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">12 Extracted</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/resume-tools/ats-score-analysis"
                  className="w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-transparent dark:border-indigo-500/20"
                >
                  <span>Open ATS Analysis</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Tool 2: Resume Boost */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-100 dark:border-amber-500/20">
                      <ResumeBoostIcon className="w-3.5 h-3.5" />
                      Resume Boost
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-500/20">
                      Recommendations
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Actionable Bullet Enhancements</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    AI suggestions to rewrite work achievements with metrics and impact verbs.
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/[0.06] space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Active Suggestions:</span>
                      <span className="text-amber-700 dark:text-amber-300 font-bold">4 High Impact</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Action Verb Density:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Strong</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/resume-tools/resume-boost"
                  className="w-full py-2 rounded-xl bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-transparent dark:border-amber-500/20"
                >
                  <span>Boost Bullet Points</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Tool 3: Resume Builder */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-500/20">
                      <ResumeBuilderIcon className="w-3.5 h-3.5" />
                      Resume Builder
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Template Engine</span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Guided Builder State</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Create clean resumes from scratch using pre-formatted ATS templates.
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/[0.06] space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Selected Layout:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">Modern Clean</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Export Format:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">ATS Text / PDF</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/resume-tools/resume-builder"
                  className="w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-transparent dark:border-indigo-500/20"
                >
                  <span>Launch Builder</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* GROUP 2: CAREER TOOLS SECTION RESULTS */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <CareerToolsIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Career Tools Results</span>
              </h2>
              <Link href="/career-tools/learning-level-up" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                Explore Career Tools →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Tool: Career Suggestion */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-500/20">
                      <CareerSuggestionIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Career Suggestion
                    </span>
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                      AI Powered
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Matched Career Paths</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Deterministic skill-weighted career pathways & transition difficulty ratings.
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/[0.06] space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Fit Calculation:</span>
                      <span className="text-indigo-700 dark:text-indigo-300 font-bold">5-Factor Formula</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Roles Analyzed:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">20+ Tech Careers</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/career-tools/career-suggestion"
                  className="w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-transparent dark:border-indigo-500/20"
                >
                  <span>Explore Career Fit</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Tool 4: Learning & Level Up */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-500/20">
                      <LearningIcon className="w-3.5 h-3.5" />
                      Learning & Level Up
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                      Skill Tracker
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Skill Gap Timeline</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Track skill milestones required for your target role promotion.
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/[0.06] space-y-2 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Target Missing Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded font-semibold text-[10px]">
                        System Architecture
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded font-semibold text-[10px]">
                        GraphQL
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/career-tools/learning-level-up"
                  className="w-full py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-transparent dark:border-emerald-500/20"
                >
                  <span>Track Learning Goals</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Tool 5: Job Recommendation */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 text-xs font-bold flex items-center gap-1.5 border border-blue-100 dark:border-sky-500/20">
                      <JobIcon className="w-3.5 h-3.5" />
                      Job Recommendation
                    </span>
                    <span className="text-[10px] text-sky-600 dark:text-sky-300 font-bold bg-sky-50 dark:bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-500/20">
                      Live Matching
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Matched Opportunities</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Jobs matched against your parsed resume skills and experience level.
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/[0.06] space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Top Match Role:</span>
                      <span className="text-sky-700 dark:text-sky-300 font-bold">Senior Frontend Dev</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Average Fit Score:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">88%</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/career-tools/job-recommendation"
                  className="w-full py-2 rounded-xl bg-blue-50 dark:bg-sky-500/15 hover:bg-blue-100 dark:hover:bg-sky-500/25 text-blue-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-transparent dark:border-sky-500/20"
                >
                  <span>Explore Matched Jobs</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Tool 6: Course Recommendations */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-500/20">
                      <CourseIcon className="w-3.5 h-3.5" />
                      Course Recommendations
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Curated</span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Recommended Courses</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Courses curated specifically to close identified skill gaps.
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/[0.06] space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Top Recommendation:</span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold truncate max-w-[140px]">Microservices Patterns</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Platforms:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">Coursera, Udemy</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/career-tools/course-recommendations"
                  className="w-full py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-transparent dark:border-emerald-500/20"
                >
                  <span>View Courses</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Tool 7: Career Roadmap */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 border border-purple-100 dark:border-purple-500/20">
                      <RoadmapIcon className="w-3.5 h-3.5" />
                      Career Roadmap
                    </span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-500/20">
                      Progression
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Personalized Career Milestones</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Visualize your career path timeline, skill milestones, and predicted salary ranges.
                  </p>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/[0.06] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Target Goal:</span>
                      <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-[11px]">
                        {targetRoleGoal}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Current Position:</span>
                        <span className="font-bold text-slate-800 dark:text-white">Software Developer</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Predicted Comp:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">₹18,00,000 - ₹25,00,000 (18-25 LPA)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/career-tools/career-roadmap"
                  className="w-full py-2 rounded-xl bg-purple-50 dark:bg-purple-500/15 hover:bg-purple-100 dark:hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-transparent dark:border-purple-500/20"
                >
                  <span>Explore Career Roadmap</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Tool 8: Interview Question Generator */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-500/20">
                      <InterviewIcon className="w-3.5 h-3.5" />
                      Interview Question Generator
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                      AI Chatbot
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">AI Role-Tailored Interview Practice</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Generate technical and behavioral interview questions with model response guides.
                  </p>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Question Categories:</span>
                      <span className="font-bold text-slate-800 dark:text-white">System Architecture, Behavioral, Technical</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/career-tools/interview-question-generator"
                  className="w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-transparent dark:border-indigo-500/20"
                >
                  <span>Practice Interview Questions</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Career Progress Breakdown & Checklist Card */}
          <div className="animate-fade-in pt-4 border-t border-slate-200 dark:border-white/[0.08]">
            <SnapshotCard
              onNavigateTab={(section, subtab) => {
                if (section === "resume") {
                  router.push(subtab === "boost" ? "/resume-tools/resume-boost" : "/resume-tools/ats-score-analysis");
                } else if (section === "opportunities") {
                  router.push("/career-tools/job-recommendation");
                } else if (section === "learning") {
                  router.push("/career-tools/learning-level-up");
                } else {
                  router.push("/overview");
                }
              }}
            />
          </div>
        </main>
      </div>
    </>
  );
}
