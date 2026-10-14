import React, { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

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
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const confirmClass =
    variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/20"
      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 450, damping: 30 }
        }
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:bg-[#111726] dark:border-white/[0.1] dark:shadow-[0_16px_48px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-modal-title" className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            className="rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {cancelLabel}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${confirmClass}`}
          >
            {confirmLabel}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
