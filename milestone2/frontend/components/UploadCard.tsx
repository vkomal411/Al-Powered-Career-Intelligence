import { useRef, useState } from "react";
import { CheckCircleIcon, FileIcon, UploadIcon } from "./icons";

interface UploadCardProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  onUpload: (e: React.FormEvent) => void;
  uploading: boolean;
  error: string | null;
  successMessage?: string | null;
  title?: string;
  description?: string;
  buttonText?: string;
  uploadingMessage?: string;
}

const ACCEPTED = [".pdf", ".docx"];

export default function UploadCard({
  file,
  onFileSelect,
  onUpload,
  uploading,
  error,
  successMessage,
  title = "Upload your resume",
  description = "We'll extract your contact details and skills automatically.",
  buttonText = "Analyze my resume",
  uploadingMessage = "Parsing resume & auditing ATS compliance...",
}: UploadCardProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onUpload(e);
        }}
        className="mt-4"
      >
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`focus-ring flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary-light"
              : "border-slate-200 bg-slate-50/60 hover:border-primary/40 hover:bg-primary-light/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="sr-only"
            onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          />
          {file ? (
            <div className="flex flex-col items-center gap-1">
              <FileIcon className="h-7 w-7 text-primary" />
              <p className="max-w-[220px] truncate text-sm font-semibold text-ink">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB — click to replace</p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFileSelect(null);
                }}
                className="mt-2 rounded-md bg-danger-light px-2.5 py-1 text-xs font-semibold text-danger transition-all hover:bg-danger hover:text-white active:scale-95"
              >
                Remove file
              </button>
            </div>
          ) : (
            <>
              <UploadIcon className="h-7 w-7 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">
                Drag &amp; drop, or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-slate-400">PDF or DOCX, up to 10MB</p>
            </>
          )}
        </label>

        {uploading && (
          <div className="mt-3.5 space-y-2 rounded-xl border border-primary/20 bg-primary-light/50 p-3 animate-fade-up">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                {uploadingMessage}
              </span>
              <span className="font-mono text-primary font-bold">In Progress</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
              <div className="h-full bg-primary animate-scan transition-all duration-500 w-full" />
            </div>
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
        )}

        {file && !successMessage && !uploading && !error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-indigo-50/80 border border-indigo-100 px-3.5 py-2.5 text-xs font-semibold text-indigo-800">
            <CheckCircleIcon className="h-4 w-4 text-indigo-600 flex-shrink-0" />
            <span>File ready. Click &quot;{buttonText}&quot; to process.</span>
          </div>
        )}

        {successMessage && !uploading && !error && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#ecfdf5] px-4 py-3.5 text-sm font-medium text-[#047857] shadow-sm animate-fade-up">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-[#059669]" />
            <span>{successMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="focus-ring mt-4 flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Analyzing resume..." : buttonText}
        </button>
      </form>
    </div>
  );
}
