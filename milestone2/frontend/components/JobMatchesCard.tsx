import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchJobRecommendations,
  saveJobBookmark,
  removeSavedJobBookmark,
  fetchSavedJobs,
  type JobRecommendationItem,
  type SavedJobResponse,
} from "../lib/api";
import JobDetailModal from "./JobDetailModal";

interface DropdownOption {
  value: string;
  label: string;
}

interface SmoothSelectProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}

function SmoothSelect({ label, value, options, onChange, icon }: SmoothSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all duration-200 shadow-2xs ${
          isOpen
            ? "border-primary bg-white ring-4 ring-primary/10 text-primary shadow-sm"
            : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-slate-50/90"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-slate-400">{icon}</span>}
          <span className="truncate">{selectedOption?.label}</span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ease-out flex-shrink-0 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-40 mt-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl overflow-hidden py-1 transition-all duration-200 ease-out animate-fade-in">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs font-medium flex items-center justify-between text-left transition-all duration-150 ${
                  isSelected
                    ? "bg-indigo-50 text-primary font-bold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <svg
                    className="w-3.5 h-3.5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface JobMatchesCardProps {
  hasResume?: boolean;
  onNavigateTab?: (section: string, subtab?: string) => void;
  defaultFilterMode?: "all" | "saved";
}

