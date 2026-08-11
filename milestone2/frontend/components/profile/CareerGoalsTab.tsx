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
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Job Title</label>
        <div className="focus-ring flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <BriefcaseIcon className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="e.g., Senior Fullstack Engineer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-ink placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Experience Level</label>
        <div className="focus-ring flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-ink placeholder:text-slate-400 focus:outline-none"
          >
            <option value="">Select Level</option>
            <option value="Entry-level">Entry-level (0-2 years)</option>
            <option value="Mid-level">Mid-level (2-5 years)</option>
            <option value="Senior">Senior (5-8 years)</option>
            <option value="Lead/Principal">Lead / Principal (8+ years)</option>
          </select>
        </div>
      </div>

      {/* Industry */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Preferred Industry</label>
        <div className="focus-ring flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-ink placeholder:text-slate-400 focus:outline-none"
          >
            <option value="">Select Industry</option>
            <option value="Tech & Software">Tech & Software</option>
            <option value="Finance & Banking">Finance & Banking</option>
            <option value="Healthcare & Pharma">Healthcare & Pharma</option>
            <option value="Consulting & Strategy">Consulting & Strategy</option>
            <option value="E-Commerce & Retail">E-Commerce & Retail</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}
