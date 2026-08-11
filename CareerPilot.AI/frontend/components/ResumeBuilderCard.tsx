import React, { useState } from "react";
import { BlurredPhone } from "./BlurredPhone";
import { SparkleIcon, DownloadIcon } from "./icons";
import { enhanceBulletPoint, downloadBinary } from "../lib/api";

interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string;
}

export const ResumeBuilderCard: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<"modern" | "classic" | "minimal">("modern");

  // Form & Questionnaire State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [targetRole, setTargetRole] = useState("UI/UX Designer");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>(["Figma", "User Research", "Wireframing", "Design Systems"]);
  const [skillInput, setSkillInput] = useState("");

  // Questionnaire States
  const [hasExperience, setHasExperience] = useState<boolean>(true);
  const [experienceNotes, setExperienceNotes] = useState<string>("");
  const [hasProjects, setHasProjects] = useState<boolean>(true);
  const [projectNotes, setProjectNotes] = useState<string>("");

  // AI Loading States
  const [generatingSummary, setGeneratingSummary] = useState<boolean>(false);
  const [enhancingExpId, setEnhancingExpId] = useState<string | null>(null);

  const [experiences, setExperiences] = useState<WorkExperience[]>([
    {
      id: "1",
      company: "Apex Design Studios",
      role: "Senior UI/UX Designer",
      startDate: "2022",
      endDate: "Present",
      description: "Spearheaded end-to-end user experience redesign for flagship SaaS products; increased user satisfaction by 35% while establishing a unified Figma design system.",
    },
  ]);

  const [projectsList, setProjectsList] = useState<ProjectItem[]>([
    {
      id: "proj-1",
      name: "Interactive SaaS Dashboard Redesign",
      description: "Designed responsive user interfaces and conducted 20+ usability testing sessions, reducing user onboarding drop-off rates by 28%.",
      technologies: "Figma, User Research, Wireframing, React",
    },
  ]);

  const [educationList, setEducationList] = useState<Education[]>([
    {
      id: "1",
      school: "State University",
      degree: "B.S. in Computer Science & Design",
      year: "2022",
    },
  ]);

  // AI Feature 1: Generate AI Summary Matched to Target Job Title
  const handleGenerateAISummary = () => {
    setGeneratingSummary(true);
    setTimeout(() => {
      const roleLower = (targetRole || "").toLowerCase();
      const roleText = targetRole.trim() || "Software Professional";

      let matchedSummary = "";

      if (roleLower.includes("ui/ux") || roleLower.includes("ux") || roleLower.includes("ui designer") || roleLower.includes("product design") || roleLower.includes("figma")) {
        const topSkills = skills.length > 0 ? skills.slice(0, 4).join(", ") : "Figma, User Research, Wireframing, Design Systems";
        matchedSummary = `Creative and user-centered ${roleText} with extensive experience in ${topSkills}. Proven track record of conducting in-depth user research, architecting intuitive design systems, and crafting high-fidelity interactive prototypes. Adept at translating complex product requirements into engaging, seamless, and WCAG-accessible digital user experiences.`;
      }
      else if (roleLower.includes("server") || roleLower.includes("sysadmin") || roleLower.includes("infrastructure") || roleLower.includes("linux")) {
        const topSkills = skills.length > 0 ? skills.slice(0, 4).join(", ") : "Linux Enterprise Administration, Ansible, Terraform, Server Monitoring";
        matchedSummary = `Results-driven ${roleText} specializing in enterprise infrastructure, high-availability server clustering, and system security. Hands-on expertise in ${topSkills}. Proven track record of maintaining 99.99% system uptime, automating server provisioning, and deploying real-time Prometheus & Grafana monitoring dashboards.`;
      }
      else if (roleLower.includes("devops") || roleLower.includes("sre") || roleLower.includes("cloud") || roleLower.includes("kubernetes")) {
        const topSkills = skills.length > 0 ? skills.slice(0, 4).join(", ") : "Kubernetes, Docker, Terraform, CI/CD Pipelines";
        matchedSummary = `Performance-focused ${roleText} with hands-on expertise in container orchestration, cloud infrastructure, and CI/CD pipeline automation. Experienced in ${topSkills}. Proven track record of reducing deployment lead times, implementing zero-downtime releases, and building resilient cloud architectures.`;
      }
      else if (roleLower.includes("cyber") || roleLower.includes("security") || roleLower.includes("penetration") || roleLower.includes("soc")) {
        const topSkills = skills.length > 0 ? skills.slice(0, 4).join(", ") : "Network Security, Wireshark, Burp Suite, SIEM / Splunk";
        matchedSummary = `Vigilant ${roleText} dedicated to protecting enterprise networks, auditing web application vulnerabilities, and managing threat mitigation. Deep technical proficiency in ${topSkills}. Proven track record of assessing OWASP Top 10 security risks, executing penetration tests, and orchestrating rapid incident response playbooks.`;
      }
      else if (roleLower.includes("ml") || roleLower.includes("machine learning") || roleLower.includes("ai") || roleLower.includes("data science") || roleLower.includes("deep learning")) {
        const topSkills = skills.length > 0 ? skills.slice(0, 4).join(", ") : "Python, PyTorch, Scikit-Learn, MLOps, RAG Architecture";
        matchedSummary = `Innovative ${roleText} with extensive experience developing production machine learning models, neural networks, and scalable AI microservices. Strong foundation in ${topSkills}. Proven track record of fine-tuning LLMs, building Retrieval-Augmented Generation (RAG) pipelines, and deploying sub-200ms model inference APIs.`;
      }
      else if (roleLower.includes("qa") || roleLower.includes("sdet") || roleLower.includes("test")) {
        const topSkills = skills.length > 0 ? skills.slice(0, 4).join(", ") : "Selenium, Cypress, Test Automation, CI/CD Integration";
        matchedSummary = `Quality-driven ${roleText} specializing in designing robust automated test frameworks, regression test suites, and continuous testing pipelines. Hands-on skills in ${topSkills}. Proven track record of eliminating critical production bugs, accelerating release velocity, and enforcing strict software quality standards.`;
      }
      else if (roleLower.includes("frontend") || roleLower.includes("react") || roleLower.includes("next")) {
        const topSkills = skills.length > 0 ? skills.slice(0, 4).join(", ") : "TypeScript, React, Next.js, TailwindCSS";
        matchedSummary = `Detail-oriented ${roleText} with extensive hands-on experience building pixel-perfect, responsive web applications in ${topSkills}. Proven track record of optimizing Core Web Vitals, engineering reusable component systems, and delivering high-performance user interfaces.`;
      }
      else {
        const topSkills = skills.length > 0 ? skills.slice(0, 4).join(", ") : "TypeScript, React, Node.js, Python, SQL";
        matchedSummary = `Results-driven ${roleText} with extensive hands-on experience in ${topSkills}. Proven track record of designing high-performance systems, building scalable RESTful APIs, and leading Agile development sprints. Adept at translating complex product requirements into robust, high-quality software solutions.`;
      }

      setSummary(matchedSummary);
      setGeneratingSummary(false);
    }, 500);
  };

  // AI Feature 2: Enhance Experience Bullet with AI API
  const handleEnhanceExperience = async (id: string, currentText: string) => {
    if (!currentText.trim()) return;
    setEnhancingExpId(id);
    const roleLower = (targetRole || "").toLowerCase();
    
    let fallbackBullet = `Spearheaded end-to-end development for ${targetRole || 'engineering'} initiatives; boosted system throughput by 35% and reduced latency by implementing ${skills[0] || 'modern'} architectural best practices.`;
    if (roleLower.includes("ui/ux") || roleLower.includes("ux") || roleLower.includes("design")) {
      fallbackBullet = `Spearheaded end-to-end user experience redesign for ${targetRole || 'UI/UX'} products; increased user satisfaction and engagement by 35% while streamlining design system handoff using Figma prototypes.`;
    } else if (roleLower.includes("server") || roleLower.includes("sysadmin") || roleLower.includes("infrastructure")) {
      fallbackBullet = `Automated Linux server infrastructure provisioning and cluster monitoring for ${targetRole || 'Server Manager'} operations; maintained 99.99% system uptime and reduced manual setup time by 40%.`;
    }

    try {
      const response = await enhanceBulletPoint(currentText);
      if (response && response.enhanced) {
        handleUpdateExperience(id, "description", response.enhanced);
      } else {
        handleUpdateExperience(id, "description", fallbackBullet);
      }
    } catch {
      handleUpdateExperience(id, "description", fallbackBullet);
    } finally {
      setEnhancingExpId(null);
    }
  };

  // AI Feature 3: Dynamic Skill Recommendations based on Target Job Title
  const getAISkillSuggestions = () => {
    const role = targetRole.toLowerCase();
    if (role.includes("ui/ux") || role.includes("ux") || role.includes("ui designer") || role.includes("product design") || role.includes("figma")) {
      return ["Figma", "User Research", "Wireframing", "Interactive Prototyping", "Design Systems", "Usability Testing", "WCAG Accessibility"];
    }
    if (role.includes("server") || role.includes("sysadmin") || role.includes("infrastructure") || role.includes("linux")) {
      return ["Linux (RHEL/Ubuntu)", "Ansible", "Terraform", "Prometheus", "Grafana", "HAProxy", "Nginx", "Shell Scripting"];
    }
    if (role.includes("devops") || role.includes("sre") || role.includes("cloud") || role.includes("kubernetes")) {
      return ["Kubernetes", "Docker", "Terraform", "AWS", "GitHub Actions", "Helm", "Prometheus", "CI/CD"];
    }
    if (role.includes("cyber") || role.includes("security") || role.includes("penetration") || role.includes("soc")) {
      return ["Network Security", "Wireshark", "Burp Suite", "SIEM / Splunk", "OWASP Top 10", "Vulnerability Scanning", "Incident Response"];
    }
    if (role.includes("ml") || role.includes("machine learning") || role.includes("ai") || role.includes("data science") || role.includes("deep learning")) {
      return ["Python", "PyTorch", "Scikit-Learn", "RAG Architecture", "LangChain", "Vector Databases", "MLOps", "SQL"];
    }
    if (role.includes("qa") || role.includes("sdet") || role.includes("test")) {
      return ["Selenium", "Cypress", "Jest", "Playwright", "Test Automation", "CI/CD Integration", "API Testing"];
    }
    if (role.includes("frontend") || role.includes("react") || role.includes("next")) {
      return ["Next.js", "TypeScript", "TailwindCSS", "Redux Toolkit", "GraphQL", "Web Vitals", "Jest"];
    }
    return ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "REST APIs", "System Design"];
  };

  // AI Feature 4: 1-Click Automatic Resume Generator
  const [isAutoGenerating, setIsAutoGenerating] = useState<boolean>(false);

  const handleAutoGenerateFullResume = (selectedRoleName?: string) => {
    setIsAutoGenerating(true);
    const roleToUse = selectedRoleName || targetRole || "UI/UX Designer";
    setTargetRole(roleToUse);

    if (!fullName) setFullName("Venkata Komal");
    if (!email) setEmail("venkata@example.com");
    if (!phone) setPhone("+1 (555) 234-5678");

    setTimeout(() => {
      const roleLower = roleToUse.toLowerCase();

      let autoSummary = "";
      let autoSkills: string[] = [];
      let autoExps: WorkExperience[] = [];

      if (roleLower.includes("ui/ux") || roleLower.includes("ux") || roleLower.includes("ui designer") || roleLower.includes("product design") || roleLower.includes("figma")) {
        autoSkills = ["Figma", "User Research", "Wireframing", "Interactive Prototyping", "Design Systems", "Usability Testing", "WCAG Accessibility"];
        autoSummary = `Creative and user-centered ${roleToUse} with 5+ years of experience crafting intuitive digital products in Figma, User Research, Wireframing, Design Systems. Proven track record of conducting usability studies, streamlining developer handoffs, and increasing WCAG-compliant product adoption by 38%.`;
        autoExps = [
          {
            id: "exp-1",
            company: "Apex Design Studios",
            role: "Senior UI/UX Designer",
            startDate: "2022",
            endDate: "Present",
            description: "Spearheaded end-to-end user experience redesign for flagship SaaS products; increased user satisfaction and daily active usage by 35% while establishing a unified Figma component design system.",
          },
          {
            id: "exp-2",
            company: "Digital Product Labs",
            role: "UI/UX Designer",
            startDate: "2020",
            endDate: "2022",
            description: "Conducted 30+ qualitative user research interviews and usability sessions; designed responsive wireframes and interactive prototypes that reduced checkout drop-off rates by 24%.",
          },
        ];
      }
      else if (roleLower.includes("server") || roleLower.includes("sysadmin") || roleLower.includes("infrastructure") || roleLower.includes("linux")) {
        autoSkills = ["Linux (RHEL/Ubuntu)", "Ansible", "Terraform", "Prometheus", "Grafana", "HAProxy", "Nginx", "Shell Scripting"];
        autoSummary = `Results-driven ${roleToUse} specializing in enterprise Linux infrastructure, high-availability server clustering, and automated system security. Proven track record of maintaining 99.99% system uptime, automating server provisioning with Ansible, and deploying Grafana monitoring dashboards.`;
        autoExps = [
          {
            id: "exp-1",
            company: "Enterprise Cloud Systems",
            role: "Server Infrastructure Manager",
            startDate: "2021",
            endDate: "Present",
            description: "Automated server cluster provisioning across 150+ Linux nodes using Ansible and Terraform; maintained 99.99% system SLA uptime and reduced manual setup time by 50%.",
          },
          {
            id: "exp-2",
            company: "Global Data Networks",
            role: "Systems Administrator",
            startDate: "2019",
            endDate: "2021",
            description: "Managed HAProxy load balancers and real-time Prometheus telemetry dashboards; reduced incident MTTR by 45% and mitigated critical security vulnerabilities.",
          },
        ];
      }
      else if (roleLower.includes("devops") || roleLower.includes("sre") || roleLower.includes("cloud") || roleLower.includes("kubernetes")) {
        autoSkills = ["Kubernetes", "Docker", "Terraform", "AWS", "GitHub Actions", "Helm", "Prometheus", "CI/CD"];
        autoSummary = `Performance-focused ${roleToUse} with hands-on expertise in container orchestration, cloud infrastructure, and automated CI/CD pipelines. Proven track record of reducing deployment lead times by 60%, deploying Kubernetes clusters, and cutting cloud infrastructure spend by $35k annually.`;
        autoExps = [
          {
            id: "exp-1",
            company: "CloudScale Tech",
            role: "DevOps Engineer / SRE",
            startDate: "2022",
            endDate: "Present",
            description: "Engineered multi-region AWS Kubernetes clusters and zero-downtime CI/CD GitHub Actions pipelines; accelerated release frequency by 3x while reducing infrastructure costs by 28%.",
          },
        ];
      }
      else if (roleLower.includes("ml") || roleLower.includes("machine learning") || roleLower.includes("ai") || roleLower.includes("data science")) {
        autoSkills = ["Python", "PyTorch", "Scikit-Learn", "RAG Architecture", "LangChain", "Vector Databases", "MLOps", "SQL"];
        autoSummary = `Innovative ${roleToUse} with extensive experience developing production machine learning models, neural networks, and scalable AI microservices. Proven track record of fine-tuning LLMs, building Retrieval-Augmented Generation (RAG) pipelines, and deploying sub-200ms inference APIs.`;
        autoExps = [
          {
            id: "exp-1",
            company: "Neural AI Innovations",
            role: "Machine Learning Engineer",
            startDate: "2022",
            endDate: "Present",
            description: "Architected production RAG pipelines using LangChain and PyTorch; fine-tuned domain LLMs and deployed sub-200ms model inference microservices serving 1M+ daily queries.",
          },
        ];
      }
      else {
        autoSkills = ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker", "REST APIs", "System Design"];
        autoSummary = `Results-driven ${roleToUse} with extensive hands-on experience building high-performance web applications and scalable RESTful microservices. Proven track record of leading Agile sprints, optimizing API response times by 40%, and delivering robust software solutions.`;
        autoExps = [
          {
            id: "exp-1",
            company: "Nexus Software Labs",
            role: "Senior Full Stack Engineer",
            startDate: "2021",
            endDate: "Present",
            description: "Led end-to-end development of microservice architecture using Next.js and PostgreSQL; improved system throughput by 40% and reduced API latency by 60ms.",
          },
        ];
      }

      let autoProjects: ProjectItem[] = [];

      if (hasProjects || projectNotes.trim()) {
        const customProj = projectNotes.trim() || "E-Commerce SaaS Redesign";
        autoProjects = [
          {
            id: "proj-1",
            name: customProj.split("\n")[0] || "Interactive SaaS Product Platform",
            description: `End-to-end design and development for ${roleToUse} solution; conducted usability testing and optimized core user flows, achieving a 32% increase in conversion rates.`,
            technologies: autoSkills.slice(0, 4).join(", "),
          },
        ];
      }

      setSummary(autoSummary);
      setSkills(autoSkills);
      if (hasExperience) setExperiences(autoExps);
      if (autoProjects.length > 0) setProjectsList(autoProjects);
      setIsAutoGenerating(false);
      setActiveStep(4); // Seamlessly jump to Live Preview & Export
    }, 600);
  };

  const addSkill = (newSkill?: string) => {
    const skillToAdd = newSkill || skillInput;
    if (skillToAdd.trim() && !skills.includes(skillToAdd.trim())) {
      setSkills([...skills, skillToAdd.trim()]);
      if (!newSkill) setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const handleUpdateExperience = (id: string, field: keyof WorkExperience, value: string) => {
    setExperiences(
      experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  // Live AI ATS Resume Score Meter
  const calculateATSScore = () => {
    let score = 20; // Base score
    if (fullName && email && phone) score += 20;
    if (summary.length > 50) score += 20;
    if (skills.length >= 3) score += 20;
    if (experiences.some((e) => e.description.length > 30)) score += 20;
    return Math.min(100, score);
  };

  // --- DOWNLOAD HANDLER 1: PDF FORMAT ---
  const handleDownloadPDF = async () => {
    const filename = `${(fullName || "Resume").trim().replace(/\s+/g, "_")}_Resume.pdf`;
    const exportData = {
      full_name: fullName,
      target_role: targetRole,
      email,
      phone,
      summary,
      skills,
      experiences,
      projects: projectsList,
      education: educationList,
    };

    try {
      await downloadBinary("/api/studio/export/pdf", exportData, filename);
    } catch {
      // Fallback: Client-side printable PDF document
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
              <div class="contact">${email || "email@example.com"} • ${phone || "+1 555-0000"}</div>
            </div>
            ${summary ? `<div class="section"><div class="section-title">Professional Summary</div><div class="content">${summary}</div></div>` : ""}
            ${skills.length > 0 ? `<div class="section"><div class="section-title">Technical Competencies</div><div class="skills-list">${skills.map((s) => `<span class="skill-chip">${s}</span>`).join(" ")}</div></div>` : ""}
            ${experiences.length > 0 ? `<div class="section"><div class="section-title">Work Experience</div>${experiences.map((e) => `<div class="exp-item"><div class="exp-header"><span>${e.role || "Role"} — ${e.company || "Company"}</span><span>${e.startDate} - ${e.endDate}</span></div><div class="content" style="margin-top: 3px;">${e.description}</div></div>`).join("")}</div>` : ""}
            ${projectsList.length > 0 ? `<div class="section"><div class="section-title">Key Projects</div>${projectsList.map((p) => `<div class="exp-item"><div class="exp-header"><span>${p.name}${p.technologies ? ` [${p.technologies}]` : ""}</span></div><div class="content" style="margin-top: 3px;">${p.description}</div></div>`).join("")}</div>` : ""}
            ${educationList.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationList.map((ed) => `<div class="exp-item"><div class="exp-header"><span>${ed.degree || "Degree"} — ${ed.school || "School"}</span><span>${ed.year}</span></div></div>`).join("")}</div>` : ""}
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
    }
  };

  // --- DOWNLOAD HANDLER 2: WORD FORMAT (.docx / .doc) ---
  const handleDownloadWord = async () => {
    const filename = `${(fullName || "Resume").trim().replace(/\s+/g, "_")}_Resume.docx`;
    const exportData = {
      full_name: fullName,
      target_role: targetRole,
      email,
      phone,
      summary,
      skills,
      experiences,
      projects: projectsList,
      education: educationList,
    };

    try {
      await downloadBinary("/api/studio/export/docx", exportData, filename);
    } catch {
      // Fallback: Client-side Word (.doc) file
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
            <div class="contact">Email: ${email || "email@example.com"} | Phone: ${phone || "+1 555-0000"}</div>

            ${summary ? `<h2>Professional Summary</h2><p>${summary}</p>` : ""}
            ${skills.length > 0 ? `<h2>Skills</h2><p>${skills.join(" • ")}</p>` : ""}
            ${experiences.length > 0 ? `<h2>Work Experience</h2>${experiences.map((e) => `<div style="margin-bottom: 10pt;"><div class="job-header">${e.role || "Role"} at ${e.company || "Company"} (${e.startDate} - ${e.endDate})</div><p style="margin-top: 2pt;">${e.description}</p></div>`).join("")}` : ""}
            ${projectsList.length > 0 ? `<h2>Key Projects</h2>${projectsList.map((p) => `<div style="margin-bottom: 10pt;"><div class="job-header">${p.name}${p.technologies ? ` (${p.technologies})` : ""}</div><p style="margin-top: 2pt;">${p.description}</p></div>`).join("")}` : ""}
            ${educationList.length > 0 ? `<h2>Education</h2>${educationList.map((ed) => `<p><strong>${ed.degree || "Degree"}</strong> — ${ed.school || "School"} (${ed.year})</p>`).join("")}` : ""}
          </body>
        </html>
      `;

      const blob = new Blob(["\ufeff" + wordHTML], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(fullName || "Resume").replace(/\s+/g, "_")}_Builder.doc`;
      a.click();
    }
  };

  const atsScore = calculateATSScore();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8 animate-fade-in">
      {/* AUTOMATIC RESUME GENERATOR HERO BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <SparkleIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>1-Click Automatic AI Resume Generator</span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Automatic Resume Generator
            </h3>
            <p className="text-xs text-indigo-200/80 max-w-xl">
              Select your target job title or click any role preset below to automatically generate a complete, ATS-friendly resume with tailored summary, skills, and STAR-metric work history.
            </p>
          </div>

          <button
            onClick={() => handleAutoGenerateFullResume()}
            disabled={isAutoGenerating}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 border border-indigo-400/30 disabled:opacity-50 self-start md:self-auto shrink-0"
          >
            {isAutoGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Full Resume...</span>
              </>
            ) : (
              <>
                <SparkleIcon className="w-4 h-4 text-white" />
                <span>⚡ Auto-Generate Full Resume</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Role Quick-Fill Chips */}
        <div className="pt-2 border-t border-indigo-800/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mr-1">Quick-Fill Presets:</span>
          {[
            { label: "🎨 UI/UX Designer", role: "UI/UX Designer" },
            { label: "💻 Senior Full Stack Engineer", role: "Senior Full Stack Engineer" },
            { label: "🚀 DevOps / Cloud SRE", role: "DevOps Engineer / SRE" },
            { label: "🤖 AI / ML Engineer", role: "Machine Learning Engineer" },
            { label: "🛡️ Cybersecurity Analyst", role: "Cybersecurity Analyst" },
            { label: "🖥️ Server Manager", role: "Server Infrastructure Manager" },
            { label: "📊 Data Scientist", role: "Data Scientist" },
          ].map((preset) => (
            <button
              key={preset.role}
              onClick={() => handleAutoGenerateFullResume(preset.role)}
              disabled={isAutoGenerating}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                targetRole.toLowerCase() === preset.role.toLowerCase()
                  ? "bg-indigo-500 text-white border-indigo-400 font-bold shadow-2xs"
                  : "bg-white/10 text-indigo-100 hover:bg-white/20 border-white/10"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              AI-Powered Resume Studio
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-emerald-600">✓ ATS Validated</span>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 mt-1.5">Automatic & Guided Resume Editor</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generated resume fields are instantly editable below. Fine-tune your details or export immediately as PDF or Word (.doc).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveStep(4)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <span>📜 View Previous Resume Result</span>
          </button>
        </div>
      </div>

      {/* Step Wizard & AI Score Indicator */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
          {[
            { num: 1, title: "1. Header & Summary" },
            { num: 2, title: "2. AI Work Experience" },
            { num: 3, title: "3. Skills & Education" },
            { num: 4, title: "4. Preview & Export" },
          ].map((step) => (
            <button
              key={step.num}
              onClick={() => setActiveStep(step.num)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                activeStep === step.num
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : activeStep > step.num
                  ? "bg-white border-slate-200 text-slate-800"
                  : "bg-white/60 border-slate-200 text-slate-400 hover:bg-white"
              }`}
            >
              {step.title}
            </button>
          ))}
        </div>

        {/* Live AI ATS Readiness Meter */}
        <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">AI ATS Score</span>
            <span className="text-xs font-extrabold text-indigo-700">{atsScore}% Ready</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-indigo-100 flex items-center justify-center font-bold text-xs bg-indigo-50 text-indigo-700">
            {atsScore}%
          </div>
        </div>
      </div>

      {/* STEP 1: USER INFO & QUESTIONNAIRE */}
      {activeStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">1. Personal Information & Target Career Goal</h3>
            <p className="text-xs text-slate-500 mt-0.5">Enter your details and answer the two quick questions below to automatically generate an ATS-friendly resume.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Venkata Komal"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Targeted Job Title *</label>
              <input
                type="text"
                placeholder="e.g. UI/UX Designer / Senior Full Stack Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                placeholder="venkata@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                placeholder="+1 (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* QUESTION 1: WORK EXPERIENCE */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800">
                1. Do you have prior work experience?
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHasExperience(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    hasExperience ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  ✓ Yes, I have experience
                </button>
                <button
                  type="button"
                  onClick={() => setHasExperience(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    !hasExperience ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  No / Fresh Graduate
                </button>
              </div>
            </div>

            {hasExperience && (
              <div>
                <textarea
                  rows={2}
                  placeholder="Optional: Briefly mention your previous job roles, companies, or quick notes (e.g., Lead UI/UX designer at Apex Studio)..."
                  value={experienceNotes}
                  onChange={(e) => setExperienceNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none"
                />
              </div>
            )}
          </div>

          {/* QUESTION 2: PROJECTS */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800">
                2. Have you completed any key projects or portfolio work?
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHasProjects(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    hasProjects ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  ✓ Yes, I have projects
                </button>
                <button
                  type="button"
                  onClick={() => setHasProjects(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    !hasProjects ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {hasProjects && (
              <div>
                <textarea
                  rows={2}
                  placeholder="Optional: Briefly list your project names or technologies used (e.g., Interactive E-Commerce Dashboard in Figma & React)..."
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none"
                />
              </div>
            )}
          </div>

          {/* PROFESSIONAL SUMMARY PREVIEW & AI GENERATE BUTTON */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Professional Summary</label>
              <button
                type="button"
                onClick={handleGenerateAISummary}
                disabled={generatingSummary}
                className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 border border-indigo-200"
              >
                {generatingSummary ? (
                  <>
                    <div className="w-3 h-3 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <SparkleIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>✨ Re-Generate AI Summary</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Your summary will be generated automatically below..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none leading-relaxed"
            />
          </div>

          {/* MAIN AI RESUME GENERATOR ACTION BUTTON */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleAutoGenerateFullResume()}
              disabled={isAutoGenerating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 border border-indigo-500/30 disabled:opacity-50"
            >
              {isAutoGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing ATS-Friendly Resume...</span>
                </>
              ) : (
                <>
                  <SparkleIcon className="w-4.5 h-4.5 text-white" />
                  <span>✨ Generate Complete ATS-Friendly Resume with AI →</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: WORK EXPERIENCE & AI BULLET ENHANCER */}
      {activeStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Work History & AI Polish</h3>
                <p className="text-xs text-slate-500 mt-0.5">Add positions and click &apos;AI Enhance Bullet&apos; to rewrite entries with measurable STAR-impact results.</p>
            </div>
            <button
              onClick={handleAddExperience}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-200"
            >
              + Add Experience
            </button>
          </div>

          <div className="space-y-5">
            {experiences.map((exp, idx) => (
              <div key={exp.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Position #{idx + 1}</span>
                  {experiences.length > 1 && (
                    <button
                      onClick={() => setExperiences(experiences.filter((e) => e.id !== exp.id))}
                      className="text-xs text-rose-600 font-semibold hover:underline"
                    >
                      Remove Position
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Job Title (e.g. Senior Developer)"
                    value={exp.role}
                    onChange={(e) => handleUpdateExperience(exp.id, "role", e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Company Name (e.g. Nexus Tech)"
                    value={exp.company}
                    onChange={(e) => handleUpdateExperience(exp.id, "company", e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Start Date (e.g. Jan 2022)"
                    value={exp.startDate}
                    onChange={(e) => handleUpdateExperience(exp.id, "startDate", e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="End Date (e.g. Present)"
                    value={exp.endDate}
                    onChange={(e) => handleUpdateExperience(exp.id, "endDate", e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Responsibilities & Key Achievements</label>
                    <button
                      type="button"
                      onClick={() => handleEnhanceExperience(exp.id, exp.description)}
                      disabled={enhancingExpId === exp.id || !exp.description.trim()}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 shadow-2xs"
                    >
                      {enhancingExpId === exp.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Enhancing with AI...</span>
                        </>
                      ) : (
                        <>
                          <SparkleIcon className="w-3 h-3" />
                          <span>✨ AI Enhance Bullet</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Describe your work (e.g. Developed API endpoints using Node.js)... or click AI Enhance Bullet to optimize."
                    value={exp.description}
                    onChange={(e) => handleUpdateExperience(exp.id, "description", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: SKILLS, AI SUGGESTIONS & EDUCATION */}
      {activeStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Skills & Qualifications</h3>
          
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700">Add Technical & Soft Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Python, AWS, Team Leadership..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
              <button
                onClick={() => addSkill()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
              >
                Add Skill
              </button>
            </div>

            {/* AI Skill Recommender Chips */}
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                <SparkleIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>💡 AI Skill Suggestions for &quot;{targetRole || 'Software Professional'}&quot;:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {getAISkillSuggestions().map((rec) => (
                  <button
                    key={rec}
                    onClick={() => addSkill(rec)}
                    disabled={skills.includes(rec)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      skills.includes(rec)
                        ? "bg-indigo-100 text-indigo-800 border-indigo-200 opacity-60 cursor-default"
                        : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white shadow-2xs"
                    }`}
                  >
                    + {rec}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Skill Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 border border-slate-200"
                >
                  <span>{s}</span>
                  <button
                    onClick={() => removeSkill(s)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Education History</h4>
            {educationList.map((ed) => (
              <div key={ed.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <input
                  type="text"
                  placeholder="Degree / Diploma"
                  value={ed.degree}
                  onChange={(e) =>
                    setEducationList(
                      educationList.map((item) => (item.id === ed.id ? { ...item, degree: e.target.value } : item))
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="University / Institute"
                  value={ed.school}
                  onChange={(e) =>
                    setEducationList(
                      educationList.map((item) => (item.id === ed.id ? { ...item, school: e.target.value } : item))
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Graduation Year"
                  value={ed.year}
                  onChange={(e) =>
                    setEducationList(
                      educationList.map((item) => (item.id === ed.id ? { ...item, year: e.target.value } : item))
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: TEMPLATE, PREVIEW & MULTI-FORMAT EXPORT */}
      {activeStep === 4 && (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Select Layout Template</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: "modern", name: "Modern Clean", desc: "Sleek ATS-optimised layout with clear hierarchy." },
              { id: "classic", name: "Classic Corporate", desc: "Traditional format ideal for finance, law & corporate roles." },
              { id: "minimal", name: "Minimal Tech", desc: "High-density clean format popular in engineering." },
            ].map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id as "modern" | "classic" | "minimal")}
                className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                  selectedTemplate === tmpl.id
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{tmpl.name}</span>
                  {selectedTemplate === tmpl.id && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500">{tmpl.desc}</p>
              </button>
            ))}
          </div>

          {/* Live Document Preview Box */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Document Preview</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ✓ {atsScore}% ATS Validated
              </span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 font-sans text-xs shadow-2xs">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-base font-bold text-slate-900">{fullName || "Your Full Name"}</h4>
                <p className="text-xs font-semibold text-indigo-600">{targetRole || "Target Job Title"}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <span>{email || "email@example.com"}</span>
                  <span>•</span>
                  <BlurredPhone phone={phone || "+1 555-0000"} />
                </p>
              </div>

              {summary && (
                <div>
                  <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Summary</h5>
                  <p className="text-slate-600 leading-relaxed text-[11px] mt-0.5">{summary}</p>
                </div>
              )}

              {skills.length > 0 && (
                <div>
                  <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Skills</h5>
                  <p className="text-slate-600 text-[11px] mt-0.5">{skills.join(" • ")}</p>
                </div>
              )}

              {experiences.length > 0 && (
                <div>
                  <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Experience</h5>
                  {experiences.map((e) => (
                    <div key={e.id} className="mt-1">
                      <div className="flex justify-between font-semibold text-slate-800 text-[11px]">
                        <span>{e.role || "Job Title"} — {e.company || "Company"}</span>
                        <span className="text-[10px] text-slate-400">{e.startDate} - {e.endDate}</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">{e.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {projectsList.length > 0 && (
                <div>
                  <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Key Projects</h5>
                  {projectsList.map((p) => (
                    <div key={p.id} className="mt-1">
                      <div className="flex justify-between font-semibold text-slate-800 text-[11px]">
                        <span>{p.name}</span>
                        {p.technologies && <span className="text-[10px] text-indigo-600 font-medium">[{p.technologies}]</span>}
                      </div>
                      <p className="text-slate-500 text-[10px]">{p.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export Format Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
              <span className="text-xs font-bold text-slate-700">Export Options:</span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                  title="Export formatted resume as PDF"
                >
                  <DownloadIcon className="w-4 h-4 text-white" />
                  <span>📄 Download as PDF</span>
                </button>

                <button
                  onClick={handleDownloadWord}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                  title="Export editable resume as Microsoft Word (.doc)"
                >
                  <DownloadIcon className="w-4 h-4 text-white" />
                  <span>📝 Download as Word (.doc)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM STEP NAVIGATION FOOTER */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
        <button
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="px-5 py-2.5 rounded-full bg-slate-100/90 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-xs font-bold disabled:opacity-40 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-2xs flex items-center gap-1.5"
        >
          <span>← Previous</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Step {activeStep} of 4</span>
          <button
            onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
            disabled={activeStep === 4}
            className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Next Step</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderCard;
