import React from "react";
import { CareerPreferences } from "../../lib/api";

interface PreferencePanelProps {
  preferences: CareerPreferences;
  onChangePreferences: (updated: CareerPreferences) => void;
  onApply: () => void;
  onClose?: () => void;
  loading?: boolean;
}

export default function PreferencePanel({
  preferences,
  onChangePreferences,
  onApply,
  onClose,
  loading = false,
}: PreferencePanelProps) {
  const handleCategoryToggle = (cat: string) => {
    const current = preferences.preferred_categories || [];
    const exists = current.includes(cat);
    const updated = exists ? current.filter((c) => c !== cat) : [...current, cat];
    onChangePreferences({ ...preferences, preferred_categories: updated });
  };

  const availableCategories = [
    "Software Engineering",
    "Cloud & DevOps",
    "Data & Analytics",
    "AI & Machine Learning",
    "Cybersecurity",
    "Product & Management",
    "Design & Creative",
  ];

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 text-xs animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white text-sm">
          <span>⚙️</span>
          <span>Career Preferences</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Target Categories */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 dark:text-slate-300 block">Preferred Categories:</label>
        <div className="flex flex-wrap gap-1.5">
          {availableCategories.map((cat) => {
            const selected = (preferences.preferred_categories || []).includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryToggle(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  selected
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
                }`}
              >
                {selected && "✓ "}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Work Style */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 dark:text-slate-300 block">Work Style:</label>
          <select
            value={preferences.preferred_work_style || ""}
            onChange={(e) =>
              onChangePreferences({ ...preferences, preferred_work_style: e.target.value || undefined })
            }
            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          >
            <option value="">Any Work Style</option>
            <option value="remote">Remote Only</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
        </div>

        {/* Experience Level */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 dark:text-slate-300 block">Experience Level:</label>
          <select
            value={preferences.experience_level || ""}
            onChange={(e) =>
              onChangePreferences({ ...preferences, experience_level: e.target.value || undefined })
            }
            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          >
            <option value="">Auto (From Resume)</option>
            <option value="entry">Entry-Level (0-2 Yrs)</option>
            <option value="mid">Mid-Level (2-5 Yrs)</option>
            <option value="senior">Senior (5+ Yrs)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            onApply();
            onClose?.();
          }}
          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-colors disabled:opacity-50"
        >
          {loading ? "Applying..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
