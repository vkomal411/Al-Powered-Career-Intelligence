import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import UserFeedbackModal from "./UserFeedbackModal";
import {
  LogOutIcon,
  OverviewIcon,
  ResumeToolsIcon,
  CareerToolsIcon,
  AtsScoreIcon,
  GapAnalysisIcon,
  ResumeBoostIcon,
  ResumeBuilderIcon,
  LearningIcon,
  JobIcon,
  CourseIcon,
  RoadmapIcon,
  InterviewIcon,
  CareerSuggestionIcon,
  MailIcon,
} from "./icons";

import { calculateProfileCompletion } from "./ProfileCard";
import { apiFetch, UserResponse } from "../lib/api";

interface TopbarProps {
  fullName?: string;
  user?: UserResponse;
  onLogout: () => void;
  activeMenu?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "VK";
}

export default function Topbar({ fullName: propFullName, user: propUser, onLogout, activeMenu }: TopbarProps) {
  if (activeMenu) void activeMenu;
  const [userName, setUserName] = useState<string>(propFullName || propUser?.full_name || "Venkata Komal");
  const [userRole, setUserRole] = useState<string>(propUser?.role?.toLowerCase() || "user");
  const [completionPercentage, setCompletionPercentage] = useState<number>(
    propUser ? calculateProfileCompletion(propUser) : 85
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(true);
  const [isCareerOpen, setIsCareerOpen] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<"resume" | "career" | null>(null);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const currentPath = router.pathname;

  React.useEffect(() => {
    if (propUser) {
      setUserName(propUser.full_name);
      if (propUser.role) {
        setUserRole(propUser.role.toLowerCase());
      }
      setCompletionPercentage(calculateProfileCompletion(propUser));
      return;
    }

    apiFetch<UserResponse>("/auth/me")
      .then((data) => {
        if (data) {
          if (data.full_name) {
            setUserName(data.full_name);
          }
          if (data.role) {
            setUserRole(data.role.toLowerCase());
          }
          setCompletionPercentage(calculateProfileCompletion(data));
        }
      })
      .catch(() => {
        if (propFullName) {
          setUserName(propFullName);
        }
      });
  }, [propFullName, propUser]);

  // Handle clicking outside of desktop dropdowns to close them
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    router.push(path);
  };

  const isRouteActive = (routePrefix: string) => {
    if (routePrefix === "/overview") return currentPath === "/overview";
    return currentPath.startsWith(routePrefix);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#090d16]/85 backdrop-blur-xl transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all border border-slate-200/80 dark:border-white/[0.08] shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 flex items-center gap-2"
              title="Open Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline text-xs font-semibold text-slate-600 dark:text-slate-300">Menu</span>
            </button>

            <Link href="/overview" className="focus-ring rounded-lg block">
              <BrandMark variant="dark" />
            </Link>

            {/* Desktop Navigation Shortcuts with Dropdowns */}
            <nav ref={dropdownRef} className="hidden lg:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200 dark:border-white/[0.08] relative">
              <Link
                href="/overview"
                onClick={() => setActiveDropdown(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isRouteActive("/overview")
                    ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <OverviewIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Overview</span>
              </Link>

              {/* Desktop Dropdown: Resume Tools */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("resume")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => {
                    if (activeDropdown === "resume") {
                      setActiveDropdown(null);
                    } else {
                      setActiveDropdown("resume");
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isRouteActive("/resume-tools")
                      ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <ResumeToolsIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Resume Tools</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "resume" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeDropdown === "resume" && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-[#111726] rounded-2xl shadow-xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-white/[0.08] p-2 animate-fade-in z-50 space-y-0.5 backdrop-blur-xl">
                    <Link
                      href="/resume-tools/ats-score-analysis"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800/70 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <AtsScoreIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>ATS Score Analysis</span>
                    </Link>
                    <Link
                      href="/resume-tools/gap-analysis"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800/70 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <GapAnalysisIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Skill Gap Analysis</span>
                    </Link>
                    <Link
                      href="/resume-tools/resume-boost"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800/70 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <ResumeBoostIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>Resume Boost</span>
                    </Link>
                    <Link
                      href="/resume-tools/cover-letter-generator"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800/70 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <MailIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Cover Letter Generator</span>
                    </Link>
                    <Link
                      href="/resume-tools/resume-builder"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800/70 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <ResumeBuilderIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Resume Builder</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Desktop Dropdown: Career Tools */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("career")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => {
                    if (activeDropdown === "career") {
                      setActiveDropdown(null);
                    } else {
                      setActiveDropdown("career");
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isRouteActive("/career-tools")
                      ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-500/25 shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <CareerToolsIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Career Tools</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "career" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeDropdown === "career" && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[#111726] rounded-2xl shadow-xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-white/[0.08] p-2 animate-fade-in z-50 space-y-0.5 backdrop-blur-xl">
                    <Link
                      href="/career-tools/career-suggestion"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-500/15 hover:bg-indigo-100/70 dark:hover:bg-indigo-500/25 transition-colors border border-indigo-100/50 dark:border-indigo-500/20"
                    >
                      <CareerSuggestionIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="flex-1">Career Suggestion</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold">New</span>
                    </Link>
                    <Link
                      href="/career-tools/learning-level-up"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/70 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <LearningIcon className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Skill Level Up</span>
                    </Link>
                    <Link
                      href="/career-tools/job-recommendation"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/70 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <JobIcon className="w-3.5 h-3.5 text-sky-500" />
                      <span>Job Recommendation</span>
                    </Link>
                    <Link
                      href="/career-tools/course-recommendations"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/70 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <CourseIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>Course Recommendations</span>
                    </Link>
                    <Link
                      href="/career-tools/career-roadmap"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/70 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <RoadmapIcon className="w-3.5 h-3.5 text-purple-500" />
                      <span>Career Roadmap</span>
                    </Link>
                    <Link
                      href="/career-tools/interview-question-generator"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/70 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <InterviewIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Interview Question Generator</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Promoted Tier Shortcut in Desktop Navbar */}
              {userRole !== "user" && (
                <Link
                  href="/admin"
                  className={`ml-2 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border shadow-2xs ${
                    userRole === "superadmin"
                      ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/25"
                      : userRole === "admin"
                      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                  }`}
                  title="Access Staff & Management Features"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{userRole === "superadmin" ? "👑 Superadmin Portal" : userRole === "admin" ? "🛡️ Admin Portal" : "⚖️ Moderator Portal"}</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Notification Bell with System Alerts Drawer */}
            <NotificationBell />

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Wrapped Profile Clicks with Dynamic Circular Profile Completion Ring */}
            <Link
              href="/profile"
              className="focus-ring group flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 p-1.5 transition-all"
              title={`View Profile Settings (Profile ${completionPercentage}% Complete)`}
            >
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-ink dark:text-white leading-tight group-hover:text-primary transition-colors">
                  {userName}
                </p>
                <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-end gap-1">
                  <span>{completionPercentage}% Profile Completion</span>
                </p>
              </div>

              {/* Circular Progress Ring Container */}
              <div className="relative flex items-center justify-center w-10 h-10">
                {/* SVG Progress Ring */}
                <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 44 44">
                  {/* Outer Track */}
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    className="text-slate-200 dark:text-slate-800 stroke-current"
                    strokeWidth="2.5"
                    fill="transparent"
                  />
                  {/* Active Dynamic Completion Fill Ring */}
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    className={`stroke-current transition-all duration-700 ease-out ${
                      completionPercentage === 100
                        ? "text-emerald-500 group-hover:text-emerald-600"
                        : "text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300"
                    }`}
                    strokeWidth="2.5"
                    strokeDasharray={113.1}
                    strokeDashoffset={113.1 * (1 - completionPercentage / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Avatar Initials Circle Inside Ring */}
                <div className="absolute inset-1 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-slate-800 font-display text-xs font-bold text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs border border-indigo-100/50 dark:border-slate-700">
                  {getInitials(userName)}
                </div>

                {/* Badge Overlay */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 text-white text-[8px] font-extrabold px-1 rounded-full border border-white dark:border-[#090d16] shadow-2xs ${
                    completionPercentage === 100 ? "bg-emerald-500" : "bg-indigo-600"
                  }`}
                >
                  {completionPercentage}%
                </div>
              </div>
            </Link>

            <button
              onClick={onLogout}
              aria-label="Log out"
              className="focus-ring flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:border-danger/30 hover:bg-danger-light dark:hover:bg-red-950/30 hover:text-danger dark:hover:text-red-400"
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Hamburger Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-in">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Left Drawer Panel */}
          <div className="relative z-10 w-80 max-w-[85vw] bg-white dark:bg-[#111726] h-full shadow-2xl flex flex-col justify-between border-r border-slate-200/80 dark:border-white/[0.08] p-6 animate-slide-in-left overflow-y-auto">
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-4 mb-6">
                <BrandMark variant="dark" />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Section 1: Overview */}
              <div className="space-y-4">
                <div>
                  <button
                    onClick={() => handleNavigate("/overview")}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      isRouteActive("/overview")
                        ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                        : "text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <OverviewIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Overview</span>
                    </span>
                    <span className="text-slate-400 text-xs">→</span>
                  </button>
                </div>

                {/* Section 2: Resume Tools Group */}
                <div className="space-y-1">
                  <button
                    onClick={() => setIsResumeOpen(!isResumeOpen)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <ResumeToolsIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Resume Tools</span>
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${isResumeOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isResumeOpen && (
                    <div className="space-y-1 pl-1">
                      <button
                        onClick={() => handleNavigate("/resume-tools/ats-score-analysis")}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/resume-tools/ats-score-analysis"
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <AtsScoreIcon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>ATS Score Analysis</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/resume-tools/gap-analysis")}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/resume-tools/gap-analysis"
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <GapAnalysisIcon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Skill Gap Analysis</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/resume-tools/resume-boost")}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/resume-tools/resume-boost"
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ResumeBoostIcon className="w-3.5 h-3.5 text-amber-500" />
                          <span>Resume Boost</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/resume-tools/cover-letter-generator")}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/resume-tools/cover-letter-generator"
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <MailIcon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Cover Letter Generator</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/resume-tools/resume-builder")}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/resume-tools/resume-builder"
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ResumeBuilderIcon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Resume Builder</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Section 3: Career Tools Group */}
                <div className="space-y-1">
                  <button
                    onClick={() => setIsCareerOpen(!isCareerOpen)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <CareerToolsIcon className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Career Tools</span>
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${isCareerOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isCareerOpen && (
                    <div className="space-y-1 pl-1">
                      <button
                        onClick={() => handleNavigate("/career-tools/career-suggestion")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/career-tools/career-suggestion"
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                            : "text-indigo-700 dark:text-indigo-300 bg-indigo-50/40 dark:bg-indigo-500/10 hover:bg-indigo-100/60 dark:hover:bg-indigo-500/20 font-semibold"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <CareerSuggestionIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Career Suggestion</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold">New</span>
                      </button>

                      <button
                        onClick={() => handleNavigate("/career-tools/learning-level-up")}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/career-tools/learning-level-up"
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <LearningIcon className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Skill Level Up</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/career-tools/job-recommendation")}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/career-tools/job-recommendation"
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <JobIcon className="w-3.5 h-3.5 text-sky-500" />
                          <span>Job Recommendation</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/career-tools/course-recommendations")}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/career-tools/course-recommendations"
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <CourseIcon className="w-3.5 h-3.5 text-amber-500" />
                          <span>Course Recommendations</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/career-tools/career-roadmap")}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/career-tools/career-roadmap"
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <RoadmapIcon className="w-3.5 h-3.5 text-purple-500" />
                          <span>Career Roadmap</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/career-tools/interview-question-generator")}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/career-tools/interview-question-generator"
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <InterviewIcon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Interview Question Generator</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Section 4: Promoted Tier Staff & Operations Group */}
                {userRole !== "user" && (
                  <div className="space-y-1.5 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
                    <div className="px-3 py-1 text-[11px] font-black tracking-wider uppercase flex items-center justify-between">
                      <span className={userRole === "superadmin" ? "text-purple-400" : userRole === "admin" ? "text-indigo-400" : "text-amber-400"}>
                        {userRole === "superadmin" ? "👑 Superadmin Tools" : userRole === "admin" ? "🛡️ Admin Tools" : "⚖️ Moderator Tools"}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
                        STAFF
                      </span>
                    </div>

                    <button
                      onClick={() => handleNavigate("/admin")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                        userRole === "superadmin"
                          ? "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/30"
                          : userRole === "admin"
                          ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30"
                          : "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <OverviewIcon className="w-4 h-4 text-indigo-500" />
                        <span>Management Portal</span>
                      </span>
                      <span className="text-xs">↗</span>
                    </button>

                    {(userRole === "superadmin" || userRole === "admin") && (
                      <>
                        <button
                          onClick={() => handleNavigate("/admin")}
                          className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            <span>Candidate Directory</span>
                          </span>
                        </button>
                        <button
                          onClick={() => handleNavigate("/admin")}
                          className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            <span>Resume Repository &amp; OCR</span>
                          </span>
                        </button>
                        <button
                          onClick={() => handleNavigate("/admin")}
                          className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            <span>System Alerts &amp; Broadcasts</span>
                          </span>
                        </button>
                      </>
                    )}

                    {userRole === "moderator" && (
                      <>
                        <button
                          onClick={() => handleNavigate("/admin")}
                          className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Feedback Triage &amp; Review</span>
                          </span>
                        </button>
                        <button
                          onClick={() => handleNavigate("/admin")}
                          className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Job &amp; Course Catalogs</span>
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Account & Theme Section inside Drawer */}
            <div className="border-t border-slate-100 dark:border-white/[0.08] pt-4 space-y-2 mt-6">
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/[0.08]">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Theme</span>
                <ThemeToggle showLabel={false} />
              </div>

              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors"
              >
                <span>Profile Settings</span>
                <span className="text-slate-400 text-xs">↗</span>
              </Link>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-between transition-colors"
              >
                <span>Log out</span>
                <LogOutIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      <UserFeedbackModal />
    </>
  );
}
