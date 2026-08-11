import React from "react";

interface HealthDashboardProps {
  score: number;
  categoryScores: Record<string, number>;
  formattingIssues: string[];
  actionItems: string[];
}

const ResumeHealthDashboardInner: React.FC<HealthDashboardProps> = ({
  score,
  categoryScores,
  actionItems
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 animate-fade-in transform-gpu">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">7-Category ATS Health Audit</h3>
          <p className="text-xs text-slate-500">Real-time analysis across structure, formatting, keywords, skills, experience, readability & completeness.</p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
          <div className="text-right">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Overall ATS Score</span>
            <span className="text-lg font-extrabold text-indigo-700">{score}% Validated</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
            {score}%
          </div>
        </div>
      </div>

      {/* Category Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(categoryScores).map(([category, catScore]) => (
          <div key={category} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>{category}</span>
              <span className="text-indigo-600">{catScore}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  catScore >= 85 ? "bg-emerald-500" : catScore >= 70 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${catScore}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Priority Action Items */}
      {actionItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
          <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <span>⚡ Priority ATS Recommendations ({actionItems.length}):</span>
          </h4>
          <ul className="space-y-1 text-xs text-amber-800 list-disc list-inside">
            {actionItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const ResumeHealthDashboard = React.memo(ResumeHealthDashboardInner);
