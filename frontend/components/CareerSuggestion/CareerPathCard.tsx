import React, { useState } from "react";
import { CareerPathSuggestion } from "../../lib/api";
import CareerScore from "./CareerScore";
import SkillMatchList from "./SkillMatchList";
import MarketInfo from "./MarketInfo";
import CareerDetails from "./CareerDetails";
import CareerActionButtons from "./CareerActionButtons";

interface CareerPathCardProps {
  career: CareerPathSuggestion;
  rank?: number;
  onSetTargetRole?: (role: string) => void;
  defaultExpanded?: boolean;
}

export default function CareerPathCard({
  career,
  rank,
  onSetTargetRole,
  defaultExpanded = false,
}: CareerPathCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#111726] border transition-all duration-200 shadow-2xs hover:shadow-md dark:hover:border-slate-700 p-5 space-y-4 ${
        career.match_score >= 80
          ? "border-slate-200/90 dark:border-white/[0.08] ring-1 ring-emerald-500/25"
          : "border-slate-200 dark:border-white/[0.08]"
      }`}
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {rank && (
            <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/25 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center mt-0.5">
              #{rank}
            </span>
          )}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                {career.career_title}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold border border-transparent dark:border-white/[0.06]">
                {career.category}
              </span>
              {career.is_alternative && (
                <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-500/25">
                  Alternative Pivot
                </span>
              )}
            </div>
            {career.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                {career.description}
              </p>
            )}
          </div>
        </div>

        {/* Match Fit Score */}
        <CareerScore score={career.match_score} matchLevel={career.match_level} />
      </div>

      {/* Market Metrics Strip */}
      <MarketInfo
        marketInfo={career.market_info}
        transitionDifficulty={career.transition_difficulty}
      />

      {/* Skills Summary */}
      <SkillMatchList
        matchingSkills={career.matching_skills_display || career.matching_skills}
        missingSkills={career.missing_skills_display || career.missing_skills}
      />

      {/* Expanded AI Details (Why You Fit, Trajectory, Action Steps) */}
      {expanded && (
        <CareerDetails
          whyFit={career.why_fit}
          growthTrajectory={career.growth_trajectory}
          recommendedSteps={career.recommended_steps}
          missingSkillsSummary={career.missing_skills_summary}
        />
      )}

      {/* Action Buttons */}
      <CareerActionButtons
        careerTitle={career.career_title}
        careerId={career.career_id}
        onSetTargetRole={onSetTargetRole}
        isExpanded={expanded}
        onToggleExpand={() => setExpanded(!expanded)}
      />
    </div>
  );
}
