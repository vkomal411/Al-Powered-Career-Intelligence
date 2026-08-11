import React, { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
  AlertTriangleIcon,
  LightbulbIcon,
  GithubIcon,
  LinkedinIcon,
} from "./icons";
import { ParsedResume } from "./ResumeReportCard";

// Sub-score calculators
function calculateContactScore(contact: ParsedResume["ats"]["contact"]) {
  let score = 0;
  if (contact.email) score += 10;
  if (contact.phone) score += 10;
  if (contact.linkedin) score += 10;
  if (contact.github) score += 10;
  return score;
}

function calculateSectionScore(sections: ParsedResume["ats"]["sections"]) {
  let score = 0;
  if (sections.summary) score += 5;
  if (sections.skills) score += 5;
  if (sections.experience) score += 5;
  if (sections.education) score += 5;
  if (sections.projects) score += 5;
  if (sections.certifications) score += 5;
  return score;
}

function calculateSkillsScore(skills: string[]) {
  const count = skills.length;
  if (count >= 15) return 30;
  if (count >= 12) return 27;
  if (count >= 10) return 24;
  if (count >= 8) return 20;
  if (count >= 6) return 15;
  if (count >= 4) return 10;
  if (count >= 2) return 5;
  return 0;
}

export default function ATSReportCard({
  parsed,
}: {
  parsed: ParsedResume;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000; // 1s smooth counter animation
    const targetScore = parsed.ats.score;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * targetScore);
      setAnimatedScore(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else if (targetScore >= 75) {
        // Trigger celebration confetti for score >= 75
        fireConfetti();
      }
    };

    requestAnimationFrame(step);
  }, [parsed.ats.score]);

  function fireConfetti() {
    if (typeof window === "undefined") return;
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; size: number }> = [];
    const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 3,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
      });
    }

    let frame = 0;
    const anim = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // gravity
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (frame < 60) {
        requestAnimationFrame(anim);
      } else {
        canvas.remove();
      }
    };
    requestAnimationFrame(anim);
  }

  // Calculate detailed breakdowns
  const contactScore = calculateContactScore(parsed.ats.contact);
  const sectionScore = calculateSectionScore(parsed.ats.sections);
  const skillsScore = calculateSkillsScore(parsed.ats.skills);

  // Categorize recommendations
  const criticalRecs = parsed.ats.suggestions.filter(s =>
    s.toLowerCase().includes("email") || s.toLowerCase().includes("phone")
  );

  const highRecs = parsed.ats.suggestions.filter(s =>
    !s.toLowerCase().includes("email") && !s.toLowerCase().includes("phone") &&
    (s.toLowerCase().includes("summary") || s.toLowerCase().includes("project") || s.toLowerCase().includes("skill"))
  );

  const generalRecs = parsed.ats.suggestions.filter(s =>
    !s.toLowerCase().includes("email") && !s.toLowerCase().includes("phone") &&
    !s.toLowerCase().includes("summary") && !s.toLowerCase().includes("project") && !s.toLowerCase().includes("skill")
  );

  // Determine badge styling based on score
  let strokeColor = "url(#scoreGradientGreen)";
  let badgeText = "Looking great!";
  let badgeColorClass = "bg-emerald-50 text-verified border-verified/20";

  if (animatedScore < 50) {
    strokeColor = "url(#scoreGradientRed)";
    badgeText = "Room to grow";
    badgeColorClass = "bg-amber-50 text-signal border-signal/20";
  } else if (animatedScore < 75) {
    strokeColor = "url(#scoreGradientAmber)";
    badgeText = "On the right track";
    badgeColorClass = "bg-amber-50 text-signal border-signal/20";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
      
      {/* Title Header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-bold text-ink font-display">
          Your Resume Health Check
        </h2>
        <p className="text-xs text-slate-500">
          Here&apos;s how your resume looks to hiring software — and how to improve it
        </p>
      </div>

      {/* Hero Visual: Gauge & Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-slate-100 bg-slate-50/50">
        
        {/* Animated Radial Gauge */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative h-32 w-32">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="scoreGradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="scoreGradientAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F5A524" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="scoreGradientRed" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
              </defs>
              
              {/* Back track */}
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-200"
                strokeWidth="7"
                fill="transparent"
              />
              
              {/* Animated fill */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={strokeColor}
                strokeWidth="7"
                fill="transparent"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * animatedScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Center percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-extrabold text-ink leading-none">
                {Math.round(animatedScore)}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-wider">
                Optimized
              </span>
            </div>
          </div>
          
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold mt-4 shadow-sm ${badgeColorClass}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            {badgeText}
          </span>
        </div>

        {/* Component Score Progress Bars */}
        <div className="flex flex-col justify-center gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span>Contact Credentials</span>
              <span>{contactScore} / 40 pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200/70 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(contactScore / 40) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span>Essential Sections</span>
              <span>{sectionScore} / 30 pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200/70 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(sectionScore / 30) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span>Skillset Breadth</span>
              <span>{skillsScore} / 30 pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200/70 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(skillsScore / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Credentials Audit */}
      <div className="border-b border-slate-100 px-6 py-5">
        <h3 className="text-sm font-semibold text-ink mb-3 font-display">
          What We Found on Your Resume
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Email */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
              </span>
              <span className="text-xs font-medium text-slate-600">Email</span>
            </div>
            {parsed.ats.contact.email ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                Found
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200">
                Not found yet
              </span>
            )}
          </div>
          
          {/* Phone */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              </span>
              <span className="text-xs font-medium text-slate-600">Phone</span>
            </div>
            {parsed.ats.contact.phone ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                Found
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200">
                Not found yet
              </span>
            )}
          </div>

          {/* LinkedIn */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                <LinkedinIcon className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-slate-600">LinkedIn</span>
            </div>
            {parsed.ats.contact.linkedin ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                Found
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200">
                Not found yet
              </span>
            )}
          </div>

          {/* GitHub */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                <GithubIcon className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-slate-600">GitHub</span>
            </div>
            {parsed.ats.contact.github ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                Found
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200">
                Not found yet
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sections Checklist */}
      <div className="border-b border-slate-100 px-6 py-5">
        <h3 className="text-sm font-semibold text-ink mb-3 font-display">
          Resume Sections
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(parsed.ats.sections).map(([section, exists]) => (
            <div
              key={section}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                exists
                  ? "bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
                  : "bg-red-50/30 border-red-100 text-red-600"
              }`}
            >
              {exists ? (
                <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <XCircleIcon className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className="capitalize">{section}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Extracted Skills Taxonomy with Accessibility Legend */}
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-ink font-display">
            Detected Skills Taxonomy
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {parsed.ats.skills.length} Detected
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {parsed.ats.skills.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No skills recognized in the parsed text.</p>
          ) : (
            parsed.ats.skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm"
              >
                <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                {skill}
              </span>
            ))
          )}
        </div>

        {/* Accessibility Legend */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600">Legend:</span>
          <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
            <CheckCircleIcon className="h-3 w-3 text-emerald-600" /> Verified Match
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-amber-700">
            <AlertTriangleIcon className="h-3 w-3 text-amber-600" /> Action Suggested
          </span>
        </div>
      </div>

      {/* Prioritized Recommendations */}
      <div className="px-6 py-5">

        <h3 className="text-sm font-semibold text-ink mb-3 font-display">
          How to Improve
        </h3>
        {parsed.ats.suggestions.length === 0 ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 text-center">
            <span className="inline-block p-2 rounded-full bg-emerald-100 text-emerald-700 mb-2">
              <CheckCircleIcon className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-emerald-800">Perfect Layout Scan!</p>
            <p className="text-xs text-emerald-600 mt-1">
              Your resume contains all contact info, core sections, and skills.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {criticalRecs.map((item, idx) => (
              <div key={`crit-${idx}`} className="flex gap-3 p-3.5 rounded-xl border border-red-150 bg-red-50/20">
                <span className="text-danger mt-0.5 flex-shrink-0">
                  <AlertTriangleIcon className="h-5 w-5" />
                </span>
                <div className="flex-grow">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Quick Win</h4>
                    <span className="inline-flex items-center rounded-full bg-red-100/80 px-2 py-0.5 text-[9px] font-extrabold text-red-800 uppercase tracking-wider">
                      ⚡ Quick Fix (&lt; 2 min)
                    </span>
                  </div>
                  <p className="text-sm text-red-900 mt-1">{item}</p>
                </div>
              </div>
            ))}
            
            {highRecs.map((item, idx) => (
              <div key={`high-${idx}`} className="flex gap-3 p-3.5 rounded-xl border border-amber-200 bg-amber-50/30">
                <span className="text-signal mt-0.5 flex-shrink-0">
                  <LightbulbIcon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Recommended</h4>
                  <p className="text-sm text-amber-900 mt-0.5">{item}</p>
                </div>
              </div>
            ))}

            {generalRecs.map((item, idx) => (
              <div key={`gen-${idx}`} className="flex gap-3 p-3.5 rounded-xl border border-indigo-150 bg-indigo-50/20">
                <span className="text-indigo-500 mt-0.5 flex-shrink-0">
                  <InfoIcon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Nice to Have</h4>
                  <p className="text-sm text-indigo-950 mt-0.5">{item}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}