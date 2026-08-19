import React from "react";

interface CareerDetailsProps {
  whyFit?: string;
  growthTrajectory?: string;
  recommendedSteps?: string[];
  missingSkillsSummary?: string;
}

export default function CareerDetails({
  whyFit,
  growthTrajectory,
  recommendedSteps,
  missingSkillsSummary,
}: CareerDetailsProps) {
  return (
    <div className="space-y-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs animate-fade-in">
      {/* Why fit */}
      {whyFit && (
        <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100/70 dark:border-indigo-900/60 space-y-1">
          <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 text-xs">
            <span>💡</span> Why You Fit This Role
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
            {whyFit}
          </p>
        </div>
      )}

      {/* Growth Trajectory */}
      {growthTrajectory && (
        <div className="p-3.5 bg-purple-50/40 dark:bg-purple-950/30 rounded-xl border border-purple-100/60 dark:border-purple-900/60 space-y-1">
          <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5 text-xs">
            <span>📈</span> Growth Pathway
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
            {growthTrajectory}
          </p>
        </div>
      )}

      {/* Recommended Steps */}
      {recommendedSteps && recommendedSteps.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
            <span>🚀</span> Next Action Steps
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {recommendedSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 space-y-1"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="text-[11px] leading-snug">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {missingSkillsSummary && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-0.5">
          {missingSkillsSummary}
        </p>
      )}
    </div>
  );
}
