import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Topbar from "../../components/Topbar";
import BrandMark from "../../components/BrandMark";
import GroupNavControl from "../../components/GroupNavControl";
import UploadCard from "../../components/UploadCard";
import ResumeHistoryCard from "../../components/ResumeHistoryCard";
import ResumeReportCard, {
  ParsedResume,
  ResumeReportEmptyState,
  ResumeReportSkeleton,
} from "../../components/ResumeReportCard";
import ATSReportCard from "../../components/ATSReportCard";
import BulletEnhancerCard from "../../components/BulletEnhancerCard";
import ResumeViewModal from "../../components/ResumeViewModal";
import Toast from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import {
  apiFetch,
  UserResponse,
  getResumeHistory,
  getResume,
  deleteResume,
  downloadResume,
  replaceResume,
  uploadResume,
  ResumeHistory,
  logoutUser,
} from "../../lib/api";

export default function AtsScoreAnalysisPage() {
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
      setSuccessMessage("Resume analyzed successfully!");

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
      const resume = await getResume(id);
      setParsed(resume);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error(err);
      setToast({ message: "Could not load resume details.", type: "error" });
    }
  }

  function handleDeleteResume(id: string) {
    setConfirmDelete(id);
  }

  async function handleConfirmDelete(id: string) {
    try {
      await deleteResume(id);
      const resumes = await getResumeHistory();
      setHistory(resumes);
      if (parsed?.id === id) {
        setParsed(resumes.length > 0 ? (resumes[0] as unknown as ParsedResume) : null);
      }
      setToast({ message: "Resume deleted successfully.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to delete resume.", type: "error" });
    }
  }

  async function handleDownloadResume(id: string, filename: string) {
    try {
      await downloadResume(id, filename);
    } catch (err) {
      console.error(err);
      setToast({ message: "Could not download file.", type: "error" });
    }
  }

  async function handleReplaceResume(id: string) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.docx";
    fileInput.onchange = async (e) => {
      const selected = (e.target as HTMLInputElement).files?.[0];
      if (!selected) return;

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
          <p className="text-sm font-medium text-slate-500">Preparing ATS Analysis...</p>
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
          <p className="mt-2 text-xs text-slate-500">Please sign in to access your ATS Score Analysis.</p>
          <button
            type="button"
            onClick={() => router.push("/login?redirect=/resume-tools/ats-score-analysis")}
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
        <title>ATS Score Analysis — Resume Tools</title>
      </Head>
      <div className="min-h-screen bg-paper">
        <Topbar fullName={user.full_name} onLogout={handleLogout} activeMenu="resume" />

        <main className="mx-auto max-w-7xl px-6 sm:px-8 py-8 space-y-6">
          <GroupNavControl group="resume-tools" activeId="ats-score-analysis" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
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
                title="Upload Resume for ATS Score Analysis"
                description="Upload your resume to audit ATS formatting, section structures, contact info, and parser compatibility."
                buttonText="Analyze ATS Compatibility"
                uploadingMessage="Auditing ATS formatting & compliance..."
              />
              <ResumeHistoryCard
                resumes={history}
                loading={historyLoading}
                onView={handleViewResume}
                onDelete={handleDeleteResume}
                onDownload={handleDownloadResume}
                onReplace={handleReplaceResume}
                title="ATS Score Resume History"
                description="Revisit, view ATS compliance scores, download, or update past audited resumes."
                emptyStateMessage="Your ATS-analyzed resumes will appear here."
                badgeMode="ats"
              />
            </div>

            <div className="space-y-6">
              {uploading ? (
                <ResumeReportSkeleton />
              ) : parsed ? (
                <div className="space-y-6">
                  <ResumeReportCard
                    parsed={parsed}
                    onDownload={handleDownloadResume}
                    onReplace={handleReplaceResume}
                    onViewDocument={() => setIsViewModalOpen(true)}
                  />
                  {parsed.ats && <ATSReportCard parsed={parsed} />}
                  <BulletEnhancerCard />
                </div>
              ) : (
                <ResumeReportEmptyState />
              )}
            </div>
          </div>
        </main>
      </div>

      <ResumeViewModal
        parsed={parsed}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onReplace={handleReplaceResume}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirmDelete && (
        <ConfirmModal
          title="Remove this resume?"
          message="This will delete the analysis results. You can always upload it again."
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
