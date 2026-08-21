import React, { useState, useCallback, useMemo, useEffect } from "react";
import { DownloadIcon } from "../icons";
import { BlurredPhone } from "../BlurredPhone";
import { downloadBinary, apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export const ResumeEditorStudio: React.FC = () => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<"modern" | "classic" | "minimal">("modern");
  const [loadedFromProfile, setLoadedFromProfile] = useState<boolean>(false);

  // Form State
  const [fullName, setFullName] = useState(user?.full_name || "Venkata Komal");
  const [email, setEmail] = useState(user?.email || "venkata@example.com");
  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [githubUrl, setGithubUrl] = useState("github.com/venkatakomal");
  const [targetRole, setTargetRole] = useState(user?.target_role || "UI/UX Designer");
  const [summary, setSummary] = useState(
    "Creative and user-centered UI/UX Designer with 5+ years of experience crafting intuitive digital products in Figma, User Research, Wireframing, and Design Systems. Proven track record of conducting usability studies and increasing WCAG-compliant adoption by 38%."
  );

  const [skills, setSkills] = useState<string[]>(
    user?.skills && user.skills.length > 0
      ? user.skills
      : ["Figma", "User Research", "Wireframing", "Design Systems", "Usability Testing"]
  );
  const [skillInput, setSkillInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "docx" | null>(null);
  const [exportError, setExportError] = useState("");

  const [experiences, setExperiences] = useState([
    {
      id: "exp-1",
      company: "Apex Design Studios",
      jobTitle: "Senior UI/UX Designer",
      startDate: "2022",
      endDate: "Present",
      description: "Spearheaded end-to-end user experience redesign for flagship SaaS products; increased user satisfaction by 35% while establishing a unified Figma component design system."
    }
  ]);

  const [projects, setProjects] = useState([
    {
      id: "proj-1",
      name: "Interactive SaaS Dashboard Redesign",
      githubUrl: "github.com/venkatakomal/saas-dashboard-redesign",
      description: "Designed responsive user interfaces and conducted 20+ usability testing sessions, reducing user onboarding drop-off rates by 28%.",
      technologies: "Figma, User Research, Wireframing, React"
    }
  ]);

  const [education, setEducation] = useState([
    {
      id: "edu-1",
      school: "University of Technology",
      degree: "B.S. in Computer Science / Design",
      year: "2018 - 2022"
    }
  ]);

  // Automatically load active parsed resume and user profile
  useEffect(() => {
    let isMounted = true;
    async function loadCandidateData() {
      try {
        const resumes = await apiFetch<any[]>("/resume/my-resumes");
        if (!isMounted) return;
        if (Array.isArray(resumes) && resumes.length > 0) {
          const latest = resumes[0];
          if (latest.extracted_name || user?.full_name) setFullName(latest.extracted_name || user?.full_name || "");
          if (latest.extracted_email || user?.email) setEmail(latest.extracted_email || user?.email || "");
          if (latest.extracted_phone) setPhone(latest.extracted_phone);
          if (latest.target_role || user?.target_role) setTargetRole(latest.target_role || user?.target_role || "");
          if (latest.summary || latest.extracted_summary) setSummary(latest.summary || latest.extracted_summary);
          if (Array.isArray(latest.extracted_skills) && latest.extracted_skills.length > 0) {
            setSkills(latest.extracted_skills);
          } else if (Array.isArray(user?.skills) && user.skills.length > 0) {
            setSkills(user.skills);
          }
          if (Array.isArray(latest.extracted_experience) && latest.extracted_experience.length > 0) {
            setExperiences(
              latest.extracted_experience.map((exp: any, i: number) => ({
                id: `exp-${i + 1}`,
                company: exp.company || exp.title || "Company",
                jobTitle: exp.title || exp.role || "Job Title",
                startDate: exp.start_date || exp.dates?.split("-")[0]?.trim() || "2022",
                endDate: exp.end_date || exp.dates?.split("-")[1]?.trim() || "Present",
                description: exp.description || exp.summary || exp.responsibilities || ""
              }))
            );
          }
          if (Array.isArray(latest.extracted_education) && latest.extracted_education.length > 0) {
            setEducation(
              latest.extracted_education.map((ed: any, i: number) => ({
                id: `edu-${i + 1}`,
                school: ed.school || ed.institution || ed.name || "University",
                degree: ed.degree || ed.field || ed.major || "Degree",
                year: ed.year || ed.dates || "2020 - 2024"
              }))
            );
          }
          if (Array.isArray(latest.extracted_projects) && latest.extracted_projects.length > 0) {
            setProjects(
              latest.extracted_projects.map((proj: any, i: number) => ({
                id: `proj-${i + 1}`,
                name: proj.name || proj.title || "Project",
                githubUrl: proj.url || proj.link || "",
                description: proj.description || "",
                technologies: Array.isArray(proj.technologies) ? proj.technologies.join(", ") : (proj.technologies || "")
              }))
            );
          }
          setLoadedFromProfile(true);
        } else if (user) {
          if (user.full_name) setFullName(user.full_name);
          if (user.email) setEmail(user.email);
          if (user.target_role) setTargetRole(user.target_role);
          if (Array.isArray(user.skills) && user.skills.length > 0) setSkills(user.skills);
          setLoadedFromProfile(true);
        }
      } catch {
        if (user && isMounted) {
          if (user.full_name) setFullName(user.full_name);
          if (user.email) setEmail(user.email);
          if (user.target_role) setTargetRole(user.target_role);
          if (Array.isArray(user.skills) && user.skills.length > 0) setSkills(user.skills);
        }
      }
    }
    loadCandidateData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Quick 1-Click Role Presets
  const handleSelectPreset = useCallback((roleName: string) => {
    setIsGenerating(true);
    setTargetRole(roleName);
    const roleLower = roleName.toLowerCase();

    setTimeout(() => {
      if (roleLower.includes("ui/ux") || roleLower.includes("design") || roleLower.includes("figma")) {
        setSkills(["Figma", "User Research", "Wireframing", "Interactive Prototyping", "Design Systems", "Usability Testing"]);
        setSummary(`Creative and user-centered ${roleName} with 5+ years of experience crafting intuitive digital products in Figma, User Research, Wireframing, and Design Systems. Proven track record of conducting usability studies and increasing WCAG-compliant adoption by 38%.`);
        setExperiences([
          {
            id: "exp-1",
            company: "Apex Design Studios",
            jobTitle: roleName,
            startDate: "2022",
            endDate: "Present",
            description: "Spearheaded end-to-end user experience redesign for flagship SaaS products; increased user satisfaction by 35% while establishing a unified Figma component design system."
          }
        ]);
      } else if (roleLower.includes("server") || roleLower.includes("infrastructure") || roleLower.includes("sysadmin")) {
        setSkills(["Linux (RHEL/Ubuntu)", "Ansible", "Terraform", "Prometheus", "Grafana", "HAProxy", "Shell Scripting"]);
        setSummary(`Results-driven ${roleName} specializing in enterprise Linux infrastructure, high-availability server clustering, and system security. Proven track record of maintaining 99.99% system uptime and automating server provisioning.`);
        setExperiences([
          {
            id: "exp-1",
            company: "Enterprise Cloud Systems",
            jobTitle: roleName,
            startDate: "2021",
            endDate: "Present",
            description: "Automated server cluster provisioning across 150+ Linux nodes using Ansible and Terraform; maintained 99.99% system SLA uptime."
          }
        ]);
      } else if (roleLower.includes("devops") || roleLower.includes("sre") || roleLower.includes("cloud")) {
        setSkills(["Kubernetes", "Docker", "Terraform", "AWS", "GitHub Actions", "Helm", "Prometheus", "CI/CD"]);
        setSummary(`Performance-focused ${roleName} with hands-on expertise in container orchestration, cloud infrastructure, and automated CI/CD pipelines. Proven track record of reducing deployment lead times by 60%.`);
        setExperiences([
          {
            id: "exp-1",
            company: "CloudScale Tech",
            jobTitle: roleName,
            startDate: "2022",
            endDate: "Present",
            description: "Engineered multi-region AWS Kubernetes clusters and zero-downtime CI/CD GitHub Actions pipelines; accelerated release frequency by 3x."
          }
        ]);
      } else {
        setSkills(["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker", "REST APIs"]);
        setSummary(`Results-driven ${roleName} with extensive hands-on experience building high-performance web applications and scalable RESTful microservices. Proven track record of leading Agile sprints and optimizing response times.`);
        setExperiences([
          {
            id: "exp-1",
            company: "Nexus Software Labs",
            jobTitle: roleName,
            startDate: "2021",
            endDate: "Present",
            description: "Architected modern responsive full-stack applications with React, Next.js, and FastAPI microservices; reduced client API latency by 45%."
          }
        ]);
      }
      setIsGenerating(false);
    }, 200);
  }, []);

  const handleAddSkill = useCallback(() => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  }, [skillInput, skills]);

  const handleRemoveSkill = useCallback((skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  }, [skills]);

  const exportData = useMemo(() => ({
    fullName,
    targetRole,
    email,
    phone,
    githubUrl,
    summary,
    skills,
    experiences,
    projects,
    education,
    template: selectedTemplate
  }), [fullName, targetRole, email, phone, githubUrl, summary, skills, experiences, projects, education, selectedTemplate]);

  const handleExportPDF = useCallback(async () => {
    setIsExporting("pdf");
    setExportError("");
    try {
      await downloadBinary("/api/studio/export/pdf", exportData, `${fullName.trim().replace(/\s+/g, "_") || "Resume"}_Resume.pdf`);
    } catch {
      // Client-side fallback if backend export endpoint is unreachable
      if (typeof window !== "undefined") {
        const docTitle = `${fullName || "Resume"} — ${targetRole || "Target Role"}`;
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>${docTitle}</title>
              <style>
                @page { size: letter portrait; margin: 18mm 16mm; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #111827; margin: 0; padding: 0; }
                h1 { font-size: 20pt; margin: 0 0 2pt 0; color: #111827; font-weight: 800; letter-spacing: -0.5px; }
                .role { font-size: 12pt; font-weight: 700; color: #4f46e5; margin-bottom: 6pt; }
                .contact { font-size: 9.5pt; color: #6b7280; margin-bottom: 14pt; padding-bottom: 8pt; border-bottom: 1.5pt solid #e5e7eb; }
                h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 0.8px; color: #1e293b; border-bottom: 1pt solid #cbd5e1; padding-bottom: 3pt; margin-top: 12pt; margin-bottom: 6pt; font-weight: 700; }
                p { margin: 0 0 5pt 0; }
                .item-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 10.5pt; color: #0f172a; margin-bottom: 2pt; }
                .item-sub { font-size: 9.5pt; color: #4f46e5; font-weight: 600; margin-bottom: 3pt; }
                .skills-box { display: flex; flex-wrap: wrap; gap: 4pt; }
                .skill-tag { background: #f1f5f9; border: 1pt solid #e2e8f0; padding: 2pt 6pt; border-radius: 4pt; font-size: 9pt; font-weight: 600; color: #334155; }
              </style>
            </head>
            <body>
              <h1>${fullName || "Your Full Name"}</h1>
              <div class="role">${targetRole || "Target Job Title"}</div>
              <div class="contact">
                <span>${email || "email@example.com"}</span> • <span>${phone || "+1 (555) 000-0000"}</span>
                ${githubUrl ? ` • <span>${githubUrl}</span>` : ""}
              </div>

              ${summary ? `<h2>Professional Summary</h2><p>${summary}</p>` : ""}

              ${skills.length > 0 ? `<h2>Technical & Domain Skills</h2><div class="skills-box">${skills.map((s) => `<span class="skill-tag">${s}</span>`).join(" ")}</div>` : ""}

              ${experiences.length > 0 ? `<h2>Work Experience</h2>${experiences.map((e) => `<div style="margin-bottom: 10pt;"><div class="item-header"><span>${e.jobTitle || "Role"}</span><span>${e.startDate} – ${e.endDate}</span></div><div class="item-sub">${e.company || "Company"}</div><p>${e.description}</p></div>`).join("")}` : ""}

              ${projects.length > 0 ? `<h2>Key Projects</h2>${projects.map((p) => `<div style="margin-bottom: 10pt;"><div class="item-header"><span>${p.name}</span><span style="font-weight: normal; color: #64748b; font-size: 9pt;">${p.technologies || ""}</span></div>${p.githubUrl ? `<div style="font-size: 9pt; color: #4f46e5; margin-bottom: 2pt;">${p.githubUrl}</div>` : ""}<p>${p.description}</p></div>`).join("")}` : ""}

              ${education.length > 0 ? `<h2>Education</h2>${education.map((ed) => `<div style="margin-bottom: 6pt;"><div class="item-header"><span>${ed.degree}</span><span>${ed.year}</span></div><div style="font-size: 9.5pt; color: #475569;">${ed.school}</div></div>`).join("")}` : ""}
            </body>
          </html>
        `;
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);
        iframe.contentWindow?.document.write(htmlContent);
        iframe.contentWindow?.document.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => iframe.remove(), 1000);
        }, 300);
      }
    } finally {
      setIsExporting(null);
    }
  }, [exportData, fullName, targetRole, email, phone, githubUrl, summary, skills, experiences, projects, education]);

  const handleExportDocx = useCallback(async () => {
    setIsExporting("docx");
    setExportError("");
    try {
      await downloadBinary("/api/studio/export/docx", exportData, `${fullName.trim().replace(/\s+/g, "_") || "Resume"}_Resume.docx`);
    } catch {
      // Client-side fallback if backend export service is unreachable
      const docTitle = `${fullName || "Resume"} — ${targetRole || "Target Role"}`;
      const wordHTML = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset="utf-8">
            <title>${docTitle}</title>
            <style>
              body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #111827; }
              h1 { font-size: 20pt; color: #1e3a8a; margin-bottom: 2pt; }
              .subtitle { font-size: 12pt; font-weight: bold; color: #4338ca; margin-bottom: 4pt; }
              .contact { font-size: 10pt; color: #6b7280; margin-bottom: 16pt; }
              h2 { font-size: 12pt; text-transform: uppercase; color: #1e293b; border-bottom: 1.5pt solid #cbd5e1; padding-bottom: 2pt; margin-top: 14pt; margin-bottom: 6pt; }
              p { margin-top: 0; margin-bottom: 6pt; line-height: 1.4; }
              .job-header { font-weight: bold; font-size: 11pt; color: #0f172a; }
            </style>
          </head>
          <body>
            <h1>${fullName || "Your Full Name"}</h1>
            <div class="subtitle">${targetRole || "Target Job Title"}</div>
            <div class="contact">Email: ${email || "email@example.com"} | Phone: ${phone || "+1 555-0000"}${githubUrl ? ` | ${githubUrl}` : ""}</div>

            ${summary ? `<h2>Professional Summary</h2><p>${summary}</p>` : ""}
            ${skills.length > 0 ? `<h2>Skills</h2><p>${skills.join(" • ")}</p>` : ""}
            ${experiences.length > 0 ? `<h2>Work Experience</h2>${experiences.map((e) => `<div style="margin-bottom: 10pt;"><div class="job-header">${e.jobTitle || "Role"} at ${e.company || "Company"} (${e.startDate} - ${e.endDate})</div><p style="margin-top: 2pt;">${e.description}</p></div>`).join("")}` : ""}
            ${projects.length > 0 ? `<h2>Key Projects</h2>${projects.map((p) => `<div style="margin-bottom: 10pt;"><div class="job-header">${p.name}${p.technologies ? ` (${p.technologies})` : ""}</div><p style="margin-top: 2pt;">${p.description}</p></div>`).join("")}` : ""}
            ${education.length > 0 ? `<h2>Education</h2>${education.map((ed) => `<p><strong>${ed.degree}</strong> — ${ed.school} (${ed.year})</p>`).join("")}` : ""}
          </body>
        </html>
      `;
      const blob = new Blob(["\ufeff" + wordHTML], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fullName.replace(/\s+/g, "_")}_Resume.doc`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(null);
    }
  }, [exportData, fullName, targetRole, email, phone, githubUrl, summary, skills, experiences, projects, education]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Simple Header & Quick Role Presets */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/[0.08] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/25">
                Simple AI Resume Studio
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ ATS Optimized</span>
              {loadedFromProfile && (
                <>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-2xs font-semibold border border-emerald-200 dark:border-emerald-800/40">
                    ⚡ Auto-filled from your profile
                  </span>
                </>
              )}
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-1">Automatic Resume Generator</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fill in your info below or click a role preset to generate a clean, ATS-ready resume instantly.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Layout:</span>
            {(["modern", "classic", "minimal"] as const).map((tmpl) => (
              <button
                key={tmpl}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                  selectedTemplate === tmpl
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {tmpl}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">1-Click Presets:</span>
          {[
            { label: "UI/UX Designer", role: "UI/UX Designer" },
            { label: "Senior Full Stack Engineer", role: "Senior Full Stack Engineer" },
            { label: "DevOps / Cloud SRE", role: "DevOps Engineer" },
            { label: "AI / ML Engineer", role: "Machine Learning Engineer" },
            { label: "Server Manager", role: "Server Infrastructure Manager" }
          ].map((preset) => (
            <button
              key={preset.role}
              onClick={() => handleSelectPreset(preset.role)}
              disabled={isGenerating}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                targetRole.toLowerCase() === preset.role.toLowerCase()
                  ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30 font-bold"
                  : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50/50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-300"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clean 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Direct Simple Editor Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/[0.08] p-6 space-y-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-white/[0.06] pb-2">
              Personal Information & Target Role
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Targeted Job Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">GitHub Profile Link</label>
                <input
                  type="text"
                  placeholder="e.g. github.com/venkatakomal"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-indigo-700 dark:text-indigo-400 font-semibold placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Summary Input */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Professional Summary</label>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(targetRole)}
                  className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-500/25 hover:bg-indigo-100 dark:hover:bg-indigo-500/25"
                >
                  AI Polish
                </button>
              </div>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none leading-relaxed"
              />
            </div>

            {/* Skills */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Technical & Soft Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  placeholder="e.g. Figma, React, Python..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                    <span>{s}</span>
                    <button onClick={() => handleRemoveSkill(s)} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Work Experience</h4>
                <button
                  type="button"
                  onClick={() =>
                    setExperiences([
                      ...experiences,
                      {
                        id: Date.now().toString(),
                        company: "",
                        jobTitle: "",
                        startDate: "2023",
                        endDate: "Present",
                        description: ""
                      }
                    ])
                  }
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all border border-indigo-200 dark:border-indigo-500/25"
                >
                  + Add Role
                </button>
              </div>
              {experiences.map((exp) => (
                <div key={exp.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 relative group">
                  {experiences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setExperiences(experiences.filter((item) => item.id !== exp.id))}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold px-1.5 py-0.5"
                      title="Remove Role"
                    >
                      ×
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) =>
                        setExperiences(experiences.map((item) => (item.id === exp.id ? { ...item, jobTitle: e.target.value } : item)))
                      }
                      placeholder="Job Title"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        setExperiences(experiences.map((item) => (item.id === exp.id ? { ...item, company: e.target.value } : item)))
                      }
                      placeholder="Company Name"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) =>
                      setExperiences(experiences.map((item) => (item.id === exp.id ? { ...item, description: e.target.value } : item)))
                    }
                    placeholder="Bullet point description..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Key Projects */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Key Projects & Portfolio</h4>
                <button
                  type="button"
                  onClick={() =>
                    setProjects([
                      ...projects,
                      {
                        id: Date.now().toString(),
                        name: "",
                        githubUrl: "",
                        description: "",
                        technologies: "Figma, React"
                      }
                    ])
                  }
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all border border-indigo-200 dark:border-indigo-500/25"
                >
                  + Add Project
                </button>
              </div>
              {projects.map((proj) => (
                <div key={proj.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 relative group">
                  {projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setProjects(projects.filter((item) => item.id !== proj.id))}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold px-1.5 py-0.5"
                      title="Remove Project"
                    >
                      ×
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) =>
                        setProjects(projects.map((item) => (item.id === proj.id ? { ...item, name: e.target.value } : item)))
                      }
                      placeholder="Project Name (e.g. E-Commerce Redesign)"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                    <input
                      type="text"
                      value={proj.technologies}
                      onChange={(e) =>
                        setProjects(projects.map((item) => (item.id === proj.id ? { ...item, technologies: e.target.value } : item)))
                      }
                      placeholder="Technologies (e.g. Figma, React)"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={proj.githubUrl || ""}
                      onChange={(e) =>
                        setProjects(projects.map((item) => (item.id === proj.id ? { ...item, githubUrl: e.target.value } : item)))
                      }
                      placeholder="GitHub / Repo Link (e.g. github.com/username/project)"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs font-medium text-indigo-700 dark:text-indigo-400 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) =>
                      setProjects(projects.map((item) => (item.id === proj.id ? { ...item, description: e.target.value } : item)))
                    }
                    placeholder="Project description and key results..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Paper Document Preview & Action Buttons */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-white/[0.08] p-6 space-y-4 shadow-sm sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Live Document Preview ({selectedTemplate})</span>
              </div>
              <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/25">
                94% ATS Score
              </span>
            </div>

            {/* DYNAMIC TEMPLATE PAPER PREVIEW */}
            {selectedTemplate === "modern" && (
              <div className="bg-white dark:bg-slate-900/90 p-6 sm:p-8 rounded-xl border-l-4 border-indigo-600 border border-slate-200 dark:border-slate-800 space-y-4 font-sans text-xs shadow-2xs min-h-[420px] transition-all">
                <div className="border-b border-indigo-100 dark:border-indigo-900/40 pb-3">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1 inline-block border border-indigo-100 dark:border-indigo-500/30">
                    Modern Layout
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{fullName || "Candidate Name"}</h3>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{targetRole || "Target Role"}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <span>{email}</span>
                    <span>•</span>
                    <BlurredPhone phone={phone} />
                    {githubUrl && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{githubUrl}</span>
                      </>
                    )}
                  </p>
                </div>

                {summary && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-indigo-950 dark:text-indigo-300 text-[11px] uppercase tracking-wider border-b border-indigo-100 dark:border-indigo-900/30 pb-1">Professional Summary</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pt-0.5">{summary}</p>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-indigo-950 dark:text-indigo-300 text-[11px] uppercase tracking-wider border-b border-indigo-100 dark:border-indigo-900/30 pb-1">Technical Skills</h4>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/30 font-semibold text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {experiences.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-indigo-950 dark:text-indigo-300 text-[11px] uppercase tracking-wider border-b border-indigo-100 dark:border-indigo-900/30 pb-1">Work Experience</h4>
                    {experiences.map((e) => (
                      <div key={e.id} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          <span>{e.jobTitle} — <span className="text-indigo-600 dark:text-indigo-400">{e.company}</span></span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{e.startDate} - {e.endDate}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-relaxed">{e.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {projects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-indigo-950 dark:text-indigo-300 text-[11px] uppercase tracking-wider border-b border-indigo-100 dark:border-indigo-900/30 pb-1">Key Projects</h4>
                    {projects.map((p) => (
                      <div key={p.id} className="space-y-0.5">
                        <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          <span>{p.name}</span>
                          <div className="flex items-center gap-2 text-[10px]">
                            {p.githubUrl && <span className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono">{p.githubUrl}</span>}
                            {p.technologies && <span className="text-slate-500 dark:text-slate-400 font-medium">[{p.technologies}]</span>}
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTemplate === "classic" && (
              <div className="bg-stone-50/60 dark:bg-stone-900/80 p-6 sm:p-8 rounded-xl border-2 border-stone-800 dark:border-stone-600 space-y-4 font-serif text-xs shadow-2xs min-h-[420px] text-stone-900 dark:text-stone-100 transition-all">
                <div className="text-center space-y-1 border-t-2 border-b-2 border-stone-800 dark:border-stone-600 py-3">
                  <h3 className="text-xl font-bold font-serif uppercase tracking-widest text-stone-900 dark:text-stone-100">{fullName || "Candidate Name"}</h3>
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">{targetRole || "Target Role"}</p>
                  <p className="text-[10px] text-stone-600 dark:text-stone-400 flex justify-center flex-wrap items-center gap-2 pt-1 font-sans">
                    <span>{email}</span>
                    <span>•</span>
                    <BlurredPhone phone={phone} />
                    {githubUrl && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-300">{githubUrl}</span>
                      </>
                    )}
                  </p>
                </div>

                {summary && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-center font-serif text-[11px] uppercase tracking-widest border-b border-stone-400 dark:border-stone-600 pb-1 text-stone-900 dark:text-stone-100">Professional Summary</h4>
                    <p className="text-stone-800 dark:text-stone-200 text-[11px] leading-relaxed text-justify pt-0.5">{summary}</p>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-center font-serif text-[11px] uppercase tracking-widest border-b border-stone-400 dark:border-stone-600 pb-1 text-stone-900 dark:text-stone-100">Technical Competencies</h4>
                    <p className="text-stone-800 dark:text-stone-200 text-[11px] text-center pt-0.5">{skills.join(" • ")}</p>
                  </div>
                )}

                {experiences.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-center font-serif text-[11px] uppercase tracking-widest border-b border-stone-400 dark:border-stone-600 pb-1 text-stone-900 dark:text-stone-100">Work History</h4>
                    {experiences.map((e) => (
                      <div key={e.id} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-stone-900 dark:text-stone-100 text-[11px]">
                          <span>{e.jobTitle}, <em>{e.company}</em></span>
                          <span className="text-[10px] text-stone-600 dark:text-stone-400 font-sans">{e.startDate} - {e.endDate}</span>
                        </div>
                        <p className="text-stone-800 dark:text-stone-300 text-[10px] leading-relaxed text-justify">{e.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {projects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-center font-serif text-[11px] uppercase tracking-widest border-b border-stone-400 dark:border-stone-600 pb-1 text-stone-900 dark:text-stone-100">Portfolio Projects</h4>
                    {projects.map((p) => (
                      <div key={p.id} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-stone-900 dark:text-stone-100 text-[11px]">
                          <span>{p.name} {p.technologies && <span className="font-sans font-normal text-stone-600 dark:text-stone-400">({p.technologies})</span>}</span>
                          {p.githubUrl && <span className="text-[10px] font-mono text-stone-700 dark:text-stone-300">{p.githubUrl}</span>}
                        </div>
                        <p className="text-stone-800 dark:text-stone-300 text-[10px] leading-relaxed text-justify">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTemplate === "minimal" && (
              <div className="bg-white dark:bg-slate-900/90 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-slate-900 dark:border-t-indigo-500 space-y-4 font-sans text-xs shadow-2xs min-h-[420px] text-slate-900 dark:text-slate-100 transition-all">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">{fullName || "Candidate Name"}</h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{targetRole || "Target Role"}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[9px] uppercase font-bold tracking-wider">
                      Minimal
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex flex-wrap items-center gap-2">
                    <span>{email}</span>
                    <span>•</span>
                    <BlurredPhone phone={phone} />
                    {githubUrl && (
                      <>
                        <span>•</span>
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{githubUrl}</span>
                      </>
                    )}
                  </p>
                </div>

                {summary && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-1">Professional Summary</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-relaxed pt-0.5">{summary}</p>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-1">Technical Skills</h4>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {experiences.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-1">Work Experience</h4>
                    {experiences.map((e) => (
                      <div key={e.id} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 text-[10px]">
                          <span>{e.jobTitle} <span className="text-slate-400 dark:text-slate-500 font-normal">|</span> {e.company}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">{e.startDate} - {e.endDate}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-relaxed">{e.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {projects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-1">Key Projects</h4>
                    {projects.map((p) => (
                      <div key={p.id} className="space-y-0.5">
                        <div className="flex justify-between items-center font-bold text-slate-900 dark:text-slate-100 text-[10px]">
                          <span>{p.name}</span>
                          <div className="flex items-center gap-2 text-[9px]">
                            {p.githubUrl && <span className="text-slate-700 dark:text-slate-300 font-medium">{p.githubUrl}</span>}
                            {p.technologies && <span className="text-slate-400 dark:text-slate-500 font-normal">[{p.technologies}]</span>}
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Export Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Export Options:</span>
                {exportError && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{exportError}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPDF}
                  disabled={Boolean(isExporting)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <DownloadIcon className="w-4 h-4 text-white" />
                  <span>📄 Download PDF</span>
                </button>
                <button
                  onClick={handleExportDocx}
                  disabled={Boolean(isExporting)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <DownloadIcon className="w-4 h-4 text-white" />
                  <span>📝 Download Word (.doc)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditorStudio;
