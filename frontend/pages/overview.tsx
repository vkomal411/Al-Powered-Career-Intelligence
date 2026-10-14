import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import Topbar from "../components/Topbar";
import SystemAlertBanner from "../components/SystemAlertBanner";
import {
  apiFetch,
  logoutUser,
  UserResponse,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";
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
  SparkleIcon,
  CheckCircleIcon,
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

function getGreeting(name?: string) {
  const hour = new Date().getHours();
  const firstName = name ? name.trim().split(" ")[0] : "there";
  if (hour < 12) return `Good morning, ${firstName} ☀️`;
  if (hour < 18) return `Good afternoon, ${firstName} 👋`;
  return `Good evening, ${firstName} 🌙`;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function OverviewPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  // Session & Analytics State
  const { user, loading: loadingSession } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Target Goal State
  const [targetRoleGoal, setTargetRoleGoal] = useState<string>("Software Engineer");
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);

  useEffect(() => {
    if (!loadingSession && !user) {
      router.push("/login?redirect=/overview");
      return;
    }

    if (user) {
      setTargetRoleGoal(user.target_role || "Software Engineer");
      apiFetch<AnalyticsData>("/analytics/career-overview")
        .then((analyticsData) => {
          if (analyticsData) {
            setAnalytics(analyticsData);
          }
        })
        .catch(() => {});
    }
  }, [user, loadingSession, router]);

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

  const handleChecklistNavigate = (target: string) => {
    if (target === "profile") router.push("/profile");
    else if (target === "resume") router.push("/resume-tools/ats-score-analysis");
    else if (target === "improvements") router.push("/resume-tools/resume-boost");
    else if (target === "courses") router.push("/career-tools/learning-level-up");
    else if (target === "jobs") router.push("/career-tools/job-recommendation");
    else router.push("/profile");
  };

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] dark:bg-[#090d16] font-sans text-slate-800 dark:text-slate-100 antialiased">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your career overview...</p>
        </div>
      </div>
    );
  }

  const completedChecklistCount = analytics?.profile_checklist?.filter((i) => i.is_completed).length || 0;
  const totalChecklistCount = analytics?.profile_checklist?.length || 0;
  const checklistPercent = totalChecklistCount > 0 ? Math.round((completedChecklistCount / totalChecklistCount) * 100) : 0;

  return (
    <>
      <Head>
        <title>Career Dashboard — CareerPilot.AI</title>
        <meta name="description" content="Personalized career intelligence and resume optimization." />
      </Head>

      <div className="min-h-screen bg-[#f7f8fb] dark:bg-[#090d16] font-sans text-slate-800 dark:text-slate-100 antialiased transition-colors duration-200">
        <Topbar fullName={user?.full_name} user={user || undefined} onLogout={handleLogout} activeMenu="home" />

        <motion.main
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial={shouldReduceMotion ? undefined : "hidden"}
          animate={shouldReduceMotion ? undefined : "visible"}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        >
          {/* System Broadcast Banner */}
          <SystemAlertBanner />

          {/* Clean Header & Welcome */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {getGreeting(user?.full_name)}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Your career command center. Audit your resume, close skill gaps, and land your next role.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/resume-tools/ats-score-analysis"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Check Resume</span>
                  <span>→</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/career-tools/career-roadmap"
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-white/[0.08] transition-all shadow-2xs"
                >
                  <span>View Roadmap</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* 4 CORE METRIC CARDS */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: TARGET GOAL */}
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}
              className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Target Role
                </span>
                <button
                  onClick={toggleEditGoal}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  {isEditingGoal ? "Save" : "Change"}
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
                    className="w-full text-base font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-indigo-500 outline-none pb-0.5"
                    autoFocus
                  />
                ) : (
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate" title={targetRoleGoal}>
                    {targetRoleGoal}
                  </h3>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Primary career pathway</p>
              </div>

              <Link
                href="/career-tools/career-suggestion"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1"
              >
                <span>Explore career paths</span>
                <span>→</span>
              </Link>
            </motion.div>

            {/* Metric 2: ATS RESUME SCORE */}
            <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}>
              <Link
                href="/resume-tools/ats-score-analysis"
                className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors group block h-full"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    ATS Resume Score
                  </span>
                  <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                    <AtsScoreIcon className="w-4 h-4" />
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {analytics?.resume_uploaded ? `${analytics.resume_score.score}` : "—"}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                    <span
                      className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        analytics?.resume_uploaded
                          ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-100 dark:border-emerald-500/20"
                          : "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border border-amber-100 dark:border-amber-500/20"
                      }`}
                    >
                      {analytics?.resume_uploaded ? analytics.resume_score.label : "Upload Needed"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Recruiter ATS pass rate</p>
                </div>

                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                  <span>View ATS report</span>
                  <span>→</span>
                </span>
              </Link>
            </motion.div>

            {/* Metric 3: SKILL FIT */}
            <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}>
              <Link
                href="/career-tools/learning-level-up"
                className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors group block h-full"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Target Skill Fit
                  </span>
                  <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <LearningIcon className="w-4 h-4" />
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {analytics ? `${analytics.skill_coverage.coverage_percentage}%` : "—%"}
                    </span>
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/20">
                      {analytics ? `${analytics.skill_coverage.matched_count}/${analytics.skill_coverage.total_target_count} Skills` : "— Skills"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Matched to {targetRoleGoal}</p>
                </div>

                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                  <span>Level up skills</span>
                  <span>→</span>
                </span>
              </Link>
            </motion.div>

            {/* Metric 4: JOB MARKET MATCH */}
            <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}>
              <Link
                href="/career-tools/job-recommendation"
                className="bg-white dark:bg-[#111726] rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-3 hover:border-sky-200 dark:hover:border-sky-500/30 transition-colors group block h-full"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Matched Openings
                  </span>
                  <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    <JobIcon className="w-4 h-4" />
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {analytics ? `${analytics.job_market_fit.total_available_matches}` : "—"}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Live Roles</span>
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 border border-sky-100 dark:border-sky-500/20">
                      {analytics ? `${analytics.job_market_fit.average_match_rate}%+ Avg` : "— Fit"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Matched to your qualifications</p>
                </div>

                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:underline flex items-center gap-1">
                  <span>Browse openings</span>
                  <span>→</span>
                </span>
              </Link>
            </motion.div>
          </motion.div>

          {/* ACTION BANNER: Next Best Move or Quick Start */}
          {analytics && !analytics.resume_uploaded ? (
            <motion.div
              variants={itemVariants}
              className="rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-md border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                  <SparkleIcon className="w-3.5 h-3.5" />
                  <span>Get Started in 10 Seconds</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight">Upload your resume to unlock your career score</h2>
                <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
                  Get instant ATS compatibility scores, discover high-impact skills to add, and view customized job opportunities tailored to your background.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/resume-tools/ats-score-analysis"
                    className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 text-xs font-extrabold hover:bg-indigo-50 transition-all shadow-sm block"
                  >
                    Upload Resume →
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/resume-tools/resume-builder"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold transition-all border border-indigo-400/30 block"
                  >
                    Build New Resume
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ) : analytics?.what_to_do_next ? (
            <motion.div
              variants={itemVariants}
              className="rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 shadow-md border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/20 px-3 py-0.5 rounded-full border border-indigo-500/30 inline-flex items-center gap-1.5">
                  <SparkleIcon className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Recommended Next Move</span>
                </span>
                <p className="text-sm font-medium text-indigo-100/90 leading-relaxed pt-1">
                  {analytics.what_to_do_next.summary}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChecklistNavigate(analytics.what_to_do_next.primary_action_tab)}
                className="flex-shrink-0 bg-white text-indigo-950 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all text-xs flex items-center gap-2"
              >
                <span>{analytics.what_to_do_next.primary_action_title}</span>
                <span>→</span>
              </motion.button>
            </motion.div>
          ) : null}

          {/* 2-COLUMN SIMPLIFIED TOOL HUB */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SECTION 1: RESUME STUDIO & APPLICATIONS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                    <ResumeToolsIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Resume &amp; Application Tools</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Craft, audit, and elevate your job applications</p>
                  </div>
                </div>
                <Link href="/resume-tools/ats-score-analysis" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  All tools →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. ATS Score Analysis */}
                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}>
                  <Link
                    href="/resume-tools/ats-score-analysis"
                    className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-xs transition-colors flex flex-col justify-between space-y-3 group h-full"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                          <AtsScoreIcon className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Scanner</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        ATS Score Analysis
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Audit resume format, headers, contact info, and parser compatibility.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <span>Audit Resume</span>
                      <span>→</span>
                    </span>
                  </Link>
                </motion.div>

                {/* 2. Skill Gap Analysis */}
                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}>
                  <Link
                    href="/resume-tools/gap-analysis"
                    className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-xs transition-colors flex flex-col justify-between space-y-3 group h-full"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400">
                          <SparkleIcon className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Diagnosis</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Skill Gap Analysis
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Compare your resume against market requirements to uncover missing skills.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <span>Check Gaps</span>
                      <span>→</span>
                    </span>
                  </Link>
                </motion.div>

                {/* 3. Resume Boost */}
                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}>
                  <Link
                    href="/resume-tools/resume-boost"
                    className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/[0.08] hover:border-amber-300 dark:hover:border-amber-500/40 hover:shadow-xs transition-colors flex flex-col justify-between space-y-3 group h-full"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          <ResumeBoostIcon className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Enhancer</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Bullet Point Polisher
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Turn passive bullet points into quantified, achievement-focused statements.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <span>Polish Bullets</span>
                      <span>→</span>
                    </span>
                  </Link>
                </motion.div>

                {/* 4. Resume Builder */}
                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}>
                  <Link
                    href="/resume-tools/resume-builder"
                    className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-xs transition-colors flex flex-col justify-between space-y-3 group h-full"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                          <ResumeBuilderIcon className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Live Editor</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Resume Studio
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Step-by-step resume builder with clean recruiter-tested templates and instant export.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <span>Open Editor</span>
                      <span>→</span>
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* SECTION 2: CAREER COMPASS & GUIDANCE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <CareerToolsIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Career Compass &amp; Growth</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Explore pathways, master skills, and practice interviews</p>
                  </div>
                </div>
                <Link href="/career-tools/career-roadmap" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  All pathways →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Career Suggestion */}
                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}>
                  <Link
                    href="/career-tools/career-suggestion"
                    className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:shadow-xs transition-colors flex flex-col justify-between space-y-3 group h-full"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <CareerSuggestionIcon className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Role Matching</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Career Suggestions
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Discover matching career paths based on your parsed skills and trajectory.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>Explore Roles</span>
                      <span>→</span>
                    </span>
                  </Link>
                </motion.div>

                {/* 2. Career Roadmap */}
                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}>
                  <Link
                    href="/career-tools/career-roadmap"
                    className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/[0.08] hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-xs transition-colors flex flex-col justify-between space-y-3 group h-full"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400">
                          <RoadmapIcon className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Milestones</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Career Roadmap
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Step-by-step milestone path with weekly focus goals and readiness score.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <span>View Roadmap</span>
                      <span>→</span>
                    </span>
                  </Link>
                </motion.div>

                {/* 3. Skill Level-Up & Learning */}
                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}>
                  <Link
                    href="/career-tools/learning-level-up"
                    className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:shadow-xs transition-colors flex flex-col justify-between space-y-3 group h-full"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <LearningIcon className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Skill Tracker</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Skill Level-Up
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Track targeted skills, complete daily practice challenges, and close gaps.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>Track Progress</span>
                      <span>→</span>
                    </span>
                  </Link>
                </motion.div>

                {/* 4. Interview Preparation */}
                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}>
                  <Link
                    href="/career-tools/interview-question-generator"
                    className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-xs transition-colors flex flex-col justify-between space-y-3 group h-full"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                          <InterviewIcon className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">STAR Method</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Interview Prep
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Practice role-specific technical and behavioral questions with instant feedback.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <span>Practice Now</span>
                      <span>→</span>
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* PROFILE & READINESS CHECKLIST */}
          {analytics?.profile_checklist && analytics.profile_checklist.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Career Readiness Checklist
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Complete these key steps to maximize recruiter visibility and match rates.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-28 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${checklistPercent}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="bg-emerald-500 h-full rounded-full"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {completedChecklistCount}/{totalChecklistCount} ({checklistPercent}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analytics.profile_checklist.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                    onClick={() => handleChecklistNavigate(item.action_tab)}
                    className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                      item.is_completed
                        ? "bg-emerald-50/40 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-white/[0.06] hover:border-indigo-300 dark:hover:border-indigo-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          item.is_completed
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {item.is_completed ? "✓" : "•"}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${item.is_completed ? "text-emerald-900 dark:text-emerald-300" : "text-slate-800 dark:text-slate-200"}`}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      {item.is_completed ? "View" : "Complete →"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.main>
      </div>
    </>
  );
}
