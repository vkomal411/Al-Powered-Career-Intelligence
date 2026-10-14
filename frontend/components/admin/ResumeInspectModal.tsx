import React from "react";
import {
  DocumentTextIcon,
  DownloadIcon,
  CloseIcon,
  JobDescIcon,
  TrophyIcon,
  CopyIcon,
  SparklesIcon,
  TrashIcon,
} from "./AdminIcons";

interface ResumeInspectModalProps {
  inspectingResume: any;
  onClose: () => void;
  resumeModalTab: "overview" | "experience" | "education" | "raw";
  setResumeModalTab: (tab: "overview" | "experience" | "education" | "raw") => void;
  onDownload: (resumeId: string, filename: string) => void;
  onDelete: (resumeId: string, filename: string) => void;
}

export const ResumeInspectModal: React.FC<ResumeInspectModalProps> = ({
  inspectingResume,
  onClose,
  resumeModalTab,
  setResumeModalTab,
  onDownload,
  onDelete,
}) => {
  if (!inspectingResume) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 dark:bg-[#111726] border border-slate-800 dark:border-white/[0.1] rounded-2xl shadow-2xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-800 dark:border-white/[0.08] flex justify-between items-start bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-base uppercase shadow-lg shadow-indigo-600/30">
              {inspectingResume.owner_name ? inspectingResume.owner_name.slice(0, 2) : "CV"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100 dark:text-white">
                  {inspectingResume.owner_name || inspectingResume.extracted_name || "Candidate Resume"}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                    (inspectingResume.ats_score || 0) >= 80
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : (inspectingResume.ats_score || 0) >= 60
                      ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                      : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                  }`}
                >
                  {inspectingResume.ats_score || 0} / 100 ATS Score
                </span>
              </div>
              <p className="text-xs text-indigo-400 font-mono mt-0.5 flex items-center gap-1.5">
                <span>{inspectingResume.owner_email || inspectingResume.extracted_email}</span>
                <span>•</span>
                <DocumentTextIcon className="w-3.5 h-3.5 inline" />
                <span>{inspectingResume.filename}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(inspectingResume.id, inspectingResume.filename)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Download File</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-sm"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary Metric Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-slate-950/20 border-b border-slate-800 dark:border-white/[0.06] text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 dark:bg-slate-800/50 border border-slate-800 dark:border-white/[0.06]">
            <span className="text-slate-400 block mb-0.5">Candidate Phone</span>
            <span className="font-bold text-slate-200 dark:text-white">
              {inspectingResume.extracted_phone || "Not specified"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 dark:bg-slate-800/50 border border-slate-800 dark:border-white/[0.06]">
            <span className="text-slate-400 block mb-0.5">Parsed Skills</span>
            <span className="font-bold text-indigo-400">
              {inspectingResume.extracted_skills?.length || 0} skills detected
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 dark:bg-slate-800/50 border border-slate-800 dark:border-white/[0.06]">
            <span className="text-slate-400 block mb-0.5">Experience Records</span>
            <span className="font-bold text-purple-400">
              {inspectingResume.extracted_experience?.length || 0} positions
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 dark:bg-slate-800/50 border border-slate-800 dark:border-white/[0.06]">
            <span className="text-slate-400 block mb-0.5">Uploaded Date</span>
            <span className="font-bold text-slate-300">
              {new Date(inspectingResume.uploaded_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Modal Tab Switcher */}
        <div className="flex border-b border-slate-800 dark:border-white/[0.08] px-6 bg-slate-950/30 gap-4 text-xs font-bold">
          <button
            onClick={() => setResumeModalTab("overview")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              resumeModalTab === "overview"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <DocumentTextIcon className="w-3.5 h-3.5" />
            <span>Overview &amp; Skills</span>
          </button>
          <button
            onClick={() => setResumeModalTab("experience")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              resumeModalTab === "experience"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <JobDescIcon className="w-3.5 h-3.5" />
            <span>Work Experience ({inspectingResume.extracted_experience?.length || 0})</span>
          </button>
          <button
            onClick={() => setResumeModalTab("education")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              resumeModalTab === "education"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrophyIcon className="w-3.5 h-3.5" />
            <span>Education &amp; Projects</span>
          </button>
          <button
            onClick={() => setResumeModalTab("raw")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              resumeModalTab === "raw"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CopyIcon className="w-3.5 h-3.5" />
            <span>Raw Resume Text</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Tab 1: Overview & Skills */}
          {resumeModalTab === "overview" && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-slate-300 dark:text-slate-200 uppercase mb-2">
                  Parsed Skills &amp; Keywords
                </h4>
                <div className="flex flex-wrap gap-1.5 p-4 rounded-xl bg-slate-950/60 dark:bg-slate-800/50 border border-slate-800 dark:border-white/[0.06]">
                  {inspectingResume.extracted_skills && inspectingResume.extracted_skills.length > 0 ? (
                    inspectingResume.extracted_skills.map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 font-medium border border-indigo-500/20"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No skills extracted.</span>
                  )}
                </div>
              </div>

              {inspectingResume.suggestions && inspectingResume.suggestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-300 dark:text-slate-200 uppercase mb-2">
                    ATS Audit &amp; Optimization Recommendations
                  </h4>
                  <div className="space-y-2">
                    {inspectingResume.suggestions.map((s: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2"
                      >
                        <SparklesIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                        <div>
                          <p className="font-bold">{typeof s === "string" ? s : s.title || s.message}</p>
                          {s.description && (
                            <p className="text-[11px] text-amber-400/80 mt-0.5">{s.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Work Experience */}
          {resumeModalTab === "experience" && (
            <div className="space-y-4">
              {inspectingResume.extracted_experience && inspectingResume.extracted_experience.length > 0 ? (
                inspectingResume.extracted_experience.map((exp: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/60 dark:bg-slate-800/50 border border-slate-800 dark:border-white/[0.06] space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-slate-100 dark:text-white text-sm">
                          {exp.role || exp.title || exp.job_title || "Position Title"}
                        </h5>
                        <p className="text-indigo-400 font-medium">
                          {exp.company || exp.organization || "Company"}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-400 font-mono">
                        {exp.duration || exp.dates || exp.period || "Dates not specified"}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                    {exp.highlights && Array.isArray(exp.highlights) && (
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                        {exp.highlights.map((h: string, hIdx: number) => (
                          <li key={hIdx}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                  No structured work experience parsed from this resume.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Education & Projects */}
          {resumeModalTab === "education" && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-slate-300 dark:text-slate-200 uppercase mb-2">
                  Education Qualifications
                </h4>
                {inspectingResume.extracted_education && inspectingResume.extracted_education.length > 0 ? (
                  <div className="space-y-2">
                    {inspectingResume.extracted_education.map((edu: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/60 dark:bg-slate-800/50 border border-slate-800 dark:border-white/[0.06] flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-200 dark:text-white">
                            {edu.degree || edu.title || "Degree / Course"}
                          </p>
                          <p className="text-indigo-400 text-[11px]">
                            {edu.institution || edu.school || edu.university || "University"}
                          </p>
                        </div>
                        <span className="text-slate-400 text-xs font-mono">{edu.year || edu.dates || ""}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic p-3 bg-slate-950/40 rounded-xl">
                    No education history recorded.
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 dark:text-slate-200 uppercase mb-2">
                  Certifications &amp; Credentials
                </h4>
                {inspectingResume.extracted_certifications &&
                inspectingResume.extracted_certifications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {inspectingResume.extracted_certifications.map((cert: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium flex items-center gap-1.5"
                      >
                        <TrophyIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{typeof cert === "string" ? cert : cert.name || cert.title}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic p-3 bg-slate-950/40 rounded-xl">
                    No certifications found.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Raw Text */}
          {resumeModalTab === "raw" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold uppercase">
                  Extracted Document Transcript
                </span>
                <button
                  onClick={() => {
                    if (inspectingResume.raw_text) {
                      navigator.clipboard.writeText(inspectingResume.raw_text);
                      alert("Raw resume text copied to clipboard!");
                    }
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold flex items-center gap-1"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 dark:bg-black/60 border border-slate-800 dark:border-white/[0.08] text-slate-300 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto select-text">
                {inspectingResume.raw_text || "No raw text available for this resume."}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 dark:border-white/[0.08] bg-slate-950/40 flex justify-between items-center">
          <button
            onClick={() => onDelete(inspectingResume.id, inspectingResume.filename)}
            className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1.5"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            <span>Delete Resume</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
