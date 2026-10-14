"""
CareerPilot.AI Skill Taxonomy & Ontology v2.

A structured, market-informed skill ontology powering the redesigned
Skill Gap Analysis Engine. Every skill carries:
  - category       : grouping for the visual breakdown
  - demand         : current market demand (1-10)
  - salary_impact  : approximate salary uplift for possessing it (%)
  - trend          : demand trajectory (emerging | high | stable)
  - blurb          : why it matters for recruiters / hiring managers
  - resource       : (title, provider, url) learning resource
  - weeks          : realistic time-to-learn estimate
  - cert           : optional associated certification
  - related        : adjacency / companion skills
"""

from typing import Dict, Any

SKILL_TAXONOMY: Dict[str, Dict[str, Any]] = {
    # =========================================================================
    # LANGUAGES & CORE
    # =========================================================================
    "python": {
        "category": "Languages & Core",
        "demand": 10, "salary_impact": 8, "trend": "high",
        "blurb": "The most requested language across AI, backend, data and automation roles.",
        "resource": ("Corey Schafer Python / Python Masterclass", "Udemy", "https://www.udemy.com/course/python-the-complete-python-developer-course/"),
        "weeks": 4, "cert": "PCAP",
        "related": ["pandas", "fastapi", "machine learning", "automation"],
    },
    "javascript": {
        "category": "Languages & Core",
        "demand": 10, "salary_impact": 5, "trend": "stable",
        "blurb": "Ubiquitous across web, mobile and serverless platforms.",
        "resource": ("JavaScript: The Hard Parts", "Frontend Masters", "https://frontendmasters.com/courses/javascript-hard-parts-v2/"),
        "weeks": 4, "cert": None,
        "related": ["typescript", "react", "node.js", "next.js"],
    },
    "typescript": {
        "category": "Languages & Core",
        "demand": 10, "salary_impact": 9, "trend": "high",
        "blurb": "Type safety at scale; the default for modern web and backend codebases.",
        "resource": ("TypeScript for Professionals", "ExecuteProgram", "https://www.executeprogram.com/courses/typescript"),
        "weeks": 3, "cert": None,
        "related": ["javascript", "react", "node.js"],
    },
    "java": {
        "category": "Languages & Core",
        "demand": 8, "salary_impact": 6, "trend": "stable",
        "blurb": "Core of enterprise services, Android and large-scale fintech systems.",
        "resource": ("Java Programming Masterclass", "Udemy", "https://www.udemy.com/course/java-the-complete-java-developer-course/"),
        "weeks": 5, "cert": "Oracle OCP",
        "related": ["spring boot", "microservices", "kubernetes"],
    },
    "go": {
        "category": "Languages & Core",
        "demand": 8, "salary_impact": 12, "trend": "high",
        "blurb": "Powering cloud-native infrastructure and high-throughput services.",
        "resource": ("Learn Go / Boot.dev", "Boot.dev", "https://boot.dev/learn/learn-golang"),
        "weeks": 4, "cert": None,
        "related": ["kubernetes", "docker", "microservices", "cloud"],
    },
    "c++": {
        "category": "Languages & Core",
        "demand": 6, "salary_impact": 7, "trend": "stable",
        "blurb": "Required for systems, embedded, game engines and performance-critical software.",
        "resource": ("C++ for C Programmers", "Coursera", "https://www.coursera.org/specializations/coding-interview"),
        "weeks": 6, "cert": None,
        "related": ["systems programming", "embedded"],
    },
    "rust": {
        "category": "Languages & Core",
        "demand": 7, "salary_impact": 15, "trend": "emerging",
        "blurb": "Memory-safe systems language with the highest salary premiums in 2026.",
        "resource": ("The Rust Book", "Rust Foundation", "https://doc.rust-lang.org/book/"),
        "weeks": 6, "cert": None,
        "related": ["systems programming", "webassembly", "blockchain"],
    },
    "sql": {
        "category": "Languages & Core",
        "demand": 10, "salary_impact": 5, "trend": "stable",
        "blurb": "Non-negotiable for any data or backend role; query performance drives everything.",
        "resource": ("SQL for Data Analytics", "Kaggle Learn", "https://www.kaggle.com/learn/advanced-sql"),
        "weeks": 3, "cert": None,
        "related": ["postgresql", "data analysis", "database design"],
    },
    "bash": {
        "category": "Languages & Core",
        "demand": 7, "salary_impact": 4, "trend": "stable",
        "blurb": "Glue for automation, CI/CD and Linux administration.",
        "resource": ("Bash Scripting for Automation", "Linux Foundation", "https://www.edx.org/learn/linux"),
        "weeks": 2, "cert": None,
        "related": ["linux", "ci/cd", "automation"],
    },

    # =========================================================================
    # BACKEND & WEB
    # =========================================================================
    "node.js": {
        "category": "Backend & Web",
        "demand": 9, "salary_impact": 6, "trend": "stable",
        "blurb": "Event-driven runtime powering most modern APIs and full-stack apps.",
        "resource": ("Node.js Complete Developer Course", "Udemy", "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/"),
        "weeks": 4, "cert": None,
        "related": ["express", "typescript", "mongodb", "react"],
    },
    "express": {
        "category": "Backend & Web",
        "demand": 6, "salary_impact": 3, "trend": "stable",
        "blurb": "Minimal Node.js web framework; foundation for countless REST APIs.",
        "resource": ("Express & API Design", "MDN", "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs"),
        "weeks": 2, "cert": None,
        "related": ["node.js", "rest api", "mongodb"],
    },
    "fastapi": {
        "category": "Backend & Web",
        "demand": 8, "salary_impact": 9, "trend": "high",
        "blurb": "Modern async Python framework with automatic OpenAPI docs; favorite for AI backends.",
        "resource": ("FastAPI: Python Web Framework", "Udemy", "https://www.udemy.com/course/fastapi-the-complete-course/"),
        "weeks": 3, "cert": None,
        "related": ["python", "pydantic", "microservices", "docker"],
    },
    "django": {
        "category": "Backend & Web",
        "demand": 6, "salary_impact": 4, "trend": "stable",
        "blurb": "Batteries-included Python framework for rapid, secure web apps.",
        "resource": ("Django for Everybody", "Coursera", "https://www.coursera.org/specializations/django"),
        "weeks": 4, "cert": None,
        "related": ["python", "postgresql", "rest api"],
    },
    "flask": {
        "category": "Backend & Web",
        "demand": 5, "salary_impact": 3, "trend": "stable",
        "blurb": "Lightweight Python micro-framework for APIs and prototypes.",
        "resource": ("Flask: The Ultimate Web Framework", "TechWithTim", "https://techwithtim.net/tutorials/flask"),
        "weeks": 2, "cert": None,
        "related": ["python", "rest api"],
    },
    "spring boot": {
        "category": "Backend & Web",
        "demand": 7, "salary_impact": 6, "trend": "stable",
        "blurb": "Industry-standard Java framework for enterprise microservices.",
        "resource": ("Spring Boot & Spring Framework", "Udemy", "https://www.udemy.com/course/spring-boot-3-spring-6-hibernate-for-beginners/"),
        "weeks": 5, "cert": "Spring Professional",
        "related": ["java", "microservices", "kubernetes"],
    },
    "graphql": {
        "category": "Backend & Web",
        "demand": 6, "salary_impact": 6, "trend": "stable",
        "blurb": "Query language reducing over-fetching; strong for complex client apps.",
        "resource": ("How to GraphQL", "GraphQL Foundation", "https://www.howtographql.com/"),
        "weeks": 3, "cert": None,
        "related": ["node.js", "react", "rest api"],
    },
    "rest api": {
        "category": "Backend & Web",
        "demand": 9, "salary_impact": 4, "trend": "stable",
        "blurb": "Designing clean, versioned, secure HTTP APIs is a core backend skill.",
        "resource": ("API Design Guide", "Stripe", "https://stripe.com/blog/api-versioning"),
        "weeks": 2, "cert": None,
        "related": ["node.js", "fastapi", "swagger", "microservices"],
    },
    "microservices": {
        "category": "Backend & Web",
        "demand": 8, "salary_impact": 10, "trend": "high",
        "blurb": "Decomposing monoliths into independently deployable services is a senior-level skill.",
        "resource": ("Microservices Architecture", "Udemy", "https://www.udemy.com/course/microservices-with-node-js-and-react/"),
        "weeks": 5, "cert": None,
        "related": ["docker", "kubernetes", "system design", "message queue"],
    },
    "system design": {
        "category": "Backend & Web",
        "demand": 9, "salary_impact": 14, "trend": "high",
        "blurb": "Scaling, caching, load-balancing and fault-tolerance — the senior/SWE-III differentiator.",
        "resource": ("Grokking System Design / DDIA", "Educative", "https://www.educative.io/courses/grokking-modern-system-design-interview"),
        "weeks": 6, "cert": None,
        "related": ["microservices", "redis", "kubernetes", "distributed systems"],
    },
    "git": {
        "category": "Backend & Web",
        "demand": 10, "salary_impact": 2, "trend": "stable",
        "blurb": "Version control is table stakes for every software team; GitHub fluency expected.",
        "resource": ("Git & GitHub Foundations", "GitHub Skills", "https://skills.github.com/"),
        "weeks": 1, "cert": None,
        "related": ["ci/cd", "testing", "project management"],
    },
    "swagger": {
        "category": "Backend & Web",
        "demand": 6, "salary_impact": 3, "trend": "stable",
        "blurb": "OpenAPI documentation and client generation for discoverable, testable APIs.",
        "resource": ("OpenAPI Specification Guide", "Swagger", "https://swagger.io/docs/"),
        "weeks": 1, "cert": None,
        "related": ["rest api", "fastapi", "node.js"],
    },

    # =========================================================================
    # FRONTEND & UI ENGINEERING
    # =========================================================================
    "react": {
        "category": "Frontend & UI Engineering",
        "demand": 10, "salary_impact": 6, "trend": "stable",
        "blurb": "The most widely used UI library; ecosystem knowledge matters more than ever.",
        "resource": ("React & Redux Masterclass", "Frontend Masters", "https://frontendmasters.com/courses/complete-react-v8/"),
        "weeks": 4, "cert": None,
        "related": ["typescript", "next.js", "tailwind", "state management"],
    },
    "next.js": {
        "category": "Frontend & UI Engineering",
        "demand": 9, "salary_impact": 9, "trend": "high",
        "blurb": "Full-stack React framework with SSR/ISR; top request in 2026 web roles.",
        "resource": ("Next.js Official Course", "Vercel", "https://nextjs.org/learn"),
        "weeks": 3, "cert": None,
        "related": ["react", "typescript", "tailwind", "vercel"],
    },
    "vue": {
        "category": "Frontend & UI Engineering",
        "demand": 5, "salary_impact": 3, "trend": "stable",
        "blurb": "Approachable progressive framework, strong in EU/Asia markets.",
        "resource": ("Vue 3 Essentials", "Vue School", "https://vueschool.io/courses/vuejs-3-fundamentals"),
        "weeks": 3, "cert": None,
        "related": ["javascript", "typescript"],
    },
    "angular": {
        "category": "Frontend & UI Engineering",
        "demand": 5, "salary_impact": 4, "trend": "stable",
        "blurb": "Enterprise-grade opinionated framework with strong DI and testing story.",
        "resource": ("Angular Zero to Mastery", "Udemy", "https://www.udemy.com/course/the-complete-guide-to-angular-2/"),
        "weeks": 4, "cert": None,
        "related": ["typescript", "rxjs", "testing"],
    },
    "html": {
        "category": "Frontend & UI Engineering",
        "demand": 9, "salary_impact": 2, "trend": "stable",
        "blurb": "Semantic, accessible markup — baseline for every web role.",
        "resource": ("Web Accessibility & HTML Semantics", "MDN", "https://developer.mozilla.org/en-US/docs/Learn"),
        "weeks": 1, "cert": None,
        "related": ["css", "accessibility", "seo"],
    },
    "css": {
        "category": "Frontend & UI Engineering",
        "demand": 9, "salary_impact": 3, "trend": "stable",
        "blurb": "Layout, responsiveness and modern container queries.",
        "resource": ("CSS for JavaScript Developers", "CSS for JS", "https://css-for-js.dev/"),
        "weeks": 3, "cert": None,
        "related": ["tailwind", "html", "design systems"],
    },
    "tailwind": {
        "category": "Frontend & UI Engineering",
        "demand": 8, "salary_impact": 4, "trend": "high",
        "blurb": "Utility-first CSS accelerating design-system workflows.",
        "resource": ("Tailwind CSS Mastery", "Tailwind Labs", "https://tailwindcss.com/docs"),
        "weeks": 2, "cert": None,
        "related": ["react", "next.js", "css"],
    },
    "accessibility": {
        "category": "Frontend & UI Engineering",
        "demand": 7, "salary_impact": 7, "trend": "high",
        "blurb": "WCAG compliance is now a legal & hiring requirement, not a nice-to-have.",
        "resource": ("W3C Web Accessibility", "W3C", "https://www.w3.org/WAI/fundamentals/accessibility-intro/"),
        "weeks": 3, "cert": "CPACC",
        "related": ["html", "ux design", "design systems"],
    },
    "jest": {
        "category": "Frontend & UI Engineering",
        "demand": 7, "salary_impact": 3, "trend": "stable",
        "blurb": "Unit & component testing for JavaScript/React keeps CI green and regressions low.",
        "resource": ("Testing with Jest & RTL", "Testing Library", "https://testing-library.com/docs/"),
        "weeks": 2, "cert": None,
        "related": ["testing", "ci/cd", "react", "typescript"],
    },

    # =========================================================================
    # DATA, AI & ML
    # =========================================================================
    "machine learning": {
        "category": "Data, AI & ML",
        "demand": 9, "salary_impact": 12, "trend": "high",
        "blurb": "Classical ML + model evaluation remain core to applied data science roles.",
        "resource": ("Machine Learning Specialization", "DeepLearning.AI", "https://www.coursera.org/specializations/machine-learning-introduction"),
        "weeks": 6, "cert": "Google ML Engineer",
        "related": ["python", "pandas", "deep learning", "statistics"],
    },
    "deep learning": {
        "category": "Data, AI & ML",
        "demand": 8, "salary_impact": 13, "trend": "high",
        "blurb": "Neural networks, transformers and modern architectures.",
        "resource": ("Deep Learning Specialization", "DeepLearning.AI", "https://www.deeplearning.ai/courses/deep-learning-specialization/"),
        "weeks": 7, "cert": None,
        "related": ["pytorch", "tensorflow", "machine learning"],
    },
    "pytorch": {
        "category": "Data, AI & ML",
        "demand": 9, "salary_impact": 12, "trend": "high",
        "blurb": "The dominant framework for research & production LLMs.",
        "resource": ("PyTorch for Deep Learning", "freeCodeCamp", "https://pytorch.org/tutorials/"),
        "weeks": 5, "cert": None,
        "related": ["deep learning", "python", "nlp"],
    },
    "tensorflow": {
        "category": "Data, AI & ML",
        "demand": 6, "salary_impact": 6, "trend": "stable",
        "blurb": "Still strong in production serving and TFX pipelines.",
        "resource": ("TensorFlow Developer Certificate", "Google", "https://www.coursera.org/professional-certificates/tensorflow-in-practice"),
        "weeks": 5, "cert": "TF Developer",
        "related": ["machine learning", "python", "mlops"],
    },
    "pandas": {
        "category": "Data, AI & ML",
        "demand": 8, "salary_impact": 5, "trend": "stable",
        "blurb": "Data wrangling workhorse for analysts and ML engineers.",
        "resource": ("Pandas Mastery", "Kaggle Learn", "https://www.kaggle.com/learn/pandas"),
        "weeks": 2, "cert": None,
        "related": ["python", "data analysis", "numpy"],
    },
    "nlp": {
        "category": "Data, AI & ML",
        "demand": 8, "salary_impact": 12, "trend": "high",
        "blurb": "Text pipelines, embeddings and language models dominate AI hiring.",
        "resource": ("Hugging Face NLP Course", "Hugging Face", "https://huggingface.co/learn/nlp-course"),
        "weeks": 5, "cert": None,
        "related": ["llm", "pytorch", "python", "rag"],
    },
    "llm": {
        "category": "Data, AI & ML",
        "demand": 10, "salary_impact": 18, "trend": "emerging",
        "blurb": "Prompt engineering, fine-tuning and cost-aware LLM integration is THE 2026 skill.",
        "resource": ("LLMOps / LangChain Courses", "DeepLearning.AI", "https://www.deeplearning.ai/short-courses/"),
        "weeks": 4, "cert": None,
        "related": ["nlp", "rag", "python", "vector database"],
    },
    "rag": {
        "category": "Data, AI & ML",
        "demand": 9, "salary_impact": 16, "trend": "emerging",
        "blurb": "Retrieval-Augmented Generation connecting LLMs to enterprise knowledge bases.",
        "resource": ("Building RAG Applications", "DeepLearning.AI", "https://www.deeplearning.ai/short-courses/"),
        "weeks": 3, "cert": None,
        "related": ["llm", "vector database", "fastapi", "nlp"],
    },
    "vector database": {
        "category": "Data, AI & ML",
        "demand": 8, "salary_impact": 13, "trend": "emerging",
        "blurb": "Semantic search & embeddings storage (Pinecone, Qdrant, pgvector) power RAG systems.",
        "resource": ("Vector Databases for LLMs", "Pinecone Academy", "https://www.pinecone.io/learn/"),
        "weeks": 2, "cert": None,
        "related": ["rag", "llm", "nlp", "postgresql"],
    },
    "data analysis": {
        "category": "Data, AI & ML",
        "demand": 8, "salary_impact": 6, "trend": "stable",
        "blurb": "Exploratory analysis, dashboards and storytelling with data.",
        "resource": ("Google Data Analytics", "Coursera", "https://www.coursera.org/professional-certificates/google-data-analytics"),
        "weeks": 4, "cert": "Google Data Analytics",
        "related": ["sql", "tableau", "pandas", "excel"],
    },
    "statistics": {
        "category": "Data, AI & ML",
        "demand": 7, "salary_impact": 8, "trend": "stable",
        "blurb": "Probability, hypothesis testing and experimental design underpin ML rigor.",
        "resource": ("Statistics & Probability", "Khan Academy", "https://www.khanacademy.org/math/statistics-probability"),
        "weeks": 5, "cert": None,
        "related": ["machine learning", "data analysis", "python"],
    },
    "tableau": {
        "category": "Data, AI & ML",
        "demand": 6, "salary_impact": 5, "trend": "stable",
        "blurb": "BI dashboarding expected in analytics and product data roles.",
        "resource": ("Tableau Desktop Specialist", "Tableau", "https://www.udemy.com/course/tableau10/"),
        "weeks": 3, "cert": "Tableau Specialist",
        "related": ["data analysis", "sql"],
    },
    "excel": {
        "category": "Data, AI & ML",
        "demand": 8, "salary_impact": 3, "trend": "stable",
        "blurb": "Pivot tables, Power Query and modeling — still a baseline analytical expectation.",
        "resource": ("Excel Skills for Business", "Coursera", "https://www.coursera.org/specializations/excel"),
        "weeks": 2, "cert": "MOS Excel",
        "related": ["data analysis", "sql", "statistics"],
    },

    # =========================================================================
    # CLOUD & DEVOPS
    # =========================================================================
    "aws": {
        "category": "Cloud & DevOps",
        "demand": 10, "salary_impact": 10, "trend": "high",
        "blurb": "The default cloud platform; broadest set of managed services in demand.",
        "resource": ("AWS Cloud Practitioner → Solutions Architect", "Coursera", "https://www.coursera.org/learn/aws-cloud-technical-essentials"),
        "weeks": 5, "cert": "AWS SAA",
        "related": ["cloud", "terraform", "docker", "serverless"],
    },
    "azure": {
        "category": "Cloud & DevOps",
        "demand": 7, "salary_impact": 7, "trend": "stable",
        "blurb": "Dominant in enterprise & hybrid-cloud environments.",
        "resource": ("Azure Fundamentals AZ-900", "Microsoft Learn", "https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/"),
        "weeks": 4, "cert": "AZ-900",
        "related": ["cloud", "devops"],
    },
    "gcp": {
        "category": "Cloud & DevOps",
        "demand": 6, "salary_impact": 8, "trend": "stable",
        "blurb": "Strong for data & ML (BigQuery, Vertex AI).",
        "resource": ("Google Cloud Associate Engineer", "Google Cloud Skills", "https://cloud.google.com/learn/training"),
        "weeks": 4, "cert": "GCP ACE",
        "related": ["cloud", "data analysis", "mlops"],
    },
    "docker": {
        "category": "Cloud & DevOps",
        "demand": 9, "salary_impact": 6, "trend": "stable",
        "blurb": "Containerization is table stakes across every platform team.",
        "resource": ("Docker Mastery", "Udemy", "https://www.udemy.com/course/docker-mastery-with-kubernetes-swarm/"),
        "weeks": 2, "cert": None,
        "related": ["kubernetes", "ci/cd", "microservices"],
    },
    "kubernetes": {
        "category": "Cloud & DevOps",
        "demand": 9, "salary_impact": 13, "trend": "high",
        "blurb": "Orchestration standard; CKA is the highest-value infra cert.",
        "resource": ("Certified Kubernetes Administrator", "KodeKloud", "https://www.udemy.com/course/certified-kubernetes-administrator-with-handson-labs/"),
        "weeks": 6, "cert": "CKA",
        "related": ["docker", "terraform", "helm", "observability"],
    },
    "terraform": {
        "category": "Cloud & DevOps",
        "demand": 8, "salary_impact": 11, "trend": "high",
        "blurb": "Infrastructure-as-Code enabling reproducible, reviewable cloud.",
        "resource": ("Terraform Associate Track", "HashiCorp", "https://developer.hashicorp.com/terraform/tutorials"),
        "weeks": 4, "cert": "TF Associate",
        "related": ["aws", "kubernetes", "devops"],
    },
    "ci/cd": {
        "category": "Cloud & DevOps",
        "demand": 9, "salary_impact": 7, "trend": "high",
        "blurb": "Automated pipelines (GitHub Actions / GitLab CI) are expected in all modern teams.",
        "resource": ("GitHub Actions: CI/CD", "GitHub Skills", "https://docs.github.com/en/actions"),
        "weeks": 2, "cert": None,
        "related": ["docker", "git", "testing", "devops"],
    },
    "linux": {
        "category": "Cloud & DevOps",
        "demand": 8, "salary_impact": 5, "trend": "stable",
        "blurb": "Production environments run on Linux; shell fluency is expected.",
        "resource": ("Linux for Developers", "Linux Foundation", "https://training.linuxfoundation.org/training/linux-for-developers/"),
        "weeks": 3, "cert": "RHCSA",
        "related": ["bash", "cloud", "docker"],
    },
    "observability": {
        "category": "Cloud & DevOps",
        "demand": 7, "salary_impact": 10, "trend": "high",
        "blurb": "Metrics, logs and traces (Prometheus, Grafana, OpenTelemetry) for SRE roles.",
        "resource": ("Prometheus & Grafana", "Pluralsight", "https://www.pluralsight.com/courses/prometheus-monitoring"),
        "weeks": 3, "cert": None,
        "related": ["kubernetes", "sre", "devops"],
    },
    "serverless": {
        "category": "Cloud & DevOps",
        "demand": 7, "salary_impact": 8, "trend": "high",
        "blurb": "Event-driven compute (Lambda, Cloud Functions) for cost-efficient scale.",
        "resource": ("Serverless Architectures", "AWS Training", "https://aws.amazon.com/serverless/"),
        "weeks": 3, "cert": None,
        "related": ["aws", "cloud", "rest api"],
    },
    "mlops": {
        "category": "Cloud & DevOps",
        "demand": 8, "salary_impact": 11, "trend": "high",
        "blurb": "Model training, serving, monitoring and experiment tracking in production.",
        "resource": ("MLOps with MLflow & Airflow", "DeepLearning.AI", "https://www.deeplearning.ai/short-courses/"),
        "weeks": 4, "cert": None,
        "related": ["docker", "kubernetes", "fastapi", "machine learning"],
    },

    # =========================================================================
    # DATABASES & CACHING
    # =========================================================================
    "postgresql": {
        "category": "Databases & Caching",
        "demand": 9, "salary_impact": 6, "trend": "high",
        "blurb": "The default relational database for modern startups and enterprises.",
        "resource": ("PostgreSQL Performance & Indexing", "Use the Index Luke", "https://use-the-index-luke.com/"),
        "weeks": 3, "cert": None,
        "related": ["sql", "database design", "redis"],
    },
    "mongodb": {
        "category": "Databases & Caching",
        "demand": 7, "salary_impact": 5, "trend": "stable",
        "blurb": "Document store powering flexible-schema applications.",
        "resource": ("MongoDB University", "MongoDB", "https://learn.mongodb.com/"),
        "weeks": 3, "cert": "M001",
        "related": ["node.js", "database design", "nosql"],
    },
    "redis": {
        "category": "Databases & Caching",
        "demand": 7, "salary_impact": 7, "trend": "stable",
        "blurb": "In-memory cache/queue critical for low-latency systems.",
        "resource": ("Redis University", "Redis", "https://university.redis.com/"),
        "weeks": 2, "cert": "RU101",
        "related": ["system design", "postgresql", "microservices"],
    },
    "database design": {
        "category": "Databases & Caching",
        "demand": 8, "salary_impact": 8, "trend": "stable",
        "blurb": "Schema modeling, normalization, and query optimization are senior signals.",
        "resource": ("Designing Data-Intensive Applications", "O'Reilly", "https://dataintensive.net/"),
        "weeks": 5, "cert": None,
        "related": ["sql", "postgresql", "system design"],
    },

    # =========================================================================
    # CYBERSECURITY & AUTH
    # =========================================================================
    "cybersecurity": {
        "category": "Cybersecurity & Auth",
        "demand": 8, "salary_impact": 9, "trend": "high",
        "blurb": "Security-first engineering is now a mandate across the industry.",
        "resource": ("CompTIA Security+", "CompTIA", "https://www.comptia.org/certifications/security"),
        "weeks": 5, "cert": "Security+",
        "related": ["network security", "iam", "cloud"],
    },
    "network security": {
        "category": "Cybersecurity & Auth",
        "demand": 7, "salary_impact": 8, "trend": "stable",
        "blurb": "Firewalls, segmentation and zero-trust architecture.",
        "resource": ("Network Security Fundamentals", "TryHackMe", "https://tryhackme.com/path/outline/introtosecurity"),
        "weeks": 4, "cert": None,
        "related": ["cybersecurity", "linux", "cloud"],
    },
    "oauth": {
        "category": "Cybersecurity & Auth",
        "demand": 8, "salary_impact": 7, "trend": "stable",
        "blurb": "Secure authN/authZ (OAuth2, JWT, SSO) — expected in every platform role.",
        "resource": ("OAuth 2.0 & OpenID Connect", "Okta", "https://auth0.com/docs/get-started/authentication-and-authorization-flow"),
        "weeks": 2, "cert": None,
        "related": ["rest api", "security", "jwt"],
    },
    "jwt": {
        "category": "Cybersecurity & Auth",
        "demand": 7, "salary_impact": 4, "trend": "stable",
        "blurb": "Token-based session management for stateless APIs.",
        "resource": ("JWT Handbook", "Auth0", "https://jwt.io/introduction"),
        "weeks": 1, "cert": None,
        "related": ["oauth", "rest api", "security"],
    },
    "penetration testing": {
        "category": "Cybersecurity & Auth",
        "demand": 7, "salary_impact": 12, "trend": "high",
        "blurb": "Ethical hacking and OWASP Top 10 exploitation skills.",
        "resource": ("Web Security Academy", "PortSwigger", "https://portswigger.net/web-security"),
        "weeks": 6, "cert": "OSCP",
        "related": ["cybersecurity", "network security"],
    },

    # =========================================================================
    # DESIGN, PRODUCT & SOFT SKILLS
    # =========================================================================
    "figma": {
        "category": "Design, Product & Soft Skills",
        "demand": 8, "salary_impact": 5, "trend": "high",
        "blurb": "Collaborative design & prototyping; also expected of frontend engineers.",
        "resource": ("Figma Learn Design", "Figma", "https://www.figma.com/resources/learn-design/"),
        "weeks": 2, "cert": None,
        "related": ["ux design", "design systems", "css"],
    },
    "ux design": {
        "category": "Design, Product & Soft Skills",
        "demand": 8, "salary_impact": 7, "trend": "stable",
        "blurb": "User research, journey mapping and usability testing.",
        "resource": ("Google UX Design Certificate", "Coursera", "https://www.coursera.org/professional-certificates/google-ux-design"),
        "weeks": 6, "cert": "Google UX",
        "related": ["figma", "wireframing", "user research"],
    },
    "user research": {
        "category": "Design, Product & Soft Skills",
        "demand": 7, "salary_impact": 6, "trend": "stable",
        "blurb": "Interviews, surveys and usability studies grounding product decisions.",
        "resource": ("NN/g UX Research", "Nielsen Norman Group", "https://www.nngroup.com/topic/ux-research/"),
        "weeks": 3, "cert": None,
        "related": ["ux design", "data analysis"],
    },
    "design systems": {
        "category": "Design, Product & Soft Skills",
        "demand": 7, "salary_impact": 8, "trend": "high",
        "blurb": "Component libraries, tokens and governance — the design-engineering bridge.",
        "resource": ("Design Systems Course", "UX Collective", "https://www.designsystems.com/"),
        "weeks": 4, "cert": None,
        "related": ["figma", "css", "accessibility", "react"],
    },
    "project management": {
        "category": "Design, Product & Soft Skills",
        "demand": 7, "salary_impact": 6, "trend": "stable",
        "blurb": "Agile/Scrum delivery, stakeholder communication and roadmapping.",
        "resource": ("Google Project Management", "Coursera", "https://www.coursera.org/professional-certificates/google-project-management"),
        "weeks": 5, "cert": "PMP/CSM",
        "related": ["leadership", "communication", "agile"],
    },
    "agile": {
        "category": "Design, Product & Soft Skills",
        "demand": 8, "salary_impact": 3, "trend": "stable",
        "blurb": "Iterative delivery, scrum ceremonies and continuous improvement.",
        "resource": ("Scrum & Agile Fundamentals", "Scrum.org", "https://www.scrum.org/pathway/scrum-master"),
        "weeks": 2, "cert": "PSM I",
        "related": ["project management", "communication"],
    },
    "communication": {
        "category": "Design, Product & Soft Skills",
        "demand": 9, "salary_impact": 6, "trend": "stable",
        "blurb": "Technical writing, documentation and cross-team collaboration.",
        "resource": ("Writing Well for Engineers", "Google Tech Writing", "https://developers.google.com/tech-writing"),
        "weeks": 2, "cert": None,
        "related": ["leadership", "project management"],
    },
    "leadership": {
        "category": "Design, Product & Soft Skills",
        "demand": 8, "salary_impact": 12, "trend": "stable",
        "blurb": "Mentoring, technical direction and ownership — the staff/lead differentiator.",
        "resource": ("Engineering Leadership", "StaffEng", "https://staffeng.com/"),
        "weeks": 4, "cert": None,
        "related": ["communication", "project management", "system design"],
    },
    "testing": {
        "category": "Design, Product & Soft Skills",
        "demand": 8, "salary_impact": 5, "trend": "stable",
        "blurb": "Unit, integration, e2e and TDD habits raise code quality signals.",
        "resource": ("Test-Driven Development", "freeCodeCamp", "https://www.freecodecamp.org/news/test-driven-development/"),
        "weeks": 3, "cert": None,
        "related": ["ci/cd", "python", "javascript", "jest"],
    },
    "problem solving": {
        "category": "Design, Product & Soft Skills",
        "demand": 9, "salary_impact": 4, "trend": "stable",
        "blurb": "Structured algorithmic & systems thinking is assessed in nearly every technical screen.",
        "resource": ("NeetCode / LeetCode Patterns", "NeetCode", "https://neetcode.io/"),
        "weeks": 5, "cert": None,
        "related": ["system design", "data structures", "algorithms"],
    },
}


