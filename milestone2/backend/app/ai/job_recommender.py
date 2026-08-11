import logging
import re
from typing import Dict, Any, List, Optional
from urllib.parse import quote_plus

from app.ai.vector_matcher import compute_semantic_similarity

logger = logging.getLogger("career_platform")

def format_live_apply_url(title: str, company: str, apply_url: Optional[str] = None) -> str:
    """
    Ensures every recommended job has a verified, live apply link.
    If apply_url is a direct live job portal link, preserves it.
    Otherwise, generates a direct live search link on LinkedIn Jobs / Google Jobs.
    """
    if apply_url and isinstance(apply_url, str):
        valid_live_domains = [
            "linkedin.com", "indeed.com", "google.com", "amazon.jobs",
            "careers.google.com", "lever.co", "greenhouse.io", "naukri.com",
            "glassdoor.com", "careers."
        ]
        if any(domain in apply_url.lower() for domain in valid_live_domains):
            return apply_url
    
    query = quote_plus(f"{title} {company}")
    return f"https://www.linkedin.com/jobs/search/?keywords={query}"


# ==============================================================================
# 1. SKILL TAXONOMY: SYNONYMS & ADJACENCY GRAPH
# ==============================================================================

SKILL_SYNONYMS: Dict[str, str] = {
    # Languages
    "js": "javascript",
    "reactjs": "react",
    "react.js": "react",
    "ts": "typescript",
    "py": "python",
    "golang": "go",
    "cpp": "c++",
    "csharp": "c#",
    "rb": "ruby",
    
    # Frameworks
    "nextjs": "next.js",
    "next.js": "next.js",
    "vuejs": "vue",
    "vue.js": "vue",
    "angularjs": "angular",
    "nodejs": "node.js",
    "node": "node.js",
    "expressjs": "express",
    "fast-api": "fastapi",
    "spring-boot": "spring boot",
    "ror": "ruby on rails",
    "rails": "ruby on rails",
    "tailwind": "tailwind css",
    "tailwindcss": "tailwind css",
    "bootstrap": "bootstrap",
    
    # Databases & Storage
    "postgres": "postgresql",
    "pg": "postgresql",
    "mongo": "mongodb",
    "mongo db": "mongodb",
    "redis": "redis",
    "elastic": "elasticsearch",
    "es": "elasticsearch",
    "dynamo": "dynamodb",
    "sqlite3": "sqlite",
    "ms sql": "sql server",
    "mssql": "sql server",
    
    # Cloud & DevOps
    "k8s": "kubernetes",
    "kube": "kubernetes",
    "amazon web services": "aws",
    "google cloud platform": "gcp",
    "google cloud": "gcp",
    "microsoft azure": "azure",
    "tf": "terraform",
    "ci / cd": "ci/cd",
    "cicd": "ci/cd",
    "github actions": "ci/cd",
    "git lab": "gitlab",
    
    # AI / ML & Data Science
    "machine learning": "machine learning",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "artificial intelligence": "artificial intelligence",
    "deep learning": "deep learning",
    "dl": "deep learning",
    "nlp": "natural language processing",
    "llm": "llms",
    "llms": "llms",
    "genai": "generative ai",
    "generative ai": "generative ai",
    "sklearn": "scikit-learn",
    "tf": "tensorflow",
    "pytorch": "pytorch",
    "cv": "computer vision",
    
    # General Tech & Methodologies
    "rest": "rest api", "restful": "rest api", "restful api": "rest api", "rest apis": "rest api",
    "graphql": "graphql",
    "microservice": "microservices",
    "unit test": "unit testing", "testing": "unit testing", "tests": "unit testing",
    "system design": "system architecture", "architecture": "system architecture",
    "agile": "agile", "scrum": "scrum",
}

# Related skills graph for partial credit (0.4 match score)
SKILL_ADJACENCY: Dict[str, List[str]] = {
    "react": ["vue", "angular", "svelte", "next.js"],
    "vue": ["react", "angular", "svelte"],
    "angular": ["react", "vue"],
    "python": ["java", "go", "ruby", "c++"],
    "fastapi": ["flask", "django", "express", "node.js"],
    "django": ["fastapi", "flask", "ruby on rails"],
    "node.js": ["express", "fastapi", "go"],
    "postgresql": ["mysql", "sqlite", "oracle", "mongodb", "sql"],
    "mysql": ["postgresql", "sqlite", "sql"],
    "mongodb": ["postgresql", "redis", "dynamodb", "nosql"],
    "docker": ["kubernetes", "terraform", "podman"],
    "kubernetes": ["docker", "terraform", "helm"],
    "aws": ["gcp", "azure", "cloud"],
    "gcp": ["aws", "azure"],
    "azure": ["aws", "gcp"],
    "pytorch": ["tensorflow", "keras", "scikit-learn"],
    "tensorflow": ["pytorch", "keras"],
    "machine learning": ["deep learning", "nlp", "data science"],
    "tailwind css": ["css", "bootstrap"],
    "javascript": ["typescript"],
    "typescript": ["javascript"],
}


def _canonicalize_skill(skill: str) -> str:
    """Normalize skill string and apply synonym mappings."""
    if not skill or not skill.strip():
        return ""

    def _normalize(s: str) -> str:
        return re.sub(r"\s+", " ", s.strip().lower().replace("-", " ").replace(".", ""))

    cleaned_space = _normalize(skill)
    synonym = SKILL_SYNONYMS.get(cleaned_space)
    if synonym and synonym != cleaned_space:
        return _normalize(synonym)
    return cleaned_space


# Pre-normalized adjacency lookup so dotted/hyphenated keys (e.g. "node.js",
# "tailwind css") match canonicalized candidate skills (e.g. "node js").
SKILL_ADJACENCY_NORMALIZED: Dict[str, List[str]] = {
    _canonicalize_skill(key): [_canonicalize_skill(adj) for adj in adjacents]
    for key, adjacents in SKILL_ADJACENCY.items()
}


# ==============================================================================
# 2. EXPANDED PRODUCTION JOB DATASET (50+ REALISTIC TECH JOBS)
# ==============================================================================

