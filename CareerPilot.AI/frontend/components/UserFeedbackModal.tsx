import React, { useState } from "react";
import { getApiBase } from "../lib/api";

export default function UserFeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("general");
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, rating, message }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setMessage("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
      >
        <span>💬</span>
        <span>Feedback & Support</span>
      </button>

      {/* Feedback Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 dark:bg-[#111726] dark:border-white/[0.1] rounded-2xl p-6 shadow-2xl dark:shadow-[0_16px_48px_rgba(0,0,0,0.7)] relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 text-base transition-colors"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-ink dark:text-slate-100 mb-1">Send Feedback</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">We read every message to improve CareerPilot AI.</p>

            {submitted ? (
              <div className="p-6 text-center text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                🎉 Thank you! Your feedback has been submitted to our team.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs">
                    ⚠️ {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Feedback Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="general" className="dark:bg-slate-800 dark:text-white">General Feedback</option>
                    <option value="bug" className="dark:bg-slate-800 dark:text-white">Report a Bug</option>
                    <option value="feature" className="dark:bg-slate-800 dark:text-white">Request a Feature</option>
                    <option value="rating" className="dark:bg-slate-800 dark:text-white">Rating & Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-xl transition-transform hover:scale-110 ${star <= rating ? "opacity-100" : "opacity-30"}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you like or what we can improve..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-xs text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-lg disabled:opacity-50 transition-all hover:from-indigo-500 hover:to-purple-500"
                  >
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
