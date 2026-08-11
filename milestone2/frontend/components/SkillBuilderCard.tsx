import React, { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

interface Step {
  step_number: number;
  title: string;
  course_id: string;
  course_title: string;
  provider: string;
  difficulty: string;
  duration: string;
  reason: string;
  url: string;
}

interface Course {
  id: string;
  skill: string;
  matched_skill?: string;
  provider: string;
  title: string;
  url: string;
  difficulty: string;
  duration: string;
  rating: number;
  description: string;
}

interface CourseData {
  missing_skills: string[];
  target_role: string;
  recommended_courses: Course[];
  learning_path: {
    total_steps: number;
    estimated_duration: string;
    steps: Step[];
  };
}

interface SkillBuilderCardProps {
  onNavigateTab: (section: string, subtab?: string) => void;
  hasResume?: boolean;
}

export const SkillBuilderCard: React.FC<SkillBuilderCardProps> = ({
  onNavigateTab,
  hasResume = true,
}) => {
  const [data, setData] = useState<CourseData | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"timeline" | "all">("timeline");

  const roleOptions = [
    "Software Engineer",
    "Backend Python / FastAPI Engineer",
    "Frontend React Developer",
    "Data Scientist",
    "Machine Learning Engineer",
    "DevOps Engineer",
    "UI/UX Designer",
    "Product Manager",
    "Other",
  ];

  const availableRoles = data?.target_role && !roleOptions.includes(data.target_role)
    ? [data.target_role, ...roleOptions]
    : roleOptions;

  useEffect(() => {
    if (hasResume) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [hasResume]);

  const fetchRecommendations = async (role?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = role ? `?target_role=${encodeURIComponent(role)}` : "";
      const result = await apiFetch<CourseData>(`/courses/recommendations${query}`);
      setData(result);
      setSelectedRole(result.target_role);
      setShowRolePicker(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not fetch course recommendations.");
    } finally {
      setLoading(false);
    }
  };

  if (!hasResume) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center animate-fade-in space-y-4">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
          Skill
        </div>
        <h3 className="text-lg font-bold text-slate-800">Build Skills for Your Next Role</h3>
        <p className="text-slate-500 max-w-md mx-auto text-xs leading-relaxed">
          Upload your resume in Resume Check to see your personalized course recommendations and step-by-step learning timeline.
        </p>
        <button
          onClick={() => onNavigateTab("resume", "check")}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all text-xs"
        >
          Go to Resume Check →
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded"></div>
        <div className="h-4 w-72 bg-slate-100 rounded"></div>
        <div className="space-y-3 pt-4">
          <div className="h-16 bg-slate-100 rounded-xl"></div>
          <div className="h-16 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
        <p className="text-rose-500 text-xs mb-4">{error || "No recommendations available."}</p>
        <button
          onClick={() => fetchRecommendations()}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-800">Skill Builder</h2>
            {!showRolePicker ? (
              <>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {data.target_role}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole(data.target_role);
                    setShowRolePicker(true);
                  }}
                  className="rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50"
                >
                  Change job
                </button>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedRole}
                  onChange={(event) => {
                    setSelectedRole(event.target.value);
                    if (event.target.value !== "Other") setCustomRole("");
                  }}
                  className="rounded-lg border border-indigo-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  autoFocus
                >
                  {availableRoles.map((role) => <option key={role}>{role}</option>)}
                </select>
                {selectedRole === "Other" && (
                  <input
                    type="text"
                    value={customRole}
                    onChange={(event) => setCustomRole(event.target.value)}
                    placeholder="Enter job title"
                    className="w-full rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-48"
                    autoFocus
                  />
                )}
                <button
                  type="button"
                  onClick={() => fetchRecommendations(selectedRole === "Other" ? customRole.trim() : selectedRole)}
                  disabled={(!selectedRole || (selectedRole === "Other" && !customRole.trim())) || loading}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Apply
                </button>
                <button type="button" onClick={() => setShowRolePicker(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Cancel</button>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Handpicked courses to help you master {data.missing_skills.join(", ") || "core skills"}.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveView("timeline")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeView === "timeline"
                ? "bg-white text-indigo-600 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Step-by-Step Path
          </button>
          <button
            onClick={() => setActiveView("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeView === "all"
                ? "bg-white text-indigo-600 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Courses ({data.recommended_courses.length})
          </button>
        </div>
      </div>

      {/* Step-by-Step Timeline */}
      {activeView === "timeline" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
            <div>
              <h4 className="text-xs font-bold text-indigo-950">Recommended Order</h4>
              <p className="text-xs text-indigo-700">Follow these steps to learn effectively.</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
              Est. {data.learning_path.estimated_duration}
            </span>
          </div>

          <div className="relative pl-6 space-y-6">
            <div className="timeline-line"></div>
            {data.learning_path.steps.map((step) => (
              <div
                key={step.step_number}
                className="relative flex items-start gap-4 bg-slate-50/70 hover:bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group"
              >
                <div className="relative z-10 flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {step.step_number}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      {step.title}
                    </span>
                    <span className="text-xs bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                      {step.difficulty} • {step.duration}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                    {step.course_title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">By <span className="font-semibold text-slate-700">{step.provider}</span></p>

                  <div className="bg-amber-50/80 border border-amber-100 text-amber-900 text-xs p-2.5 rounded-lg mb-3">
                    <span className="font-semibold">Why start here:</span> {step.reason}
                  </div>

                  <a
                    href={step.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    View Course Details ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 2: All Courses Grid */}
      {activeView === "all" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.recommended_courses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-50/60 hover:bg-white border border-slate-100 hover:border-indigo-200 p-5 rounded-2xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
                    {course.provider}
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    ★ {course.rating}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 mb-2 leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {course.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-200/60 pt-3 mb-3">
                  <span>Level: <strong>{course.difficulty}</strong></span>
                  <span>Duration: <strong>{course.duration}</strong></span>
                </div>

                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all shadow-sm"
                >
                  Start Course ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillBuilderCard;