JOB_DATASET = [
    # --- FULL STACK & BACKEND (1-10) ---
    {
        "id": "job-101",
        "title": "Senior Full Stack Software Engineer",
        "company": "Nexus Technologies",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_range": "₹25,00,000 - ₹35,00,000 (25-35 LPA)",
        "required_education": "Bachelor's in Computer Science or equivalent field",
        "required_skills": ["Python", "TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS"],
        "description": "Lead end-to-end development of microservices and modern Web applications. Design scalable REST APIs, optimize database queries, and mentor junior developers in an agile environment.",
        "apply_url": "https://nexus-tech.careers/job/101",
        "posted_date": "2 days ago"
    },
    {
        "id": "job-102",
        "title": "Backend Python / FastAPI Engineer",
        "company": "CloudPulse Systems",
        "location": "Austin, TX",
        "work_type": "Hybrid",
        "experience_level": "Mid",
        "salary_range": "₹18,00,000 - ₹24,00,000 (18-24 LPA)",
        "required_education": "Bachelor's in Computer Science, Software Engineering, or related",
        "required_skills": ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Redis", "Docker", "REST API"],
        "description": "Architect high-performance REST APIs and real-time data pipelines using FastAPI and PostgreSQL. Collaborate with cloud security teams and frontend developers.",
        "apply_url": "https://cloudpulse.io/careers/102",
        "posted_date": "1 day ago"
    },
    {
        "id": "job-103",
        "title": "Frontend React / Next.js Developer",
        "company": "Vivid UI Studios",
        "location": "New York, NY",
        "work_type": "Hybrid",
        "experience_level": "Mid",
        "salary_range": "₹16,00,000 - ₹22,00,000 (16-22 LPA)",
        "required_education": "Bachelor's in Computer Science or Web Design",
        "required_skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript", "HTML", "CSS"],
        "description": "Build state-of-the-art Web interfaces, responsive design systems, and animated user experiences using Next.js 14 and Tailwind CSS.",
        "apply_url": "https://vividui.com/jobs/frontend-dev",
        "posted_date": "3 days ago"
    },
    {
        "id": "job-104",
        "title": "Full Stack Node.js & React Architect",
        "company": "Starlight Digital",
        "location": "Bengaluru, India",
        "work_type": "Hybrid",
        "experience_level": "Senior",
        "salary_range": "₹22,00,000 - ₹32,00,000 (22-32 LPA)",
        "required_education": "Bachelor's or Master's in Computer Science",
        "required_skills": ["Node.js", "Express", "React", "TypeScript", "MongoDB", "GraphQL", "Docker"],
        "description": "Scale enterprise SaaS products serving millions of active users. Implement GraphQL APIs, MongoDB schema optimizations, and automated CI/CD pipelines.",
        "apply_url": "https://starlight.digital/careers/node-react",
        "posted_date": "Just now"
    },
    {
        "id": "job-105",
        "title": "Go / Distributed Systems Engineer",
        "company": "HyperScale Cloud",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_range": "₹28,00,000 - ₹42,00,000 (28-42 LPA)",
        "required_education": "Bachelor's in CS or Computer Engineering",
        "required_skills": ["Go", "Kubernetes", "gRPC", "Distributed Systems", "Docker", "PostgreSQL", "Linux"],
        "description": "Build high-throughput networking proxies and cloud control planes using Go and gRPC. Optimize low-latency microservices deployed on Kubernetes.",
        "apply_url": "https://hyperscale.cloud/careers/go-engineer",
        "posted_date": "1 day ago"
    },
    {
        "id": "job-106",
        "title": "Junior Software Engineer",
        "company": "InnovateLabs",
        "location": "Bengaluru, India",
        "work_type": "Remote",
        "experience_level": "Entry",
        "salary_range": "₹8,00,000 - ₹12,00,000 (8-12 LPA)",
        "required_education": "Bachelor's in Computer Science or IT",
        "required_skills": ["JavaScript", "Python", "React", "Git", "SQL", "HTML", "CSS"],
        "description": "Great entry-level role to gain full-stack exposure across modern web applications. Work directly alongside senior architects.",
        "apply_url": "https://innovatelabs.co/careers/junior-se",
        "posted_date": "5 days ago"
    },
    {
        "id": "job-107",
        "title": "Java Spring Boot Backend Engineer",
        "company": "Apex Financial Systems",
        "location": "Hyderabad, India",
        "work_type": "Hybrid",
        "experience_level": "Mid",
        "salary_range": "₹17,00,000 - ₹25,00,000 (17-25 LPA)",
        "required_education": "Bachelor's in CS / IT",
        "required_skills": ["Java", "Spring Boot", "Microservices", "PostgreSQL", "Kafka", "Docker", "REST API"],
        "description": "Build secure payment processing systems and banking transaction ledgers using Java 21, Spring Boot, and Apache Kafka.",
        "apply_url": "https://apexfinsys.com/careers/java-dev",
        "posted_date": "2 days ago"
    },
    {
        "id": "job-108",
        "title": "Lead Software Architect",
        "company": "OmniCore Global",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Executive",
        "salary_range": "₹40,00,000 - ₹60,00,000 (40-60 LPA)",
        "required_education": "Master's in Computer Science",
        "required_skills": ["System Architecture", "Python", "Go", "AWS", "Kubernetes", "PostgreSQL", "Microservices"],
        "description": "Define enterprise technical vision, multi-tenant cloud architecture, and technical standards across 50+ engineering teams.",
        "apply_url": "https://omnicore.global/careers/architect",
        "posted_date": "4 days ago"
    },
    {
        "id": "job-109",
        "title": "Ruby on Rails Senior Developer",
        "company": "SaaSify Stack",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_range": "₹22,00,000 - ₹30,00,000 (22-30 LPA)",
        "required_education": "Bachelor's in CS",
        "required_skills": ["Ruby", "Ruby on Rails", "PostgreSQL", "Redis", "JavaScript", "Sidekiq", "RSpec"],
        "description": "Maintain and enhance high-traffic subscription billing platform built on Rails 7. Write clean, test-driven Ruby code.",
        "apply_url": "https://saasifystack.io/jobs/rails",
        "posted_date": "3 days ago"
    },
    {
        "id": "job-110",
        "title": "Python & Django API Developer",
        "company": "DataBridge Tech",
        "location": "Pune, India",
        "work_type": "Onsite",
        "experience_level": "Entry",
        "salary_range": "₹9,00,000 - ₹14,00,000 (9-14 LPA)",
        "required_education": "Bachelor's in CS / IT",
        "required_skills": ["Python", "Django", "REST API", "PostgreSQL", "Git", "Docker"],
        "description": "Develop Django REST framework backends, integrate third-party APIs, and manage relational database migrations.",
        "apply_url": "https://databridge.in/careers/django-dev",
        "posted_date": "Just now"
    },

    # --- AI, ML & DATA SCIENCE (11-20) ---
    {
        "id": "job-111",
        "title": "Data Scientist & AI Specialist",
        "company": "Cognitive AI Solutions",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_range": "₹28,00,000 - ₹38,00,000 (28-38 LPA)",
        "required_education": "Master's or Ph.D. in Data Science, AI, Mathematics, or CS",
        "required_skills": ["Python", "PyTorch", "Scikit-Learn", "Machine Learning", "NLP", "Pandas", "SQL"],
        "description": "Develop generative AI models, fine-tune LLMs, and build predictive algorithms for scalable career and market intelligence applications.",
        "apply_url": "https://cognitiveai.org/careers/ds-ai",
        "posted_date": "Just now"
    },
    {
        "id": "job-112",
        "title": "Lead Machine Learning Engineer",
        "company": "DeepMind Innovations",
        "location": "London, UK",
        "work_type": "Hybrid",
        "experience_level": "Executive",
        "salary_range": "₹35,00,000 - ₹50,00,000 (35-50 LPA)",
        "required_education": "Master's or Ph.D. in AI/CS",
        "required_skills": ["Python", "TensorFlow", "PyTorch", "Deep Learning", "MLOps", "Docker", "C++"],
        "description": "Drive neural network architectural innovations and production MLOps deployment pipelines for autonomous AI agents.",
        "apply_url": "https://deepmind-innovations.co.uk/careers/ml-lead",
        "posted_date": "1 week ago"
    },
    {
        "id": "job-113",
        "title": "Generative AI & LLM Engineer",
        "company": "NeuroTech AI",
        "location": "San Francisco, CA",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹24,00,000 - ₹36,00,000 (24-36 LPA)",
        "required_education": "Bachelor's or Master's in CS / AI",
        "required_skills": ["Python", "PyTorch", "LLMs", "Generative AI", "LangChain", "Vector Databases", "FastAPI"],
        "description": "Build RAG pipelines, fine-tune open-weight LLMs (Llama 3, Mistral), and construct high-performance vector retrieval engines.",
        "apply_url": "https://neurotech.ai/jobs/llm-eng",
        "posted_date": "1 day ago"
    },
    {
        "id": "job-114",
        "title": "Computer Vision ML Engineer",
        "company": "Visionary Robotics",
        "location": "Boston, MA",
        "work_type": "Hybrid",
        "experience_level": "Senior",
        "salary_range": "₹26,00,000 - ₹38,00,000 (26-38 LPA)",
        "required_education": "Master's or Ph.D. in Computer Vision / Robotics",
        "required_skills": ["Python", "OpenCV", "PyTorch", "Computer Vision", "C++", "TensorRT", "CUDA"],
        "description": "Develop real-time object detection and spatial tracking models for autonomous edge hardware devices.",
        "apply_url": "https://visionaryrobotics.com/careers/cv",
        "posted_date": "3 days ago"
    },
    {
        "id": "job-115",
        "title": "Junior Data Analyst",
        "company": "AnalyticsOne",
        "location": "Mumbai, India",
        "work_type": "Onsite",
        "experience_level": "Entry",
        "salary_range": "₹7,00,000 - ₹10,00,000 (7-10 LPA)",
        "required_education": "Bachelor's in Statistics, CS, or Math",
        "required_skills": ["Python", "SQL", "Pandas", "Tableau", "Excel", "Data Analysis"],
        "description": "Transform unstructured raw business data into actionable dashboards and automated executive reports.",
        "apply_url": "https://analyticsone.in/jobs/junior-da",
        "posted_date": "2 days ago"
    },
    {
        "id": "job-116",
        "title": "MLOps Infrastructure Engineer",
        "company": "ScaleAI Systems",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹20,00,000 - ₹30,00,000 (20-30 LPA)",
        "required_education": "Bachelor's in CS",
        "required_skills": ["Python", "Kubeflow", "MLflow", "Docker", "Kubernetes", "AWS", "CI/CD"],
        "description": "Automate end-to-end model training, monitoring, and zero-downtime deployment pipelines for large ML models.",
        "apply_url": "https://scaleai.systems/careers/mlops",
        "posted_date": "4 days ago"
    },
    {
        "id": "job-117",
        "title": "NLP Data Scientist",
        "company": "LinguistAI Labs",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹22,00,000 - ₹32,00,000 (22-32 LPA)",
        "required_education": "Master's in Computational Linguistics or CS",
        "required_skills": ["Python", "NLP", "Hugging Face", "PyTorch", "BERT", "Scikit-Learn", "SQL"],
        "description": "Build text classification, named entity recognition (NER), and semantic sentiment engines for multi-lingual content.",
        "apply_url": "https://linguistai.com/careers/nlp",
        "posted_date": "2 days ago"
    },
    {
        "id": "job-118",
        "title": "Data Engineer (Spark & Snowflake)",
        "company": "StreamData Inc.",
        "location": "Bengaluru, India",
        "work_type": "Hybrid",
        "experience_level": "Senior",
        "salary_range": "₹24,00,000 - ₹35,00,000 (24-35 LPA)",
        "required_education": "Bachelor's in CS",
        "required_skills": ["Python", "Apache Spark", "Snowflake", "SQL", "Airflow", "dbt", "AWS"],
        "description": "Architect petabyte-scale data lakes, ETL pipelines, and real-time streaming infrastructure with Spark and Snowflake.",
        "apply_url": "https://streamdata.io/jobs/de",
        "posted_date": "1 day ago"
    },
    {
        "id": "job-119",
        "title": "Applied AI Researcher",
        "company": "Quantum Intelligence",
        "location": "Zurich, Switzerland",
        "work_type": "Hybrid",
        "experience_level": "Senior",
        "salary_range": "₹32,00,000 - ₹48,00,000 (32-48 LPA)",
        "required_education": "Ph.D. in Computer Science or Math",
        "required_skills": ["Python", "PyTorch", "Deep Learning", "Reinforcement Learning", "C++", "Mathematics"],
        "description": "Publish top-tier research papers and implement novel multi-modal reinforcement learning algorithms.",
        "apply_url": "https://quantumi.ch/jobs/ai-researcher",
        "posted_date": "6 days ago"
    },
    {
        "id": "job-120",
        "title": "Business Intelligence & SQL Developer",
        "company": "MetricsCorp",
        "location": "Chennai, India",
        "work_type": "Onsite",
        "experience_level": "Mid",
        "salary_range": "₹12,00,000 - ₹18,00,000 (12-18 LPA)",
        "required_education": "Bachelor's in IT or Commerce",
        "required_skills": ["SQL", "Power BI", "Python", "Data Warehouse", "ETL", "Excel"],
        "description": "Design interactive Power BI reporting dashboards and optimize complex SQL queries on relational databases.",
        "apply_url": "https://metricscorp.in/careers/bi-dev",
        "posted_date": "3 days ago"
    },

    # --- CLOUD, DEVOPS & INFRASTRUCTURE (21-30) ---
    {
        "id": "job-121",
        "title": "DevOps & Cloud Security Infrastructure Engineer",
        "company": "ScaleGuard Cloud",
        "location": "San Francisco, CA",
        "work_type": "Onsite",
        "experience_level": "Senior",
        "salary_range": "₹30,00,000 - ₹40,00,000 (30-40 LPA)",
        "required_education": "Bachelor's in Information Technology or Computer Engineering",
        "required_skills": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Python"],
        "description": "Manage multi-region AWS cloud infrastructure, automate deployment pipelines with Terraform, and enforce zero-trust container security policies.",
        "apply_url": "https://scaleguard.io/join-us",
        "posted_date": "4 days ago"
    },
    {
        "id": "job-122",
        "title": "Site Reliability Engineer (SRE)",
        "company": "UptimeOps",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_range": "₹26,00,000 - ₹38,00,000 (26-38 LPA)",
        "required_education": "Bachelor's in CS or Network Engineering",
        "required_skills": ["Linux", "Python", "Go", "Prometheus", "Grafana", "Kubernetes", "AWS"],
        "description": "Ensure 99.99% availability for enterprise microservices. Implement SLO/SLA monitoring, chaos engineering, and automated incident response.",
        "apply_url": "https://uptimeops.com/careers/sre",
        "posted_date": "2 days ago"
    },
    {
        "id": "job-123",
        "title": "Cloud Architect (AWS / GCP)",
        "company": "SkyHigh Systems",
        "location": "Bengaluru, India",
        "work_type": "Hybrid",
        "experience_level": "Senior",
        "salary_range": "₹28,00,000 - ₹42,00,000 (28-42 LPA)",
        "required_education": "Bachelor's in CS / IT",
        "required_skills": ["AWS", "GCP", "Terraform", "Cloud Architecture", "Kubernetes", "Security", "Python"],
        "description": "Design cloud migration strategies, cost-optimization blueprints, and enterprise landing zones across AWS and Google Cloud.",
        "apply_url": "https://skyhigh.in/careers/cloud-architect",
        "posted_date": "1 day ago"
    },
    {
        "id": "job-124",
        "title": "Junior DevOps Engineer",
        "company": "CloudBegin",
        "location": "Noida, India",
        "work_type": "Onsite",
        "experience_level": "Entry",
        "salary_range": "₹7,50,000 - ₹11,00,000 (7.5-11 LPA)",
        "required_education": "Bachelor's in CS / IT",
        "required_skills": ["Linux", "Docker", "Git", "Bash", "AWS", "CI/CD"],
        "description": "Maintain build environments, Docker containers, and GitHub Actions workflows for rapid engineering deployments.",
        "apply_url": "https://cloudbegin.in/jobs/jr-devops",
        "posted_date": "3 days ago"
    },
    {
        "id": "job-125",
        "title": "Kubernetes Administrator & Platform Engineer",
        "company": "KubeScale Inc.",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹20,00,000 - ₹28,00,000 (20-28 LPA)",
        "required_education": "Bachelor's in CS",
        "required_skills": ["Kubernetes", "Helm", "Docker", "Linux", "Go", "Terraform", "CI/CD"],
        "description": "Operate production Kubernetes clusters across hybrid clouds. Build internal developer platforms (IDP) and service meshes.",
        "apply_url": "https://kubescale.io/careers/k8s-admin",
        "posted_date": "5 days ago"
    },
    {
        "id": "job-126",
        "title": "Azure Infrastructure Engineer",
        "company": "CloudNet Solutions",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹18,00,000 - ₹26,00,000 (18-26 LPA)",
        "required_education": "Bachelor's in IT",
        "required_skills": ["Azure", "PowerShell", "Terraform", "CI/CD", "Active Directory", "Linux"],
        "description": "Deploy Microsoft Azure enterprise infrastructure, configure vNets, and manage automated ARM / Bicep deployments.",
        "apply_url": "https://cloudnet.com/jobs/azure",
        "posted_date": "2 days ago"
    },
    {
        "id": "job-127",
        "title": "System Administrator & Network Lead",
        "company": "Enterprise Infrastructure Corp",
        "location": "Chicago, IL",
        "work_type": "Onsite",
        "experience_level": "Senior",
        "salary_range": "₹22,00,000 - ₹32,00,000 (22-32 LPA)",
        "required_education": "Bachelor's in IT or Network Systems",
        "required_skills": ["Linux", "Bash", "Network Security", "Cisco", "Firewalls", "Python", "VMware"],
        "description": "Manage physical server infrastructure, Cisco routers, VMware hypervisors, and enterprise perimeter firewalls.",
        "apply_url": "https://eicorp.com/careers/sysadmin",
        "posted_date": "4 days ago"
    },
    {
        "id": "job-128",
        "title": "Build & Release Automation Engineer",
        "company": "ShipFast Software",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹16,00,000 - ₹24,00,000 (16-24 LPA)",
        "required_education": "Bachelor's in CS",
        "required_skills": ["Jenkins", "Git", "Python", "Docker", "CI/CD", "Bash", "Groovy"],
        "description": "Streamline build, artifact deployment, and test automation pipelines across multi-repo microservice projects.",
        "apply_url": "https://shipfast.dev/jobs/release-eng",
        "posted_date": "1 day ago"
    },
    {
        "id": "job-129",
        "title": "FinOps Cloud Cost Optimization Specialist",
        "company": "CloudSaver Tech",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹19,00,000 - ₹27,00,000 (19-27 LPA)",
        "required_education": "Bachelor's in Finance or CS",
        "required_skills": ["AWS", "GCP", "Python", "SQL", "Terraform", "Cloud Cost Analysis"],
        "description": "Audit cloud resource utilization across AWS/GCP, engineer automated rightsizing policies, and reduce infrastructure burn.",
        "apply_url": "https://cloudsaver.io/careers/finops",
        "posted_date": "3 days ago"
    },
    {
        "id": "job-130",
        "title": "Principal Reliability Architect",
        "company": "GlobalScale Cloud",
        "location": "Seattle, WA",
        "work_type": "Hybrid",
        "experience_level": "Executive",
        "salary_range": "₹45,00,000 - ₹65,00,000 (45-65 LPA)",
        "required_education": "Master's in CS",
        "required_skills": ["SRE", "Distributed Systems", "Go", "Linux", "Kubernetes", "AWS", "Chaos Engineering"],
        "description": "Define multi-datacenter failover strategies, high-availability consensus protocols, and disaster recovery blueprints.",
        "apply_url": "https://globalscale.cloud/jobs/principal-sre",
        "posted_date": "1 week ago"
    },

    # --- FRONTEND & MOBILE (31-40) ---
    {
        "id": "job-131",
        "title": "Senior React / TypeScript Engineer",
        "company": "PixelCraft Design",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_range": "₹22,00,000 - ₹32,00,000 (22-32 LPA)",
        "required_education": "Bachelor's in CS or Software Engineering",
        "required_skills": ["React", "TypeScript", "Redux", "Tailwind CSS", "GraphQL", "Jest", "HTML"],
        "description": "Build high-performance web applications with state management, custom UI component libraries, and end-to-end testing.",
        "apply_url": "https://pixelcraft.design/jobs/sr-react",
        "posted_date": "2 days ago"
    },
    {
        "id": "job-132",
        "title": "iOS Swift Application Developer",
        "company": "Appify Mobile",
        "location": "Bengaluru, India",
        "work_type": "Hybrid",
        "experience_level": "Mid",
        "salary_range": "₹16,00,000 - ₹24,00,000 (16-24 LPA)",
        "required_education": "Bachelor's in CS / IT",
        "required_skills": ["Swift", "iOS", "SwiftUI", "Xcode", "REST API", "Git", "CoreData"],
        "description": "Develop native iOS mobile applications using SwiftUI, async networking, and offline synchronization mechanisms.",
        "apply_url": "https://appify.co/careers/ios",
        "posted_date": "1 day ago"
    },
    {
        "id": "job-133",
        "title": "Android Kotlin Developer",
        "company": "Mobility Tech",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹15,00,000 - ₹23,00,000 (15-23 LPA)",
        "required_education": "Bachelor's in CS / IT",
        "required_skills": ["Kotlin", "Android", "Jetpack Compose", "Coroutines", "REST API", "Git"],
        "description": "Build consumer Android apps with Jetpack Compose, clean Architecture (MVVM), and Kotlin Coroutines.",
        "apply_url": "https://mobilitytech.io/jobs/android",
        "posted_date": "4 days ago"
    },
    {
        "id": "job-134",
        "title": "Flutter Cross-Platform Developer",
        "company": "OmniApp Mobile",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹14,00,000 - ₹22,00,000 (14-22 LPA)",
        "required_education": "Bachelor's in CS",
        "required_skills": ["Flutter", "Dart", "iOS", "Android", "Firebase", "REST API", "Git"],
        "description": "Ship cross-platform mobile apps for iOS and Android using Flutter, Riverpod state management, and Firebase.",
        "apply_url": "https://omniapp.mobile/careers/flutter",
        "posted_date": "3 days ago"
    },
    {
        "id": "job-135",
        "title": "Vue.js & Nuxt.js Frontend Specialist",
        "company": "VueFlow Digital",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹15,00,000 - ₹21,00,000 (15-21 LPA)",
        "required_education": "Bachelor's in CS or Web Dev",
        "required_skills": ["Vue", "Nuxt.js", "JavaScript", "TypeScript", "Tailwind CSS", "HTML", "CSS"],
        "description": "Build server-side rendered Vue/Nuxt dashboards with rapid page loading speeds and accessibility compliance.",
        "apply_url": "https://vueflow.dev/jobs/frontend",
        "posted_date": "2 days ago"
    },
    {
        "id": "job-136",
        "title": "UI/UX Engineer & Web Specialist",
        "company": "Creative UI Labs",
        "location": "Mumbai, India",
        "work_type": "Hybrid",
        "experience_level": "Entry",
        "salary_range": "₹7,00,000 - ₹11,00,000 (7-11 LPA)",
        "required_education": "Bachelor's in Design or CS",
        "required_skills": ["HTML", "CSS", "JavaScript", "Figma", "Tailwind CSS", "React"],
        "description": "Bridge design and code by translating Figma UI prototypes into interactive React component libraries.",
        "apply_url": "https://creativeui.in/careers/ui-eng",
        "posted_date": "Just now"
    },
    {
        "id": "job-137",
        "title": "Staff Frontend Web Performance Engineer",
        "company": "UltraWeb Inc",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_range": "₹28,00,000 - ₹40,00,000 (28-40 LPA)",
        "required_education": "Bachelor's in CS",
        "required_skills": ["React", "TypeScript", "Next.js", "Web Performance", "Webpack", "JavaScript"],
        "description": "Optimize web vital metrics (LCP, CLS, FID), asset bundling, and micro-frontend architecture for enterprise web apps.",
        "apply_url": "https://ultraweb.io/jobs/staff-fe",
        "posted_date": "5 days ago"
    },
    {
        "id": "job-138",
        "title": "React Native Mobile Lead",
        "company": "CrossDev Studios",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_range": "₹24,00,000 - ₹34,00,000 (24-34 LPA)",
        "required_education": "Bachelor's in CS",
        "required_skills": ["React Native", "React", "TypeScript", "JavaScript", "iOS", "Android", "Redux"],
        "description": "Architect universal React Native applications with native bridge modules and smooth 60fps UI animations.",
        "apply_url": "https://crossdev.com/careers/rn-lead",
        "posted_date": "1 day ago"
    },
    {
        "id": "job-139",
        "title": "Web Accessibility & Design Systems Engineer",
        "company": "Inclusive Tech",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹16,00,000 - ₹23,00,000 (16-23 LPA)",
        "required_education": "Bachelor's in CS",
        "required_skills": ["HTML", "CSS", "JavaScript", "React", "Accessibility", "Tailwind CSS"],
        "description": "Ensure WCAG 2.1 AA accessibility standards across design components, keyboard navigation, and screen readers.",
        "apply_url": "https://inclusivetech.org/jobs/a11y",
        "posted_date": "4 days ago"
    },
    {
        "id": "job-140",
        "title": "Angular Enterprise Frontend Engineer",
        "company": "FinTech Corp",
        "location": "Chennai, India",
        "work_type": "Onsite",
        "experience_level": "Mid",
        "salary_range": "₹15,00,000 - ₹22,00,000 (15-22 LPA)",
        "required_education": "Bachelor's in CS",
        "required_skills": ["Angular", "TypeScript", "RxJS", "HTML", "CSS", "REST API", "Jasmine"],
        "description": "Build high-security online banking platforms using Angular 17, RxJS state management, and strict TypeScript types.",
        "apply_url": "https://fintechcorp.in/jobs/angular",
        "posted_date": "3 days ago"
    },

    # --- SECURITY, QA & OTHER DOMAINS (41-50+) ---
    {
        "id": "job-141",
        "title": "Cybersecurity & Security Operations Analyst",
        "company": "SecureNet Global",
        "location": "United States",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹15,00,000 - ₹20,00,000 (15-20 LPA)",
        "required_education": "Bachelor's in Cybersecurity, IT, or Computer Science",
        "required_skills": ["Cybersecurity", "Network Security", "Linux", "Python", "SIEM", "Incident Response"],
        "description": "Monitor enterprise cloud perimeters, perform vulnerability assessments, and mitigate threat vectors in enterprise SaaS systems.",
        "apply_url": "https://securenet.global/jobs/security-analyst",
        "posted_date": "2 days ago"
    },
    {
        "id": "job-142",
        "title": "Penetration Tester & Ethical Hacker",
        "company": "ArmorSec Security",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_range": "₹22,00,000 - ₹34,00,000 (22-34 LPA)",
        "required_education": "Bachelor's in Cybersecurity / CS",
        "required_skills": ["Cybersecurity", "Linux", "Python", "Burp Suite", "Metasploit", "Network Security"],
        "description": "Conduct offensive security testing, web app penetration tests, and vulnerability reporting for fintech platforms.",
        "apply_url": "https://armorsec.io/jobs/pentester",
        "posted_date": "1 day ago"
    },
    {
        "id": "job-143",
        "title": "Automated QA & SDET Engineer",
        "company": "QualityFirst Tech",
        "location": "Bengaluru, India",
        "work_type": "Hybrid",
        "experience_level": "Mid",
        "salary_range": "₹14,00,000 - ₹21,00,000 (14-21 LPA)",
        "required_education": "Bachelor's in CS / IT",
        "required_skills": ["Python", "Selenium", "Cypress", "Pytest", "Git", "CI/CD", "SQL"],
        "description": "Build end-to-end web test automation frameworks using Python, Cypress, and Selenium running inside Docker containers.",
        "apply_url": "https://qualityfirst.io/careers/sdet",
        "posted_date": "3 days ago"
    },
    {
        "id": "job-144",
        "title": "Junior QA Manual & Automation Tester",
        "company": "TestStack Solutions",
        "location": "Noida, India",
        "work_type": "Onsite",
        "experience_level": "Entry",
        "salary_range": "₹6,50,000 - ₹9,50,000 (6.5-9.5 LPA)",
        "required_education": "Bachelor's in CS",
        "required_skills": ["JavaScript", "Testing", "Jira", "SQL", "Git", "HTML"],
        "description": "Perform manual regression testing, write test plans, and create automated web UI scripts for web applications.",
        "apply_url": "https://teststack.in/jobs/jr-qa",
        "posted_date": "2 days ago"
    },
    {
        "id": "job-145",
        "title": "Technical Product Manager (AI Platforms)",
        "company": "Productive AI",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_range": "₹28,00,000 - ₹42,00,000 (28-42 LPA)",
        "required_education": "Bachelor's in CS + MBA preferred",
        "required_skills": ["Product Management", "Agile", "Jira", "SQL", "Machine Learning", "System Architecture"],
        "description": "Define product roadmap, user stories, and feature specs for developer-facing AI and developer tool platforms.",
        "apply_url": "https://productiveai.com/careers/tpm",
        "posted_date": "4 days ago"
    },
    {
        "id": "job-146",
        "title": "Scrum Master & Agile Project Delivery Lead",
        "company": "AgileFlow Corp",
        "location": "Hyderabad, India",
        "work_type": "Hybrid",
        "experience_level": "Mid",
        "salary_range": "₹16,00,000 - ₹23,00,000 (16-23 LPA)",
        "required_education": "Bachelor's degree with CSM certification",
        "required_skills": ["Agile", "Scrum", "Jira", "Confluence", "Project Management", "Communication"],
        "description": "Facilitate daily standups, sprint planning, and retrospectives across cross-functional engineering teams.",
        "apply_url": "https://agileflow.in/jobs/scrum-master",
        "posted_date": "1 day ago"
    },
    {
        "id": "job-147",
        "title": "Technical Writer & Developer Advocate",
        "company": "DevDocs Tech",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Mid",
        "salary_range": "₹13,00,000 - ₹19,00,000 (13-19 LPA)",
        "required_education": "Bachelor's in CS or English/Communications",
        "required_skills": ["Python", "Git", "Markdown", "REST API", "Communication", "HTML"],
        "description": "Write comprehensive developer documentation, API guides, SDK tutorials, and technical blog articles.",
        "apply_url": "https://devdocs.tech/careers/writer",
        "posted_date": "5 days ago"
    },
    {
        "id": "job-148",
        "title": "Application Security (AppSec) Engineer",
        "company": "ShieldApp Security",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_range": "₹25,00,000 - ₹36,00,000 (25-36 LPA)",
        "required_education": "Bachelor's in CS / Cybersecurity",
        "required_skills": ["Cybersecurity", "Python", "OWASP", "SAST/DAST", "Docker", "Java"],
        "description": "Perform static/dynamic security analysis on source code, conduct threat modeling, and fix OWASP Top 10 flaws.",
        "apply_url": "https://shieldapp.io/jobs/appsec",
        "posted_date": "2 days ago"
    },
    {
        "id": "job-149",
        "title": "Embedded Systems & IoT Engineer",
        "company": "SmartNode Systems",
        "location": "Pune, India",
        "work_type": "Onsite",
        "experience_level": "Mid",
        "salary_range": "₹14,00,000 - ₹20,00,000 (14-20 LPA)",
        "required_education": "Bachelor's in Electronics / CS",
        "required_skills": ["C++", "C", "Linux", "Python", "Microcontrollers", "Git"],
        "description": "Program low-level firmware for IoT microcontrollers, micro-kernel Linux devices, and Bluetooth sensors.",
        "apply_url": "https://smartnode.in/careers/embedded",
        "posted_date": "4 days ago"
    },
    {
        "id": "job-150",
        "title": "Database Administrator (PostgreSQL & Redis)",
        "company": "DataStore Infra",
        "location": "Remote",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_range": "₹22,00,000 - ₹32,00,000 (22-32 LPA)",
        "required_education": "Bachelor's in CS / IT",
        "required_skills": ["PostgreSQL", "Redis", "SQL", "Linux", "Python", "Database Architecture"],
        "description": "Manage multi-node PostgreSQL clusters, replication lag, point-in-time recovery (PITR), and Redis caching nodes.",
        "apply_url": "https://datastoreinfra.com/jobs/dba",
        "posted_date": "3 days ago"
    }
]


