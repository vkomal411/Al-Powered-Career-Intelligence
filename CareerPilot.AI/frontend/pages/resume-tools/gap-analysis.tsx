import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Topbar from "../../components/Topbar";
import BrandMark from "../../components/BrandMark";
import GroupNavControl from "../../components/GroupNavControl";
import JobMatchCard from "../../components/JobMatchCard";
import UploadCard from "../../components/UploadCard";
import ResumeHistoryCard from "../../components/ResumeHistoryCard";
import ResumeViewModal from "../../components/ResumeViewModal";
import ResumeCompareModal from "../../components/ResumeCompareModal";
import Toast from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import { GapAnalysisIcon, SparkleIcon, FileIcon } from "../../components/icons";
import {
  apiFetch,
  UserResponse,
  getResumeHistory,
  deleteResume,
  downloadResume,
  replaceResume,
  uploadResume,
  ResumeHistory,
  logoutUser,
} from "../../lib/api";
import { ParsedResume } from "../../components/ResumeReportCard";

function ResumeHealthSummary({ parsed }: { parsed: ParsedResume }) {
  const suggestions = parsed.ats?.suggestions || [];
  const advice = parsed.ai_career_advice;
  const missingSections = Object.entries(parsed.ats?.sections || {})
    .filter(([, present]) => !present)
    .map(([section]) => section.replace(/_/g, " "));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Resume health & improvement opportunities</h2>
          <p className="mt-1 text-xs text-slate-500">These are presentation gaps in the uploaded resume, separate from career skill gaps.</p>
        </div>
        <div className="rounded-xl bg-indigo-50 px-3 py-2 text-center"><span className="block text-[10px] font-bold uppercase text-indigo-500">ATS score</span><span className="text-xl font-extrabold text-indigo-800">{parsed.ats?.score ?? "—"}</span></div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase text-slate-400">Skills detected</span><p className="mt-1 text-lg font-bold text-slate-900">{parsed.extracted_skills?.length || 0}</p></div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase text-slate-400">Missing sections</span><p className="mt-1 text-lg font-bold text-slate-900">{missingSections.length}</p></div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase text-slate-400">Projects found</span><p className="mt-1 text-lg font-bold text-slate-900">{parsed.extracted_projects?.length || 0}</p></div>
      </div>
      {(suggestions.length > 0 || advice?.improvement_areas?.length) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">Recommended resume improvements</h3>
          <ul className="mt-2 space-y-1.5 text-xs text-amber-950">
            {[...suggestions, ...(advice?.improvement_areas || [])].slice(0, 5).map((item, index) => <li key={`${item}-${index}`} className="flex gap-2"><span className="font-bold">→</span>{item}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function SkillGapAnalysisPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [history, setHistory] = useState<ResumeHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<UserResponse>("/auth/me")
      .then(async (userData) => {
        setUser(userData);
        try {
          const resumes = await getResumeHistory();
          setHistory(resumes);
          if (resumes.length > 0) {
            setParsed(resumes[0] as unknown as ParsedResume);
          }
        } catch (err) {
          console.error("Failed to fetch resume history:", err);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setCheckingSession(false);
        setHistoryLoading(false);
      });
  }, []);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.push("/login");
    }
  }

  async function handleUpload(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newResume = await uploadResume(file);
      setParsed(newResume);
      setFile(null);
      setSuccessMessage("Resume uploaded for Skill Gap Analysis!");

      const resumes = await getResumeHistory();
      setHistory(resumes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  }

  async function handleViewResume(id: string) {
    try {
      const match = history.find((r) => r.id === id);
      if (match) {
        setParsed(match as unknown as ParsedResume);
        setSuccessMessage(`Active analysis source set to "${match.original_filename}".`);
      } else {
        const resumes = await getResumeHistory();
        const found = resumes.find((r) => r.id === id);
        if (found) {
          setParsed(found as unknown as ParsedResume);
          setSuccessMessage(`Active analysis source set to "${found.original_filename}".`);
        }
      }
    } catch {
      setToast({ message: "Unable to load resume details.", type: "error" });
    }
  }

  async function handleDeleteResume(id: string) {
    setConfirmDelete(id);
  }

  async function handleConfirmDelete(id: string) {
    try {
      await deleteResume(id);
      setToast({ message: "Resume deleted successfully.", type: "success" });
      const updated = history.filter((h) => h.id !== id);
      setHistory(updated);
      if (parsed && parsed.id === id) {
        setParsed(updated.length > 0 ? (updated[0] as unknown as ParsedResume) : null);
      }
    } catch {
      setToast({ message: "Failed to delete resume.", type: "error" });
    }
  }

  async function handleDownloadResume(id: string) {
    try {
      const match = history.find((h) => h.id === id);
      const filename = match?.original_filename || "resume.pdf";
      await downloadResume(id, filename);
      setToast({ message: "Download started.", type: "info" });
    } catch {
      setToast({ message: "Download failed.", type: "error" });
    }
  }

  async function handleReplaceResume(id: string) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.docx";
    fileInput.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;
      const selected = target.files[0];

      setUploading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const updated = await replaceResume(id, selected);
        setParsed(updated);

        const resumes = await getResumeHistory();
        setHistory(resumes);
        setSuccessMessage("Resume updated successfully!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to replace resume");
      } finally {
        setUploading(false);
      }
    };
    fileInput.click();
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Preparing Skill Gap Analysis Hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <div className="flex justify-center mb-6">
            <BrandMark variant="dark" />
          </div>
          <h1 className="font-display text-xl font-bold text-ink">Sign In Required</h1>
          <p className="mt-2 text-xs text-slate-500">Please sign in to access Skill Gap Analysis.</p>
          <button
            type="button"
            onClick={() => router.push("/login?redirect=/resume-tools/gap-analysis")}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Resume Analysis & Career Paths — Career Tools</title>
      </Head>
      <div className="min-h-screen bg-paper">
        <Topbar fullName={user.full_name} onLogout={handleLogout} activeMenu="resume" />

        <main className="mx-auto max-w-7xl px-6 sm:px-8 py-8 space-y-6">
          <GroupNavControl group="resume-tools" activeId="gap-analysis" />

          {/* Redesigned Header Banner */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
                  <GapAnalysisIcon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-slate-900">
                    Resume Analysis → Career Paths
                  </h1>
                  <p className="text-xs text-slate-500">
                    Upload your resume once, understand what is missing, improve it, and discover career paths that fit your experience.
                  </p>
                </div>
              </div>

              {/* Header Quick Stats */}
              <div className="flex items-center gap-3 self-start md:self-auto">
                <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                  <FileIcon className="h-4 w-4 text-indigo-600" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Resumes</span>
                    <span className="text-xs font-extrabold text-slate-900">{history.length} Saved</span>
                  </div>
                </div>

                {parsed && (
                  <div className="flex items-center gap-2 bg-indigo-50 px-3.5 py-2 rounded-xl border border-indigo-100">
                    <SparkleIcon className="h-4 w-4 text-indigo-600" />
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase block">Active Source</span>
                      <span className="text-xs font-extrabold text-indigo-900 truncate max-w-[140px] block">
                        {parsed.original_filename}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
            {/* Left Column: Upload & Redesigned History */}
            <div className="flex flex-col gap-6">
              <UploadCard
                file={file}
                onFileSelect={(selectedFile) => {
                  setFile(selectedFile);
                  setError(null);
                  setSuccessMessage(null);
                }}
                onUpload={handleUpload}
                uploading={uploading}
                error={error}
                successMessage={successMessage}
                title="Upload Resume for Skill Gap Analysis"
                description="Upload a new resume to extract skills and analyze missing gaps against target roles."
                buttonText="Upload for Skill Gap Analysis"
                uploadingMessage="Extracting skills & parsing requirements..."
              />

              <ResumeHistoryCard
                resumes={history}
                loading={historyLoading}
                activeResumeId={parsed?.id}
                onView={handleViewResume}
                onDelete={handleDeleteResume}
                onDownload={handleDownloadResume}
                onReplace={handleReplaceResume}
                onCompare={() => setIsCompareModalOpen(true)}
                title="Skill Gap Resume History"
                description="Select or compare past resume versions to evaluate skill gaps."
                emptyStateMessage="Resumes uploaded for gap analysis will appear here."
                badgeMode="skills"
              />
            </div>

            {/* Right Column: Redesigned Skill Gap Engine */}
            <div className="space-y-6">
              {parsed ? (
                <>
                  <ResumeHealthSummary parsed={parsed} />
                  <JobMatchCard resumeId={parsed.id} activeResumeName={parsed.original_filename} />
                </>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <GapAnalysisIcon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">No Resume Selected for Analysis</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Please upload a new resume or select a past resume from your history on the left to run dedicated Skill Gap Analysis against target job roles.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ResumeViewModal
        parsed={parsed}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onReplace={handleReplaceResume}
      />
      <ResumeCompareModal
        resumes={history}
        activeResumeId={parsed?.id}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirmDelete && (
        <ConfirmModal
          title="Remove this resume version?"
          message="This will delete the resume and its skill gap analysis results."
          confirmLabel="Yes, remove it"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={() => {
            handleConfirmDelete(confirmDelete);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
