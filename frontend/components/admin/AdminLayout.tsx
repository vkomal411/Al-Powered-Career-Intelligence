import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  OverviewIcon,
  UsersIcon,
  ProfileIcon,
  ResumeIcon,
  ParsingIcon,
  JobDescIcon,
  AtsTargetIcon,
  SkillGapIcon,
  RocketIcon,
  SearchJobsIcon,
  CourseIcon,
  FeedbackIcon,
  UsageTrendIcon,
  SystemHealthIcon,
  ExportReportsIcon,
  BellAlertIcon,
  RbacShieldIcon,
  LockKeyIcon,
  KeyRoundIcon,
} from "./AdminIcons";

export interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickAlert?: () => void;
  liveLatencyMs?: number;
}

export interface AdminSubTab {
  id: string;
  label: string;
  iconId: string;
}

export interface AdminHub {
  id: string;
  label: string;
  category: "Executive" | "Core Hubs" | "Catalogs" | "Operations" | "DevOps & Security";
  iconId: string;
  subTabs: AdminSubTab[];
  defaultSubTab: string;
}

export const ADMIN_HUBS: AdminHub[] = [
  {
    id: "overview",
    label: "Overview & KPIs",
    category: "Executive",
    iconId: "overview",
    subTabs: [{ id: "overview", label: "Executive KPI Dashboard", iconId: "overview" }],
    defaultSubTab: "overview",
  },
  {
    id: "candidates",
    label: "Candidates & Resumes",
    category: "Core Hubs",
    iconId: "users",
    subTabs: [
      { id: "users", label: "Candidate Directory", iconId: "users" },
      { id: "resumes", label: "Resume Repository", iconId: "resumes" },
    ],
    defaultSubTab: "users",
  },
  {
    id: "ai-intelligence",
    label: "AI & Intelligence",
    category: "Core Hubs",
    iconId: "parsing",
    subTabs: [
      { id: "parsing", label: "Parsing OCR Monitor", iconId: "parsing" },
      { id: "ats", label: "ATS Score Quality", iconId: "ats" },
      { id: "skill-gaps", label: "Skill Gap Analytics", iconId: "skill-gaps" },
      { id: "career-recs", label: "Career & Role Trends", iconId: "career-recs" },
      { id: "job-recs", label: "Job Recommendations", iconId: "job-recs" },
    ],
    defaultSubTab: "parsing",
  },
  {
    id: "catalogs",
    label: "Catalogs & Content",
    category: "Catalogs",
    iconId: "job-descriptions",
    subTabs: [
      { id: "job-descriptions", label: "Target Job Roles", iconId: "job-descriptions" },
      { id: "courses", label: "Courses & Certifications", iconId: "courses" },
    ],
    defaultSubTab: "job-descriptions",
  },
  {
    id: "operations",
    label: "Operations & Comms",
    category: "Operations",
    iconId: "alerts",
    subTabs: [
      { id: "alerts", label: "System Alerts", iconId: "alerts" },
      { id: "feedback", label: "User Feedback", iconId: "feedback" },
      { id: "reports", label: "Export Reports", iconId: "reports" },
    ],
    defaultSubTab: "alerts",
  },
  {
    id: "devops",
    label: "DevOps & Security",
    category: "DevOps & Security",
    iconId: "system",
    subTabs: [
      { id: "system", label: "API & System Health", iconId: "system" },
      { id: "usage", label: "Usage & Activity", iconId: "usage" },
      { id: "rbac", label: "Role Permissions (RBAC)", iconId: "rbac" },
      { id: "security", label: "Audit & Security Logs", iconId: "security" },
    ],
    defaultSubTab: "system",
  },
];

// Backwards compatibility flat export
export const ADMIN_TABS = ADMIN_HUBS.flatMap((hub) =>
  hub.subTabs.map((sub) => ({ id: sub.id, label: sub.label, category: hub.category }))
);

export function resolveHubAndSubTab(tabId: string): { currentHub: AdminHub; activeSubTabId: string } {
  const directHub = ADMIN_HUBS.find((h) => h.id === tabId);
  if (directHub) {
    return { currentHub: directHub, activeSubTabId: directHub.defaultSubTab };
  }
  for (const hub of ADMIN_HUBS) {
    const matchedSub = hub.subTabs.find((s) => s.id === tabId);
    if (matchedSub) {
      return { currentHub: hub, activeSubTabId: matchedSub.id };
    }
  }
  return { currentHub: ADMIN_HUBS[0], activeSubTabId: ADMIN_HUBS[0].defaultSubTab };
}