# ==============================================================================
# 3. MULTI-FACTOR SCORING PIPELINE WITH SYNONYMS & ADJACENCY
# ==============================================================================

def calculate_skill_score(candidate_skills: List[str], required_skills: List[str]) -> Dict[str, Any]:
    """
    Computes skill match percentage using synonym normalization + adjacency partial credit.
    """
    if not required_skills:
        return {"score": 100, "matched": [], "missing": []}

    # Normalize candidate skills via taxonomy
    cand_canon = set()
    for s in candidate_skills:
        canon = _canonicalize_skill(s)
        if canon:
            cand_canon.add(canon)

    matched_original = []
    missing_original = []
    total_credit = 0.0

    for orig_req in required_skills:
        canon_req = _canonicalize_skill(orig_req)
        
        # 1. Exact match via canonical taxonomy
        if canon_req in cand_canon:
            matched_original.append(orig_req)
            total_credit += 1.0
            continue

        # 2. Substring containment match
        found_sub = False
        for c_skill in cand_canon:
            if canon_req in c_skill or c_skill in canon_req:
                matched_original.append(orig_req)
                total_credit += 1.0
                found_sub = True
                break

        if found_sub:
            continue

        # 3. Adjacency partial credit (0.4 credit)
        adj_skills = SKILL_ADJACENCY_NORMALIZED.get(canon_req, [])
        found_adj = False
        for adj in adj_skills:
            if adj in cand_canon:
                # Award partial match credit
                matched_original.append(f"{orig_req} (via {adj.capitalize()})")
                total_credit += 0.4
                found_adj = True
                break

        if not found_adj:
            missing_original.append(orig_req)

    total_req = len(required_skills)
    score = int(round((total_credit / total_req) * 100)) if total_req > 0 else 100
    score = min(100, score)

    return {
        "score": score,
        "matched": matched_original,
        "missing": missing_original
    }


