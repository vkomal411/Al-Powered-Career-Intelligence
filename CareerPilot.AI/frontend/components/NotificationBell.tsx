import React, { useState, useEffect, useRef } from "react";
import { BellIcon } from "./icons";
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

export default function NotificationBell() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchActiveAlerts = async () => {
    const apiBase = getApiBase();
    let res: Response | null = null;
    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("admin_token")) : null;
    const fetchOptions: RequestInit = {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
    try {
      res = await fetch(`${apiBase}/alerts/active`, fetchOptions);
    } catch {
      const alt = getFallbackHost(apiBase);
      if (alt) {
        try {
          res = await fetch(`${alt}/alerts/active`, fetchOptions);
        } catch {}
      }
    }

    if (res && res.ok) {
      try {
        const data: SystemAlert[] = await res.json();
        setAlerts(data);
      } catch {}
    }
  };

  useEffect(() => {
    // Load read alert IDs from storage
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("read_system_alerts");
        if (saved) setReadIds(JSON.parse(saved));
      } catch {}
    }

    fetchActiveAlerts();

    // Poll every 60 seconds
    const timer = setInterval(fetchActiveAlerts, 60000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadAlerts = alerts.filter((a) => !readIds.includes(a.id));
  const unreadCount = unreadAlerts.length;
  const hasCritical = unreadAlerts.some((a) => a.severity === "critical");

  const markAllAsRead = () => {
    const allIds = alerts.map((a) => a.id);
    setReadIds(allIds);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("read_system_alerts", JSON.stringify(allIds));
      } catch {}
    }
  };

  const markSingleAsRead = (id: string) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("read_system_alerts", JSON.stringify(updated));
      } catch {}
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            // Option: Mark as read when opening or via button
          }
        }}
        className={`relative p-2 rounded-xl transition-all border ${
          isOpen
            ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 shadow-sm"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
        }`}
        title={`Notifications & System Alerts (${unreadCount} unread)`}
        aria-label="System Notifications"
      >
        <BellIcon className="w-4 h-4" />

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold text-white flex items-center justify-center shadow-md ${
              hasCritical
                ? "bg-rose-500 animate-pulse ring-2 ring-rose-500/30"
                : "bg-indigo-600 dark:bg-indigo-500"
            }`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#111726] rounded-2xl shadow-2xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.7)] border border-slate-200 dark:border-white/[0.1] overflow-hidden z-50 animate-fade-in backdrop-blur-xl">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500">
                <BellIcon className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">
                Alerts &amp; Notices
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>

            {alerts.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Alerts List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
            {alerts.length > 0 ? (
              alerts.map((alert) => {
                const isUnread = !readIds.includes(alert.id);
                const isCritical = alert.severity === "critical";
                const isWarning = alert.severity === "warning";

                return (
                  <div
                    key={alert.id}
                    onClick={() => markSingleAsRead(alert.id)}
                    className={`p-4 transition-colors cursor-pointer space-y-1.5 ${
                      isUnread
                        ? isCritical
                          ? "bg-rose-50/60 dark:bg-rose-950/20"
                          : isWarning
                          ? "bg-amber-50/60 dark:bg-amber-950/20"
                          : "bg-indigo-50/40 dark:bg-indigo-950/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                            isCritical
                              ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                              : isWarning
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                              : "bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30"
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <h4
                          className={`text-xs font-bold ${
                            isUnread
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {alert.title}
                        </h4>
                      </div>

                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                      <span>{alert.created_at ? new Date(alert.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Active"}</span>
                      <span>{alert.is_broadcast ? "🌐 All Users" : `🎯 ${alert.target_role || "Targeted"}`}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs space-y-1">
                <p className="text-xl">✨</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                <p className="text-[11px]">No active system alerts or notices.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
