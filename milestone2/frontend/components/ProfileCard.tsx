import React, { useState } from "react";
import Link from "next/link";
import { UserResponse } from "../lib/api";
import { MailIcon } from "./icons";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "U";
}

export interface ProfileFieldStatus {
  label: string;
  points: number;
  isFilled: boolean;
  hint: string;
}

export function getProfileFieldStatuses(user: UserResponse): ProfileFieldStatus[] {
  return [
    {
      label: "Full Name",
      points: 15,
      isFilled: Boolean(user.full_name?.trim()),
      hint: "Your full name for resume headers & account",
    },
    {
      label: "Email Address",
      points: 15,
      isFilled: Boolean(user.email?.trim()),
      hint: "Verified primary contact email",
    },
    {
      label: "Target Role",
      points: 15,
      isFilled: Boolean(user.target_role?.trim()),
      hint: "Desired job title for AI career matching",
    },
    {
      label: "Experience Level",
      points: 10,
      isFilled: Boolean(user.experience_level?.trim()),
      hint: "Career stage (e.g. Mid-Level, Senior)",
    },
    {
      label: "Industry",
      points: 10,
      isFilled: Boolean(user.industry?.trim()),
      hint: "Primary domain (e.g. Technology)",
    },
    {
      label: "Education",
      points: 15,
      isFilled: Boolean(user.education && user.education.length > 0),
      hint: "Degrees or schools added to profile",
    },
    {
      label: "Skills",
      points: 10,
      isFilled: Boolean(user.skills && user.skills.length > 0),
      hint: "Technical skills & technologies",
    },
    {
      label: "Certifications",
      points: 10,
      isFilled: Boolean(user.certifications && user.certifications.length > 0),
      hint: "Certificates or credentials",
    },
  ];
}

export function calculateProfileCompletion(user: UserResponse): number {
  const fields = getProfileFieldStatuses(user);
  const score = fields.reduce((acc, f) => acc + (f.isFilled ? f.points : 0), 0);
  return Math.min(100, score);
}

export default function ProfileCard({ user }: { user: UserResponse }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const fields = getProfileFieldStatuses(user);
  const completionPct = calculateProfileCompletion(user);
  const missingFields = fields.filter((f) => !f.isFilled);
  const completedFields = fields.filter((f) => f.isFilled);

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-400 font-display text-lg font-semibold text-white shadow-lg shadow-primary/25">
          {getInitials(user.full_name)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-semibold text-ink">
            {user.full_name}
          </h2>
          <p className="flex items-center gap-1.5 truncate text-sm text-slate-500">
            <MailIcon className="h-3.5 w-3.5 flex-shrink-0" />
            {user.email}
          </p>
        </div>
      </div>

      {/* Profile Completion Bar with Interactive Hover Tooltip */}
      <div
        className="relative mt-5 border-t border-slate-100 pt-4 cursor-pointer group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          <span className="group-hover:text-primary transition-colors flex items-center gap-1">
            Profile {completionPct}% complete
            <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span className="text-[11px] font-normal text-slate-400">
            {missingFields.length === 0 ? "All set!" : `${missingFields.length} field${missingFields.length > 1 ? "s" : ""} left`}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completionPct === 100 ? "bg-emerald-500" : "bg-primary"
            }`}
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {/* Hover Tooltip / Popover showing missing and completed fields */}
        {showTooltip && (
          <div className="absolute left-0 top-full mt-2 z-30 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <span className="font-display text-xs font-bold text-ink uppercase tracking-wider">
                Profile Completion Checklist
              </span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                completionPct === 100 ? "bg-emerald-100 text-emerald-700" : "bg-primary-light text-primary-dark"
              }`}>
                {completionPct}%
              </span>
            </div>

            {/* Missing Fields to Fill */}
            {missingFields.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>⚠️ Needs Completion ({missingFields.length})</span>
                </p>
                <div className="space-y-1.5">
                  {missingFields.map((field) => (
                    <div
                      key={field.label}
                      className="flex items-center justify-between rounded-xl bg-amber-50/60 p-2 text-xs border border-amber-200/50"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-slate-800 block leading-tight">{field.label}</span>
                        <span className="text-[10px] text-slate-500 truncate block">{field.hint}</span>
                      </div>
                      <span className="flex-shrink-0 font-bold text-primary text-[11px] bg-white px-2 py-0.5 rounded-lg border border-primary/20">
                        +{field.points}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Fields */}
            {completedFields.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>✓ Completed Fields ({completedFields.length})</span>
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {completedFields.map((field) => (
                    <div
                      key={field.label}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-50/50 px-2 py-1 text-[11px] font-medium text-emerald-900 border border-emerald-100"
                    >
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span className="truncate">{field.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer action link */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
              <Link
                href="/profile"
                className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline transition-colors block"
              >
                {missingFields.length > 0 ? "Edit Profile to Complete 100% →" : "View & Edit Profile Settings →"}
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-verified">
            <span className="h-1.5 w-1.5 rounded-full bg-verified" />
            {user.is_active ? "Active" : "Inactive"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Member since</p>
          <p className="mt-1 text-sm font-semibold text-ink">{memberSince}</p>
        </div>
      </div>
    </div>
  );
}
