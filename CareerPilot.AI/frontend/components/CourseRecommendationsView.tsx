import React, { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

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
}

export const CourseRecommendationsView: React.FC = () => {
  const [data, setData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>("All");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<CourseData>("/courses/recommendations");
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not fetch course recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const defaultCourses: Course[] = [
    {
      id: "c1",
      skill: "System Architecture",
      provider: "Coursera",
      title: "Distributed Systems & Microservices Architecture",
      url: "https://coursera.org",
      difficulty: "Advanced",
      duration: "6 Weeks",
      rating: 4.8,
      description: "Master high-scale distributed system patterns, RPC frameworks, and fault tolerant caching.",
    },
    {
      id: "c2",
      skill: "GraphQL",
      provider: "Udemy",
      title: "Complete GraphQL with React and Node.js",
      url: "https://udemy.com",
      difficulty: "Intermediate",
      duration: "4 Weeks",
      rating: 4.7,
      description: "Build production GraphQL APIs, schema resolvers, authentication, and Apollo Client integration.",
    },
    {
      id: "c3",
      skill: "AWS Cloud Infrastructure",
      provider: "edX",
      title: "AWS Certified Solutions Architect Course",
      url: "https://edx.org",
      difficulty: "Intermediate",
      duration: "8 Weeks",
      rating: 4.9,
      description: "Comprehensive preparation covering EC2, ECS, S3, IAM, CloudFront, and Infrastructure as Code.",
    },
  ];

  const coursesToDisplay = data?.recommended_courses && data.recommended_courses.length > 0 ? data.recommended_courses : defaultCourses;
  const missingSkills = data?.missing_skills || ["System Architecture", "GraphQL", "AWS Cloud Infrastructure"];

  const filteredCourses =
    selectedSkillFilter === "All"
      ? coursesToDisplay
      : coursesToDisplay.filter((c) => (c.skill || c.matched_skill) === selectedSkillFilter);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              Career Tools
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">Skill Gap Resolution</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">Course Recommendations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated online courses directly targeted at closing identified skill gaps in your profile.
          </p>
        </div>
      </div>

      {/* Target Role & Missing Skill Chips */}
      <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
          Target Role Gap Analysis {data?.target_role ? `— ${data.target_role}` : ""}
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSkillFilter("All")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedSkillFilter === "All"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-white text-indigo-900 hover:bg-white/80 border border-indigo-200"
            }`}
          >
            All Recommended Courses
          </button>
          {missingSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkillFilter(skill)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedSkillFilter === skill
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Missing: {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading course recommendations...</div>
      ) : error ? (
        <div className="py-12 text-center space-y-3">
          <p className="text-xs font-semibold text-rose-600">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                    {course.provider}
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    ★ {course.rating}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{course.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{course.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Level: {course.difficulty}</span>
                  <span>Duration: {course.duration}</span>
                </div>

                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Explore Course</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseRecommendationsView;
