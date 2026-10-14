import React, { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = "success", duration = 4000, onClose }: ToastProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colorMap = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-300",
    error: "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/80 dark:text-red-300",
    info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-indigo-500/30 dark:bg-indigo-950/80 dark:text-indigo-300",
  };

  const iconMap = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-lg dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-md ${colorMap[type]}`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-xs font-bold">
        {iconMap[type]}
      </span>
      <p className="text-xs font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-current/50 hover:text-current transition-colors text-xs"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </motion.div>
  );
}
