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
}

export const ADMIN_TABS = [
  { id: "overview", label: "Overview & KPIs", category: "Core" },
  { id: "users", label: "Candidate Directory", category: "Core" },
  { id: "resumes", label: "Resume Repository", category: "Core" },
  { id: "parsing", label: "Parsing Engine Monitor", category: "AI & Intelligence" },
  { id: "ats", label: "ATS Score Quality", category: "AI & Intelligence" },
  { id: "skill-gaps", label: "Skill Gap Analytics", category: "AI & Intelligence" },
  { id: "career-recs", label: "Career & Role Trends", category: "AI & Intelligence" },
  { id: "job-recs", label: "Job Recommendations", category: "AI & Intelligence" },
  { id: "job-descriptions", label: "Target Job Roles", category: "Catalogs" },
  { id: "courses", label: "Courses & Certifications", category: "Catalogs" },
  { id: "feedback", label: "User Feedback", category: "Operations" },
  { id: "reports", label: "Export Reports", category: "Operations" },
  { id: "alerts", label: "System Alerts", category: "Operations" },
  { id: "system", label: "API & System Health", category: "Security & Ops" },
  { id: "usage", label: "Usage & Activity", category: "Security & Ops" },
  { id: "rbac", label: "Role Permissions (RBAC)", category: "Security & Ops" },
  { id: "security", label: "Audit & Security Logs", category: "Security & Ops" },
];

export function getAdminIcon(tabId: string, className = "w-4 h-4") {
  switch (tabId) {
    case "overview": return <OverviewIcon className={className} />;
    case "users": return <UsersIcon className={className} />;
    case "profiles": return <ProfileIcon className={className} />;
    case "resumes": return <ResumeIcon className={className} />;
    case "parsing": return <ParsingIcon className={className} />;
    case "job-descriptions": return <JobDescIcon className={className} />;
    case "ats": return <AtsTargetIcon className={className} />;
    case "skill-gaps": return <SkillGapIcon className={className} />;
    case "career-recs": return <RocketIcon className={className} />;
    case "job-recs": return <SearchJobsIcon className={className} />;
    case "courses": return <CourseIcon className={className} />;
    case "feedback": return <FeedbackIcon className={className} />;
    case "usage": return <UsageTrendIcon className={className} />;
    case "system": return <SystemHealthIcon className={className} />;
    case "reports": return <ExportReportsIcon className={className} />;
    case "alerts": return <BellAlertIcon className={className} />;
    case "rbac": return <RbacShieldIcon className={className} />;
    case "security": return <LockKeyIcon className={className} />;
    case "auth-settings": return <KeyRoundIcon className={className} />;
    default: return <OverviewIcon className={className} />;
  }
}

export default function AdminLayout({ children, activeTab, setActiveTab }: AdminLayoutProps) {
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
          <p className="text-slate-400 text-sm font-medium">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  const userRole = (adminUser?.role || "superadmin").toLowerCase();

  const visibleTabs = ADMIN_TABS.filter((tab) => {
    if (userRole === "superadmin") return true;
    if (userRole === "admin") {
      return true;
    }
    if (userRole === "moderator") {
      return ["overview", "users", "resumes", "job-descriptions", "courses", "feedback", "system", "rbac"].includes(tab.id);
    }
    return true;
  });

  const activeTabMeta = visibleTabs.find((t) => t.id === activeTab) || visibleTabs[0] || ADMIN_TABS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-extrabold text-sm tracking-tight">
              CP
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-100 group-hover:text-indigo-400 transition-colors">
                CareerPilot AI
              </h1>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Admin Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs List tailored to user role */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {visibleTabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const isCategoryStart = idx === 0 || visibleTabs[idx - 1].category !== tab.category;

            return (
              <React.Fragment key={tab.id}>
                {isCategoryStart && (
                  <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {tab.category}
                  </div>
                )}
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <span className={`p-1 rounded-lg ${isActive ? "bg-white/20 text-white" : "bg-slate-800/80 text-slate-400"}`}>
                    {getAdminIcon(tab.id, "w-3.5 h-3.5")}
                  </span>
                  <span className="truncate">{tab.label}</span>
                </button>
              </React.Fragment>
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
      <div className="flex-1 pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              {getAdminIcon(activeTabMeta.id, "w-4 h-4")}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">{activeTabMeta.label}</h2>
              <p className="text-[11px] text-slate-400">Platform Analytics & Management Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* System Operational Pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>System Operational</span>
            </div>

            {/* Link back to public app */}
            <Link
              href="/overview"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              App View ↗
            </Link>
          </div>
        </header>

        {/* Tab Content Container */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
