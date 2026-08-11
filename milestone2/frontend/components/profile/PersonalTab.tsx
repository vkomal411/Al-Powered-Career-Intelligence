import React from "react";
import { UserResponse } from "../../lib/api";
import { UserIcon, MailIcon, LockIcon } from "../icons";

interface PersonalTabProps {
  fullName: string;
  setFullName: (val: string) => void;
  user: UserResponse;
}

export default function PersonalTab({ fullName, setFullName, user }: PersonalTabProps) {
  return (
    <div className="space-y-4">
      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
        <div className="focus-ring flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <UserIcon className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-ink placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-100/60 px-4 py-3 text-slate-450 cursor-not-allowed">
          <MailIcon className="h-4 w-4 text-slate-400" />
          <input
            type="email"
            disabled
            value={user.email}
            className="w-full border-none bg-transparent text-sm text-slate-500 focus:outline-none cursor-not-allowed"
          />
          <LockIcon className="h-4 w-4 text-slate-400" />
        </div>
        <p className="text-[10px] text-slate-400">Email addresses are unique identifiers and cannot be altered.</p>
      </div>

      {/* Connection Badges */}
      <div className="border-t border-slate-100 pt-5 mt-5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">Connection Methods</label>
        <div className="flex flex-wrap gap-2.5">
          {user.has_password && (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              Email / Password Connected
            </span>
          )}
          {!user.has_password && (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
              Google Authenticated
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