export function JobMatchesCard({
  hasResume = true,
  onNavigateTab,
  defaultFilterMode = "all",
}: JobMatchesCardProps) {
  const [filterMode, setFilterMode] = useState<"all" | "saved">(defaultFilterMode);

  // Target career goal state (used in both resume and no-resume states)
  const [careerGoalRole, setCareerGoalRole] = useState<string>("Senior Software Engineer");
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);

  // Filters state
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [workTypeFilter, setWorkTypeFilter] = useState<string>("All");
  const [expLevelFilter, setExpLevelFilter] = useState<string>("All");
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  // Debounced filter state to avoid excessive network requests on fast typing / slider dragging
  const [debouncedLocation, setDebouncedLocation] = useState<string>("");
  const [debouncedMinScore, setDebouncedMinScore] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(locationFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [locationFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinScore(minScoreFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [minScoreFilter]);

  // Recommendations state
  const [jobs, setJobs] = useState<JobRecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Saved jobs state
  const [savedJobs, setSavedJobs] = useState<SavedJobResponse[]>([]);
  const [loadingSaved, setLoadingSaved] = useState<boolean>(false);

  // Modal inspection state
  const [selectedJob, setSelectedJob] = useState<JobRecommendationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadRecommendations = useCallback(async () => {
    if (!hasResume) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchJobRecommendations({
        location: debouncedLocation || undefined,
        workType: workTypeFilter !== "All" ? workTypeFilter : undefined,
        experienceLevel: expLevelFilter !== "All" ? expLevelFilter : undefined,
        minScore: debouncedMinScore > 0 ? debouncedMinScore : undefined,
        limit: 12,
      });
      setJobs(res.recommended_jobs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch job recommendations.");
    } finally {
      setLoading(false);
    }
  }, [hasResume, debouncedLocation, workTypeFilter, expLevelFilter, debouncedMinScore]);

  const loadSavedJobs = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const data = await fetchSavedJobs();
      setSavedJobs(data);
    } catch {
      // Ignore error
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
    loadSavedJobs();
  }, [loadRecommendations, loadSavedJobs]);

  const handleToggleBookmark = async (job: JobRecommendationItem) => {
    try {
      if (job.is_saved) {
        await removeSavedJobBookmark(job.id);
      } else {
        await saveJobBookmark({
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          location: job.location,
          work_type: job.work_type,
          salary_range: job.salary_range,
          job_data: job as unknown as Record<string, unknown>,
        });
      }

      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, is_saved: !j.is_saved } : j))
      );
      if (selectedJob && selectedJob.id === job.id) {
        setSelectedJob({ ...selectedJob, is_saved: !selectedJob.is_saved });
      }

      loadSavedJobs();
    } catch {
      // Error bookmarking
    }
  };

  const handleRemoveSavedBookmark = async (jobId: string) => {
    try {
      await removeSavedJobBookmark(jobId);
      setSavedJobs((prev) => prev.filter((j) => j.job_id !== jobId));
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, is_saved: false } : j))
      );
    } catch {
      // Error
    }
  };

  const handleOpenDetailModal = (job: JobRecommendationItem) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 85) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (score >= 70) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 85) return { label: "Apply now", className: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 70) return { label: "Close small gaps", className: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "Stretch opportunity", className: "text-slate-600 bg-slate-50 border-slate-200" };
  };

  const workTypeOptions: DropdownOption[] = [
    { value: "All", label: "All Work Types" },
    { value: "Remote", label: "Remote Only" },
    { value: "Hybrid", label: "Hybrid" },
    { value: "Onsite", label: "Onsite" },
  ];

  const expLevelOptions: DropdownOption[] = [
    { value: "All", label: "All Levels" },
    { value: "Entry", label: "Entry Level" },
    { value: "Mid", label: "Mid Level" },
    { value: "Senior", label: "Senior Level" },
    { value: "Executive", label: "Executive / Lead" },
  ];

  if (!hasResume) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center animate-fade-in space-y-4">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
          Job
        </div>
        <h3 className="text-lg font-bold text-slate-800">No job matches yet</h3>
        <p className="text-slate-500 max-w-md mx-auto text-xs leading-relaxed">
          Upload your resume in Resume Check. We will analyze your skills and match you with open positions tailored to your background.
        </p>
        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab("resume")}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
          >
            Analyze my resume first
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-panel overflow-hidden animate-fade-up">
      {/* Header & View Filter Toggle */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Career Paths & Job Recommendations
              </h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <span className="text-slate-500">Target Goal:</span>
                {isEditingGoal ? (
                  <input
                    type="text"
                    autoFocus
                    value={careerGoalRole}
                    onChange={(e) => setCareerGoalRole(e.target.value)}
                    onBlur={() => setIsEditingGoal(false)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingGoal(false)}
                    className="bg-white text-slate-900 px-2 py-0.5 rounded text-xs font-semibold outline-none border border-indigo-400 w-44"
                  />
                ) : (
                  <span
                    onClick={() => setIsEditingGoal(true)}
                    className="font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                    title="Click to edit target goal"
                  >
                    <span>{careerGoalRole}</span>
                    <svg className="w-3 h-3 text-slate-400 hover:text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Start with roles that fit your resume today, then use the missing skills to decide what to improve next.
            </p>
          </div>

          {/* Inline Filter Toggle: All Matches vs Saved Jobs */}
          <div className="inline-flex p-1 rounded-xl bg-slate-200/70 border border-slate-300/40 gap-1 self-start md:self-auto">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === "all"
                  ? "bg-white text-indigo-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Matches ({jobs.length})
            </button>

            <button
              onClick={() => setFilterMode("saved")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterMode === "saved"
                  ? "bg-white text-indigo-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Saved Jobs</span>
              {savedJobs.length > 0 && (
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {savedJobs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Controls Bar (Visible in All Matches mode) */}
        {filterMode === "all" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-200/80">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco or Remote"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <SmoothSelect
              label="Work Type"
              value={workTypeFilter}
              options={workTypeOptions}
              onChange={(val) => setWorkTypeFilter(val)}
            />

            <SmoothSelect
              label="Experience Level"
              value={expLevelFilter}
              options={expLevelOptions}
              onChange={(val) => setExpLevelFilter(val)}
            />

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Min Match Score: {minScoreFilter}%
              </label>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* View Content */}
      <div className="p-6">
        {filterMode === "all" ? (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-slate-100 rounded-2xl p-5 border border-slate-200/60" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-rose-500 text-sm mb-3">{error}</p>
              <button
                onClick={loadRecommendations}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-slate-700 mb-1">No matching jobs found</p>
              <p className="text-xs text-slate-500">Try adjusting your location or match score filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.filter((job) => Boolean(job.apply_url && job.apply_url.trim() !== "")).map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-card transition-all duration-200 hover:-translate-y-0.5 relative group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getMatchScoreBadge(job.overall_score)}`}>
                            {job.overall_score}% Match
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Opening
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-sm text-slate-900 mt-2 line-clamp-1 group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-600">{job.company}</p>
                      </div>

                      <button
                        onClick={() => handleToggleBookmark(job)}
                        className={`p-2 rounded-xl border transition-all ${
                          job.is_saved
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                            : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300"
                        }`}
                        title={job.is_saved ? "Remove bookmark" : "Save job"}
                      >
                        <svg className="w-4 h-4" fill={job.is_saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>

                    <div className="mb-3 mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{job.location}</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{job.work_type}</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{job.salary_range}</span>
                    </div>

                    <span className={`mb-3 inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${getReadinessLabel(job.overall_score).className}`}>
                      {getReadinessLabel(job.overall_score).label}
                    </span>

                    <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-slate-600">
                      {job.details.match_rationale}
                    </p>

                    {job.details.missing_skills.length > 0 && (
                      <p className="mb-4 text-[10px] font-semibold text-amber-700">
                        Next skills: {job.details.missing_skills.slice(0, 3).join(", ")}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 py-2.5 rounded-xl text-center shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Apply Now</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <button
                      onClick={() => handleOpenDetailModal(job)}
                      className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100/80 py-2 rounded-xl text-center transition-colors"
                    >
                      View Fit & Skill Gaps →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Filter Mode: Saved Jobs */
          loadingSaved ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-slate-100 rounded-2xl p-5 border border-slate-200/60" />
              ))}
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-slate-700 mb-1">No saved jobs yet</p>
              <p className="text-xs text-slate-500 mb-4">Bookmark jobs in All Matches to save them for later.</p>
              <button
                onClick={() => setFilterMode("all")}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Browse Job Matches →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedJobs.map((saved) => (
                <div
                  key={saved.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-card transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-display font-bold text-sm text-slate-900">{saved.job_title}</h3>
                        <p className="text-xs font-medium text-slate-600">{saved.company}</p>
                      </div>

                      <button
                        onClick={() => handleRemoveSavedBookmark(saved.job_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove bookmark"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mb-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{saved.location}</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{saved.work_type}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    Saved on {new Date(saved.saved_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Details Inspection Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}
    </div>
  );
}

export default JobMatchesCard;
