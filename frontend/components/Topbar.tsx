import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
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
import { UserResponse } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const UserFeedbackModal = dynamic(() => import("./UserFeedbackModal"), { ssr: false });

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

export default function Topbar({
  fullName: propFullName,
  user: propUser,
  onLogout,
  activeMenu,
}: TopbarProps) {
  const { user: authUser } = useAuth();
  const activeUser = propUser || authUser;
  const [userName, setUserName] = useState<string>(activeUser?.full_name || propFullName || "Venkata Komal");
  const [userRole, setUserRole] = useState<string>(activeUser?.role?.toLowerCase() || "user");
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(true);
  const [isCareerOpen, setIsCareerOpen] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<"resume" | "career" | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const currentPath = router.pathname;

  React.useEffect(() => {
    if (activeUser) {
      if (activeUser.full_name) {
        setUserName(activeUser.full_name);
      }
      if (activeUser.role) {
        setUserRole(activeUser.role.toLowerCase());
      }
      setCompletionPercentage(calculateProfileCompletion(activeUser));
    } else if (propFullName) {
      setUserName(propFullName);
    }
  }, [activeUser, propFullName]);

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
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all border border-slate-200/80 dark:border-white/[0.08] shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 flex items-center gap-2"
              title="Open Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="inline text-xs font-semibold text-slate-600 dark:text-slate-300">Menu</span>
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "resume" ? null : "resume")}
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
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-[#111726] rounded-2xl shadow-xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-white/[0.08] p-2 animate-fade-in z-50 space-y-0.5 backdrop-blur-xl">
                    <Link
                      href="/resume-tools/ats-score-analysis"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800/70 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <AtsScoreIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">ATS Score Analysis</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Check resume compatibility & formatting</span>
                      </div>
                    </Link>
                    <Link
                      href="/resume-tools/gap-analysis"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800/70 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <GapAnalysisIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">Skill Gap Analysis</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Find missing skills for target roles</span>
                      </div>
                    </Link>
                    <Link
                      href="/resume-tools/resume-boost"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800/70 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <ResumeBoostIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">Resume Boost</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">AI bullet enhancements & action verbs</span>
                      </div>
                    </Link>
                    <Link
                      href="/resume-tools/cover-letter-generator"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800/70 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <MailIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">Cover Letter Generator</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Role-tailored 3-paragraph letters</span>
                      </div>
                    </Link>
                    <Link
                      href="/resume-tools/resume-builder"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800/70 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <ResumeBuilderIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">Resume Builder</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Build, style & export PDF / Word</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Desktop Dropdown: Career Tools */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "career" ? null : "career")}
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
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-[#111726] rounded-2xl shadow-xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-white/[0.08] p-2 animate-fade-in z-50 space-y-0.5 backdrop-blur-xl">
                    <Link
                      href="/career-tools/career-suggestion"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-500/15 hover:bg-indigo-100/70 dark:hover:bg-indigo-500/25 transition-colors border border-indigo-100/50 dark:border-indigo-500/20"
                    >
                      <CareerSuggestionIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white">Career Suggestion</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-bold">New</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Discover roles matching your skillset</span>
                      </div>
                    </Link>
                    <Link
                      href="/career-tools/career-roadmap"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/70 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <RoadmapIcon className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">Career Roadmap</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Step-by-step milestone career path</span>
                      </div>
                    </Link>
                    <Link
                      href="/career-tools/course-recommendations"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/70 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <CourseIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">Course Recommendations</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Curated courses to close skill gaps</span>
                      </div>
                    </Link>
                    <Link
                      href="/career-tools/job-recommendation"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/70 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <JobIcon className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">Job Recommendation</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Browse jobs matched to your profile</span>
                      </div>
                    </Link>
                    <Link
                      href="/career-tools/interview-question-generator"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/70 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <InterviewIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">Interview Prep</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Practice role-specific STAR questions</span>
                      </div>
                    </Link>
                    <Link
                      href="/career-tools/learning-level-up"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/70 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <LearningIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">Skill Level Up</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Track daily challenges & practice</span>
                      </div>
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

            {/* Claymorphic Profile Badge with Dynamic Completion Ring */}
            <Link
              href="/profile"
              className="focus-ring group flex items-center gap-3 px-3.5 py-1.5 rounded-2xl transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] select-none bg-gradient-to-br from-white/95 via-indigo-50/40 to-slate-100/80 dark:from-[#151c2e] dark:via-[#121726] dark:to-[#0d121e] border border-white/80 dark:border-white/[0.08] shadow-[4px_6px_16px_rgba(99,102,241,0.10),-3px_-3px_10px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(99,102,241,0.08)] dark:shadow-[6px_8px_20px_rgba(0,0,0,0.5),-2px_-2px_8px_rgba(255,255,255,0.02),inset_1.5px_1.5px_3px_rgba(255,255,255,0.07),inset_-2px_-2px_6px_rgba(0,0,0,0.6)] hover:shadow-[5px_8px_20px_rgba(99,102,241,0.16),-3px_-3px_12px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(255,255,255,0.95),inset_-2px_-2px_6px_rgba(99,102,241,0.12)] dark:hover:shadow-[8px_10px_24px_rgba(0,0,0,0.65),-2px_-2px_10px_rgba(255,255,255,0.04),inset_1.5px_1.5px_3px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.7)]"
              title={`View Profile Settings (Profile ${completionPercentage}% Complete)`}
            >
              <div className="hidden text-right md:block">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {userName}
                </p>
                <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{completionPercentage}% Profile Completion</span>
                </p>
              </div>

              {/* Claymorphic Circular Progress Ring & Avatar Disk */}
              <div className="relative flex items-center justify-center w-10 h-10 flex-shrink-0">
                {/* SVG Progress Ring */}
                <svg className="w-10 h-10 transform -rotate-90 filter drop-shadow-[0_2px_4px_rgba(99,102,241,0.15)]" viewBox="0 0 44 44">
                  {/* Outer Track */}
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    className="text-slate-200/80 dark:text-slate-800/80 stroke-current"
                    strokeWidth="3"
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
                        : "text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500"
                    }`}
                    strokeWidth="3"
                    strokeDasharray={113.1}
                    strokeDashoffset={113.1 * (1 - completionPercentage / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Inflated Clay Avatar Bead Inside Ring */}
                <div className="absolute inset-[3.5px] flex items-center justify-center rounded-full font-display text-xs font-black tracking-tight transition-all duration-300 bg-gradient-to-br from-indigo-100 via-indigo-50 to-indigo-200 dark:from-indigo-900/80 dark:via-[#192237] dark:to-indigo-950 text-indigo-700 dark:text-indigo-300 border border-white/60 dark:border-white/10 shadow-[inset_2px_2px_3px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(99,102,241,0.25),0_2px_6px_rgba(99,102,241,0.2)] dark:shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.15),inset_-2px_-2px_4px_rgba(0,0,0,0.6),0_2px_6px_rgba(0,0,0,0.4)] group-hover:scale-105 group-hover:from-indigo-600 group-hover:to-indigo-700 group-hover:text-white">
                  {getInitials(userName)}
                </div>

                {/* Mini Clay Candy Percentage Badge */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white/80 dark:border-slate-900 transition-transform duration-200 group-hover:scale-110 ${
                    completionPercentage === 100
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[1px_2px_5px_rgba(16,185,129,0.4),inset_1px_1px_2px_rgba(255,255,255,0.6),inset_-1px_-1px_2px_rgba(6,95,70,0.4)]"
                      : "bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-[1px_2px_5px_rgba(99,102,241,0.45),inset_1px_1px_2px_rgba(255,255,255,0.6),inset_-1px_-1px_2px_rgba(49,46,129,0.4)]"
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
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-4 mb-4">
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

              {/* Mobile Claymorphic Profile Card */}
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-3 mb-5 rounded-2xl transition-all duration-300 ease-out hover:scale-[1.01] active:scale-[0.98] select-none bg-gradient-to-br from-white/95 via-indigo-50/40 to-slate-100/80 dark:from-[#151c2e] dark:via-[#121726] dark:to-[#0d121e] border border-white/80 dark:border-white/[0.08] shadow-[4px_6px_16px_rgba(99,102,241,0.10),-3px_-3px_10px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(99,102,241,0.08)] dark:shadow-[6px_8px_20px_rgba(0,0,0,0.5),-2px_-2px_8px_rgba(255,255,255,0.02),inset_1.5px_1.5px_3px_rgba(255,255,255,0.07),inset_-2px_-2px_6px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex items-center justify-center w-10 h-10 flex-shrink-0">
                    <svg className="w-10 h-10 transform -rotate-90 filter drop-shadow-[0_2px_4px_rgba(99,102,241,0.15)]" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="18" className="text-slate-200/80 dark:text-slate-800/80 stroke-current" strokeWidth="3" fill="transparent" />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        className={`stroke-current ${completionPercentage === 100 ? "text-emerald-500" : "text-indigo-600 dark:text-indigo-400"}`}
                        strokeWidth="3"
                        strokeDasharray={113.1}
                        strokeDashoffset={113.1 * (1 - completionPercentage / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-[3.5px] flex items-center justify-center rounded-full font-display text-xs font-black bg-gradient-to-br from-indigo-100 via-indigo-50 to-indigo-200 dark:from-indigo-900/80 dark:via-[#192237] dark:to-indigo-950 text-indigo-700 dark:text-indigo-300 border border-white/60 dark:border-white/10 shadow-[inset_2px_2px_3px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(99,102,241,0.25)] dark:shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.15),inset_-2px_-2px_4px_rgba(0,0,0,0.6)]">
                      {getInitials(userName)}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white/80 dark:border-slate-900 ${
                        completionPercentage === 100
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[1px_2px_5px_rgba(16,185,129,0.4)]"
                          : "bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-[1px_2px_5px_rgba(99,102,241,0.45)]"
                      }`}
                    >
                      {completionPercentage}%
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{userName}</p>
                    <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">{completionPercentage}% Profile Complete</p>
                  </div>
                </div>
                <span className="text-slate-400 text-xs mr-1">↗</span>
              </Link>

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
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          currentPath === "/resume-tools/ats-score-analysis"
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <AtsScoreIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold block">ATS Score Analysis</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">Check resume compatibility & formatting</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate("/resume-tools/gap-analysis")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          currentPath === "/resume-tools/gap-analysis"
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <GapAnalysisIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold block">Skill Gap Analysis</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">Find missing skills for target roles</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate("/resume-tools/resume-boost")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          currentPath === "/resume-tools/resume-boost"
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <ResumeBoostIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold block">Resume Boost</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">AI bullet enhancements & action verbs</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate("/resume-tools/cover-letter-generator")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          currentPath === "/resume-tools/cover-letter-generator"
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <MailIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold block">Cover Letter Generator</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">Role-tailored 3-paragraph letters</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate("/resume-tools/resume-builder")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          currentPath === "/resume-tools/resume-builder"
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <ResumeBuilderIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold block">Resume Builder</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">Build, style & export PDF / Word</span>
                        </div>
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
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          currentPath === "/career-tools/career-suggestion"
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/25 shadow-2xs"
                            : "text-indigo-700 dark:text-indigo-300 bg-indigo-50/40 dark:bg-indigo-500/10 hover:bg-indigo-100/60 dark:hover:bg-indigo-500/20 font-semibold"
                        }`}
                      >
                        <CareerSuggestionIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold block">Career Suggestion</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-bold">New</span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">Discover roles matching your skillset</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNavigate("/career-tools/career-roadmap")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          currentPath === "/career-tools/career-roadmap"
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <RoadmapIcon className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold block">Career Roadmap</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">Step-by-step milestone career path</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNavigate("/career-tools/course-recommendations")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          currentPath === "/career-tools/course-recommendations"
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <CourseIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold block">Course Recommendations</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">Curated courses to close skill gaps</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNavigate("/career-tools/job-recommendation")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          currentPath === "/career-tools/job-recommendation"
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <JobIcon className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold block">Job Recommendation</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">Browse jobs matched to your profile</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNavigate("/career-tools/interview-question-generator")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          currentPath === "/career-tools/interview-question-generator"
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <InterviewIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold block">Interview Prep</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">Practice role-specific STAR questions</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNavigate("/career-tools/learning-level-up")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          currentPath === "/career-tools/learning-level-up"
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-500/25 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                        }`}
                      >
                        <LearningIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold block">Skill Level Up</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">Track daily challenges & practice</span>
                        </div>
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
