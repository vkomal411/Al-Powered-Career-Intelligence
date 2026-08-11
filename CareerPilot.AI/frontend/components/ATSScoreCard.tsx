import React from "react";

interface ATSScoreCardProps {
  score?: number;
  keywordMatches?: number;
  formattingIssues?: string[];
  suggestions?: string[];
  onRunScore?: () => void;
  loading?: boolean;
}

export const ATSScoreCard: React.FC<ATSScoreCardProps> = ({
  score = 88,
  keywordMatches = 12,
  formattingIssues = [],
  suggestions = [
    "Add 3 more technical skills matching your target job role.",
    "Include STAR numbers and percentages in work history bullets."
  ],
  onRunScore,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">ATS Screening Engine Audit</h3>
          <p className="text-xs text-slate-500 mt-0.5">Automated ATS parsing compatibility & keyword density analysis</p>
        </div>
        {onRunScore && (
          <button
            onClick={onRunScore}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? "Calculating..." : "⚡ Run ATS Audit"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center">
          <div className="text-3xl font-extrabold text-indigo-700">{score}%</div>
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">ATS Compatibility Score</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
          <div className="text-2xl font-bold text-emerald-700">{keywordMatches}</div>
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">Keywords Matched</div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
          <div className="text-2xl font-bold text-amber-700">{formattingIssues.length}</div>
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">Formatting Issues</div>
        </div>
      </div>

      {formattingIssues.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
          <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚠️ Formatting Warnings</span>
          </h4>
          <ul className="text-xs text-rose-800 space-y-1">
            {formattingIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span>•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span>💡 ATS Optimization Checklist</span>
          </h4>
          <ul className="text-xs text-slate-700 space-y-1.5">
            {suggestions.map((sug, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold mt-0.5">✓</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
