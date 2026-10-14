"""
Comprehensive AI Career Roadmap Generator & Enterprise Domain Classifier with Structured Course Links.
Classifies 60+ job roles across 11 major tech domains to produce tailored output_schema roadmaps with direct course sources.
"""

from typing import List, Dict, Any, Optional


def classify_target_domain(target_role: str) -> str:
    r = target_role.lower().strip()
    
    if any(k in r for k in ["ml", "machine learning", "ai", "artificial intelligence", "deep learning", "nlp", "computer vision", "generative ai", "llm", "prompt"]):
        return "AI, Machine Learning & Data Science"
    
    if any(k in r for k in ["data engineer", "big data", "data analyst", "bi developer", "business intelligence", "data architect", "analytics engineer", "etl"]):
        return "Data Engineering, Analytics & BI"
        
    if any(k in r for k in ["server", "sysadmin", "system administrator", "infrastructure", "datacenter", "linux admin", "network engineer", "storage engineer"]):
        return "Server, Systems & Infrastructure Engineering"
        
    if any(k in r for k in ["devops", "sre", "site reliability", "cloud", "platform engineer", "aws", "azure", "gcp", "kubernetes", "gitops"]):
        return "DevOps, Cloud & Site Reliability Engineering (SRE)"
        
    if any(k in r for k in ["cyber", "security", "penetration", "hacker", "soc", "info sec", "information security"]):
        return "Cybersecurity & Information Security"
        
    if any(k in r for k in ["frontend", "react", "next.js", "nextjs", "vue", "angular", "ui engineer", "frontend architect"]):
        return "Frontend Engineering & Web Architecture"
        
    if any(k in r for k in ["mobile", "ios", "android", "flutter", "react native", "swift", "kotlin"]):
        return "Mobile Application Development"
        
    if any(k in r for k in ["product manager", "tpm", "scrum", "agile", "project manager", "engineering manager"]):
        return "Product & Project Management"
        
    if any(k in r for k in ["ui/ux", "ux designer", "ui designer", "product designer", "interaction designer", "ux researcher"]):
        return "UI/UX & Product Design"
        
    if any(k in r for k in ["qa", "sdet", "test engineer", "quality assurance", "automation tester", "performance tester"]):
        return "Quality Assurance & SDET Test Automation"
        
    return "Software Engineering & Full-Stack Development"


