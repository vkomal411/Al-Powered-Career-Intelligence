import React, { useEffect, useMemo, useState } from "react";
import { analyzeSkillGap, SkillGapAnalysisResult } from "../lib/api";
import { GapAnalysisIcon, SparkleIcon } from "./icons";

interface JobMatchCardProps {
  resumeId: string;
  activeResumeName?: string;
}

const CAREER_PATHS = [
  "Senior Full Stack Software Engineer",
  "Backend Python / FastAPI Engineer",
  "Data Scientist & AI Specialist",
  "Machine Learning & LLM Engineer",
  "DevOps & Cloud Security Engineer",
  "UI/UX & Design Systems Engineer",
  "Other (Type custom role)",
];

export default function JobMatchCard({ resumeId, activeResumeName }: JobMatchCardProps) {
  const [targetRole, setTargetRole] = useState(CAREER_PATHS[0]);
  const [customRole, setCustomRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [result, setResult] = useState<SkillGapAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    const effectiveRole =
      targetRole === "Other (Type custom role)"
        ? customRole.trim() || "Target Job Role"
        : targetRole;

    setLoading(true);
    setError(null);
    try {
      setResult(await analyzeSkillGap(effectiveRole, jobDescription.trim() || undefined, resumeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Skill gap analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (resumeId) runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  const priorityGaps = useMemo(
    () => result?.skills.filter((skill) => skill.status !== "strength").slice(0, 3) || [],
    [result]
  );

  const readinessMessage = result
    ? result.readiness_score >= 80
      ? "You are in a strong position to apply."
      : result.readiness_score >= 60
      ? "You are close. A few focused improvements can make you more competitive."
      : "This is a longer-term path. Start with the priority gaps below."
    : "";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2.5 text-indigo-600">
          <GapAnalysisIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">Find your career skill gaps</h2>
          <p className="text-xs text-slate-500">We compare your resume with a target role and show what to improve next.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2 text-center">
        <div className="rounded-lg bg-white px-2 py-2 shadow-sm"><span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">1</span><span className="mt-1 block text-[10px] font-bold text-slate-700">Choose path</span></div>
        <div className={`rounded-lg px-2 py-2 ${result ? "bg-white shadow-sm" : ""}`}><span className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${result ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>2</span><span className="mt-1 block text-[10px] font-bold text-slate-700">See your fit</span></div>
        <div className={`rounded-lg px-2 py-2 ${result ? "bg-white shadow-sm" : ""}`}><span className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${result ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>3</span><span className="mt-1 block text-[10px] font-bold text-slate-700">Take action</span></div>
      </div>

      <form onSubmit={(event) => { event.preventDefault(); runAnalysis(); }} className="space-y-3">
        <label htmlFor="target-career-path" className="block text-xs font-bold text-slate-700">Step 1: Choose a career path</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select id="target-career-path" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none">
            {CAREER_PATHS.map((path) => <option key={path}>{path}</option>)}
          </select>
          <button type="submit" disabled={loading} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Checking…" : "Check my fit"}
          </button>
        </div>

        {targetRole === "Other (Type custom role)" && (
          <div className="space-y-1 animate-fade-up">
            <label htmlFor="custom-target-role" className="block text-[11px] font-bold uppercase tracking-wider text-indigo-700">Custom Target Job Title</label>
            <input
              id="custom-target-role"
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="e.g. Product Manager, iOS Engineer, Cybersecurity Specialist..."
              className="w-full rounded-xl border border-indigo-200 bg-indigo-50/40 px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-2xs"
            />
          </div>
        )}
        <button type="button" onClick={() => setShowJobDescription((value) => !value)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
          {showJobDescription ? "− Hide job description" : "+ Add a specific job description (optional)"}
        </button>
        {showJobDescription && <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} rows={3} placeholder="Paste the job description for a more specific comparison…" className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none" />}
      </form>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">{error}</div>}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Your result for</p>
                <h3 className="mt-1 font-display text-lg font-bold">{result.target_role}</h3>
                <p className="mt-1 text-xs text-slate-300">Based on {activeResumeName || "your uploaded resume"}</p>
              </div>
              <div className="text-center"><div className="text-3xl font-extrabold">{result.readiness_score}%</div><div className="text-[10px] font-bold uppercase text-slate-400">Ready now</div></div>
            </div>
            <p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-center text-xs font-semibold text-indigo-100">{readinessMessage}</p>
          </div>

          {result.insights[0] && <p className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs leading-relaxed text-indigo-950"><span className="font-bold">In simple terms: </span>{result.insights[0]}</p>}

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Step 2: Breakdown of your skills</h3>
              <p className="text-xs text-slate-500">Here are the exact skills detected on your resume vs. what you need to learn.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* YOU ALREADY HAVE */}
              <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">You already have</span>
                    <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-xs font-black text-emerald-900">{result.matched_skill_count}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5">Matching competencies detected</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-emerald-200/60">
                  {((result.strengths && result.strengths.length > 0) ? result.strengths : result.skills.filter(s => s.status === "strength").map(s => s.skill)).length > 0 ? (
                    ((result.strengths && result.strengths.length > 0) ? result.strengths : result.skills.filter(s => s.status === "strength").map(s => s.skill)).map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 rounded-lg bg-white border border-emerald-300 px-2 py-1 text-[11px] font-bold text-emerald-900 shadow-2xs">
                        <span className="text-emerald-600 font-extrabold">✓</span> {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-medium text-emerald-700 italic">No exact matches yet</span>
                  )}
                </div>
              </div>

              {/* YOU CAN BUILD ON */}
              <div className="flex flex-col justify-between rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">You can build on</span>
                    <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-xs font-black text-amber-900">{result.partial_skill_count}</span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 mt-0.5">Related / transferable skills</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-amber-200/60">
                  {((result.partials && result.partials.length > 0) ? result.partials : result.skills.filter(s => s.status === "partial").map(s => s.skill)).length > 0 ? (
                    ((result.partials && result.partials.length > 0) ? result.partials : result.skills.filter(s => s.status === "partial").map(s => s.skill)).map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-300 px-2 py-1 text-[11px] font-bold text-amber-900 shadow-2xs">
                        <span className="text-amber-600 font-extrabold">⚡</span> {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-medium text-amber-700 italic">No partial matches</span>
                  )}
                </div>
              </div>

              {/* FOCUS AREAS / SKILLS TO LEARN */}
              <div className="flex flex-col justify-between rounded-2xl border border-rose-200 bg-rose-50/50 p-4 space-y-3 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">Skills to learn</span>
                    <span className="rounded-full bg-rose-200/80 px-2 py-0.5 text-xs font-black text-rose-900">{result.gap_count}</span>
                  </div>
                  <p className="text-[11px] text-rose-800/80 mt-0.5">Missing key requirements</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-rose-200/60">
                  {((result.gaps && result.gaps.length > 0) ? result.gaps : result.skills.filter(s => s.status !== "strength").map(s => s.skill)).length > 0 ? (
                    ((result.gaps && result.gaps.length > 0) ? result.gaps : result.skills.filter(s => s.status !== "strength").map(s => s.skill)).map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 rounded-lg bg-white border border-rose-300 px-2 py-1 text-[11px] font-bold text-rose-900 shadow-2xs">
                        <span className="text-rose-600 font-extrabold">🎯</span> {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-medium text-rose-700 italic">All skills matched!</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div><h3 className="text-sm font-bold text-slate-900">Step 3: Review your top gaps</h3><p className="text-xs text-slate-500">Start with these skills because they have the biggest impact.</p></div>
            {priorityGaps.length > 0 ? priorityGaps.map((skill) => (
              <div key={skill.skill} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-start justify-between gap-3"><h4 className="text-sm font-bold text-slate-900">{skill.skill}</h4><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase text-amber-800">{skill.status}</span></div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{skill.blurb}</p>
                <p className="mt-2 text-[10px] font-semibold text-slate-500">Estimated learning time: about {skill.weeks_to_learn} weeks</p>
              </div>
            )) : <p className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">You have no critical gaps for this path.</p>}
          </section>

          <section className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-indigo-950"><SparkleIcon className="h-4 w-4 text-indigo-600" />Step 4: Follow your action plan</h3>
            <ol className="mt-3 space-y-2 text-xs text-slate-700">
              {(result.next_actions.length ? result.next_actions : ["Prepare for interviews using your strongest skills."]).slice(0, 3).map((action, index) => <li key={action} className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">{index + 1}</span><span>{action}</span></li>)}
            </ol>
          </section>

          {result.strengths.length > 0 && <section><h3 className="text-sm font-bold text-slate-900">Your strongest match</h3><div className="mt-2 flex flex-wrap gap-2">{result.strengths.slice(0, 5).map((skill) => <span key={skill} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800">✓ {skill}</span>)}</div></section>}

          <p className="text-center text-[11px] text-slate-400">You can improve your score by closing the top gaps and adding proof of those skills to your resume.</p>
        </div>
      )}
    </div>
  );
}
