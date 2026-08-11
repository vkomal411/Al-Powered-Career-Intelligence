import React from "react";

interface KeywordHeatmapProps {
  matchScore: number;
  keywordHeatmap: Record<string, number>;
  matchedSkills: string[];
  missingSkills: string[];
}

const KeywordHeatmapInner: React.FC<KeywordHeatmapProps> = ({
  matchScore,
  keywordHeatmap,
  matchedSkills,
  missingSkills
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Job Keyword Density Heatmap</h4>
          <p className="text-[11px] text-slate-500">Visual breakdown of target job posting keywords & skill gaps</p>
        </div>
        <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
          {matchScore}% Job Match
        </span>
      </div>

      {/* Matched & Missing Skill Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">✓ Matched Competencies ({matchedSkills.length})</span>
          <div className="flex flex-wrap gap-1">
            {matchedSkills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 space-y-1.5">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">⚠️ Missing Keyword Gaps ({missingSkills.length})</span>
          <div className="flex flex-wrap gap-1">
            {missingSkills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-bold">
                + {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Keyword Frequency Density Map */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Job Posting Keywords Frequency:</span>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(keywordHeatmap).map(([kw, count]) => (
            <span
              key={kw}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                count >= 5
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                  : count >= 3
                  ? "bg-indigo-100 text-indigo-900 border-indigo-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {kw} <span className="opacity-70 text-[10px]">({count})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const KeywordHeatmap = React.memo(KeywordHeatmapInner);
