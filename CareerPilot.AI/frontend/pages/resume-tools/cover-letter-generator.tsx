import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Topbar from "../../components/Topbar";
import Breadcrumbs from "../../components/Breadcrumbs";
import { apiFetch, UserResponse, logoutUser } from "../../lib/api";

interface CoverLetterData {
  tone: string;
  salutation: string;
  opening_paragraph: string;
  body_paragraph: string;
  closing_paragraph: string;
  sign_off: string;
  full_text: string;
}

export default function CoverLetterGeneratorPage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tone, setTone] = useState<"formal" | "startup" | "technical">("formal");
  const [customNotes, setCustomNotes] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetterData | null>(null);
  const [editableText, setEditableText] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    apiFetch<UserResponse>("/auth/me")
      .then(setUser)
      .catch(() => {});

    if (typeof window !== "undefined") {
      const savedJd = sessionStorage.getItem("cl_jd");
      const savedCompany = sessionStorage.getItem("cl_company");
      const savedTone = sessionStorage.getItem("cl_tone");
      const savedText = sessionStorage.getItem("cl_text");
      if (savedJd) setJobDescription(savedJd);
      if (savedCompany) setCompanyName(savedCompany);
      if (savedTone) setTone(savedTone as any);
      if (savedText) {
        setEditableText(savedText);
        setCoverLetter({ tone: savedTone || "formal", full_text: savedText } as any);
      }
    }
  }, []);

  // Auto-save state to sessionStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cl_jd", jobDescription);
      sessionStorage.setItem("cl_company", companyName);
      sessionStorage.setItem("cl_tone", tone);
      if (editableText) sessionStorage.setItem("cl_text", editableText);
    }
  }, [jobDescription, companyName, tone, editableText]);

  // Auto-detect company name when job description is pasted
  const handleJdChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJobDescription(val);
    if (!companyName) {
      const match = val.match(/(?:at|for|with)\s+([A-Z][A-Za-z0-9\s&,.-]{2,30})/);
      if (match && match[1]) {
        const candidate = match[1].trim();
        if (!["The", "A", "Our", "This"].includes(candidate)) {
          setCompanyName(candidate);
        }
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      setError("Please enter a valid job description (at least 20 characters).");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<CoverLetterData>("/ai/cover-letter", {
        method: "POST",
        body: {
          job_description: jobDescription,
          company_name: companyName || undefined,
          tone,
          resume_text: customNotes ? `Additional Context: ${customNotes}` : undefined,
        },
      });
      setCoverLetter(data);
      setEditableText(data.full_text);
    } catch (err: any) {
      setError(err.message || "Failed to generate cover letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([editableText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${user?.full_name?.replace(/\s+/g, "_") || "Applicant"}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <>
      <Head>
        <title>AI Cover Letter Generator — career.AI</title>
      </Head>

      <div className="min-h-screen bg-slate-50/60 dark:bg-[#090d16] font-sans text-slate-800 dark:text-slate-200 antialiased">
        <Topbar
          fullName={user?.full_name}
          activeMenu="resume-tools"
          onLogout={() => {
            logoutUser().finally(() => {
              window.location.href = "/login";
            });
          }}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Breadcrumbs
            items={[
              { label: "Resume Tools", href: "/resume-tools/ats-score-analysis" },
              { label: "Cover Letter Generator" },
            ]}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✉️</span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  AI Cover Letter Generator
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Instantly write a personalized, high-impact 3-paragraph cover letter tailored to your resume and target job role.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Form Column */}
            <div className="lg:col-span-5 space-y-6">
              <form onSubmit={handleGenerate} className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Target Job Details</h3>

                {/* Tone Preset Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Writing Tone</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTone("formal")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        tone === "formal"
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 bg-transparent dark:bg-slate-800/40"
                      }`}
                    >
                      🏛️ Formal
                    </button>
                    <button
                      type="button"
                      onClick={() => setTone("startup")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        tone === "startup"
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 bg-transparent dark:bg-slate-800/40"
                      }`}
                    >
                      🚀 Startup
                    </button>
                    <button
                      type="button"
                      onClick={() => setTone("technical")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        tone === "technical"
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 bg-transparent dark:bg-slate-800/40"
                      }`}
                    >
                      💻 Technical
                    </button>
                  </div>
                </div>

                {/* Company Name (Optional/Auto-extracted) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Company Name <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional / Auto-extracted)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Microsoft, Stripe..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Job Description Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Job Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Paste the job description or role requirements here..."
                    value={jobDescription}
                    onChange={handleJdChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Additional Context */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Additional Context / Specific Highlights <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Led a team of 5, passionate about AI automation..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-medium">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-extrabold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Cover Letter...
                    </>
                  ) : (
                    <>
                      <span>✨ Generate Cover Letter</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 min-h-[480px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase text-slate-400 dark:text-slate-500">Generated Draft</span>
                      {coverLetter && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/25 text-[10px] font-bold uppercase">
                          {coverLetter.tone} Tone
                        </span>
                      )}
                    </div>
                    {coverLetter && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopy}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent dark:border-white/[0.08] text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <span>{copied ? "✓ Copied!" : "📋 Copy"}</span>
                        </button>
                        <button
                          onClick={handleDownload}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-transparent dark:border-indigo-500/25 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <span>💾 Download TXT</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {coverLetter ? (
                    <textarea
                      rows={14}
                      value={editableText}
                      onChange={(e) => setEditableText(e.target.value)}
                      className="w-full text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all resize-y"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
                        📝
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Cover Letter Generated Yet</h4>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Paste your target job description on the left and click <strong>Generate Cover Letter</strong> to craft your custom application letter.
                      </p>
                    </div>
                  )}
                </div>

                {coverLetter && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
                    💡 Tip: You can edit the text directly in the preview box before downloading or copying.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
