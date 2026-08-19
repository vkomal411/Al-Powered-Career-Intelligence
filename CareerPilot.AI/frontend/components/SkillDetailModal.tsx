import React from "react";
import { CheckCircleIcon, SparkleIcon } from "./icons";

interface SkillDetailModalProps {
  skill: string | null;
  isMatched: boolean;
  targetRole: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SkillDetailModal({
  skill,
  isMatched,
  targetRole,
  isOpen,
  onClose,
}: SkillDetailModalProps) {
  if (!isOpen || !skill) return null;

  // Generate dynamic contextual info for the skill
  const skillLower = skill.toLowerCase();
  
  let category = "Technical Skill";
  let learningTime = "1 - 2 Weeks";
  let difficulty = "Intermediate";
  let description = `Key skill requirement for ${targetRole}. Proficiency in ${skill} is frequently requested by hiring managers.`;
  let actionItems = [
    `Complete a hands-on project or module incorporating ${skill}.`,
    `Highlight experience or projects using ${skill} in your resume summary and work experience bullets.`,
    `Practice common interview questions and technical concepts related to ${skill}.`,
  ];

  if (["docker", "kubernetes", "k8s", "aws", "gcp", "azure", "terraform", "ci/cd", "ansible"].some(k => skillLower.includes(k))) {
    category = "Cloud & DevOps Infrastructure";
    learningTime = "2 - 3 Weeks";
    difficulty = "Intermediate to Advanced";
    description = `${skill} is a critical infrastructure & deployment skill for modern engineering teams.`;
    actionItems = [
      `Deploy a containerized web application using ${skill}.`,
      `Set up automated build & deployment pipelines using GitHub Actions or Jenkins.`,
      `Add infrastructure-as-code or containerization badges to your portfolio projects.`,
    ];
  } else if (["python", "java", "typescript", "javascript", "c++", "golang", "go", "rust"].some(k => skillLower.includes(k))) {
    category = "Programming Language";
    learningTime = "2 - 4 Weeks";
    difficulty = "Core Foundation";
    description = `Core programming language required for building backend services and algorithms in ${targetRole}.`;
    actionItems = [
      `Build 2+ full-featured projects demonstrating clean code and design patterns in ${skill}.`,
      `Solve 15-20 algorithmic problems or data structure exercises in ${skill}.`,
      `Review asynchronous programming, memory management, and typing in ${skill}.`,
    ];
  } else if (["react", "next.js", "vue", "angular", "tailwind", "html", "css", "figma", "wcag"].some(k => skillLower.includes(k))) {
    category = "Frontend & UI/UX Development";
    learningTime = "1 - 2 Weeks";
    difficulty = "Beginner to Intermediate";
    description = `Frontend & UI technology essential for crafting user interfaces and accessible user experiences.`;
    actionItems = [
      `Create a responsive dynamic dashboard or component library powered by ${skill}.`,
      `Ensure accessibility (WCAG 2.1) compliance and modern UI design principles.`,
      `Deploy a live interactive web app on Vercel or Netlify showcasing ${skill}.`,
    ];
  } else if (["sql", "postgresql", "mongodb", "redis", "elasticsearch", "graphql", "fastapi", "django", "node.js"].some(k => skillLower.includes(k))) {
    category = "Backend & Database Architecture";
    learningTime = "1 - 3 Weeks";
    difficulty = "Intermediate";
    description = `Backend framework & database technology for managing state, RESTful APIs, and persistent storage.`;
    actionItems = [
      `Build a REST or GraphQL API backend with authentication and database integration using ${skill}.`,
      `Implement query optimization, indexing, or caching mechanisms with ${skill}.`,
      `Document API endpoints using OpenAPI / Swagger specs and publish on GitHub.`,
    ];
  }

  const encodedSkill = encodeURIComponent(skill);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#111726] p-6 shadow-2xl dark:shadow-[0_16px_48px_rgba(0,0,0,0.7)] border border-slate-200 dark:border-white/[0.1] space-y-5 overflow-hidden">
        {/* Background Decorative Gradient */}
        <div
          className={`absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-20 ${
            isMatched ? "bg-emerald-500" : "bg-indigo-600"
          }`}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                isMatched
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                  : "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30"
              }`}
            >
              {isMatched ? <CheckCircleIcon className="h-6 w-6" /> : <SparkleIcon className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded">
                  {category}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isMatched
                      ? "text-emerald-700 bg-emerald-100/80 dark:bg-emerald-500/20 dark:text-emerald-300"
                      : "text-amber-700 bg-amber-100/80 dark:bg-amber-500/20 dark:text-amber-300"
                  }`}
                >
                  {isMatched ? "✓ Matched in Resume" : "⚡ Missing Skill Gap"}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">{skill}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Description & Metadata */}
        <div className="rounded-xl border border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-slate-800/50 p-4 space-y-3">
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{description}</p>
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/60 dark:border-white/[0.06]">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400 block">Est. Effort</span>
              <span className="text-xs font-bold text-slate-800 dark:text-white">{learningTime}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400 block">Difficulty</span>
              <span className="text-xs font-bold text-slate-800 dark:text-white">{difficulty}</span>
            </div>
          </div>
        </div>

        {/* Action Items to Close Gap */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <SparkleIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Recommended Action Steps</span>
          </h4>
          <ul className="space-y-2">
            {actionItems.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-white dark:bg-slate-800/80 p-3 text-xs text-slate-700 dark:text-slate-300 shadow-2xs"
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-[11px] font-bold text-indigo-600 dark:text-indigo-300">
                  {idx + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* External Resources */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/[0.08]">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Explore Learning Resources
          </span>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://www.coursera.org/search?query=${encodedSkill}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-all"
            >
              <span>Coursera</span>
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
            <a
              href={`https://www.youtube.com/results?search_query=${encodedSkill}+tutorial`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-all"
            >
              <span>YouTube Tutorials</span>
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
            <a
              href={`https://github.com/topics/${encodedSkill.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-all"
            >
              <span>GitHub Projects</span>
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 px-5 py-2 text-xs font-bold text-white transition-all shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple internal icon for external link if needed
function ExternalLinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
