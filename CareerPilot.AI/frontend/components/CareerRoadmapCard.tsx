import React, { useState, useEffect, useCallback, useRef } from "react";
import { fetchAIRoadmap, AIRoadmapData, RoadmapMilestone } from "../lib/api";
import { SparkleIcon } from "./icons";

export const CareerRoadmapCard: React.FC = () => {
  const [targetRole, setTargetRole] = useState<string>("Senior Full-Stack Developer");
  const [currentRole, setCurrentRole] = useState<string>("Software Developer");
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [selectedMilestoneOrder, setSelectedMilestoneOrder] = useState<number>(1);

  // Behavioral Psychology State: Completed Milestones Tracker
  const [completedMilestones, setCompletedMilestones] = useState<number[]>([]);

  // Form Controls
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(15);
  const [timelineMonths, setTimelineMonths] = useState<number>(6);

  // AI Data State
  const [loading, setLoading] = useState<boolean>(false);
  const [roadmapData, setRoadmapData] = useState<AIRoadmapData | null>(null);

  const loadRoadmap = useCallback(async (roleToLoad: string) => {
    setLoading(true);
    try {
      const res = await fetchAIRoadmap(roleToLoad, currentRole, ["TypeScript", "React", "Python", "SQL"], hoursPerWeek, timelineMonths);
      if (res && res.data) {
        setRoadmapData(res.data);
        if (res.data.milestones && res.data.milestones.length > 0) {
          setSelectedMilestoneOrder(res.data.milestones[0].order);
        }
      }
    } catch (err) {
      console.error("Failed to generate AI roadmap:", err);
    } finally {
      setLoading(false);
    }
  }, [currentRole, hoursPerWeek, timelineMonths]);

  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    loadRoadmap(targetRole);
  }, [loadRoadmap, targetRole]);

  const handleSaveGoal = () => {
    setIsEditingGoal(false);
    if (targetRole.trim()) {
      loadRoadmap(targetRole.trim());
    }
  };

  const toggleMilestoneCompletion = (order: number) => {
    if (completedMilestones.includes(order)) {
      setCompletedMilestones(completedMilestones.filter((o) => o !== order));
    } else {
      setCompletedMilestones([...completedMilestones, order]);
    }
  };

  const activeMilestone: RoadmapMilestone | undefined = roadmapData?.milestones?.find(
    (m) => m.order === selectedMilestoneOrder
  ) || roadmapData?.milestones?.[0];

  // Dynamic Psychological Readiness Calculation
  const baseReadiness = roadmapData?.readiness_score || 65;
  const bonusReadiness = completedMilestones.length * 10;
  const currentReadiness = Math.min(98, baseReadiness + bonusReadiness);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-10 animate-fade-in font-sans">
      {/* 🧠 SECTION 1: COGNITIVE HEADER & TARGET ANCHORING */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <SparkleIcon className="w-3.5 h-3.5" />
              Behavioral AI Strategy Engine
            </span>
            <span className="text-xs text-slate-300">•</span>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/70 border border-indigo-150 text-indigo-900 text-xs font-semibold shadow-2xs">
              <span className="text-indigo-600 font-bold">Target Role:</span>
              {isEditingGoal ? (
                <input
                  type="text"
                  autoFocus
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  onBlur={handleSaveGoal}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveGoal()}
                  className="bg-white text-slate-900 px-2.5 py-0.5 rounded-md text-xs font-bold outline-none border border-indigo-500 w-52 shadow-2xs"
                />
              ) : (
                <span
                  onClick={() => setIsEditingGoal(true)}
                  className="font-extrabold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                  title="Click to edit target role"
                >
                  <span>{targetRole}</span>
                  <svg className="w-3.5 h-3.5 text-indigo-500 hover:text-indigo-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </span>
              )}
            </div>
          </div>

          <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Personalized Career Velocity Blueprint
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Psychologically structured roadmap designed to eliminate decision friction, build momentum through small wins, and map concrete proof-of-work deliverables.
          </p>
        </div>

        {/* Hero Psychological Progress Meter */}
        <div className="flex items-center gap-5 p-5 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50/80 rounded-2xl border border-indigo-100/80 shadow-xs self-start lg:self-auto">
          <div className="relative flex items-center justify-center w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" className="text-slate-150 stroke-current" strokeWidth="3" fill="transparent" />
              <circle
                cx="22"
                cy="22"
                r="18"
                className="text-indigo-600 stroke-current transition-all duration-1000 ease-out"
                strokeWidth="3.5"
                strokeDasharray={113.1}
                strokeDashoffset={113.1 - (currentReadiness / 100) * 113.1}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute font-extrabold text-sm text-indigo-950">{currentReadiness}%</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">Readiness Velocity</span>
            <h4 className="font-bold text-slate-900 text-sm">
              {currentReadiness >= 80 ? "🚀 High Market Readiness" : "⚡ Active Career Build"}
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              {completedMilestones.length} of {roadmapData?.milestones.length || 3} Milestones Verified
            </p>
          </div>
        </div>
      </div>

      {/* 🧠 SECTION 2: SINGLE FOCUS WEEKLY SPRINT (DECISION FATIGUE REDUCTION) */}
      {roadmapData && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                🔥 High-Impact Weekly Priority
              </span>
              <span className="text-xs text-slate-400">• Goal-Gradient Sprint</span>
            </div>
            <h3 className="font-bold text-base text-white">{roadmapData.next_immediate_action}</h3>
          </div>
          <button
            onClick={() => loadRoadmap(targetRole)}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all shadow-sm flex items-center gap-2 flex-shrink-0 z-10 disabled:opacity-60"
          >
            {loading ? "Optimizing Strategy..." : "✨ Re-optimize Blueprint"}
          </button>
        </div>
      )}

      {/* 🧠 SECTION 3: PARAMETER CONTROLS & TIMELINE GOALS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Current Role</label>
          <input
            type="text"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            onBlur={() => loadRoadmap(targetRole)}
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Target Horizon (Months)</label>
          <select
            value={timelineMonths}
            onChange={(e) => {
              setTimelineMonths(Number(e.target.value));
              loadRoadmap(targetRole);
            }}
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
          >
            <option value={3}>3 Months (Fast-Track Sprint)</option>
            <option value={6}>6 Months (Balanced Progression)</option>
            <option value={12}>12 Months (Comprehensive Mastery)</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Weekly Effort Budget</label>
          <select
            value={hoursPerWeek}
            onChange={(e) => {
              setHoursPerWeek(Number(e.target.value));
              loadRoadmap(targetRole);
            }}
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
          >
            <option value={10}>10 Hours / Week</option>
            <option value={15}>15 Hours / Week</option>
            <option value={25}>25+ Hours / Week</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-4 bg-slate-50 rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Synthesizing Behavioral AI Roadmap...</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Executing deep reasoning algorithms to break down skill gaps, sequence proof deliverables, and reduce cognitive fatigue for &quot;{targetRole}&quot;.
          </p>
        </div>
      ) : roadmapData ? (
        <>
          {/* 🧠 SECTION 4: GAP DIAGNOSTICS & STRENGTH ANCHORING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Critical Skill Gaps */}
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <span>⚡ Priority Skill Gaps to Bridge</span>
                </h4>
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  {roadmapData.gap_analysis.critical_gaps.length} Gaps Identified
                </span>
              </div>
              <ul className="space-y-2">
                {roadmapData.gap_analysis.critical_gaps.map((gap, idx) => (
                  <li key={idx} className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-rose-100 shadow-2xs font-medium flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">
                      !
                    </span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Transferable Strengths */}
            <div className="p-6 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <span>✓ Transferable Core Strengths</span>
                </h4>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {roadmapData.gap_analysis.existing_strengths.length} Assets Verified
                </span>
              </div>
              <ul className="space-y-2">
                {roadmapData.gap_analysis.existing_strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs font-semibold flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                      ✓
                    </span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 🧠 SECTION 5: SEQUENCED MILESTONE CARDS WITH PSYCHOLOGICAL COMPLETION TOGGLES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Sequenced Milestone Path</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click any milestone to inspect proof deliverables or mark complete to increase your readiness score.</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Phase Timeline: {roadmapData.estimated_timeline_months} Months
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {roadmapData.milestones.map((m) => {
                const isSelected = selectedMilestoneOrder === m.order;
                const isCompleted = completedMilestones.includes(m.order);

                return (
                  <div
                    key={m.order}
                    onClick={() => setSelectedMilestoneOrder(m.order)}
                    className={`cursor-pointer p-6 rounded-2xl border transition-all space-y-4 relative ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full font-extrabold text-xs flex items-center justify-center transition-all ${
                          isCompleted ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white"
                        }`}>
                          {isCompleted ? "✓" : m.order}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Milestone #{m.order}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {m.duration_weeks} Weeks
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-snug">{m.title}</h4>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{m.goal}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMilestoneCompletion(m.order);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200"
                        }`}
                      >
                        {isCompleted ? "✓ Verified Complete" : "◯ Mark Complete"}
                      </button>

                      <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                        <span>Details</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🧠 SECTION 6: SELECTED MILESTONE DEEP-DIVE & PROOF-OF-WORK DELIVERABLE */}
          {activeMilestone && (
            <div className="p-6 sm:p-8 rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/50 space-y-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold uppercase">
                      Active Milestone #{activeMilestone.order}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-500">{activeMilestone.duration_weeks} Weeks Duration</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-slate-900 mt-1">{activeMilestone.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{activeMilestone.goal}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleMilestoneCompletion(activeMilestone.order)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs self-start sm:self-auto ${
                    completedMilestones.includes(activeMilestone.order)
                      ? "bg-emerald-600 text-white shadow-emerald-600/20"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                  }`}
                >
                  {completedMilestones.includes(activeMilestone.order) ? "✓ Milestone Verified Complete" : "Mark Milestone Complete (+10% Readiness)"}
                </button>
              </div>

              {/* Skills to Master Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Required Technical Skills & Learning Resources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeMilestone.skills_to_learn.map((sk, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{sk.skill}</span>
                        <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          sk.priority === "must_have"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}>
                          {sk.priority.replace("_", " ")}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="text-[11px] text-slate-500 font-semibold flex items-start gap-1">
                          <span className="text-indigo-600 font-bold">🎓 Course Source:</span>
                          <span className="text-slate-800 font-bold leading-tight">{sk.course_title || sk.resource_type}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-[10px] text-slate-400 font-medium">Verified Course Track</span>
                          <a
                            href={sk.course_url || sk.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold transition-all shadow-2xs flex items-center gap-1 flex-shrink-0"
                            title={`Open direct course source for ${sk.skill}`}
                          >
                            <span>🎓 Open Course Source</span>
                            <span>→</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Self-Efficacy Proof Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">🎨 Proof-of-Work Deliverable</span>
                  <p className="text-xs font-bold text-slate-900 leading-relaxed">{activeMilestone.project_or_proof}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">🎯 Success Criteria Verification</span>
                  <p className="text-xs font-bold text-emerald-700 leading-relaxed">{activeMilestone.success_criteria}</p>
                </div>
              </div>
            </div>
          )}

          {/* 🧠 SECTION 7: ANXIETY REDUCTION & RESUME POSITIONING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
            {/* Certifications Recommended */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Target Certifications & Credentials</h4>
              <div className="space-y-2.5">
                {roadmapData.certifications_recommended.map((cert, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{cert.name}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{cert.reason}</span>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-900 flex-shrink-0">
                      {cert.priority.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Reframing Strategy */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Tactical Resume Positioning Tips</h4>
              <ul className="space-y-2.5">
                {roadmapData.resume_positioning_tips.map((tip, idx) => (
                  <li key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium flex items-start gap-2.5">
                    <span className="text-indigo-600 font-bold text-sm">💡</span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default CareerRoadmapCard;
