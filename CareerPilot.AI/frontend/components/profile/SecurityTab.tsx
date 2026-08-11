import React from "react";
import { LockIcon } from "../icons";

interface SecurityTabProps {
  oldPassword: string;
  setOldPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
}

export default function SecurityTab({
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
}: SecurityTabProps) {
  return (
    <div className="space-y-4">
      {/* Old password */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Password</label>
        <div className="focus-ring flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <LockIcon className="h-4 w-4 text-slate-400" />
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-ink placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* New password */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Password</label>
        <div className="focus-ring flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <LockIcon className="h-4 w-4 text-slate-400" />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-ink placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
        <div className="focus-ring flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <LockIcon className="h-4 w-4 text-slate-400" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-ink placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