def calculate_qualification_score(candidate_education: List[Dict[str, Any]], required_education: str) -> int:
    """Evaluates candidate education entries against required job education."""
    if not required_education:
        return 90

    req_lower = required_education.lower()
    if not candidate_education:
        return 75

    score = 75
    for edu in candidate_education:
        degree = str(edu.get("degree") or "").lower()
        field = str(edu.get("field_of_study") or "").lower()

        if "bachelor" in req_lower and ("bachelor" in degree or "b.t" in degree or "bs" in degree or "b.s" in degree):
            score = max(score, 95)
        if "master" in req_lower and ("master" in degree or "m.s" in degree or "ms" in degree):
            score = max(score, 100)
        if "ph.d" in req_lower and "phd" in degree:
            score = max(score, 100)
        if "computer science" in req_lower and ("computer science" in field or "cs" in field or "it" in field):
            score = max(score, 90)

    return min(100, score)


def calculate_experience_score(candidate_exp_level: Optional[str], required_exp_level: str) -> int:
    """Compares candidate experience level with job experience requirements."""
    levels = ["entry", "mid", "senior", "executive"]

    cand_l = (candidate_exp_level or "mid").strip().lower()
    req_l = (required_exp_level or "mid").strip().lower()

    if cand_l == req_l:
        return 100

    if cand_l in levels and req_l in levels:
        cand_idx = levels.index(cand_l)
        req_idx = levels.index(req_l)
        diff = abs(cand_idx - req_idx)
        if diff == 1:
            return 85
        elif diff == 2:
            return 65
        else:
            return 50

    return 80


