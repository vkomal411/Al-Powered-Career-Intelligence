import React, { useState, useEffect } from "react";
import { getApiBase, getFallbackHost } from "../lib/api";

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info" | string;
  is_broadcast?: boolean;
  target_role?: string;
  created_at?: string;
}

export default function SystemAlertBanner() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load previously dismissed alert IDs from session
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("dismissed_system_alerts");
        if (saved) setDismissedIds(JSON.parse(saved));
      } catch {}
    }

    const fetchAlerts = async () => {
      const apiBase = getApiBase();
      let res: Response | null = null;
      try {
        res = await fetch(`${apiBase}/alerts/active`);
      } catch {
        const alt = getFallbackHost(apiBase);
        if (alt) {
          try {
            res = await fetch(`${alt}/alerts/active`);
          } catch {}
        }
      }

      if (res && res.ok) {
        try {
          const data: SystemAlert[] = await res.json();
          setAlerts(data);
        } catch {}
      }
      setLoading(false);
    };

    fetchAlerts();
  }, []);

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("dismissed_system_alerts", JSON.stringify(updated));
      } catch {}
    }
  };

  const visibleAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));

  if (loading || visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full sm:w-96 space-y-3 pointer-events-auto transition-all duration-300">
      {visibleAlerts.map((alert) => {
        const isCritical = alert.severity === "critical";
        const isWarning = alert.severity === "warning";

        return (
          <div
            key={alert.id}
            role="alert"
            className={`w-full rounded-2xl p-4 transition-all shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 border animate-slide-in-right ${
              isCritical
                ? "bg-rose-950/95 text-rose-100 border-rose-500/60 shadow-rose-950/50"
                : isWarning
                ? "bg-amber-950/95 text-amber-100 border-amber-500/60 shadow-amber-950/50"
                : "bg-slate-900/95 text-indigo-100 border-indigo-500/50 shadow-indigo-950/50"
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <span className={`text-lg flex-shrink-0 mt-0.5 ${isCritical ? "animate-bounce" : ""}`}>
                {isCritical ? "🚨" : isWarning ? "⚠️" : "📢"}
              </span>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-xs sm:text-sm text-white tracking-tight leading-tight">
                    {alert.title}
                  </h4>
                  <span
                    className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                      isCritical
                        ? "bg-rose-500/30 text-rose-200 border border-rose-400/40"
                        : isWarning
                        ? "bg-amber-500/30 text-amber-200 border border-amber-400/40"
                        : "bg-indigo-500/30 text-indigo-200 border border-indigo-400/40"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed font-normal text-slate-200">
                  {alert.message}
                </p>
                <div className="flex items-center gap-2 text-[10px] opacity-75 font-mono pt-0.5">
                  <span>{alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}</span>
                  <span>•</span>
                  <span>{alert.is_broadcast ? "Broadcast" : "Targeted"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDismiss(alert.id)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white/70 hover:text-white shrink-0"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
