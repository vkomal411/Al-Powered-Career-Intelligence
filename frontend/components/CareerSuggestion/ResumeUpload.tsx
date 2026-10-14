import React, { useRef, useState } from "react";

interface ResumeUploadProps {
  onUpload: (file: File) => void;
  loading?: boolean;
  onCancel?: () => void;
}

export default function ResumeUpload({ onUpload, loading = false, onCancel }: ResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validateAndUpload = (file: File) => {
    setErrorMsg(null);
    const validExtensions = [".pdf", ".docx"];
    const nameLower = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => nameLower.endsWith(ext));

    if (!isValidExt) {
      setErrorMsg("Please upload a PDF or Word (.docx) resume.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File exceeds the maximum allowed size of 5 MB.");
      return;
    }

    onUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
          isDragOver
            ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40"
            : "border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:border-slate-400 dark:hover:border-slate-600"
        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />

        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-lg">
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            ) : (
              "📄"
            )}
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100 text-xs">
              {loading ? "Analyzing resume..." : "Click or drop a PDF / Word resume to upload"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Max size 5 MB</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {onCancel && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
