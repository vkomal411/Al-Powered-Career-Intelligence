import React, { useEffect, useState, useMemo } from "react";
import {
  apiFetch,
  getResumeHistory,
  ResumeHistory,
  CareerPreferences,
  CareerSuggestionResponse,
  getCareerSuggestions,
  uploadAndSuggestCareers,
} from "../../lib/api";
import ResumeSelector from "./ResumeSelector";
import ResumeUpload from "./ResumeUpload";
import PreferencePanel from "./PreferencePanel";
import CareerFilters from "./CareerFilters";
import CareerPathCard from "./CareerPathCard";

export default function CareerSuggestionPage() {
  // State
  const [resumes, setResumes] = useState<ResumeHistory[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | undefined>();
  const [data, setData] = useState<CareerSuggestionResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // UI Panels State
  const [showUpload, setShowUpload] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"all" | "top" | "easy" | "pivot">("all");
  const [preferences, setPreferences] = useState<CareerPreferences>({
    location: "India",
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [targetRoleToast, setTargetRoleToast] = useState<string | null>(null);

  // 1. Initial Load
  useEffect(() => {
    async function init() {
      setLoading(true);
      setLoadingStep("Matching skills against career catalog...");
      setError(null);
      try {
        const history = await getResumeHistory();
        setResumes(history);
        const latestId = history.length > 0 ? history[0].id : undefined;
        setSelectedResumeId(latestId);

        const res = await getCareerSuggestions({
          resume_id: latestId,
          preferences,
        });
        setData(res);
      } catch (err: unknown) {
        console.error("Career suggestions failed:", err);
        setError(err instanceof Error ? err.message : "Failed to load career suggestions.");
      } finally {
        setLoading(false);
        setLoadingStep("");
      }
    }
    init();
  }, []);

  // 2. Select resume
  const handleSelectResume = async (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setLoading(true);
    setLoadingStep("Evaluating recommendations for selected resume...");
    setError(null);
    try {
      const res = await getCareerSuggestions({
        resume_id: resumeId,
        preferences,
      });
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update suggestions.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // 3. Direct upload
  const handleUploadResume = async (file: File) => {
    setLoading(true);
    setLoadingStep("Parsing resume and analyzing matching careers...");
    setError(null);
    try {
      const res = await uploadAndSuggestCareers(file);
      setData(res);
      setShowUpload(false);
      const updatedHistory = await getResumeHistory();
      setResumes(updatedHistory);
      if (updatedHistory.length > 0) {
        setSelectedResumeId(updatedHistory[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload and analysis failed.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // 4. Apply preferences
  const handleApplyPreferences = async () => {
    setLoading(true);
    setLoadingStep("Recalculating suggestions...");
    setError(null);
    try {
      const res = await getCareerSuggestions({
        resume_id: selectedResumeId,
        preferences,
      });
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to apply preferences.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // 5. Target Role Goal
  const handleSetTargetRole = async (roleTitle: string) => {
    try {
      await apiFetch("/auth/profile", {
        method: "PUT",
        body: { target_role: roleTitle },
      });
      setTargetRoleToast(`Target role set to "${roleTitle}"!`);
      setTimeout(() => setTargetRoleToast(null), 3000);
    } catch (err) {
      console.error("Failed to update target role:", err);
    }
  };

  // Categories
  const allCategories = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    data.top_career_paths.forEach((p) => set.add(p.category));
    data.alternative_paths.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [data]);

  // Combined & Filtered Careers
  const filteredCareers = useMemo(() => {
    if (!data) return [];

    let pool = [...data.top_career_paths];
    if (activeTab === "pivot") {
      pool = [...data.alternative_paths];
    } else if (activeTab === "all") {
      pool = [...data.top_career_paths, ...data.alternative_paths];
    } else if (activeTab === "top") {
      pool = data.top_career_paths.filter((p) => p.match_score >= 80);
    } else if (activeTab === "easy") {
      pool = [...data.top_career_paths, ...data.alternative_paths].filter(
        (p) => p.transition_difficulty.toLowerCase() === "low"
      );
    }

    return pool.filter((p) => {
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (selectedDifficulty !== "All" && p.transition_difficulty.toLowerCase() !== selectedDifficulty.toLowerCase())
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.career_title.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesSkill = (p.matching_skills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCategory && !matchesSkill) return false;
      }
      return true;
    });
  }, [data, activeTab, selectedCategory, selectedDifficulty, searchQuery]);

  const hasCustomPrefs = Boolean(
    (preferences.preferred_categories && preferences.preferred_categories.length > 0) ||
    preferences.preferred_work_style ||
    preferences.experience_level
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Toast Notification */}
      {targetRoleToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-2.5 text-xs animate-slide-up border border-white/[0.1]">
          <span className="text-emerald-400 font-bold">✓</span>
          <span>{targetRoleToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white dark:bg-[#111726] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/[0.08] shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <span>✨</span>
          <span>Career Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Career Suggestions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Discover tailored career pathways ranked deterministically against your verified resume skills,
          experience level, and industry salary benchmarks.
        </p>
      </div>

      {/* Top Toolbar: Active Resume, Upload, Preferences */}
      <ResumeSelector
        resumes={resumes}
        selectedResumeId={selectedResumeId}
        onSelectResume={handleSelectResume}
        onOpenUpload={() => {
          setShowUpload(!showUpload);
          setShowPreferences(false);
        }}
        onOpenPreferences={() => {
          setShowPreferences(!showPreferences);
          setShowUpload(false);
        }}
        hasCustomPreferences={hasCustomPrefs}
        onRefresh={() => handleApplyPreferences()}
        loading={loading}
      />

      {/* Dropdown Upload Panel */}
      {showUpload && (
        <ResumeUpload
          onUpload={handleUploadResume}
          loading={loading}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Dropdown Preferences Panel */}
      {showPreferences && (
        <PreferencePanel
          preferences={preferences}
          onChangePreferences={setPreferences}
          onApply={handleApplyPreferences}
          onClose={() => setShowPreferences(false)}
          loading={loading}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-10 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/[0.08] text-center space-y-3 shadow-2xs">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent mx-auto" />
          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{loadingStep || "Analyzing career fit..."}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <span>⚠️</span>
            <span>Unable to load suggestions</span>
          </div>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => handleApplyPreferences()}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-2xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Results */}
      {data && !loading && (
        <div className="space-y-6">
          {/* Profile Match Highlights */}
          <div className="p-5 bg-gradient-to-r from-indigo-50/80 to-purple-50/60 dark:from-indigo-950/30 dark:to-purple-950/20 rounded-2xl border border-indigo-100/80 dark:border-indigo-500/20 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-extrabold text-indigo-950 dark:text-indigo-200 text-sm flex items-center gap-2">
                <span>🎯</span> Profile Match Summary
              </span>
              {data.top_career_paths.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-bold shadow-2xs">
                  Best Fit: {data.top_career_paths[0].career_title} ({Math.round(data.top_career_paths[0].match_score)}%)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {data.summary}
            </p>

            {data.candidate_strengths && data.candidate_strengths.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.candidate_strengths.map((str, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-indigo-100 dark:border-indigo-500/20 text-indigo-900 dark:text-indigo-200 text-[11px] font-semibold shadow-2xs"
                  >
                    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    <span>{str}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick View Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.08] pb-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "all"
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                All Roles ({data.top_career_paths.length + data.alternative_paths.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("top")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "top"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Top Fit (80%+)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("easy")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "easy"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Low Effort Transitions
              </button>

              {data.alternative_paths.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("pivot")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "pivot"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Alternative Pivots ({data.alternative_paths.length})
                </button>
              )}
            </div>
          </div>

          {/* Filters (Search & Category) */}
          <CareerFilters
            categories={allCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Career Cards List */}
          {filteredCareers.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 text-xs">
              No career paths match your selected filters. Try choosing "All Roles" or clearing the search.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCareers.map((career, idx) => (
                <CareerPathCard
                  key={career.career_id}
                  career={career}
                  rank={idx + 1}
                  onSetTargetRole={handleSetTargetRole}
                  defaultExpanded={idx === 0}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