def generate_ai_career_roadmap_v2(
    target_role: str,
    current_role: str = "CS undergrad / Developer",
    current_skills: List[str] = None,
    experience_level: str = "entry_level",
    hours_per_week: int = 15,
    timeline_months: int = 6,
    constraints: str = "None specified",
    resume_summary: Optional[str] = None
) -> Dict[str, Any]:
    current_skills = current_skills or ["Python", "JavaScript", "Git", "SQL"]
    target_clean = target_role.strip() if target_role else "Senior Software Engineer"
    domain_name = classify_target_domain(target_clean)

    # Readiness score calculation
    readiness_score = 65
    if any(s.lower() in target_clean.lower() for s in current_skills):
        readiness_score += 15
    if experience_level in ["mid_level", "senior"]:
        readiness_score += 10
    readiness_score = min(95, max(45, readiness_score))

    # Tailor content by classified domain
    if domain_name == "AI, Machine Learning & Data Science":
        critical_gaps = [
            "PyTorch / TensorFlow deep learning model training & fine-tuning",
            "MLOps, model serving pipelines (FastAPI, Airflow, MLflow)",
            "Vector databases (Pinecone, Qdrant) and RAG architecture",
            "GPU memory optimization & model quantization (ONNX, TensorRT)"
        ]
        existing_strengths = [s for s in current_skills if s.lower() in ["python", "sql", "git", "math", "pandas", "numpy", "statistics"]] or ["Python", "SQL", "Git"]

        milestones = [
            {
                "order": 1,
                "title": "Mathematical Foundations & Core ML Algorithms",
                "duration_weeks": 4,
                "goal": "Master linear algebra, probability, and scikit-learn machine learning algorithms.",
                "skills_to_learn": [
                    {
                        "skill": "Scikit-Learn & Classical ML Algorithms",
                        "why_it_matters": "Essential baseline for data modeling and evaluation metrics.",
                        "resource_type": "Coursera Course",
                        "course_title": "Coursera: Machine Learning Specialization (by Andrew Ng)",
                        "url": "https://www.coursera.org/specializations/machine-learning-introduction",
                        "priority": "must_have"
                    },
                    {
                        "skill": "Feature Engineering & Data Preprocessing",
                        "why_it_matters": "70% of real-world ML engineering is spent on data cleaning and feature engineering.",
                        "resource_type": "Kaggle Learn Course",
                        "course_title": "Kaggle Learn: Feature Engineering & Pandas Data Preparation",
                        "url": "https://www.kaggle.com/learn/feature-engineering",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "End-to-end Predictive Analytics Repository on GitHub with benchmark notebook.",
                "success_criteria": "Achieve top 20% validation score on Kaggle tabular dataset."
            },
            {
                "order": 2,
                "title": "Deep Learning & Neural Networks with PyTorch",
                "duration_weeks": 6,
                "goal": "Build, train, and debug custom PyTorch neural networks.",
                "skills_to_learn": [
                    {
                        "skill": "PyTorch Framework & Tensor Operations",
                        "why_it_matters": "Industry standard deep learning framework powering modern LLMs and vision AI.",
                        "resource_type": "DeepLearning.AI Course",
                        "course_title": "DeepLearning.AI: Deep Learning Specialization",
                        "url": "https://www.deeplearning.ai/courses/deep-learning-specialization/",
                        "priority": "must_have"
                    },
                    {
                        "skill": "Transformer Architectures & Attention Mechanisms",
                        "why_it_matters": "Core architecture powering LLMs and Generative AI applications.",
                        "resource_type": "Hugging Face Course",
                        "course_title": "Hugging Face: Deep RL & NLP Transformer Course",
                        "url": "https://huggingface.co/learn",
                        "priority": "should_have"
                    }
                ],
                "project_or_proof": "Custom PyTorch Transformer model fine-tuned on custom dataset.",
                "success_criteria": "Train model with zero gradient vanishing/exploding errors logged via Weights & Biases."
            },
            {
                "order": 3,
                "title": "Production MLOps, RAG & Vector Search Deployment",
                "duration_weeks": 6,
                "goal": "Deploy production LLM/RAG microservices with FastAPI and Docker.",
                "skills_to_learn": [
                    {
                        "skill": "RAG Architecture & LangChain / LlamaIndex",
                        "why_it_matters": "Top 2026 AI hiring requirement for connecting LLMs to enterprise databases.",
                        "resource_type": "DeepLearning.AI Course",
                        "course_title": "DeepLearning.AI: Building Applications with Vector Databases & LangChain",
                        "url": "https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/",
                        "priority": "must_have"
                    },
                    {
                        "skill": "MLOps Containerization (FastAPI + Docker)",
                        "why_it_matters": "Bridges raw Jupyter notebooks to production microservices.",
                        "resource_type": "Udacity Nanodegree Course",
                        "course_title": "Udacity: Machine Learning DevOps Engineer Course",
                        "url": "https://www.udacity.com/course/machine-learning-devops-engineer-nanodegree--nd0821",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Production Enterprise Search Assistant API on Render/AWS.",
                "success_criteria": "Sub-250ms query latency with multi-tenant retrieval."
            }
        ]

        certifications = [
            {"name": "AWS Certified Machine Learning - Specialty", "priority": "should_have", "reason": "Validates cloud ML infrastructure and SageMaker skills."},
            {"name": "DeepLearning.AI Deep Learning Specialization", "priority": "must_have", "reason": "Gold standard neural network certification."}
        ]

    elif domain_name == "Server, Systems & Infrastructure Engineering":
        critical_gaps = [
            "Enterprise Linux (RHEL/Ubuntu) administration & systemd tuning",
            "Advanced Bash shell & Python infrastructure scripting",
            "High Availability Clusters, Load Balancing (Nginx/HAProxy), & Disaster Recovery",
            "Server Hardening, Firewalls (iptables/ufw), & Security Patch Management"
        ]
        existing_strengths = [s for s in current_skills if s.lower() in ["linux", "bash", "networking", "python", "git", "shell"]] or ["Linux Command Line", "Networking Basics"]

        milestones = [
            {
                "order": 1,
                "title": "Enterprise Linux System Administration & Networking",
                "duration_weeks": 4,
                "goal": "Master Linux server administration, user permissions, LVM storage, and systemd.",
                "skills_to_learn": [
                    {
                        "skill": "Linux Enterprise Administration (RHEL / Ubuntu Server)",
                        "why_it_matters": "Core foundation for managing production servers and enterprise infrastructure.",
                        "resource_type": "Linux Foundation Course",
                        "course_title": "Linux Foundation: Essentials of Linux System Administration (LFS201)",
                        "url": "https://training.linuxfoundation.org/training/essentials-of-linux-system-administration/",
                        "priority": "must_have"
                    },
                    {
                        "skill": "Network Protocols & Firewall Security (DNS, SSH, UFW, Subnets)",
                        "why_it_matters": "Essential for securing server endpoints and troubleshooting connectivity.",
                        "resource_type": "Coursera Google IT Course",
                        "course_title": "Coursera: Google IT Support Professional Certificate (Bits & Bytes of Networking)",
                        "url": "https://www.coursera.org/specializations/google-it-support",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Automated Linux Server Provisioning & Hardening Script Suite on GitHub.",
                "success_criteria": "Script automatically configures firewall, creates users, and sets up log rotation on a fresh VPS."
            },
            {
                "order": 2,
                "title": "Infrastructure Automation & Configuration Management",
                "duration_weeks": 5,
                "goal": "Automate multi-server deployments using Ansible and Terraform.",
                "skills_to_learn": [
                    {
                        "skill": "Ansible Playbook Automation",
                        "why_it_matters": "Enables push-button server configuration updates across 100+ instances simultaneously.",
                        "resource_type": "Udemy Course",
                        "course_title": "Udemy: Ansible for the Absolute Beginner - Hands-on DevOps",
                        "url": "https://www.udemy.com/course/ansible-for-the-absolute-beginner/",
                        "priority": "must_have"
                    },
                    {
                        "skill": "Terraform Infrastructure as Code",
                        "why_it_matters": "Industry standard tool for declarative cloud & server provisioning.",
                        "resource_type": "HashiCorp Official Course",
                        "course_title": "HashiCorp: Terraform Associate Certification Track & Tutorials",
                        "url": "https://developer.hashicorp.com/terraform/tutorials",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Terraform + Ansible Repository that provisions a high-availability web cluster in one command.",
                "success_criteria": "Zero manual SSH steps needed to spin up load-balanced web servers."
            },
            {
                "order": 3,
                "title": "Server Monitoring, Virtualization & High Availability",
                "duration_weeks": 5,
                "goal": "Implement high-availability clusters monitored with Prometheus & Grafana.",
                "skills_to_learn": [
                    {
                        "skill": "Prometheus & Grafana Telemetry",
                        "why_it_matters": "Provides real-time server health dashboards and alert triggers.",
                        "resource_type": "Pluralsight Course",
                        "course_title": "Pluralsight: Monitoring Systems with Prometheus & Grafana",
                        "url": "https://prometheus.io/docs/introduction/overview/",
                        "priority": "must_have"
                    },
                    {
                        "skill": "HAProxy & Nginx Load Balancing",
                        "why_it_matters": "Ensures zero-downtime traffic distribution and SSL termination.",
                        "resource_type": "Nginx Official Course",
                        "course_title": "Nginx Training: Fundamentals of Load Balancing & High Availability",
                        "url": "https://nginx.org/en/docs/",
                        "priority": "should_have"
                    }
                ],
                "project_or_proof": "High-Availability Server Cluster with automated failover & Grafana alerts.",
                "success_criteria": "Cluster automatically routes traffic seamlessly during simulated server shutdown tests."
            }
        ]

        certifications = [
            {"name": "Red Hat Certified System Administrator (RHCSA)", "priority": "must_have", "reason": "Gold standard hands-on certification proving Linux server management capabilities."},
            {"name": "CompTIA Linux+ / Network+", "priority": "should_have", "reason": "Validates enterprise networking and Linux troubleshooting skills."}
        ]

    elif domain_name == "DevOps, Cloud & Site Reliability Engineering (SRE)":
        critical_gaps = [
            "Kubernetes Cluster Orchestration & Helm Chart Management",
            "Terraform Infrastructure as Code (IaC)",
            "CI/CD Pipeline Automation (GitHub Actions / GitLab CI)",
            "Observability, SLO/SLA Monitoring, and Chaos Engineering"
        ]
        existing_strengths = [s for s in current_skills if s.lower() in ["docker", "kubernetes", "aws", "linux", "terraform", "git", "python"]] or ["Docker", "Git", "Linux"]

        milestones = [
            {
                "order": 1,
                "title": "Containerization & CI/CD Pipeline Automation",
                "duration_weeks": 4,
                "goal": "Master Docker microservices containerization and continuous integration.",
                "skills_to_learn": [
                    {
                        "skill": "Docker & Multi-Stage Builds",
                        "why_it_matters": "Creates lightweight, reproducible application containers.",
                        "resource_type": "FreeCodeCamp Course",
                        "course_title": "FreeCodeCamp: Docker & Containerization Full Course",
                        "url": "https://www.freecodecamp.org/news/tag/docker/",
                        "priority": "must_have"
                    },
                    {
                        "skill": "GitHub Actions CI/CD Pipelines",
                        "why_it_matters": "Automates testing, building, and deployment on every code push.",
                        "resource_type": "GitHub Skills Course",
                        "course_title": "GitHub Skills: Build CI/CD Workflows with GitHub Actions",
                        "url": "https://docs.github.com/en/actions",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Automated Multi-Service CI/CD Pipeline on GitHub with Docker registry deployment.",
                "success_criteria": "Every pull request runs automated tests, builds container, and deploys to staging."
            },
            {
                "order": 2,
                "title": "Kubernetes Orchestration & Helm Deployment",
                "duration_weeks": 6,
                "goal": "Deploy and manage microservices on production Kubernetes clusters.",
                "skills_to_learn": [
                    {
                        "skill": "Kubernetes Administration (CKA Curriculum)",
                        "why_it_matters": "De-facto container orchestration standard for enterprise platforms.",
                        "resource_type": "KodeKloud / Udemy Course",
                        "course_title": "KodeKloud: Certified Kubernetes Administrator (CKA) with Labs",
                        "url": "https://www.udemy.com/course/certified-kubernetes-administrator-with-handson-labs/",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Production Kubernetes Cluster with Horizontal Pod Autoscaling (HPA).",
                "success_criteria": "Cluster automatically scales pods during load tests without dropping requests."
            },
            {
                "order": 3,
                "title": "Cloud Architecture & Observability (SRE)",
                "duration_weeks": 5,
                "goal": "Implement 99.99% availability architectures and Grafana monitoring.",
                "skills_to_learn": [
                    {
                        "skill": "AWS / Cloud Infrastructure Architecture",
                        "why_it_matters": "Designing fault-tolerant, multi-region cloud infrastructures.",
                        "resource_type": "Coursera AWS Course",
                        "course_title": "Coursera: AWS Cloud Technical Essentials (by Amazon Web Services)",
                        "url": "https://www.coursera.org/learn/aws-cloud-technical-essentials",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Multi-Region Cloud Infrastructure managed via Terraform.",
                "success_criteria": "99.99% availability verified via automated synthetic health checks."
            }
        ]

        certifications = [
            {"name": "Certified Kubernetes Administrator (CKA)", "priority": "must_have", "reason": "Top hands-on certification for Kubernetes engineers."},
            {"name": "AWS Certified Solutions Architect – Associate", "priority": "should_have", "reason": "Industry standard cloud architectural certification."}
        ]

    elif domain_name == "Cybersecurity & Information Security":
        critical_gaps = [
            "Penetration testing methodologies & OWASP Top 10 vulnerabilities",
            "Network traffic analysis (Wireshark) & SIEM log monitoring (Splunk)",
            "Security hardening, IAM policies, and cryptography fundamentals",
            "Incident response & threat hunting procedures"
        ]
        existing_strengths = [s for s in current_skills if s.lower() in ["linux", "networking", "python", "bash", "security", "git"]] or ["Linux", "Networking Basics"]

        milestones = [
            {
                "order": 1,
                "title": "Security Fundamentals, Networking & Vulnerability Scanning",
                "duration_weeks": 4,
                "goal": "Master network protocols, port scanning (Nmap), and vulnerability analysis.",
                "skills_to_learn": [
                    {
                        "skill": "Network Security & Packet Analysis (Wireshark, Nmap)",
                        "why_it_matters": "Essential for identifying malicious traffic and open attack vectors.",
                        "resource_type": "TryHackMe Learning Path",
                        "course_title": "TryHackMe: Complete Intro to Cyber Security & Network Security",
                        "url": "https://tryhackme.com/path/outline/introtosecurity",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Network Vulnerability Audit & Remediation Report on GitHub.",
                "success_criteria": "Identify and document 100% of open ports and security misconfigurations in sandbox network."
            },
            {
                "order": 2,
                "title": "Application Security & Ethical Hacking",
                "duration_weeks": 6,
                "goal": "Perform web application penetration testing against OWASP Top 10 vulnerabilities.",
                "skills_to_learn": [
                    {
                        "skill": "Web Application Penetration Testing (Burp Suite)",
                        "why_it_matters": "Protects APIs and web applications against XSS, SQLi, and Auth bypass attacks.",
                        "resource_type": "PortSwigger Academy",
                        "course_title": "PortSwigger: Web Security Academy Full Practitioner Track",
                        "url": "https://portswigger.net/web-security",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Complete Penetration Test Writeup on Vulnerable Machine (HackTheBox / PortSwigger).",
                "success_criteria": "Successfully exploit and patch OWASP Top 10 vulnerabilities in lab environment."
            },
            {
                "order": 3,
                "title": "SIEM Log Operations & Incident Response",
                "duration_weeks": 5,
                "goal": "Build SOC log monitoring dashboards with Splunk / Elastic Security.",
                "skills_to_learn": [
                    {
                        "skill": "SIEM Operations & Threat Detection (Splunk)",
                        "why_it_matters": "Enables real-time detection of intruder activities across corporate networks.",
                        "resource_type": "Splunk Official Course",
                        "course_title": "Splunk Education: Splunk Fundamentals 1 & Threat Detection",
                        "url": "https://workables.splunk.com/",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "SOC Incident Response Playbook & SIEM Monitoring Dashboard.",
                "success_criteria": "Automated alert triggers fire within 10 seconds of simulated brute-force login attempts."
            }
        ]

        certifications = [
            {"name": "CompTIA Security+ / EJPT", "priority": "must_have", "reason": "Foundational security certification recognized worldwide."},
            {"name": "Certified Ethical Hacker (CEH) / OSCP", "priority": "should_have", "reason": "Gold standard practical penetration testing certification."}
        ]

    elif domain_name == "UI/UX & Product Design":
        critical_gaps = [
            "Figma component systems, auto-layout & interactive prototyping",
            "User research, wireframing, and usability testing methodologies",
            "Design system tokenization & handoff to frontend engineers",
            "Information architecture & accessibility (WCAG 2.1 guidelines)"
        ]
        existing_strengths = [s for s in current_skills if s.lower() in ["figma", "html", "css", "ui", "ux", "design", "photoshop"]] or ["Figma Basics", "Visual Design"]

        milestones = [
            {
                "order": 1,
                "title": "User Research & Wireframing Fundamentals",
                "duration_weeks": 4,
                "goal": "Conduct user interviews, map user journeys, and create low-fidelity wireframes.",
                "skills_to_learn": [
                    {
                        "skill": "User Research & Information Architecture",
                        "why_it_matters": "Ensures design decisions solve actual user pain points rather than aesthetic assumptions.",
                        "resource_type": "Coursera Google Certificate",
                        "course_title": "Coursera: Google UX Design Professional Certificate",
                        "url": "https://www.coursera.org/professional-certificates/google-ux-design",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Complete User Research Case Study & Wireframe Deck on Behance/Figma.",
                "success_criteria": "Validate wireframe flow with 5 usability testing interviews."
            },
            {
                "order": 2,
                "title": "Advanced Figma Prototyping & Design Systems",
                "duration_weeks": 5,
                "goal": "Build scalable Figma design systems with auto-layout and interactive variants.",
                "skills_to_learn": [
                    {
                        "skill": "Figma Design System Architecture",
                        "why_it_matters": "Enables rapid, consistent product design across multi-platform product teams.",
                        "resource_type": "Figma Official Course",
                        "course_title": "Figma Official: Learn Design Systems & Component Auto-Layout",
                        "url": "https://www.figma.com/resources/learn-design/",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Comprehensive UI Design System & Interactive High-Fidelity Prototype.",
                "success_criteria": "Design system includes tokens, dark mode variants, and responsive components."
            },
            {
                "order": 3,
                "title": "Developer Handoff & Accessibility (WCAG)",
                "duration_weeks": 4,
                "goal": "Prepare production-ready design handoffs adhering to WCAG 2.1 standards.",
                "skills_to_learn": [
                    {
                        "skill": "Accessibility (WCAG 2.1) & Handoff Specs",
                        "why_it_matters": "Ensures designs are accessible to all users and seamless for engineers to code.",
                        "resource_type": "W3C Web Accessibility Course",
                        "course_title": "W3C: Digital Accessibility Foundations (WCAG 2.1 Standards)",
                        "url": "https://www.w3.org/WAI/standards-guidelines/wcag/",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Published Product Design Portfolio Case Study with Developer Specs.",
                "success_criteria": "Passes 100% color contrast and screen reader accessibility checks."
            }
        ]

        certifications = [
            {"name": "Google UX Design Professional Certificate", "priority": "must_have", "reason": "Industry standard credential proving end-to-end design process competency."},
            {"name": "Nielsen Norman Group UX Certification", "priority": "should_have", "reason": "Prestige UX certification validating research and interaction design standards."}
        ]

    else:  # Default Software Engineering & Full-Stack
        critical_gaps = [
            "Production System Architecture & Scalable Microservices Design",
            "Advanced TypeScript & Framework Architecture (React/Next.js/Node)",
            "Database Schema Design, Indexing, and Query Tuning (PostgreSQL/Redis)",
            "CI/CD Pipeline Automation & Cloud Deployment (Docker, AWS/Vercel)"
        ]
        existing_strengths = [s for s in current_skills if s.lower() in ["javascript", "typescript", "react", "node", "python", "git", "html", "css", "sql"]] or ["JavaScript", "Git", "HTML/CSS"]

        milestones = [
            {
                "order": 1,
                "title": "Modern Full-Stack Architecture (TypeScript + Next.js)",
                "duration_weeks": 4,
                "goal": "Master type-safe web applications with Next.js and TailwindCSS.",
                "skills_to_learn": [
                    {
                        "skill": "TypeScript Advanced Types & Generics",
                        "why_it_matters": "Prevents runtime errors and enables team collaboration in large production codebases.",
                        "resource_type": "ExecuteProgram Course",
                        "course_title": "ExecuteProgram: TypeScript Deep Dive & Advanced Generics",
                        "url": "https://www.executeprogram.com/courses/typescript",
                        "priority": "must_have"
                    },
                    {
                        "skill": "Next.js Full-Stack Architecture",
                        "why_it_matters": "Combines server rendering (SSR), API routes, and client components for speed.",
                        "resource_type": "Next.js Official Course",
                        "course_title": "Next.js Official: Full-Stack App Router & Server Components Track",
                        "url": "https://nextjs.org/learn",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Full-stack SaaS application built with Next.js, TailwindCSS, and server state management.",
                "success_criteria": "Passes 100% TypeScript compilation (`tsc --noEmit`) with Lighthouse score > 90."
            },
            {
                "order": 2,
                "title": "Scalable Backend APIs, Databases & Authentication",
                "duration_weeks": 5,
                "goal": "Build secure RESTful microservices backed by PostgreSQL & Redis caching.",
                "skills_to_learn": [
                    {
                        "skill": "PostgreSQL Schema Design & ORMs",
                        "why_it_matters": "Relational data modeling, ACID compliance, and database migrations.",
                        "resource_type": "Use The Index Luke Course",
                        "course_title": "Use The Index, Luke!: SQL Query Performance & Database Indexing Course",
                        "url": "https://use-the-index-luke.com/",
                        "priority": "must_have"
                    },
                    {
                        "skill": "Secure Authentication (JWT / OAuth2 / CSRF)",
                        "why_it_matters": "Essential for protecting user privacy and preventing security vulnerabilities.",
                        "resource_type": "OWASP Security Course",
                        "course_title": "OWASP: Web Application Security & API Defense Guide",
                        "url": "https://owasp.org/www-project-top-ten/",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Production API service featuring JWT auth, rate limiting, and PostgreSQL database connection.",
                "success_criteria": "Handles 1,000 requests/sec with Redis caching layer."
            },
            {
                "order": 3,
                "title": "Cloud Infrastructure, CI/CD & Testing Automation",
                "duration_weeks": 5,
                "goal": "Implement continuous deployment (CI/CD) pipelines to cloud hosting.",
                "skills_to_learn": [
                    {
                        "skill": "CI/CD Automation (GitHub Actions + Docker)",
                        "why_it_matters": "Automates code testing, building, and zero-downtime deployment.",
                        "resource_type": "GitHub Skills Course",
                        "course_title": "GitHub Skills: Continuous Integration with GitHub Actions",
                        "url": "https://docs.github.com/en/actions",
                        "priority": "must_have"
                    }
                ],
                "project_or_proof": "Live Deployed Application on Vercel/Render with automated GitHub Actions testing workflow.",
                "success_criteria": "Every `git push` automatically runs tests, builds container, and deploys to production."
            }
        ]

        certifications = [
            {"name": "AWS Certified Developer – Associate", "priority": "should_have", "reason": "Validates ability to build and deploy cloud applications using AWS."},
            {"name": "Meta Full-Stack Developer Certificate", "priority": "nice_to_have", "reason": "Structured resume credential proving full-stack development competency."}
        ]

    resume_tips = [
        f"Highlight transferable skills in {', '.join(existing_strengths[:2])} prominently in your top Summary section.",
        f"Reframe previous project descriptions using quantifiable STAR metrics (e.g. 'Improved throughput by 30% for {target_clean} features').",
        f"Group technical competencies into clean categories matching keywords from {target_clean} job descriptions."
    ]

    risk_factors = [
        "Inconsistent weekly practice (spending less than target hours per week on hands-on building)",
        "Focusing too heavily on passive video watching rather than shipping concrete portfolio proof projects",
        "Neglecting system design and interview prep until the final month"
    ]

    next_immediate_action = f"Start Milestone 1 this week: Set up your development workspace and spend 2 hours building the initial portfolio project repo for {target_clean}."

    return {
        "target_role": target_clean,
        "domain_name": domain_name,
        "readiness_score": readiness_score,
        "estimated_timeline_months": max(3, timeline_months),
        "gap_analysis": {
            "critical_gaps": critical_gaps,
            "existing_strengths": existing_strengths
        },
        "milestones": milestones,
        "certifications_recommended": certifications,
        "resume_positioning_tips": resume_tips,
        "risk_factors": risk_factors,
        "next_immediate_action": next_immediate_action
    }
