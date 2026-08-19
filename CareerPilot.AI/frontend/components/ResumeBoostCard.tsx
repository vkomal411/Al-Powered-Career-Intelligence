import React, { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

interface BulletPoint {
  original: string;
  improved: string;
  reason: string;
}

interface Certification {
  id: string;
  skill_domain: string;
  title: string;
  provider: string;
  level: string;
  url: string;
  description: string;
}

interface ImprovementData {
  target_role: string;
  summary: {
    current: string;
    improved: string;
    improvement_tips: string;
  };
  keyword_chips: {
    missing_action_verbs: string[];
    missing_ats_keywords: string[];
  };
  bullet_points: BulletPoint[];
  recommended_certifications: Certification[];
}

interface ResumeBoostCardProps {
  onNavigateTab: (section: string, subtab?: string) => void;
  hasResume?: boolean;
}

const SUGGESTED_ROLES = [
  "Software Engineer",
  "Frontend React Developer",
  "Backend Python / FastAPI Engineer",
  "Full Stack Engineer",
  "Data Scientist & AI Specialist",
  "Machine Learning Engineer",
  "DevOps & Cloud Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Cybersecurity Analyst",
];

export const ResumeBoostCard: React.FC<ResumeBoostCardProps> = ({
  onNavigateTab,
  hasResume = true,
}) => {
  const [data, setData] = useState<ImprovementData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"summary" | "keywords" | "bullets" | "certs">("summary");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isEditingRole, setIsEditingRole] = useState<boolean>(false);
  const [customRoleInput, setCustomRoleInput] = useState<string>("");

  useEffect(() => {
    if (hasResume) {
      fetchImprovements();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasResume]);

  useEffect(() => {
    if (data?.target_role && !selectedRole) {
      setSelectedRole(data.target_role);
      setCustomRoleInput(data.target_role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const fetchImprovements = async (targetRoleOverride?: string) => {
    setLoading(true);
    setError(null);
    const target = targetRoleOverride || selectedRole;
    try {
      const result = await apiFetch<ImprovementData>("/resume/improvements", {
        method: "POST",
        body: target ? { target_role: target } : undefined,
      });
      setData(result);
      if (result.target_role) {
        setSelectedRole(result.target_role);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not fetch resume boost suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (!newRole.trim()) return;
    setSelectedRole(newRole);
    setIsEditingRole(false);
    await fetchImprovements(newRole);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  if (!hasResume) {
    return (
      <div className="bg-white dark:bg-[#111726] rounded-2xl p-10 border border-slate-100 dark:border-white/[0.08] shadow-sm text-center animate-fade-in space-y-4">
        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
          ✎
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Upload your resume first</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-xs leading-relaxed">
          Upload your resume in Resume Check to unlock personalized summary rewrites, missing ATS keywords, STAR bullet point enhancements, and recommended certifications.
        </p>
        <button
          onClick={() => onNavigateTab("resume", "check")}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all text-xs"
        >
          Go to Resume Check →
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#111726] rounded-2xl p-10 border border-slate-100 dark:border-white/[0.08] shadow-sm text-center space-y-4 animate-pulse-glow">
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto text-2xl animate-bounce">
          ✎
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Customizing enhancements for {selectedRole || "your target role"}…</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Tailoring summary rewrites, ATS keywords, bullet points, and certifications.
        </p>
        <div className="w-36 h-1.5 bg-indigo-100 dark:bg-indigo-950 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-indigo-600 rounded-full animate-progress"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-[#111726] rounded-2xl p-8 border border-slate-100 dark:border-white/[0.08] shadow-sm text-center">
        <p className="text-rose-500 text-xs mb-4">{error || "Could not load feedback."}</p>
        <button
          onClick={() => fetchImprovements()}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-slate-100 dark:border-white/[0.08] shadow-sm animate-fade-in space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Resume Boost</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Actionable rewrites and ATS keyword optimizations tailored to your target role.
            </p>
          </div>

          {/* Interactive Target Role Changer */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {isEditingRole ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-fade-up">
                <select
                  value={SUGGESTED_ROLES.includes(customRoleInput) ? customRoleInput : "custom"}
                  onChange={(e) => {
                    if (e.target.value !== "custom") {
                      setCustomRoleInput(e.target.value);
                      handleRoleChange(e.target.value);
                    }
                  }}
                  className="rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/40 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                >
                  {SUGGESTED_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="custom">Enter custom target role...</option>
                </select>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRoleChange(customRoleInput);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    placeholder="e.g. Product Manager, iOS Engineer..."
                    className="rounded-xl border border-indigo-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none shadow-2xs min-w-[180px]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Generate
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingRole(false)}
                    className="rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent dark:border-white/[0.08]"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 px-3 py-1 text-xs font-semibold text-emerald-900 dark:text-emerald-300 shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">Target Role:</span>
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-200">{selectedRole || data.target_role}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomRoleInput(selectedRole || data.target_role);
                    setIsEditingRole(true);
                  }}
                  className="rounded-full bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1 text-xs font-bold transition-all shadow-2xs"
                >
                  ✏️ Change Target Role
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4 Renamed Sub-Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setActiveSubTab("summary")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === "summary"
                ? "bg-indigo-600 text-white shadow-sm font-bold"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-transparent dark:border-white/[0.06]"
            }`}
          >
            Rewrite My Summary
          </button>
          <button
            onClick={() => setActiveSubTab("keywords")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === "keywords"
                ? "bg-indigo-600 text-white shadow-sm font-bold"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-transparent dark:border-white/[0.06]"
            }`}
          >
            Add Missing Keywords
          </button>
          <button
            onClick={() => setActiveSubTab("bullets")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === "bullets"
                ? "bg-indigo-600 text-white shadow-sm font-bold"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-transparent dark:border-white/[0.06]"
            }`}
          >
            Strengthen My Bullet Points
          </button>
          <button
            onClick={() => setActiveSubTab("certs")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === "certs"
                ? "bg-indigo-600 text-white shadow-sm font-bold"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-transparent dark:border-white/[0.06]"
            }`}
          >
            Certifications Worth Getting
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Rewrite My Summary */}
      {activeSubTab === "summary" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/[0.06] p-4 rounded-xl">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Current Summary
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 italic">&quot;{data.summary.current}&quot;</p>
          </div>

          <div className="bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                ✨ Improved Executive Summary
              </span>
              <button
                onClick={() => copyToClipboard(data.summary.improved, "summary")}
                className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition-all"
              >
                {copiedKey === "summary" ? "✓ Copied!" : "📋 Copy"}
              </button>
            </div>

            <p className="text-xs text-indigo-950 dark:text-indigo-100 font-medium leading-relaxed">
              &quot;{data.summary.improved}&quot;
            </p>

            <p className="text-xs text-indigo-700 dark:text-indigo-300 border-t border-indigo-200/60 dark:border-indigo-500/20 pt-2.5">
              💡 <strong>Why this works:</strong> {data.summary.improvement_tips}
            </p>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Add Missing Keywords */}
      {activeSubTab === "keywords" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Missing Action Verbs (Tap to copy)
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.keyword_chips.missing_action_verbs.map((verb) => (
                <button
                  key={verb}
                  onClick={() => copyToClipboard(verb, verb)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 border ${
                    copiedKey === verb
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-500/25 hover:bg-indigo-100 dark:hover:bg-indigo-500/25"
                  }`}
                >
                  {copiedKey === verb ? "✓ Copied" : `+ ${verb}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Missing Technical Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.keyword_chips.missing_ats_keywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => copyToClipboard(kw, kw)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 border ${
                    copiedKey === kw
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/25 hover:bg-amber-100 dark:hover:bg-amber-500/25"
                  }`}
                >
                  {copiedKey === kw ? "✓ Copied" : `+ ${kw}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Strengthen My Bullet Points */}
      {activeSubTab === "bullets" && (
        <div className="space-y-4 animate-fade-in">
          {data.bullet_points.map((bullet, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/[0.06] p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Bullet #{idx + 1}</span>
                <button
                  onClick={() => copyToClipboard(bullet.improved, `bullet-${idx}`)}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs font-bold underline"
                >
                  {copiedKey === `bullet-${idx}` ? "✓ Copied" : "Copy Improved"}
                </button>
              </div>

              <div className="bg-rose-50/70 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-900 dark:text-rose-200 p-3 rounded-xl text-xs">
                <span className="font-bold text-rose-700 dark:text-rose-300 block mb-0.5">Original:</span>
                &quot;{bullet.original}&quot;
              </div>

              <div className="bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-200 p-3 rounded-xl text-xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">Improved:</span>
                &quot;{bullet.improved}&quot;
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                <strong>Why it&apos;s better:</strong> {bullet.reason}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Sub-Tab 4: Certifications Worth Getting */}
      {activeSubTab === "certs" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          {data.recommended_certifications.map((cert) => (
            <div key={cert.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                    {cert.skill_domain}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{cert.level}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-1">{cert.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">By {cert.provider}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{cert.description}</p>
              </div>

              <a
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 rounded-lg transition-all"
              >
                Learn More ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