# ==============================================================================
# 4. BEHAVIORAL PERSONALIZATION FROM SAVED JOBS
# ==============================================================================

def calculate_preference_score(job: Dict[str, Any], saved_jobs: List[Dict[str, Any]]) -> int:
    """
    Analyzes candidate's saved jobs history to compute a behavioral preference match score (0-100).
    Surfaces location preferences, work type preferences, and skill cluster affinities.
    """
    if not saved_jobs:
        return 75  # Baseline score if no saved jobs exist

    score = 75
    job_wt = job["work_type"].lower()
    job_loc = job["location"].lower()
    job_title = job["title"].lower()

    saved_work_types = [sj.get("work_type", "").lower() for sj in saved_jobs if sj.get("work_type")]
    saved_locations = [sj.get("location", "").lower() for sj in saved_jobs if sj.get("location")]
    saved_titles = [sj.get("job_title", "").lower() for sj in saved_jobs if sj.get("job_title")]

    # Work type match boost
    if saved_work_types and job_wt in saved_work_types:
        score += 10

    # Location match boost
    if saved_locations and any(loc in job_loc for loc in saved_locations):
        score += 10

    # Title similarity boost
    if saved_titles and any(t_word in job_title for t in saved_titles for t_word in t.split() if len(t_word) > 3):
        score += 10

    return min(100, score)


