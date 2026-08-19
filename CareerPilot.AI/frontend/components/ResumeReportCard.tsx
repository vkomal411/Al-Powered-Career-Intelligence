import React from "react";
import { CheckCircleIcon, DownloadIcon, FileIcon, MailIcon, PhoneIcon, ReplaceIcon, SparkleIcon, XCircleIcon } from "./icons";
import { BlurredPhone } from "./BlurredPhone";

export interface ParsedResume {
  id: string;
  original_filename: string;
  raw_text?: string | null;
  extracted_name?: string | null;
  extracted_email: string | null;
  extracted_phone: string | null;
  extracted_skills: string[] | null;
  extracted_education?: Array<{ degree_or_institution: string }> | null;
  extracted_experience?: Array<{ role_or_company: string }> | null;
  extracted_projects?: Array<{ details: string }> | null;
  extracted_certifications?: string[] | null;
  uploaded_at: string;
  ai_career_advice?: {
    summary: string;
    key_strengths: string[];
    improvement_areas: string[];
    action_plan: string[];
    suggested_certifications: string[];
  } | null;
  ai_advice_generated_at?: string | null;
  advice_status?: string | null;

  ats: {
    score: number;
    contact: {
      email: boolean;
      phone: boolean;
      linkedin: boolean;
      github: boolean;
    };
    sections: Record<string, boolean>;
    skills: string[];
    suggestions: string[];
  };
}

function DataRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null;
  icon: React.ReactNode;
}) {
  const found = Boolean(value);
  const isPhone = label.toLowerCase().includes("phone");

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 py-3 last:border-0">
      <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        {label}
      </div>
      <div className="flex items-center gap-2">
        {isPhone && found ? (
          <BlurredPhone phone={value} />
        ) : (
          <span className={`font-mono text-sm ${found ? "text-ink dark:text-white font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
            {value || "not found"}
          </span>
        )}
        {found ? (
          <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-verified" />
        ) : (
          <XCircleIcon className="h-4 w-4 flex-shrink-0 text-slate-300 dark:text-slate-600" />
        )}
      </div>
    </div>
  );
}

export function ResumeReportEmptyState() {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#111726]/60 p-10 text-center shadow-card">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light dark:bg-indigo-500/15">
        <SparkleIcon className="h-6 w-6 text-primary dark:text-indigo-400" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-ink dark:text-white">
        Your career insights will appear here
      </h3>
      <p className="mt-1.5 max-w-xs text-sm text-slate-500 dark:text-slate-400">
        Upload your resume and we&apos;ll show you exactly what recruiters and hiring software will see — plus tips to improve.
      </p>
    </div>
  );
}

export function ResumeReportSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111726] p-6 shadow-card">
      <div className="absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-primary/15 to-transparent" />
      <p className="font-display text-base font-semibold text-ink dark:text-white">Analyzing your resume…</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">We&apos;re reading through your experience, skills, and contact details.</p>
      <div className="mt-6 space-y-3">
        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function ResumeReportCard({
  parsed,
  onDownload,
  onReplace,
  onViewDocument,
}: {
  parsed: ParsedResume | null;
  onDownload?: (id: string, filename: string) => void;
  onReplace?: (id: string) => void;
  onViewDocument?: () => void;
}) {
  if (!parsed) {
    return <ResumeReportEmptyState />;
  }

  const uploadedAt = new Date(parsed.uploaded_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const skills = parsed.extracted_skills || [];
  const education = parsed.extracted_education || [];
  const experience = parsed.extracted_experience || [];
  const projects = parsed.extracted_projects || [];
  const certs = parsed.extracted_certifications || [];

  return (
    <div className="animate-fade-up rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111726] shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-verified/10 dark:bg-emerald-500/20">
            <FileIcon className="h-5 w-5 text-verified dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-ink dark:text-white">
              {parsed.original_filename}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-400">Parsed {uploadedAt}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onViewDocument && (
            <button
              type="button"
              onClick={onViewDocument}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 dark:border-indigo-500/30 bg-primary-light dark:bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-primary dark:text-indigo-300 shadow-sm transition-all hover:bg-primary hover:text-white active:scale-[0.98]"
            >
              <FileIcon className="h-3.5 w-3.5" />
              View Resume
            </button>
          )}

          {onDownload && (
            <button
              type="button"
              onClick={() => onDownload(parsed.id, parsed.original_filename)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-primary hover:bg-primary-light dark:hover:bg-indigo-500/20 hover:text-primary dark:hover:text-indigo-300 active:scale-[0.98]"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              Download
            </button>
          )}

          {onReplace && (
            <button
              type="button"
              onClick={() => onReplace(parsed.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-primary hover:bg-primary-light dark:hover:bg-indigo-500/20 hover:text-primary dark:hover:text-indigo-300 active:scale-[0.98]"
            >
              <ReplaceIcon className="h-3.5 w-3.5" />
              Replace
            </button>
          )}
        </div>
      </div>

      {/* Extracted Contact Info */}
      <div className="px-6 py-2">
        <DataRow label="Candidate Name" value={parsed.extracted_name || null} icon={<SparkleIcon className="h-4 w-4" />} />
        <DataRow label="Email" value={parsed.extracted_email} icon={<MailIcon className="h-4 w-4" />} />
        <DataRow label="Phone" value={parsed.extracted_phone} icon={<PhoneIcon className="h-4 w-4" />} />
      </div>

      {/* ── Education Timeline ── */}
      {education.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-4">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-500 text-[10px] text-white">🎓</span>
            Education ({education.length})
          </p>

          <div className="relative ml-2.5 border-l-2 border-dashed border-indigo-200 dark:border-indigo-800 pl-5 space-y-4">
            {education.map((item, idx) => {
              const text = item.degree_or_institution;
              const l = text.toLowerCase();

              let tierLabel = "Degree / Higher Education";
              let tierIcon = "🎓";
              let dotColor = "bg-gradient-to-br from-violet-500 to-indigo-500 shadow-violet-300/50";
              let cardBorder = "border-indigo-200/60 dark:border-indigo-500/25";
              let cardBg = "bg-gradient-to-br from-indigo-50/80 to-violet-50/40 dark:from-indigo-950/30 dark:to-violet-950/20";
              let labelColor = "text-indigo-700 dark:text-indigo-300";
              let accentBar = "from-indigo-500 to-violet-500";

              if (
                l.includes("intermediate") ||
                l.includes("junior college") ||
                l.includes("high school") ||
                l.includes("secondary") ||
                l.includes("12th") ||
                l.includes("hsc") ||
                l.includes("+2")
              ) {
                tierLabel = "Secondary Education";
                tierIcon = "📘";
                dotColor = "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-300/50";
                cardBorder = "border-blue-200/60 dark:border-blue-500/25";
                cardBg = "bg-gradient-to-br from-blue-50/80 to-cyan-50/40 dark:from-blue-950/30 dark:to-cyan-950/20";
                labelColor = "text-blue-700 dark:text-blue-300";
                accentBar = "from-blue-500 to-cyan-500";
              } else if (
                l.includes("primary") ||
                l.includes("elementary") ||
                l.includes("sslc") ||
                l.includes("10th") ||
                l.includes("school")
              ) {
                tierLabel = "Primary Education";
                tierIcon = "📗";
                dotColor = "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-300/50";
                cardBorder = "border-emerald-200/60 dark:border-emerald-500/25";
                cardBg = "bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20";
                labelColor = "text-emerald-700 dark:text-emerald-300";
                accentBar = "from-emerald-500 to-teal-500";
              }

              return (
                <div key={idx} className="relative group">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[29px] top-3 h-3 w-3 rounded-full ${dotColor} shadow-md ring-2 ring-white dark:ring-slate-900`} />

                  {/* Card */}
                  <div className={`relative overflow-hidden rounded-xl border ${cardBorder} ${cardBg} p-3.5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
                    {/* Left accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b ${accentBar}`} />

                    <div className="ml-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${labelColor} bg-white/80 dark:bg-slate-800/80 border border-current/10 mb-1.5`}>
                        {tierIcon} {tierLabel}
                      </span>
                      <p className="text-[13px] font-semibold text-ink dark:text-white leading-snug">{text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Experience Roles ── */}
      {experience.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-500 text-[10px] text-white">💼</span>
            Experience ({experience.length})
          </p>
          <ul className="space-y-2">
            {experience.map((item, idx) => (
              <li key={idx} className="relative overflow-hidden text-[13px] font-medium text-slate-800 dark:text-slate-200 bg-gradient-to-r from-amber-50/60 to-orange-50/30 dark:from-amber-950/25 dark:to-orange-950/15 p-3 rounded-xl border border-amber-200/50 dark:border-amber-500/20 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-amber-500 to-orange-500" />
                <span className="ml-2">💼 {item.role_or_company}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Extracted Projects & Certifications */}
      {(projects.length > 0 || certs.length > 0) && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-400 mb-2">
                Projects ({projects.length})
              </p>
              <ul className="space-y-1">
                {projects.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/[0.06] p-2 rounded-lg truncate">
                    📂 {item.details}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {certs.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-400 mb-2">
                Certifications ({certs.length})
              </p>
              <ul className="space-y-1">
                {certs.map((cert, idx) => (
                  <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/[0.06] p-2 rounded-lg truncate">
                    📜 {cert}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Skills detected */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-400">
          Skills detected ({skills.length})
        </p>
        {skills.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-primary/15 dark:border-indigo-500/25 bg-primary-light dark:bg-indigo-500/15 px-3 py-1 font-mono text-xs font-medium text-primary-dark dark:text-indigo-300"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">No skills detected in this document.</p>
        )}
      </div>
    </div>
  );
}