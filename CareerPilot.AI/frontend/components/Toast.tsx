import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = "success", duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
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
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${colorMap[type]}`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-current/10 text-sm font-bold">
        {iconMap[type]}
      </span>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 text-current/50 hover:text-current transition-colors"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}
