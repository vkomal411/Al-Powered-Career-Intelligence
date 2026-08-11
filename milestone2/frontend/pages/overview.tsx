import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Topbar from "../components/Topbar";
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
    apiFetch<UserResponse>("/auth/me")
      .then((userData) => {
        setUser(userData);
        setTargetRoleGoal(userData.target_role || "Software Engineer");
        // Fetch live analytics metrics
        apiFetch<AnalyticsData>("/analytics/career-overview")
          .then((analyticsData) => {
            setAnalytics(analyticsData);
          })
          .catch(() => {});
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50/60 font-sans text-slate-800 antialiased">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading Dashboard...</p>
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

      <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 antialiased">
        <Topbar fullName={user?.full_name} onLogout={handleLogout} activeMenu="home" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Career Intelligence Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time career roadmap, ATS resume scoring, target skill gaps, and AI recommendations.
              </p>
            </div>
          </div>

          {/* TOP METRIC CARDS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: TARGET GOAL */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  TARGET GOAL
                </span>
                <button
                  onClick={toggleEditGoal}
                  className="text-xs text-slate-400 hover:text-indigo-600 font-bold transition-colors flex items-center gap-1"
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
                    className="w-full text-lg font-bold text-slate-900 border-b border-indigo-500 outline-none pb-0.5"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900 truncate">
                      {targetRoleGoal}
                    </h3>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex-shrink-0">
                      Target Role
                    </span>
                  </div>
                )}
              </div>

              <Link
                href="/career-tools/career-roadmap"
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <span>View Career Roadmap</span>
                <span>→</span>
              </Link>
            </div>

            {/* Metric 2: ATS RESUME SCORE */}
            <Link
              href="/resume-tools/ats-score-analysis"
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  ATS Resume Score
                </span>
                <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <AtsScoreIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {analytics && analytics.resume_uploaded ? `${analytics.resume_score.score} / 100` : "— / 100"}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${analytics && analytics.resume_uploaded ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : "text-slate-500 bg-slate-100"}`}>
                  {analytics && analytics.resume_uploaded ? analytics.resume_score.label : "Needs Upload"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors">View detailed ATS Score Analysis →</p>
            </Link>

            {/* Metric 3: TARGET SKILL FIT */}
            <Link
              href="/career-tools/learning-level-up"
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Target Skill Fit
                </span>
                <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <LearningIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {analytics ? `${analytics.skill_coverage.coverage_percentage}%` : "—%"}
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {analytics ? `${analytics.skill_coverage.total_target_count - analytics.skill_coverage.matched_count} Skills Gap` : "— Gap"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 group-hover:text-emerald-600 transition-colors">View Learning & Level Up →</p>
            </Link>

            {/* Metric 4: MATCHED OPENINGS */}
            <Link
              href="/career-tools/job-recommendation"
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Matched Openings
                </span>
                <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
                  <JobIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {analytics ? `${analytics.job_market_fit.total_available_matches} Jobs` : "— Jobs"}
                </span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {analytics ? `${analytics.job_market_fit.average_match_rate}%+ Match` : "— Match"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 group-hover:text-blue-600 transition-colors">View Job Recommendations →</p>
            </Link>
          </div>

          {/* GROUP 1: RESUME TOOLS SECTION RESULTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                <ResumeToolsIcon className="w-4 h-4 text-indigo-600" />
                <span>Resume Tools Results</span>
              </h2>
              <Link href="/resume-tools/ats-score-analysis" className="text-xs font-bold text-indigo-600 hover:underline">
                Explore Resume Tools →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tool 1: ATS Score Analysis */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5">
                      <AtsScoreIcon className="w-3.5 h-3.5" />
                      ATS Score Analysis
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Parser Result</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">ATS Compatibility Summary</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Resume formatting, contact info, and keyword frequency analyzed for ATS filters.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Contact Details Audit:</span>
                      <span className="text-emerald-600 font-bold">✓ Verified</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Primary Skill Term Count:</span>
                      <span className="text-indigo-600 font-bold">12 Extracted</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/resume-tools/ats-score-analysis"
                  className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Open ATS Analysis</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Tool 2: Resume Boost */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-1.5">
                      <ResumeBoostIcon className="w-3.5 h-3.5" />
                      Resume Boost
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                      Recommendations
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">Actionable Bullet Enhancements</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    AI suggestions to rewrite work achievements with metrics and impact verbs.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Active Suggestions:</span>
                      <span className="text-amber-700 font-bold">4 High Impact</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Action Verb Density:</span>
                      <span className="text-emerald-600 font-bold">Strong</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/resume-tools/resume-boost"
                  className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Boost Bullet Points</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Tool 3: Resume Builder */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5">
                      <ResumeBuilderIcon className="w-3.5 h-3.5" />
                      Resume Builder
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Template Engine</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">Guided Builder State</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Create clean resumes from scratch using pre-formatted ATS templates.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Selected Layout:</span>
                      <span className="text-indigo-600 font-bold">Modern Clean</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Export Format:</span>
                      <span className="text-slate-800 font-bold">ATS Text / PDF</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/resume-tools/resume-builder"
                  className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Launch Builder</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* GROUP 2: CAREER TOOLS SECTION RESULTS */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <CareerToolsIcon className="w-4 h-4 text-emerald-600" />
                <span>Career Tools Results</span>
              </h2>
              <Link href="/career-tools/learning-level-up" className="text-xs font-bold text-emerald-600 hover:underline">
                Explore Career Tools →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tool 4: Learning & Level Up */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                      <LearningIcon className="w-3.5 h-3.5" />
                      Learning & Level Up
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Skill Tracker
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">Skill Gap Timeline</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Track skill milestones required for your target role promotion.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block">Target Missing Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                        System Architecture
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                        GraphQL
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/career-tools/learning-level-up"
                  className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Track Learning Goals</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Tool 5: Job Recommendation */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold flex items-center gap-1.5">
                      <JobIcon className="w-3.5 h-3.5" />
                      Job Recommendation
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                      Live Matching
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">Matched Opportunities</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Jobs matched against your parsed resume skills and experience level.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Top Match Role:</span>
                      <span className="text-blue-700 font-bold">Senior Frontend Dev</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Average Fit Score:</span>
                      <span className="text-emerald-600 font-bold">88%</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/career-tools/job-recommendation"
                  className="w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Explore Matched Jobs</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Tool 6: Course Recommendations */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                      <CourseIcon className="w-3.5 h-3.5" />
                      Course Recommendations
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Curated</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">Recommended Courses</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Courses curated specifically to close identified skill gaps.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Top Recommendation:</span>
                      <span className="text-emerald-700 font-bold truncate max-w-[140px]">Microservices Patterns</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Platforms:</span>
                      <span className="text-slate-800 font-bold">Coursera, Udemy</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/career-tools/course-recommendations"
                  className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>View Courses</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Tool 7: Career Roadmap */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold flex items-center gap-1.5">
                      <RoadmapIcon className="w-3.5 h-3.5" />
                      Career Roadmap
                    </span>
                    <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                      Progression
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">Personalized Career Milestones</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Visualize your career path timeline, skill milestones, and predicted salary ranges.
                  </p>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Target Goal:</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-bold text-[11px]">
                        {targetRoleGoal}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Current Position:</span>
                        <span className="font-bold text-slate-800">Software Developer</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Predicted Comp:</span>
                        <span className="font-bold text-emerald-600">₹18,00,000 - ₹25,00,000 (18-25 LPA)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/career-tools/career-roadmap"
                  className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Explore Career Roadmap</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Tool 8: Interview Question Generator */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5">
                      <InterviewIcon className="w-3.5 h-3.5" />
                      Interview Question Generator
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                      AI Chatbot
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">AI Role-Tailored Interview Practice</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Generate technical and behavioral interview questions with model response guides.
                  </p>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Question Categories:</span>
                      <span className="font-bold text-slate-800">System Architecture, Behavioral, Technical</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/career-tools/interview-question-generator"
                  className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Practice Interview Questions</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Career Progress Breakdown & Checklist Card */}
          <div className="animate-fade-in pt-4 border-t border-slate-200">
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
