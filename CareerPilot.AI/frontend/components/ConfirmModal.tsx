import React, { useEffect, useState } from "react";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "default";
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmModalProps) {
  const [visible, setVisible] = useState(false);

  const handleClose = React.useCallback((action: () => void) => {
    if (!visible) return;
    setVisible(false);
    setTimeout(action, 200);
  }, [visible]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose(onCancel);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, handleClose]);

  const confirmClass =
    variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
      : "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25 dark:bg-indigo-600 dark:hover:bg-indigo-500";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "bg-black/50 dark:bg-black/70 backdrop-blur-sm" : "bg-transparent"
      }`}
      onClick={() => handleClose(onCancel)}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all duration-200 dark:bg-[#111726] dark:border-white/[0.1] dark:shadow-[0_16px_48px_rgba(0,0,0,0.7)] ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-modal-title" className="font-display text-lg font-semibold text-ink dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => handleClose(onCancel)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => handleClose(onConfirm)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