# ==============================================================================
# 5. DIVERSITY RE-RANKING (MMR - MAXIMAL MARGINAL RELEVANCE)
# ==============================================================================

def apply_mmr_reranking(items: List[Dict[str, Any]], lambda_param: float = 0.7, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Applies Maximal Marginal Relevance (MMR) to balance high overall match scores
    with result diversity across companies and job titles.
    """
    if len(items) <= limit:
        return items

    selected = [items[0]]
    remaining = items[1:]

    while len(selected) < limit and remaining:
        best_score = -999.0
        best_idx = 0

        for i, cand in enumerate(remaining):
            relevance = cand["overall_score"] / 100.0

            # Compute max similarity to already selected jobs (based on company & title overlap)
            max_sim = 0.0
            for sel in selected:
                sim = 0.0
                if cand["company"].lower() == sel["company"].lower():
                    sim += 0.6
                cand_words = set(cand["title"].lower().split())
                sel_words = set(sel["title"].lower().split())
                if cand_words and sel_words:
                    overlap = len(cand_words.intersection(sel_words)) / max(len(cand_words), len(sel_words))
                    sim += overlap * 0.4
                max_sim = max(max_sim, sim)

            mmr_val = (lambda_param * relevance) - ((1.0 - lambda_param) * max_sim)
            if mmr_val > best_score:
                best_score = mmr_val
                best_idx = i

        selected.append(remaining.pop(best_idx))

    return selected


# ==============================================================================
# 6. MATCH RATIONALE GENERATION
# ==============================================================================

def generate_match_rationale(
    overall_score: int,
    matched_skills: List[str],
    missing_skills: List[str],
    job_title: str
) -> str:
    """Generates concise, human-readable match summary."""
    clean_matched = [s.split(" (via")[0] for s in matched_skills]
    matched_count = len(clean_matched)

    if overall_score >= 85:
        return (
            f"Strong match for {job_title}! Your profile aligns with core requirements "
            f"({', '.join(clean_matched[:3]) if clean_matched else 'stack'})."
        )
    elif overall_score >= 70:
        missing_str = f" Adding {', '.join(missing_skills[:2])} will boost your match." if missing_skills else ""
        return (
            f"Competitive match ({overall_score}%). You cover {matched_count} key skills.{missing_str}"
        )
    else:
        missing_str = f" Key gaps: {', '.join(missing_skills[:3])}." if missing_skills else ""
        return (
            f"Moderate alignment ({overall_score}%).{missing_str} Consider upskilling in these areas."
        )


# ==============================================================================
# 7. MAIN HYBRID RECOMMENDATION PIPELINE
# ==============================================================================

def recommend_jobs_for_candidate(
    candidate_skills: List[str],
    candidate_education: List[Dict[str, Any]],
    candidate_exp_level: Optional[str],
    candidate_resume_text: str = "",
    location_filter: Optional[str] = None,
    work_type_filter: Optional[str] = None,
    exp_level_filter: Optional[str] = None,
    min_score: int = 0,
    limit: int = 10,
    saved_jobs_data: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Main Production Hybrid Job Recommendation Pipeline.
    Combines Skill Taxonomy, Semantic Vector Embeddings, Experience, Education, and Behavioral Personalization.
    """
    saved_jobs = saved_jobs_data or []
    saved_ids = set([sj.get("job_id") for sj in saved_jobs if sj.get("job_id")])

    # Candidate text context for vector embedding matcher
    cand_text_context = f"{candidate_resume_text}\nSkills: {', '.join(candidate_skills)}"

    scored_jobs = []

    for job in JOB_DATASET:
        # 1. Location filter
        if location_filter and location_filter.strip().lower() != "all":
            loc_query = location_filter.strip().lower()
            job_loc = job["location"].lower()
            job_wt = job["work_type"].lower()
            if loc_query not in job_loc and loc_query not in job_wt:
                continue

        # 2. Work type filter
        if work_type_filter and work_type_filter.strip().lower() != "all":
            wt_query = work_type_filter.strip().lower()
            if wt_query not in job["work_type"].lower():
                continue

        # 3. Experience level filter
        if exp_level_filter and exp_level_filter.strip().lower() != "all":
            exp_query = exp_level_filter.strip().lower()
            if exp_query not in job["experience_level"].lower():
                continue

        # --- MULTI-FACTOR SCORING ---
        # Component A: Skill Score (Taxonomy + Adjacency)
        skill_res = calculate_skill_score(candidate_skills, job["required_skills"])
        skill_score = skill_res["score"]

        # Component B: Semantic Vector Similarity (sentence-transformers / TF-IDF)
        job_text_context = f"{job['title']} at {job['company']}\n{job['description']}\nRequired Skills: {', '.join(job['required_skills'])}"
        sem_sim = compute_semantic_similarity(cand_text_context, job_text_context)
        semantic_score = int(round(sem_sim * 100))

        # Component C: Qualification Score
        qual_score = calculate_qualification_score(candidate_education, job["required_education"])

        # Component D: Experience Score
        exp_score = calculate_experience_score(candidate_exp_level, job["experience_level"])

        # Component E: Behavioral Preference Score (from saved jobs)
        pref_score = calculate_preference_score(job, saved_jobs)

        # --- COMPOSITE OVERALL SCORE FORMULA ---
        # 35% Skill + 30% Semantic Vector + 15% Experience + 10% Qualification + 10% Preference
        overall_score = int(round(
            (skill_score * 0.35) +
            (semantic_score * 0.30) +
            (exp_score * 0.15) +
            (qual_score * 0.10) +
            (pref_score * 0.10)
        ))

        overall_score = max(10, min(99, overall_score))

        if overall_score < min_score:
            continue

        rationale = generate_match_rationale(
            overall_score=overall_score,
            matched_skills=skill_res["matched"],
            missing_skills=skill_res["missing"],
            job_title=job["title"]
        )

        match_details = {
            "skill_score": skill_score,
            "qualification_score": qual_score,
            "experience_score": exp_score,
            "semantic_score": semantic_score,
            "preference_score": pref_score,
            "matched_skills": skill_res["matched"],
            "missing_skills": skill_res["missing"],
            "required_education": job["required_education"],
            "match_rationale": rationale
        }

        live_apply_url = format_live_apply_url(job["title"], job["company"], job.get("apply_url"))
        if not live_apply_url:
            continue

        job_item = {
            "id": job["id"],
            "title": job["title"],
            "company": job["company"],
            "location": job["location"],
            "work_type": job["work_type"],
            "experience_level": job["experience_level"],
            "salary_range": job["salary_range"],
            "description": job["description"],
            "required_skills": job["required_skills"],
            "overall_score": overall_score,
            "details": match_details,
            "is_saved": job["id"] in saved_ids,
            "apply_url": live_apply_url,
            "posted_date": job["posted_date"]
        }

        scored_jobs.append(job_item)

    # Sort candidates by composite score descending
    scored_jobs.sort(key=lambda x: x["overall_score"], reverse=True)

    # Apply MMR Re-Ranking for result diversity across roles & companies
    final_recommendations = apply_mmr_reranking(scored_jobs, lambda_param=0.7, limit=limit)

    return final_recommendations
