import React, { useEffect, useState } from "react";
import { DownloadIcon, FileIcon, ReplaceIcon, XCircleIcon } from "./icons";
import { fetchResumeViewBlob, downloadResume } from "../lib/api";
import { ParsedResume } from "./ResumeReportCard";
import { BlurredPhone } from "./BlurredPhone";

interface ResumeViewModalProps {
  parsed: ParsedResume | null;
  isOpen: boolean;
  onClose: () => void;
  onReplace?: (id: string) => void;
}

export default function ResumeViewModal({
  parsed,
  isOpen,
  onClose,
  onReplace,
}: ResumeViewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobData, setBlobData] = useState<{
    blobUrl: string;
    mimeType: string;
    filename: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"document" | "extracted">("document");

  useEffect(() => {
    if (!isOpen || !parsed) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchResumeViewBlob(parsed.id)
      .then((data) => {
        if (isMounted) {
          setBlobData(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("View resume error:", err);
          setError(err.message || "Could not load document preview.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, parsed]);

  // Clean up blob URL on close and on unmount
  useEffect(() => {
    if (!isOpen && blobData?.blobUrl) {
      URL.revokeObjectURL(blobData.blobUrl);
      setBlobData(null);
    }
  }, [isOpen, blobData]);

  useEffect(() => {
    return () => {
      if (blobData?.blobUrl) {
        URL.revokeObjectURL(blobData.blobUrl);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !parsed) return null;

  const isPdf = parsed.original_filename.toLowerCase().endsWith(".pdf") || Boolean(blobData?.mimeType.includes("pdf"));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-up">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
              <FileIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-display text-base font-semibold text-ink">
                {parsed.original_filename}
              </h2>
              <p className="text-xs text-slate-400">
                Uploaded {new Date(parsed.uploaded_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </p>
            </div>
          </div>

          {/* Controls & Toolbar */}
          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("document")}
                className={`rounded-md px-3 py-1.5 transition-all ${
                  activeTab === "document"
                    ? "bg-white text-ink shadow-sm font-semibold"
                    : "text-slate-500 hover:text-ink"
                }`}
              >
                Document File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("extracted")}
                className={`rounded-md px-3 py-1.5 transition-all ${
                  activeTab === "extracted"
                    ? "bg-white text-ink shadow-sm font-semibold"
                    : "text-slate-500 hover:text-ink"
                }`}
              >
                Extracted Data
              </button>
            </div>

            {/* Download */}
            <button
              type="button"
              onClick={() => downloadResume(parsed.id, parsed.original_filename)}
              className="focus-ring flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-primary hover:bg-primary-light hover:text-primary active:scale-95"
            >
              <DownloadIcon className="h-4 w-4" />
              Download
            </button>

            {/* Replace */}
            {onReplace && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReplace(parsed.id);
                }}
                className="focus-ring flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-primary hover:bg-primary-light hover:text-primary active:scale-95"
              >
                <ReplaceIcon className="h-4 w-4" />
                Replace
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-ink transition-colors"
              title="Close modal (Esc)"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="relative flex-1 bg-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm font-medium text-slate-500">Loading document preview...</p>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="rounded-xl border border-danger/20 bg-danger-light p-4 text-danger max-w-md">
                <p className="text-sm font-semibold">{error}</p>
                <p className="text-xs mt-1 text-slate-500">You can still download the file directly using the download button above.</p>
              </div>
            </div>
          ) : activeTab === "document" ? (
            blobData && isPdf ? (
              <iframe
                src={blobData.blobUrl}
                className="h-full w-full border-0"
                title={parsed.original_filename}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="max-w-2xl w-full rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                    <FileIcon className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-sm text-ink">{parsed.original_filename}</span>
                    <span className="ml-auto text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                      {blobData?.mimeType.includes("word") ? "DOCX Document" : "Document File"}
                    </span>
                  </div>
                  {parsed.raw_text ? (
                    <pre className="font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {parsed.raw_text}
                    </pre>
                  ) : (
                    <p className="text-sm text-slate-500 italic text-center py-6">
                      Word document preview. Click Download above to open in Microsoft Word.
                    </p>
                  )}
                </div>
              </div>
            )
          ) : (
            /* Extracted Data Tab */
            <div className="h-full overflow-y-auto p-6 bg-paper">
              <div className="mx-auto max-w-3xl space-y-4">
                {/* Candidate Summary */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Extracted Contact Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 block">Name</span>
                      <span className="font-semibold text-ink">{parsed.extracted_name || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Email</span>
                      <span className="font-semibold text-ink">{parsed.extracted_email || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Phone</span>
                      <BlurredPhone phone={parsed.extracted_phone} />
                    </div>
                  </div>
                </div>

                {/* Extracted Education */}
                {parsed.extracted_education && parsed.extracted_education.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Education History</h3>
                    <ul className="space-y-2">
                      {parsed.extracted_education.map((edu, idx) => (
                        <li key={idx} className="text-xs font-medium text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          🎓 {edu.degree_or_institution}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Extracted Experience */}
                {parsed.extracted_experience && parsed.extracted_experience.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Work Experience</h3>
                    <ul className="space-y-2">
                      {parsed.extracted_experience.map((exp, idx) => (
                        <li key={idx} className="text-xs font-medium text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          💼 {exp.role_or_company}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Extracted Skills */}
                {parsed.extracted_skills && parsed.extracted_skills.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Detected Skills ({parsed.extracted_skills.length})</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {parsed.extracted_skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary-dark">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
