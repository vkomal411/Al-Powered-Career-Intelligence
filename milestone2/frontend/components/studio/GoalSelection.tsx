import React from "react";

interface GoalSelectionProps {
  onSelectGoal: (goal: string) => void;
}

export const GoalSelection: React.FC<GoalSelectionProps> = ({ onSelectGoal }) => {
  const options = [
    {
      id: "create",
      icon: "✍️",
      title: "Create New AI Resume",
      desc: "Start fresh with guided AI questions and role presets.",
      badge: "Popular"
    },
    {
      id: "upload",
      icon: "📥",
      title: "Upload Existing Resume",
      desc: "Import PDF, DOCX, or TXT file and extract entities.",
      badge: "Fast"
    },
    {
      id: "tailor",
      icon: "🎯",
      title: "Tailor Resume for Job",
      desc: "Match resume against specific job postings with keyword heatmaps.",
      badge: "High Impact"
    },
    {
      id: "ats",
      icon: "⚡",
      title: "Improve ATS Score",
      desc: "Run 7-category ATS audit and fix formatting warnings.",
      badge: "ATS Validated"
    },
    {
      id: "templates",
      icon: "🎨",
      title: "Browse Layout Templates",
      desc: "Switch between Modern Clean, Classic Corporate, Minimal Tech layouts.",
      badge: "3 Layouts"
    },
    {
      id: "history",
      icon: "📜",
      title: "Resume Version History",
      desc: "View auto-saved snapshots and restore previous revisions.",
      badge: "Auto-Save"
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4">
        <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          CareerPilot AI Resume Studio v2.0
        </span>
        <h2 className="font-display text-2xl font-bold text-slate-900 mt-2">What would you like to achieve today?</h2>
        <p className="text-xs text-slate-500 mt-1">Select an objective below to launch your tailored AI workflow</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelectGoal(opt.id)}
            className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-left bg-slate-50/50 hover:bg-indigo-50/30 group space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                {opt.badge}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{opt.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
            </div>
            <div className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 pt-1">
              <span>Start Workflow</span>
              <span>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
