import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

interface BulletSuggestion {
  bullet_id: string;
  original: string;
  suggested: string;
  reason: string;
}

interface TailorResponse {
  overlap: {
    matched: string[];
    missing: string[];
    overlap_pct: number;
    total_keywords: number;
  };
  suggestions: BulletSuggestion[];
}

interface AIResumeTailorModalProps {
  resumeId: string;
  onClose: () => void;
}

export default function AIResumeTailorModal({ resumeId, onClose }: AIResumeTailorModalProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (jobDescription.trim().length < 20) {
      setError("Please paste a complete job description (at least 20 characters).");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<TailorResponse>(`/resume/${resumeId}/tailor`, {
        method: "POST",
        body: { job_description: jobDescription },
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze job description.");
    } finally {
      setLoading(false);
    }
  }

  function toggleAccept(bullet_id: string) {
    setAccepted((prev) => ({ ...prev, [bullet_id]: !prev[bullet_id] }));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tailor-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 id="tailor-modal-title" className="font-display text-lg font-bold text-ink flex items-center gap-2">
              <span>🎯 AI Resume Tailor</span>
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                Job Matcher
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste a target job description to analyze keyword alignment &amp; get bullet rewrites.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-lg p-1"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Target Job Description
            </label>
            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || jobDescription.trim().length < 20}
            className="w-full rounded-xl bg-primary py-3 text-xs font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Analyzing Alignment & Generating Suggestions..." : "Analyze & Tailor Bullet Points"}
          </button>
        </form>

        {result && (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-6">
            {/* Overlap Summary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Keyword Alignment Match</span>
                <span className="text-sm font-extrabold text-primary">{result.overlap.overlap_pct}% Match</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${result.overlap.overlap_pct}%` }}
                />
              </div>

              {/* Keyword Chips */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-semibold text-emerald-700 block mb-1">
                    ✓ Matched Keywords ({result.overlap.matched.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.overlap.matched.slice(0, 8).map((kw, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-amber-700 block mb-1">
                    ! Missing Keywords ({result.overlap.missing.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.overlap.missing.slice(0, 8).map((kw, i) => (
                      <span key={i} className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bullet Suggestions */}
            <div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">
                Non-Destructive Bullet Point Rewrite Suggestions
              </h3>

              <div className="space-y-3">
                {result.suggestions.map((item) => {
                  const isAccepted = !!accepted[item.bullet_id];
                  return (
                    <div
                      key={item.bullet_id}
                      className={`p-3.5 rounded-xl border transition-all text-xs ${
                        isAccepted ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-white"
                      }`}
                    >
                      <p className="text-slate-400 font-mono text-[10px]">Original:</p>
                      <p className="text-slate-600 line-through mb-2">{item.original}</p>

                      <p className="text-primary font-semibold text-[10px] uppercase">Suggested Rewrite:</p>
                      <p className="text-slate-900 font-medium mb-1.5">{item.suggested}</p>

                      <p className="text-slate-500 text-[11px] italic mb-3">💡 {item.reason}</p>

                      <button
                        type="button"
                        onClick={() => toggleAccept(item.bullet_id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isAccepted
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {isAccepted ? "✓ Rewrite Accepted" : "+ Accept Rewrite"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
