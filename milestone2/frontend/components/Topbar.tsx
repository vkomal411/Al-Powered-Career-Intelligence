import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import BrandMark from "./BrandMark";
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
} from "./icons";

interface TopbarProps {
  fullName?: string;
  onLogout: () => void;
  activeMenu?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "VK";
}

export default function Topbar({ fullName: propFullName, onLogout, activeMenu }: TopbarProps) {
  const [userName, setUserName] = useState<string>(propFullName || "Venkata Komal");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(true);
  const [isCareerOpen, setIsCareerOpen] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<"resume" | "career" | null>(null);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const currentPath = router.pathname;

  React.useEffect(() => {
    if (propFullName && propFullName !== "Raju Venkata") {
      setUserName(propFullName);
    } else {
      import("../lib/api").then(({ apiFetch }) => {
        apiFetch<{ full_name: string }>("/auth/me")
          .then((data) => {
            if (data && data.full_name) {
              setUserName(data.full_name);
            }
          })
          .catch(() => {});
      });
    }
  }, [propFullName]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    router.push(path);
  };

  const isRouteActive = (route: string) => {
    if (route === "/overview") {
      return currentPath === "/overview" || currentPath === "/dashboard" || activeMenu === "home" || activeMenu === "overview";
    }
    return currentPath.startsWith(route);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="w-full flex items-center justify-between px-6 sm:px-8 py-3.5">
          {/* Top-Left Hamburger Button & Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="p-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition-all border border-slate-200/80 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 flex items-center gap-2"
              title="Open Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline text-xs font-semibold text-slate-600">Menu</span>
            </button>

            <Link href="/overview" className="focus-ring rounded-lg block">
              <BrandMark variant="dark" />
            </Link>

            {/* Desktop Navigation Shortcuts with Dropdowns */}
            <nav ref={dropdownRef} className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-slate-200 relative">
              <Link
                href="/overview"
                onClick={() => setActiveDropdown(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isRouteActive("/overview")
                    ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <OverviewIcon className="w-3.5 h-3.5 text-indigo-600" />
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isRouteActive("/resume-tools")
                      ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <ResumeToolsIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Resume Tools</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "resume" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeDropdown === "resume" && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 animate-fade-in z-50 space-y-0.5">
                    <Link
                      href="/resume-tools/ats-score-analysis"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <AtsScoreIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>ATS Score Analysis</span>
                    </Link>
                    <Link
                      href="/resume-tools/gap-analysis"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <GapAnalysisIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Skill Gap Analysis</span>
                    </Link>
                    <Link
                      href="/resume-tools/resume-boost"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <ResumeBoostIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>Resume Boost</span>
                    </Link>
                    <Link
                      href="/resume-tools/resume-builder"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <ResumeBuilderIcon className="w-3.5 h-3.5 text-indigo-600" />
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isRouteActive("/career-tools")
                      ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <CareerToolsIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Career Tools</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "career" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeDropdown === "career" && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 animate-fade-in z-50 space-y-0.5">
                    <Link
                      href="/career-tools/learning-level-up"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <LearningIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Learning & Level Up</span>
                    </Link>
                    <Link
                      href="/career-tools/job-recommendation"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <JobIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Job Recommendation</span>
                    </Link>
                    <Link
                      href="/career-tools/course-recommendations"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <CourseIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Course Recommendations</span>
                    </Link>
                    <Link
                      href="/career-tools/career-roadmap"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <RoadmapIcon className="w-3.5 h-3.5 text-purple-600" />
                      <span>Career Roadmap</span>
                    </Link>
                    <Link
                      href="/career-tools/interview-question-generator"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <InterviewIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Interview Question Generator</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Wrapped Profile Clicks with Circular Profile Completion Ring */}
            <Link
              href="/profile"
              className="focus-ring group flex items-center gap-3 rounded-xl hover:bg-slate-50 p-1.5 transition-all"
              title={`View Profile Settings (Profile 85% Complete)`}
            >
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-ink leading-tight group-hover:text-primary transition-colors">
                  {userName}
                </p>
                <p className="text-[10px] font-semibold text-indigo-600 flex items-center justify-end gap-1">
                  <span>85% Profile Completion</span>
                </p>
              </div>

              {/* Circular Progress Ring Container */}
              <div className="relative flex items-center justify-center w-11 h-11">
                {/* SVG Progress Ring */}
                <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 44 44">
                  {/* Outer Track */}
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    className="text-slate-200 stroke-current"
                    strokeWidth="2.5"
                    fill="transparent"
                  />
                  {/* Active Completion Fill Ring (85% = 113.1 * 0.15 = 17 strokeDashoffset) */}
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    className="text-indigo-600 stroke-current transition-all duration-700 ease-out group-hover:text-indigo-700"
                    strokeWidth="2.5"
                    strokeDasharray={113.1}
                    strokeDashoffset={17}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Avatar Initials Circle Inside Ring */}
                <div className="absolute inset-1 flex items-center justify-center rounded-full bg-indigo-50 font-display text-xs font-bold text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                  {getInitials(userName)}
                </div>

                {/* Badge Overlay */}
                <div className="absolute -bottom-0.5 -right-0.5 bg-indigo-600 text-white text-[8px] font-extrabold px-1 rounded-full border border-white shadow-2xs">
                  85%
                </div>
              </div>
            </Link>

            <button
              onClick={onLogout}
              aria-label="Log out"
              className="focus-ring flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-danger/30 hover:bg-danger-light hover:text-danger"
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Left Drawer Panel */}
          <div className="relative z-10 w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between border-r border-slate-200/80 p-6 animate-slide-in-left overflow-y-auto">
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <BrandMark variant="dark" />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <OverviewIcon className="w-4 h-4 text-indigo-600" />
                      <span>Overview</span>
                    </span>
                    <span className="text-slate-400 text-xs">→</span>
                  </button>
                </div>

                {/* Navigation Section 2: Resume Tools Dropdown Menu */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsResumeOpen(!isResumeOpen)}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-slate-50 flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2.5">
                      <ResumeToolsIcon className="w-4 h-4 text-indigo-600" />
                      <span>Resume Tools</span>
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isResumeOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isResumeOpen && (
                    <div className="pl-4 space-y-2.5 pt-2 pb-1 border-l-2 border-indigo-100 ml-3.5 animate-fade-in">
                      <button
                        onClick={() => handleNavigate("/resume-tools/ats-score-analysis")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/resume-tools/ats-score-analysis"
                            ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <AtsScoreIcon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>ATS Score Analysis</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/resume-tools/gap-analysis")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/resume-tools/gap-analysis"
                            ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <GapAnalysisIcon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Skill Gap Analysis</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/resume-tools/resume-boost")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/resume-tools/resume-boost"
                            ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ResumeBoostIcon className="w-3.5 h-3.5 text-amber-500" />
                          <span>Resume Boost</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/resume-tools/resume-builder")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/resume-tools/resume-builder"
                            ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ResumeBuilderIcon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Resume Builder</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Navigation Section 3: Career Tools Dropdown Menu */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCareerOpen(!isCareerOpen)}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-slate-50 flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2.5">
                      <CareerToolsIcon className="w-4 h-4 text-emerald-600" />
                      <span>Career Tools</span>
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isCareerOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isCareerOpen && (
                    <div className="pl-4 space-y-2.5 pt-2 pb-1 border-l-2 border-emerald-100 ml-3.5 animate-fade-in">
                      <button
                        onClick={() => handleNavigate("/career-tools/learning-level-up")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/career-tools/learning-level-up"
                            ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <LearningIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Learning & Level Up</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/career-tools/job-recommendation")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/career-tools/job-recommendation"
                            ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <JobIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>Job Recommendation</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/career-tools/course-recommendations")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/career-tools/course-recommendations"
                            ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <CourseIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Course Recommendations</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/career-tools/career-roadmap")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/career-tools/career-roadmap"
                            ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <RoadmapIcon className="w-3.5 h-3.5 text-purple-600" />
                          <span>Career Roadmap</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavigate("/career-tools/interview-question-generator")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 justify-between ${
                          currentPath === "/career-tools/interview-question-generator"
                            ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <InterviewIcon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Interview Question Generator</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Account Section inside Drawer */}
            <div className="border-t border-slate-100 pt-4 space-y-2 mt-6">
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between transition-colors"
              >
                <span>Profile Settings</span>
                <span className="text-slate-400 text-xs">↗</span>
              </Link>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center justify-between transition-colors"
              >
                <span>Log out</span>
                <LogOutIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