def get_skill_metadata(skill: str) -> Dict[str, Any]:
    """Resolve a skill (canonical or variant) to its taxonomy metadata."""
    key = skill.strip().lower().replace("-", " ").replace(".", "").replace("#", "")
    return SKILL_TAXONOMY.get(key, {})


def skill_category(skill: str) -> str:
    meta = get_skill_metadata(skill)
    return meta.get("category", "Other")


def skill_demand(skill: str) -> int:
    return get_skill_metadata(skill).get("demand", 5)


def skill_salary_impact(skill: str) -> int:
    return get_skill_metadata(skill).get("salary_impact", 5)


def skill_trend(skill: str) -> str:
    return get_skill_metadata(skill).get("trend", "stable")


def skill_resource(skill: str):
    return get_skill_metadata(skill).get("resource")


def skill_certification(skill: str):
    return get_skill_metadata(skill).get("cert")


def skill_weeks(skill: str) -> int:
    return get_skill_metadata(skill).get("weeks", 3)


def skill_blurb(skill: str) -> str:
    return get_skill_metadata(skill).get(
        "blurb",
        "Core competency required for the target role.",
    )


def skill_related(skill: str) -> list:
    return get_skill_metadata(skill).get("related", [])


def categories() -> list:
    """Sorted category list from the taxonomy."""
    seen = []
    for meta in SKILL_TAXONOMY.values():
        cat = meta["category"]
        if cat not in seen:
            seen.append(cat)
    return seen
