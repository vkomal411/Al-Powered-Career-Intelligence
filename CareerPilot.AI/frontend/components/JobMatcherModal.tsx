import React, { useEffect, useState } from "react";
import { matchJobDescription, JobMatchResult } from "../lib/api";

interface JobMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "overview" | "strengths" | "weaknesses" | "fixes";

export default function JobMatcherModal({ isOpen, onClose }: JobMatcherModalProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const [copiedMissing, setCopiedMissing] = useState(false);
  const [copiedFixes, setCopiedFixes] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await matchJobDescription(jobDescription, jobTitle);
      setResult(data);
      setActiveTab("overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze job match.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopyMissing() {
    if (!result?.missing_skills?.length) return;
    const text = result.missing_skills.join(", ");
    navigator.clipboard.writeText(text);
    setCopiedMissing(true);
    setTimeout(() => setCopiedMissing(false), 2000);
  }

  function handleCopyFixes() {
    if (!result?.recommendations?.length) return;
    const text = result.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedFixes(true);
    setTimeout(() => setCopiedFixes(false), 2000);
  }

  const totalSkills = (result?.matched_skills?.length || 0) + (result?.missing_skills?.length || 0);
  const matchedRatio = totalSkills > 0 ? Math.round(((result?.matched_skills?.length || 0) / totalSkills) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-matcher-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-panel w-full max-w-2xl overflow-hidden animate-fade-up border border-slate-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-ink via-ink-soft to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary-light border border-primary/30 shadow-xs">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 id="job-matcher-title" className="font-display font-bold text-lg leading-tight">
                AI Semantic Job Matcher
              </h2>
              <p className="text-slate-400 text-xs">Real-time keyword overlap &amp; skill gap intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
            title="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {!result ? (
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Job Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer / Data Analyst"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Job Description Text <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste the full job description, role requirements, or skill specs here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-slate-800"
                />
              </div>

              {error && (
                <div className="bg-danger-light text-danger text-xs p-3.5 rounded-xl border border-danger/20 font-medium">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !jobDescription.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-primary to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 disabled:opacity-50 transition-all flex items-center space-x-2 active:scale-95"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Analyzing Job Match...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Analyze Job Match</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 animate-fade-up">
              {/* Target Context Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Target Job Context</span>
                  <h3 className="font-display font-bold text-slate-900 text-sm">{jobTitle || "Job Description Requirements"}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 font-bold text-xs px-3 py-1 rounded-full border shadow-2xs ${
                    result.overall_score >= 80
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : result.overall_score >= 60
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-red-100 text-red-800 border-red-300"
                  }`}>
                    {result.overall_score >= 80 ? "🎯 Strong Match" : result.overall_score >= 60 ? "⚡ Competitive Match" : "⚠️ Gap Identified"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    New Search
                  </button>
                </div>
              </div>

              {/* Categorized Segmented Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                    activeTab === "overview"
                      ? "bg-white text-ink shadow-sm font-semibold"
                      : "text-slate-500 hover:text-ink"
                  }`}
                >
                  <span>📊 Overview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("strengths")}
                  className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                    activeTab === "strengths"
                      ? "bg-white text-emerald-900 shadow-sm font-semibold"
                      : "text-slate-500 hover:text-ink"
                  }`}
                >
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Strengths ({result.matched_skills.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("weaknesses")}
                  className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                    activeTab === "weaknesses"
                      ? "bg-white text-red-900 shadow-sm font-semibold"
                      : "text-slate-500 hover:text-ink"
                  }`}
                >
                  <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                  <span>Gaps &amp; Weaknesses ({result.missing_skills.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("fixes")}
                  className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                    activeTab === "fixes"
                      ? "bg-white text-indigo-900 shadow-sm font-semibold"
                      : "text-slate-500 hover:text-ink"
                  }`}
                >
                  <span>💡 Recommended Fixes ({result.recommendations.length})</span>
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-4 animate-fade-up">
                  {/* Scores Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Overall Score */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Overall AI Match Score</span>
                      <span className={`text-3xl font-extrabold ${
                        result.overall_score >= 80 ? "text-emerald-600" : result.overall_score >= 60 ? "text-amber-600" : "text-red-600"
                      }`}>
                        {result.overall_score}%
                      </span>
                    </div>

                    {/* Semantic Similarity */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-center shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Semantic Similarity</span>
                      <span className="text-xl font-bold text-slate-800">
                        {(result.semantic_similarity * 100).toFixed(1)}%
                      </span>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 mt-2">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.min(100, result.semantic_similarity * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Skill Coverage Ratio */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-center shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Skill Coverage</span>
                      <span className="text-xl font-bold text-slate-800">
                        {result.matched_skills.length} / {totalSkills} ({matchedRatio}%)
                      </span>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 mt-2">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${matchedRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths Summary */}
                    <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-3.5 shadow-2xs">
                      <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>🟢 Key Profile Strengths</span>
                        <span className="text-[11px] font-semibold text-emerald-700">{result.matched_skills.length} skills</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {result.strengths.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Gaps Summary */}
                    <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3.5 shadow-2xs">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>🔴 Identified Gaps</span>
                        <span className="text-[11px] font-semibold text-amber-700">{result.missing_skills.length} missing</span>
                      </h4>
                      {result.missing_skills.length > 0 ? (
                        <p className="text-xs text-slate-700 font-medium">
                          Missing required skills: <span className="font-bold text-amber-900">{result.missing_skills.slice(0, 4).join(", ")}</span>
                          {result.missing_skills.length > 4 ? ` and ${result.missing_skills.length - 4} more.` : "."}
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-700 font-medium">All key JD skills covered!</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STRENGTHS */}
              {activeTab === "strengths" && (
                <div className="space-y-4 animate-fade-up">
                  <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span>Categorized Candidate Strengths ({result.strengths.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {result.strengths.map((s, idx) => {
                        const parts = s.split(":");
                        return (
                          <div key={idx} className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs flex items-start gap-2.5">
                            <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                              ✓
                            </span>
                            <div>
                              {parts.length > 1 ? (
                                <>
                                  <span className="font-bold text-emerald-900 text-xs block">{parts[0]}</span>
                                  <span className="text-xs font-medium text-slate-700">{parts[1]}</span>
                                </>
                              ) : (
                                <span className="text-xs font-medium text-slate-800">{s}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Matched Skills List */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Matched Technical Skills ({result.matched_skills.length})</span>
                    </h4>
                    {result.matched_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.matched_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs px-3 py-1 rounded-xl shadow-2xs flex items-center gap-1"
                          >
                            <span className="text-emerald-600 font-bold">✓</span> {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs italic">No explicit skill keywords matched.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: WEAKNESSES / GAPS */}
              {activeTab === "weaknesses" && (
                <div className="space-y-4 animate-fade-up">
                  <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span>Identified Skill &amp; Requirement Gaps ({result.missing_skills.length})</span>
                      </h4>

                      {result.missing_skills.length > 0 && (
                        <button
                          type="button"
                          onClick={handleCopyMissing}
                          className="text-xs font-bold text-primary hover:text-primary-dark hover:underline transition-colors bg-white px-2.5 py-1 rounded-lg border border-primary/20 shadow-2xs"
                        >
                          {copiedMissing ? "Copied List! ✓" : "📋 Copy Missing Skills"}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      These technical skills and requirements were requested in the target job description but were not detected in your current resume or profile context:
                    </p>

                    {result.missing_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.missing_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-amber-200 text-amber-900 font-bold text-xs px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5"
                          >
                            <span className="text-amber-600 font-extrabold">+</span> {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-emerald-700 font-semibold text-xs">All key JD skills are covered in your profile!</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: RECOMMENDED FIXES */}
              {activeTab === "fixes" && (
                <div className="space-y-4 animate-fade-up">
                  <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <span>💡 Categorized Actionable Improvements</span>
                      </h4>
                      {result.recommendations.length > 0 && (
                        <button
                          type="button"
                          onClick={handleCopyFixes}
                          className="text-xs font-bold text-primary hover:text-primary-dark hover:underline transition-colors bg-white px-2.5 py-1 rounded-lg border border-primary/20 shadow-2xs"
                        >
                          {copiedFixes ? "Copied All! ✓" : "📋 Copy Improvement Plan"}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      {result.recommendations.map((rec, idx) => {
                        const parts = rec.split(":");
                        return (
                          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-start gap-3">
                            <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-xs shadow-xs">
                              {idx + 1}
                            </span>
                            <div>
                              {parts.length > 1 ? (
                                <>
                                  <span className="font-bold text-slate-900 text-xs block mb-0.5">{parts[0]}</span>
                                  <span className="text-xs font-medium text-slate-600 leading-relaxed">{parts[1]}</span>
                                </>
                              ) : (
                                <span className="text-xs font-medium text-slate-700 leading-relaxed">{rec}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
