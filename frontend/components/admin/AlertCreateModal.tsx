import React from "react";
import { BellAlertIcon } from "./AdminIcons";

interface AlertCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  alertForm: {
    title: string;
    message: string;
    severity: string;
    is_broadcast?: boolean;
    target_role?: string;
  };
  setAlertForm: React.Dispatch<
    React.SetStateAction<{
      title: string;
      message: string;
      severity: string;
      is_broadcast?: boolean;
      target_role?: string;
    }>
  >;
}

export const AlertCreateModal: React.FC<AlertCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  alertForm,
  setAlertForm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-slate-900 dark:bg-[#111726] border border-slate-800 dark:border-white/[0.1] rounded-2xl p-6 space-y-4 shadow-2xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
      >
        <h3 className="text-sm font-bold text-slate-100 dark:text-white flex items-center gap-2">
          <BellAlertIcon className="w-4 h-4 text-rose-400" />
          <span>Publish New System Alert</span>
        </h3>
        <input
          type="text"
          required
          placeholder="Alert Title (e.g. Scheduled DB Maintenance)"
          value={alertForm.title}
          onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-800/80 border border-slate-800 dark:border-slate-700 text-xs text-slate-200 dark:text-white outline-none focus:border-indigo-500"
        />
        <textarea
          required
          rows={3}
          placeholder="Alert message or instructions for candidates/admins..."
          value={alertForm.message}
          onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-800/80 border border-slate-800 dark:border-slate-700 text-xs text-slate-200 dark:text-white outline-none focus:border-indigo-500"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Severity Level</label>
            <select
              value={alertForm.severity}
              onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 dark:bg-slate-800/80 border border-slate-800 dark:border-slate-700 text-xs text-slate-200 dark:text-white outline-none focus:border-indigo-500"
            >
              <option value="info">Info (Blue)</option>
              <option value="warning">Warning (Amber)</option>
              <option value="critical">Critical (Red)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Audience</label>
            <select
              value={alertForm.target_role || "broadcast"}
              onChange={(e) =>
                setAlertForm({
                  ...alertForm,
                  is_broadcast: e.target.value === "broadcast",
                  target_role: e.target.value === "broadcast" ? undefined : e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-950 dark:bg-slate-800/80 border border-slate-800 dark:border-slate-700 text-xs text-slate-200 dark:text-white outline-none focus:border-indigo-500"
            >
              <option value="broadcast">All Users (Broadcast)</option>
              <option value="admin">Admins Only</option>
              <option value="moderator">Moderators Only</option>
              <option value="user">Candidates Only</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-xs text-white font-bold shadow-lg shadow-rose-600/30 transition-all"
          >
            Publish Alert
          </button>
        </div>
      </form>
    </div>
  );
};
