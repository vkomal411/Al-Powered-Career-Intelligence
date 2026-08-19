import React from "react";
import {
  ResumeBuilderIcon,
  UploadIcon,
  CareerToolsIcon,
  AtsScoreIcon,
  OverviewIcon,
  SyncIcon
} from "../icons";

interface GoalSelectionProps {
  onSelectGoal: (goal: string) => void;
}

export const GoalSelection: React.FC<GoalSelectionProps> = ({ onSelectGoal }) => {
  const options = [
    {
      id: "create",
      renderIcon: () => (
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xs">
          <ResumeBuilderIcon className="w-5 h-5" />
        </div>
      ),
      title: "Create New AI Resume",
      desc: "Start fresh with guided AI questions and role presets.",
      badge: "Popular"
    },
    {
      id: "upload",
      renderIcon: () => (
        <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xs">
          <UploadIcon className="w-5 h-5" />
        </div>
      ),
      title: "Upload Existing Resume",
      desc: "Import PDF, DOCX, or TXT file and extract entities.",
      badge: "Fast"
    },
    {
      id: "tailor",
      renderIcon: () => (
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
          <CareerToolsIcon className="w-5 h-5" />
        </div>
      ),
      title: "Tailor Resume for Job",
      desc: "Match resume against specific job postings with keyword heatmaps.",
      badge: "High Impact"
    },
    {
      id: "ats",
      renderIcon: () => (
        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-xs">
          <AtsScoreIcon className="w-5 h-5" />
        </div>
      ),
      title: "Improve ATS Score",
      desc: "Run 7-category ATS audit and fix formatting warnings.",
      badge: "ATS Validated"
    },
    {
      id: "templates",
      renderIcon: () => (
        <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-xs">
          <OverviewIcon className="w-5 h-5" />
        </div>
      ),
      title: "Browse Layout Templates",
      desc: "Switch between Modern Clean, Classic Corporate, Minimal Tech layouts.",
      badge: "3 Layouts"
    },
    {
      id: "history",
      renderIcon: () => (
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-xs">
          <SyncIcon className="w-5 h-5" />
        </div>
      ),
      title: "Resume Version History",
      desc: "View auto-saved snapshots and restore previous revisions.",
      badge: "Auto-Save"
    }
  ];

  return (
    <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8 space-y-6 animate-fade-in shadow-sm">
      <div className="border-b border-slate-100 dark:border-white/[0.06] pb-4">
        <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/25">
          CareerPilot AI Resume Studio v2.0
        </span>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-2">What would you like to achieve today?</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select an objective below to launch your tailored AI workflow</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelectGoal(opt.id)}
            className="p-5 rounded-2xl border border-slate-200 dark:border-white/[0.06] hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/30 dark:hover:bg-slate-800 group space-y-3"
          >
            <div className="flex items-center justify-between">
              {opt.renderIcon()}
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                {opt.badge}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{opt.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
            </div>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5 pt-1">
              <span>Start Workflow</span>
              <span className="text-sm">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
