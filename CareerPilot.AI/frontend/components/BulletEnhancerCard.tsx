import React, { useState } from "react";
import { enhanceBulletPoint, BulletEnhanceResponse } from "../lib/api";
import { SparkleIcon } from "./icons";

export default function BulletEnhancerCard() {
  const [bulletText, setBulletText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulletEnhanceResponse | null>(null);

  const maxChars = 500;

  async function handleEnhance(e: React.FormEvent) {
    e.preventDefault();
    if (!bulletText.trim() || bulletText.length < 5) {
      setError("Please enter a bullet point statement of at least 5 characters.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await enhanceBulletPoint(bulletText.trim());
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enhancement failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111726] p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <SparkleIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-ink dark:text-white">
            AI Bullet Point Polisher (Action Verbs)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paste a weak or passive bullet point to transform it into an active, high-impact accomplishment statement.
          </p>
        </div>
      </div>

      <form onSubmit={handleEnhance} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Raw Bullet Point
            </label>
            <span className={`text-xs ${bulletText.length > maxChars ? "text-red-500 font-bold" : "text-slate-400 dark:text-slate-500"}`}>
              {bulletText.length} / {maxChars} chars
            </span>
          </div>
          <textarea
            rows={2}
            maxLength={maxChars}
            placeholder="e.g. Was responsible for managing the database and fixing bugs..."
            value={bulletText}
            onChange={(e) => setBulletText(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 p-3 text-sm text-ink dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/20 transition-all resize-none"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 dark:border-rose-500/20 bg-red-50/50 dark:bg-rose-500/10 p-3 text-xs text-red-600 dark:text-rose-300 font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || bulletText.trim().length < 5 || bulletText.length > maxChars}
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-600/20 transition-all hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Polishing Statement...
              </>
            ) : (
              <>
                <SparkleIcon className="h-4 w-4" /> Enhance Bullet Statement
              </>
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Statement Comparison (Diff View)
          </h4>

          {/* Original (Strikethrough) */}
          <div className="p-3.5 rounded-xl border border-red-200 dark:border-rose-500/20 bg-red-50/30 dark:bg-rose-500/10">
            <span className="text-[10px] font-bold text-red-800 dark:text-rose-300 uppercase tracking-wider block mb-1">
              Original Draft
            </span>
            <p className="text-xs text-red-900 dark:text-rose-200 line-through">{result.original}</p>
          </div>

          {/* Enhanced (Active Action Verb) */}
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                ✨ Enhanced Accomplishment Statement
              </span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(result.enhanced)}
                className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Copy to Clipboard
              </button>
            </div>
            <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">{result.enhanced}</p>
          </div>

          {/* Changes Summary */}
          {result.changes_summary && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic px-1">
              💡 {result.changes_summary}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
