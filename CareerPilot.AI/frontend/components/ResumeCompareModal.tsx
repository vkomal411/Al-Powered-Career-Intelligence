import React, { useState } from "react";
import { ResumeHistory } from "../lib/api";
import { SparkleIcon, FileIcon } from "./icons";

interface ResumeCompareModalProps {
  resumes: ResumeHistory[];
  isOpen: boolean;
  onClose: () => void;
  activeResumeId?: string;
}

export default function ResumeCompareModal({
  resumes,
  isOpen,
  onClose,
  activeResumeId,
}: ResumeCompareModalProps) {
  const [resume1Id, setResume1Id] = useState<string>(activeResumeId || (resumes[0]?.id ?? ""));
  const [resume2Id, setResume2Id] = useState<string>(
    resumes.find((r) => r.id !== activeResumeId)?.id || (resumes[1]?.id ?? "")
  );

  if (!isOpen) return null;

  const r1 = resumes.find((r) => r.id === resume1Id);
  const r2 = resumes.find((r) => r.id === resume2Id);

  const r1Skills = new Set(r1?.extracted_skills || []);
  const r2Skills = new Set(r2?.extracted_skills || []);

  const allSkills = Array.from(new Set([...(r1?.extracted_skills || []), ...(r2?.extracted_skills || [])]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <SparkleIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Compare Resumes & Skill Overlap
              </h3>
              <p className="text-xs text-slate-500">
                Select two uploaded resumes from your history to compare extracted skill profiles side by side.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Resume Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resume 1 Selector */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
            <label className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
              Primary Resume (Version A)
            </label>
            <select
              value={resume1Id}
              onChange={(e) => setResume1Id(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.original_filename} ({r.extracted_skills?.length || 0} skills)
                </option>
              ))}
            </select>
            {r1 && (
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>{new Date(r1.uploaded_at).toLocaleDateString()}</span>
                <span className="font-bold text-indigo-700">{r1.extracted_skills?.length || 0} Skills</span>
              </div>
            )}
          </div>

          {/* Resume 2 Selector */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
            <label className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
              Comparison Resume (Version B)
            </label>
            <select
              value={resume2Id}
              onChange={(e) => setResume2Id(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.original_filename} ({r.extracted_skills?.length || 0} skills)
                </option>
              ))}
            </select>
            {r2 && (
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>{new Date(r2.uploaded_at).toLocaleDateString()}</span>
                <span className="font-bold text-indigo-700">{r2.extracted_skills?.length || 0} Skills</span>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Table / Matrix */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Extracted Skills Comparison Matrix ({allSkills.length} Total Unique Skills)
            </h4>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> Shared Skills
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block" /> Unique to A
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500 inline-block" /> Unique to B
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Version A Unique & Shared */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                  <FileIcon className="h-4 w-4 text-indigo-600" />
                  {r1?.original_filename || "Version A"}
                </span>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {r1Skills.size} Skills
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {Array.from(r1Skills).map((s) => {
                  const isShared = r2Skills.has(s);
                  return (
                    <span
                      key={s}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold shadow-2xs border ${
                        isShared
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}
                    >
                      {isShared ? "✓" : "⚡"} {s}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Version B Unique & Shared */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                  <FileIcon className="h-4 w-4 text-purple-600" />
                  {r2?.original_filename || "Version B"}
                </span>
                <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  {r2Skills.size} Skills
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {Array.from(r2Skills).map((s) => {
                  const isShared = r1Skills.has(s);
                  return (
                    <span
                      key={s}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold shadow-2xs border ${
                        isShared
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {isShared ? "✓" : "⚡"} {s}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
          >
            Done Comparing
          </button>
        </div>
      </div>
    </div>
  );
}
