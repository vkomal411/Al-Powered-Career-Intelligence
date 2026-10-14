import React from "react";
import { BriefcaseIcon } from "../icons";

interface CareerGoalsTabProps {
  targetRole: string;
  setTargetRole: (val: string) => void;
  experienceLevel: string;
  setExperienceLevel: (val: string) => void;
  industry: string;
  setIndustry: (val: string) => void;
}

export default function CareerGoalsTab({
  targetRole,
  setTargetRole,
  experienceLevel,
  setExperienceLevel,
  industry,
  setIndustry,
}: CareerGoalsTabProps) {
  return (
    <div className="space-y-4">
      {/* Target role */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Job Title</label>
        <div className="focus-ring flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all dark:border-slate-700 dark:bg-slate-800/80 dark:focus-within:bg-slate-800 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-500/20">
          <BriefcaseIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="e.g., Senior Fullstack Engineer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-ink placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Experience Level</label>
        <div className="focus-ring flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all dark:border-slate-700 dark:bg-slate-800/80 dark:focus-within:bg-slate-800 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-500/20">
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-ink placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500 dark:bg-slate-800"
          >
            <option value="" className="dark:bg-slate-800 dark:text-white">Select Level</option>
            <option value="Entry-level" className="dark:bg-slate-800 dark:text-white">Entry-level (0-2 years)</option>
            <option value="Mid-level" className="dark:bg-slate-800 dark:text-white">Mid-level (2-5 years)</option>
            <option value="Senior" className="dark:bg-slate-800 dark:text-white">Senior (5-8 years)</option>
            <option value="Lead/Principal" className="dark:bg-slate-800 dark:text-white">Lead / Principal (8+ years)</option>
          </select>
        </div>
      </div>

      {/* Industry */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Preferred Industry</label>
        <div className="focus-ring flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all dark:border-slate-700 dark:bg-slate-800/80 dark:focus-within:bg-slate-800 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-500/20">
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-ink placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500 dark:bg-slate-800"
          >
            <option value="" className="dark:bg-slate-800 dark:text-white">Select Industry</option>
            <option value="Tech & Software" className="dark:bg-slate-800 dark:text-white">Tech & Software</option>
            <option value="Finance & Banking" className="dark:bg-slate-800 dark:text-white">Finance & Banking</option>
            <option value="Healthcare & Pharma" className="dark:bg-slate-800 dark:text-white">Healthcare & Pharma</option>
            <option value="Consulting & Strategy" className="dark:bg-slate-800 dark:text-white">Consulting & Strategy</option>
            <option value="E-Commerce & Retail" className="dark:bg-slate-800 dark:text-white">E-Commerce & Retail</option>
            <option value="Other" className="dark:bg-slate-800 dark:text-white">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}