export function getAdminIcon(tabId: string, className = "w-4 h-4") {
  switch (tabId) {
    case "overview": return <OverviewIcon className={className} />;
    case "candidates":
    case "users": return <UsersIcon className={className} />;
    case "profiles": return <ProfileIcon className={className} />;
    case "resumes": return <ResumeIcon className={className} />;
    case "ai-intelligence":
    case "parsing": return <ParsingIcon className={className} />;
    case "catalogs":
    case "job-descriptions": return <JobDescIcon className={className} />;
    case "ats": return <AtsTargetIcon className={className} />;
    case "skill-gaps": return <SkillGapIcon className={className} />;
    case "career-recs": return <RocketIcon className={className} />;
    case "job-recs": return <SearchJobsIcon className={className} />;
    case "courses": return <CourseIcon className={className} />;
    case "feedback": return <FeedbackIcon className={className} />;
    case "usage": return <UsageTrendIcon className={className} />;
    case "devops":
    case "system": return <SystemHealthIcon className={className} />;
    case "reports": return <ExportReportsIcon className={className} />;
    case "operations":
    case "alerts": return <BellAlertIcon className={className} />;
    case "rbac": return <RbacShieldIcon className={className} />;
    case "security": return <LockKeyIcon className={className} />;
    case "auth-settings": return <KeyRoundIcon className={className} />;
    default: return <OverviewIcon className={className} />;
  }
}

export default function AdminLayout({
  children,
  activeTab,
  setActiveTab,
  onQuickAlert,
  liveLatencyMs = 38.4,
}: AdminLayoutProps) {
  const [adminUser, setAdminUser] = useState<{ full_name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      const userStr = localStorage.getItem("admin_user");

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          const role = (parsed.role || "").toLowerCase();
          if (role && !["superadmin", "admin", "moderator"].includes(role)) {
            window.location.href = "/overview";
            return;
          }
          setAdminUser(parsed);
        } catch {
          setAdminUser({ full_name: "Admin User", email: "admin@careerpilot.ai", role: "superadmin" });
        }
      } else {
        setAdminUser({ full_name: "Admin User", email: "admin@careerpilot.ai", role: "superadmin" });
      }
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/admin/login";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Loading Executive Admin Portal...</p>
        </div>
      </div>
    );
  }

  const userRole = (adminUser?.role || "superadmin").toLowerCase();

  const { currentHub, activeSubTabId } = resolveHubAndSubTab(activeTab);

  const visibleHubs = ADMIN_HUBS.filter((hub) => {
    if (userRole === "superadmin" || userRole === "admin") return true;
    if (userRole === "moderator") {
      return ["overview", "candidates", "catalogs", "operations"].includes(hub.id);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-extrabold text-sm tracking-tight">
              CP
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-100 group-hover:text-indigo-400 transition-colors">
                CareerPilot AI
              </h1>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Executive Portal</span>
            </div>
          </Link>
        </div>

        {/* 6 Executive Hubs Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Navigation Hubs
          </div>
          {visibleHubs.map((hub) => {
            const isHubActive = currentHub.id === hub.id;
            return (
              <button
                key={hub.id}
                onClick={() => {
                  setActiveTab(hub.defaultSubTab);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                  isHubActive
                    ? "bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/40 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`p-1.5 rounded-lg shrink-0 ${isHubActive ? "bg-white/20 text-white" : "bg-slate-800/80 text-slate-400 group-hover:text-slate-200"}`}>
                    {getAdminIcon(hub.id, "w-4 h-4")}
                  </span>
                  <span className="truncate">{hub.label}</span>
                </div>
                {hub.subTabs.length > 1 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isHubActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {hub.subTabs.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                userRole === "superadmin"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                  : userRole === "admin"
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
              }`}>
                {adminUser?.full_name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{adminUser?.full_name}</p>
                <span className={`text-[9px] inline-block px-1.5 py-0.2 rounded uppercase font-bold border ${
                  userRole === "superadmin"
                    ? "bg-purple-500/20 text-purple-200 border-purple-500/30"
                    : userRole === "admin"
                    ? "bg-indigo-500/20 text-indigo-200 border-indigo-500/30"
                    : "bg-amber-500/20 text-amber-200 border-amber-500/30"
                }`}>
                  {userRole === "superadmin" ? "👑 Superadmin" : userRole === "admin" ? "🛡️ Admin" : "⚖️ Moderator"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Header with Quick Actions */}
        <header className="h-16 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              {getAdminIcon(currentHub.id, "w-4 h-4")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">{currentHub.label}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-medium">
                  {currentHub.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Executive Platform Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Broadcast Alert Action */}
            {onQuickAlert && (
              <button
                onClick={onQuickAlert}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all shadow-sm"
              >
                <span>📢</span>
                <span>Broadcast Alert</span>
              </button>
            )}

            {/* Live Telemetry Ping Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="font-semibold">{liveLatencyMs ? `${liveLatencyMs}ms` : "Operational"}</span>
            </div>

            {/* Link back to public app */}
            <Link
              href="/overview"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1"
            >
              <span>User App</span>
              <span>↗</span>
            </Link>
          </div>
        </header>

        {/* Sub-tab Navigation Bar (if the active hub contains >1 subTab) */}
        {currentHub.subTabs.length > 1 && (
          <div className="bg-slate-900/40 border-b border-slate-800/80 px-8 py-2.5 flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              {currentHub.subTabs.map((sub) => {
                const isSubActive = activeSubTabId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveTab(sub.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSubActive
                        ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30 border border-indigo-400/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    {getAdminIcon(sub.iconId || sub.id, "w-3.5 h-3.5")}
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content Container */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
