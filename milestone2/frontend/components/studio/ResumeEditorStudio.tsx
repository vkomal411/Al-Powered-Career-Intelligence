import React, { useState, useCallback, useMemo } from "react";
import { DownloadIcon } from "../icons";
import { BlurredPhone } from "../BlurredPhone";
import { downloadBinary } from "../../lib/api";

export const ResumeEditorStudio: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<"modern" | "classic" | "minimal">("modern");

  // Form State
  const [fullName, setFullName] = useState("Venkata Komal");
  const [email, setEmail] = useState("venkata@example.com");
  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [githubUrl, setGithubUrl] = useState("github.com/venkatakomal");
  const [targetRole, setTargetRole] = useState("UI/UX Designer");
  const [summary, setSummary] = useState(
    "Creative and user-centered UI/UX Designer with 5+ years of experience crafting intuitive digital products in Figma, User Research, Wireframing, and Design Systems. Proven track record of conducting usability studies and increasing WCAG-compliant adoption by 38%."
  );

  const [skills, setSkills] = useState<string[]>(["Figma", "User Research", "Wireframing", "Design Systems", "Usability Testing"]);
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
            description: "Led end-to-end development of microservice architecture using Next.js and PostgreSQL; improved system throughput by 40%."
          }
        ]);
      }
      setIsGenerating(false);
    }, 400);
  }, []);

  const handleAddSkill = useCallback(() => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills((prev) => [...prev, skillInput.trim()]);
      setSkillInput("");
    }
  }, [skillInput, skills]);

  const handleRemoveSkill = useCallback((skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }, []);

  const [education] = useState([
    {
      id: "edu-1",
      degree: "B.S. in Computer Science & Design",
      school: "State University",
      year: "2022"
    }
  ]);

  const exportData = useMemo(
    () => ({
      full_name: fullName,
      target_role: targetRole,
      email,
      phone,
      github_url: githubUrl,
      summary,
      skills,
      experiences,
      projects,
      education
    }),
    [fullName, targetRole, email, phone, githubUrl, summary, skills, experiences, projects, education]
  );

  const handleExportPDF = useCallback(async () => {
    setIsExporting("pdf");
    setExportError("");
    try {
      await downloadBinary("/api/studio/export/pdf", exportData, `${fullName.trim().replace(/\s+/g, "_") || "Resume"}_Resume.pdf`);
    } catch {
      // Client-side fallback if backend export service is unreachable
      const docTitle = `${(fullName || "Resume").replace(/\s+/g, "_")}_Resume`;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${docTitle}</title>
            <meta charset="utf-8">
            <style>
              @page { margin: 15mm; size: auto; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #0f172a; background: #ffffff; line-height: 1.5; font-size: 12px; }
              .header { border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 16px; }
              .name { font-size: 24px; font-weight: bold; color: #1e1b4b; margin: 0; }
              .role { font-size: 13px; font-weight: bold; color: #4f46e5; margin-top: 4px; }
              .contact { font-size: 11px; color: #64748b; margin-top: 6px; }
              .section { margin-bottom: 18px; }
              .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 8px; }
              .content { font-size: 11px; color: #334155; }
              .exp-item { margin-bottom: 10px; }
              .exp-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; color: #0f172a; }
              .skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
              .skill-chip { background: #f1f5f9; color: #1e293b; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 10px; border: 1px solid #e2e8f0; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="name">${fullName || "Your Full Name"}</h1>
              <div class="role">${targetRole || "Target Job Title"}</div>
              <div class="contact">${email || "email@example.com"} • ${phone || "+1 555-0000"}${githubUrl ? ` • ${githubUrl}` : ""}</div>
            </div>
            ${summary ? `<div class="section"><div class="section-title">Professional Summary</div><div class="content">${summary}</div></div>` : ""}
            ${skills.length > 0 ? `<div class="section"><div class="section-title">Technical Competencies</div><div class="skills-list">${skills.map((s) => `<span class="skill-chip">${s}</span>`).join(" ")}</div></div>` : ""}
            ${experiences.length > 0 ? `<div class="section"><div class="section-title">Work Experience</div>${experiences.map((e) => `<div class="exp-item"><div class="exp-header"><span>${e.jobTitle || "Role"} — ${e.company || "Company"}</span><span>${e.startDate} - ${e.endDate}</span></div><div class="content" style="margin-top: 3px;">${e.description}</div></div>`).join("")}</div>` : ""}
            ${projects.length > 0 ? `<div class="section"><div class="section-title">Key Projects</div>${projects.map((p) => `<div class="exp-item"><div class="exp-header"><span>${p.name}${p.technologies ? ` [${p.technologies}]` : ""}</span></div><div class="content" style="margin-top: 3px;">${p.description}</div></div>`).join("")}</div>` : ""}
            ${education.length > 0 ? `<div class="section"><div class="section-title">Education</div>${education.map((ed) => `<div class="exp-item"><div class="exp-header"><span>${ed.degree || "Degree"} — ${ed.school || "School"}</span><span>${ed.year}</span></div></div>`).join("")}</div>` : ""}
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      } else {
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                Simple AI Resume Studio
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-emerald-600">✓ ATS Optimized</span>
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900 mt-1">Automatic Resume Generator</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in your info below or click a role preset to generate a clean, ATS-ready resume instantly.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-700">Layout:</span>
            {(["modern", "classic", "minimal"] as const).map((tmpl) => (
              <button
                key={tmpl}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                  selectedTemplate === tmpl
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tmpl}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">1-Click Presets:</span>
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
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50/50 hover:text-indigo-600"
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Personal Information & Target Role
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Targeted Job Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile Link</label>
                <input
                  type="text"
                  placeholder="e.g. github.com/venkatakomal"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-indigo-700 font-semibold"
                />
              </div>
            </div>

            {/* Summary Input */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Professional Summary</label>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(targetRole)}
                  className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200 hover:bg-indigo-100"
                >
                  AI Polish
                </button>
              </div>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none leading-relaxed"
              />
            </div>

            {/* Skills */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700">Technical & Soft Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  placeholder="e.g. Figma, React, Python..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 border border-slate-200">
                    <span>{s}</span>
                    <button onClick={() => handleRemoveSkill(s)} className="text-slate-400 hover:text-rose-600">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Work Experience</h4>
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
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200"
                >
                  + Add Role
                </button>
              </div>
              {experiences.map((exp) => (
                <div key={exp.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative group">
                  {experiences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setExperiences(experiences.filter((item) => item.id !== exp.id))}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 text-xs font-bold px-1.5 py-0.5"
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
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        setExperiences(experiences.map((item) => (item.id === exp.id ? { ...item, company: e.target.value } : item)))
                      }
                      placeholder="Company Name"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) =>
                      setExperiences(experiences.map((item) => (item.id === exp.id ? { ...item, description: e.target.value } : item)))
                    }
                    placeholder="Bullet point description..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Key Projects */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Key Projects & Portfolio</h4>
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
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200"
                >
                  + Add Project
                </button>
              </div>
              {projects.map((proj) => (
                <div key={proj.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative group">
                  {projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setProjects(projects.filter((item) => item.id !== proj.id))}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 text-xs font-bold px-1.5 py-0.5"
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
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                    />
                    <input
                      type="text"
                      value={proj.technologies}
                      onChange={(e) =>
                        setProjects(projects.map((item) => (item.id === proj.id ? { ...item, technologies: e.target.value } : item)))
                      }
                      placeholder="Technologies (e.g. Figma, React)"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
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
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-indigo-700 outline-none"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) =>
                      setProjects(projects.map((item) => (item.id === proj.id ? { ...item, description: e.target.value } : item)))
                    }
                    placeholder="Project description and key results..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Paper Document Preview & Action Buttons */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Document Preview ({selectedTemplate})</span>
              </div>
              <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                94% ATS Score
              </span>
            </div>

            {/* DYNAMIC TEMPLATE PAPER PREVIEW */}
            {selectedTemplate === "modern" && (
              <div className="bg-white p-6 sm:p-8 rounded-xl border-l-4 border-indigo-600 border border-slate-200 space-y-4 font-sans text-xs shadow-2xs min-h-[420px] transition-all">
                <div className="border-b border-indigo-100 pb-3">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
                    Modern Layout
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{fullName || "Candidate Name"}</h3>
                  <p className="text-xs font-bold text-indigo-600 mt-0.5">{targetRole || "Target Role"}</p>
                  <p className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                    <span>{email}</span>
                    <span>•</span>
                    <BlurredPhone phone={phone} />
                    {githubUrl && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-600 font-semibold">{githubUrl}</span>
                      </>
                    )}
                  </p>
                </div>

                {summary && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-indigo-950 text-[11px] uppercase tracking-wider border-b border-indigo-100 pb-1">Professional Summary</h4>
                    <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">{summary}</p>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-indigo-950 text-[11px] uppercase tracking-wider border-b border-indigo-100 pb-1">Technical Skills</h4>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-100 font-semibold text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {experiences.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-indigo-950 text-[11px] uppercase tracking-wider border-b border-indigo-100 pb-1">Work Experience</h4>
                    {experiences.map((e) => (
                      <div key={e.id} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                          <span>{e.jobTitle} — <span className="text-indigo-600">{e.company}</span></span>
                          <span className="text-[10px] text-slate-400 font-normal">{e.startDate} - {e.endDate}</span>
                        </div>
                        <p className="text-slate-600 text-[10px] leading-relaxed">{e.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {projects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-indigo-950 text-[11px] uppercase tracking-wider border-b border-indigo-100 pb-1">Key Projects</h4>
                    {projects.map((p) => (
                      <div key={p.id} className="space-y-0.5">
                        <div className="flex justify-between items-center font-bold text-slate-800 text-[11px]">
                          <span>{p.name}</span>
                          <div className="flex items-center gap-2 text-[10px]">
                            {p.githubUrl && <span className="text-indigo-600 font-semibold font-mono">{p.githubUrl}</span>}
                            {p.technologies && <span className="text-slate-500 font-medium">[{p.technologies}]</span>}
                          </div>
                        </div>
                        <p className="text-slate-600 text-[10px] leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTemplate === "classic" && (
              <div className="bg-stone-50/60 p-6 sm:p-8 rounded-xl border-2 border-stone-800 space-y-4 font-serif text-xs shadow-2xs min-h-[420px] text-stone-900 transition-all">
                <div className="text-center space-y-1 border-t-2 border-b-2 border-stone-800 py-3">
                  <h3 className="text-xl font-bold font-serif uppercase tracking-widest text-stone-900">{fullName || "Candidate Name"}</h3>
                  <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider">{targetRole || "Target Role"}</p>
                  <p className="text-[10px] text-stone-600 flex justify-center flex-wrap items-center gap-2 pt-1 font-sans">
                    <span>{email}</span>
                    <span>•</span>
                    <BlurredPhone phone={phone} />
                    {githubUrl && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-stone-800">{githubUrl}</span>
                      </>
                    )}
                  </p>
                </div>

                {summary && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-center font-serif text-[11px] uppercase tracking-widest border-b border-stone-400 pb-1 text-stone-900">Professional Summary</h4>
                    <p className="text-stone-800 text-[11px] leading-relaxed text-justify pt-0.5">{summary}</p>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-center font-serif text-[11px] uppercase tracking-widest border-b border-stone-400 pb-1 text-stone-900">Technical Competencies</h4>
                    <p className="text-stone-800 text-[11px] text-center pt-0.5">{skills.join(" • ")}</p>
                  </div>
                )}

                {experiences.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-center font-serif text-[11px] uppercase tracking-widest border-b border-stone-400 pb-1 text-stone-900">Work History</h4>
                    {experiences.map((e) => (
                      <div key={e.id} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-stone-900 text-[11px]">
                          <span>{e.jobTitle}, <em>{e.company}</em></span>
                          <span className="text-[10px] text-stone-600 font-sans">{e.startDate} - {e.endDate}</span>
                        </div>
                        <p className="text-stone-800 text-[10px] leading-relaxed text-justify">{e.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {projects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-center font-serif text-[11px] uppercase tracking-widest border-b border-stone-400 pb-1 text-stone-900">Portfolio Projects</h4>
                    {projects.map((p) => (
                      <div key={p.id} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-stone-900 text-[11px]">
                          <span>{p.name} {p.technologies && <span className="font-sans font-normal text-stone-600">({p.technologies})</span>}</span>
                          {p.githubUrl && <span className="text-[10px] font-mono text-stone-700">{p.githubUrl}</span>}
                        </div>
                        <p className="text-stone-800 text-[10px] leading-relaxed text-justify">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTemplate === "minimal" && (
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 border-t-4 border-t-slate-900 space-y-4 font-sans text-xs shadow-2xs min-h-[420px] text-slate-900 transition-all">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wider">{fullName || "Candidate Name"}</h3>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{targetRole || "Target Role"}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[9px] uppercase font-bold tracking-wider">
                      Minimal
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 flex flex-wrap items-center gap-2">
                    <span>{email}</span>
                    <span>•</span>
                    <BlurredPhone phone={phone} />
                    {githubUrl && (
                      <>
                        <span>•</span>
                        <span className="text-slate-700 font-semibold">{githubUrl}</span>
                      </>
                    )}
                  </p>
                </div>

                {summary && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest border-b border-slate-200 pb-1">Professional Summary</h4>
                    <p className="text-slate-600 text-[10px] leading-relaxed pt-0.5">{summary}</p>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest border-b border-slate-200 pb-1">Technical Skills</h4>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {experiences.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest border-b border-slate-200 pb-1">Work Experience</h4>
                    {experiences.map((e) => (
                      <div key={e.id} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-900 text-[10px]">
                          <span>{e.jobTitle} <span className="text-slate-400 font-normal">|</span> {e.company}</span>
                          <span className="text-[9px] text-slate-400 font-normal">{e.startDate} - {e.endDate}</span>
                        </div>
                        <p className="text-slate-600 text-[10px] leading-relaxed">{e.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {projects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest border-b border-slate-200 pb-1">Key Projects</h4>
                    {projects.map((p) => (
                      <div key={p.id} className="space-y-0.5">
                        <div className="flex justify-between items-center font-bold text-slate-900 text-[10px]">
                          <span>{p.name}</span>
                          <div className="flex items-center gap-2 text-[9px]">
                            {p.githubUrl && <span className="text-slate-700 font-medium">{p.githubUrl}</span>}
                            {p.technologies && <span className="text-slate-400 font-normal">[{p.technologies}]</span>}
                          </div>
                        </div>
                        <p className="text-slate-600 text-[10px] leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Export Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-700">Export Options:</span>
                {exportError && <p className="text-[11px] text-rose-600 mt-1">{exportError}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPDF}
                  disabled={Boolean(isExporting)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <DownloadIcon className="w-4 h-4 text-white" />
                  <span>📄 Download PDF</span>
                </button>
                <button
                  onClick={handleExportDocx}
                  disabled={Boolean(isExporting)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
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
