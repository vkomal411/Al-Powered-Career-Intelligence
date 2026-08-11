import re
import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger("career_platform")

# Optional import of sentence-transformers for vector embeddings
try:
    from sentence_transformers import SentenceTransformer, util
    EMBEDDING_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    HAS_SENTENCE_TRANSFORMERS = True
    logger.info("SentenceTransformer (all-MiniLM-L6-v2) initialized successfully.")
except Exception as e:
    EMBEDDING_MODEL = None
    HAS_SENTENCE_TRANSFORMERS = False
    logger.info("sentence-transformers not installed or disabled. Using fast TF-IDF vectorizer engine.")

# Fallback TF-IDF cosine calculation if sentence-transformers is not loaded
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

# Comprehensive skill keywords list for extraction
COMMON_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "golang", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r", "dart", "perl", "bash", "shell", "powershell",
    
    # Web & Frameworks
    "react", "reactjs", "react.js", "next.js", "nextjs", "vue", "vuejs", "angular", "svelte",
    "node.js", "nodejs", "express", "express.js", "django", "fastapi", "flask", "spring boot",
    "spring", "asp.net", "laravel", "rails", "ruby on rails", "html", "html5", "css", "css3",
    "tailwind", "tailwindcss", "bootstrap", "graphql", "rest api", "restful api", "rest",
    "microservices", "web apis", "grpc", "redux", "webpack", "vite", "babel",
    
    # UI/UX & Design
    "figma", "user research", "wireframing", "design systems", "usability testing", "prototyping",
    "interactive prototyping", "wcag", "wcag 2.1", "accessibility", "user journey mapping",
    "information architecture", "storybook", "design tokens", "micro-interactions", "ui design", "ux design",
    
    # Databases & Caching
    "sql", "nosql", "postgresql", "postgres", "mysql", "mongodb", "mongo", "redis", "elasticsearch",
    "cassandra", "dynamodb", "sqlite", "oracle", "mariadb", "snowflake", "bigquery", "memcached",
    
    # Cloud & DevOps
    "docker", "kubernetes", "k8s", "aws", "amazon web services", "azure", "gcp", "google cloud",
    "terraform", "ansible", "jenkins", "git", "github", "gitlab", "bitbucket", "ci/cd", "devops",
    "linux", "unix", "nginx", "apache", "helm", "cloudformation", "prometheus", "grafana",
    
    # Data Science & AI/ML
    "machine learning", "deep learning", "nlp", "natural language processing", "data science",
    "pandas", "numpy", "tensorflow", "pytorch", "scikit-learn", "sklearn", "keras", "opencv",
    "data analysis", "data analytics", "tableau", "power bi", "excel", "spark", "apache spark",
    "hadoop", "airflow", "dbt", "llm", "genai", "artificial intelligence", "ai", "ml", "rag", "rag architecture",
    
    # Methodologies & Tools
    "agile", "scrum", "kanban", "jira", "confluence", "trello", "unit testing", "testing",
    "jest", "cypress", "selenium", "pytest", "mocha", "system design", "architecture",
    "api design", "security", "cybersecurity", "oauth", "jwt", "problem solving",
    "communication", "leadership", "project management"
}


def _format_skill_name(skill: str) -> str:
    s_lower = skill.lower().strip()
    if s_lower in ("html", "css", "html5", "css3", "sql", "aws", "gcp", "nlp", "llm", "ai", "ml", "api", "rest api", "ci/cd", "jwt", "rag"):
        return s_lower.upper()
    elif s_lower in ("wcag", "wcag 2.1", "wcag 2"):
        return "WCAG 2.1"
    elif s_lower in ("javascript", "js"):
        return "JavaScript"
    elif s_lower in ("typescript", "ts"):
        return "TypeScript"
    elif s_lower in ("react", "reactjs", "react.js"):
        return "React"
    elif s_lower in ("next.js", "nextjs"):
        return "Next.js"
    elif s_lower in ("node.js", "nodejs"):
        return "Node.js"
    elif s_lower == "figma":
        return "Figma"
    elif s_lower == "user research":
        return "User Research"
    elif s_lower == "wireframing":
        return "Wireframing"
    elif s_lower in ("design systems", "design system"):
        return "Design Systems"
    elif s_lower == "usability testing":
        return "Usability Testing"
    elif s_lower in ("prototyping", "interactive prototyping"):
        return "Interactive Prototyping"
    elif s_lower == "c++":
        return "C++"
    elif s_lower == "c#":
        return "C#"
    elif s_lower in ("postgresql", "postgres"):
        return "PostgreSQL"
    elif s_lower == "mongodb":
        return "MongoDB"
    elif s_lower == "fastapi":
        return "FastAPI"
    elif s_lower == "docker":
        return "Docker"
    elif s_lower in ("kubernetes", "k8s"):
        return "Kubernetes"
    elif s_lower == "python":
        return "Python"
    elif s_lower == "java":
        return "Java"
    elif s_lower in ("git", "github", "gitlab"):
        return skill.capitalize() if skill.lower() != "github" else "GitHub"
    return skill.title() if len(skill) <= 4 else skill.capitalize()


def extract_jd_skills(text: str) -> List[str]:
    """Extracts known skill keywords and technical requirements from job description text."""
    if not text or not text.strip():
        return []

    lower_text = text.lower()
    found = []

    # 1. Match against known common skills
    for skill in COMMON_SKILLS:
        pattern = r"(?<!\w)" + re.escape(skill) + r"(?!\w)"
        if re.search(pattern, lower_text):
            found.append(_format_skill_name(skill))

    # 2. Extract requirement phrases (e.g. "Experience with X", "Proficiency in Y")
    patterns = [
        r"(?:experience (?:with|in)|proficient (?:with|in)|knowledge of|skills in|familiarity with)\s+([A-Za-z0-9#\+\.\-\s]{2,30})(?=[,;\.\n\)]|$)",
    ]
    for p in patterns:
        matches = re.findall(p, text, re.IGNORECASE)
        for m in matches:
            cleaned = m.strip()
            words = cleaned.split()
            if 1 <= len(words) <= 3 and len(cleaned) <= 25:
                if not cleaned.lower().startswith(("the ", "a ", "an ", "and ", "or ", "our ", "your ")):
                    found.append(_format_skill_name(cleaned))

    return sorted(list(set(found)))


# Simple LRU cache for sentence transformer embeddings to prevent re-computation
_EMBEDDING_CACHE: Dict[int, Any] = {}

def get_text_embedding(text: str):
    """Computes or retrieves cached vector embedding for a text string."""
    if not HAS_SENTENCE_TRANSFORMERS or EMBEDDING_MODEL is None or not text.strip():
        return None
    
    text_hash = hash(text.strip())
    if text_hash in _EMBEDDING_CACHE:
        return _EMBEDDING_CACHE[text_hash]
    
    try:
        emb = EMBEDDING_MODEL.encode(text, convert_to_tensor=True)
        # Keep cache bounded to 1000 items
        if len(_EMBEDDING_CACHE) > 1000:
            _EMBEDDING_CACHE.clear()
        _EMBEDDING_CACHE[text_hash] = emb
        return emb
    except Exception as e:
        logger.warning("Error encoding text embedding: %s", e)
        return None

def compute_semantic_similarity(text1: str, text2: str) -> float:
    """Computes semantic similarity score (0.0 to 1.0) between two text blocks."""
    if not text1.strip() or not text2.strip():
        return 0.0

    if HAS_SENTENCE_TRANSFORMERS and EMBEDDING_MODEL is not None:
        try:
            emb1 = get_text_embedding(text1)
            emb2 = get_text_embedding(text2)
            if emb1 is not None and emb2 is not None:
                score = float(util.cos_sim(emb1, emb2)[0][0])
                return max(0.0, min(1.0, score))
        except Exception as e:
            logger.warning("Error computing sentence-transformers embedding: %s", e)

    if HAS_SKLEARN:
        try:
            vectorizer = TfidfVectorizer(stop_words="english")
            tfidf = vectorizer.fit_transform([text1, text2])
            matrix = cosine_similarity(tfidf[0:1], tfidf[1:2])
            return float(matrix[0][0])
        except Exception as e:
            logger.warning("Error computing TF-IDF cosine similarity: %s", e)

    # Basic word overlap fallback
    words1 = set(re.findall(r"\w+", text1.lower()))
    words2 = set(re.findall(r"\w+", text2.lower()))
    if not words1 or not words2:
        return 0.0
    intersection = words1.intersection(words2)
    return len(intersection) / max(len(words1), len(words2))


def analyze_job_match(resume_text: str, candidate_skills: List[str], job_description: str, job_title: str = "") -> Dict[str, Any]:
    """
    Performs full AI job matching analysis between candidate resume & job description.
    Returns scores, matched skills, missing skills, categorized strengths, and actionable recommendations.
    """
    jd_skills = extract_jd_skills(job_description)

    # Also extract skills present directly in candidate's resume text
    resume_skills = extract_jd_skills(resume_text) if resume_text else []
    all_candidate_skills = list(set((candidate_skills or []) + resume_skills))
    c_skills_lower = set([s.lower() for s in all_candidate_skills])

    matched_skills = []
    missing_skills = []

    for s in jd_skills:
        s_lower = s.lower()
        if s_lower in c_skills_lower or (resume_text and re.search(r"(?<!\w)" + re.escape(s_lower) + r"(?!\w)", resume_text.lower())):
            matched_skills.append(s)
        else:
            missing_skills.append(s)

    # Fallback: if jd_skills was empty but job_description has text, extract capitalized technical words
    if not jd_skills and job_description.strip():
        capitalized_words = set(re.findall(r"\b[A-Z][a-zA-Z0-9\+#\.]+\b", job_description))
        stop_words = {"The", "A", "An", "In", "On", "With", "For", "To", "Of", "And", "Or", "We", "You", "Our", "Your", "Job", "Role", "Must", "Have", "Required", "Requirements", "Responsibilities", "Experience", "Skills", "Team", "Work", "Company"}
        fallback = sorted(list(capitalized_words - stop_words))[:10]
        for s in fallback:
            if s.lower() in c_skills_lower or (resume_text and re.search(r"(?<!\w)" + re.escape(s.lower()) + r"(?!\w)", resume_text.lower())):
                matched_skills.append(_format_skill_name(s))
            else:
                missing_skills.append(_format_skill_name(s))

    matched_skills = sorted(list(set(matched_skills)))
    missing_skills = sorted(list(set(missing_skills)))

    # Calculate semantic similarity
    full_candidate_context = f"{resume_text}\nSkills: {', '.join(all_candidate_skills)}"
    sem_sim = compute_semantic_similarity(full_candidate_context, job_description)

    # Calculate skill match ratio
    total_jd_skills = len(matched_skills) + len(missing_skills)
    skill_ratio = (len(matched_skills) / max(total_jd_skills, 1)) if total_jd_skills > 0 else sem_sim

    # Weighted Overall Score (60% semantic similarity + 40% explicit skill match ratio)
    overall_raw = (sem_sim * 0.6 + skill_ratio * 0.4) * 100
    overall_score = max(10, min(98, round(overall_raw)))

    # Categorized Strengths
    strengths = []
    if matched_skills:
        strengths.append(f"Technical Skill Overlap: Validated core required skills ({', '.join(matched_skills[:5])}).")
    if sem_sim >= 0.60:
        strengths.append("Contextual & Responsibility Fit: Strong alignment between work experience and target job duties.")
    elif sem_sim >= 0.40:
        strengths.append("Domain Relevance: Moderate alignment with responsibilities outlined in the job description.")
    else:
        strengths.append("Base Profile Alignment: Core profile credentials and experience detected.")

    # Actionable Recommendations
    recommendations = []
    if missing_skills:
        recommendations.append(f"Add Missing Core Skills: Include missing keywords in your skills section ({', '.join(missing_skills[:4])}).")
    if sem_sim < 0.6:
        recommendations.append("Echo Action Verbs: Rephrase work experience bullet points using action verbs from the job description.")
    recommendations.append("Quantify Achievement Metrics: Add measurable metrics (percentages, team sizes, revenue, performance gains).")
    recommendations.append("Headline & Summary Alignment: Ensure your resume summary explicitly contains the target job title.")

    return {
        "overall_score": overall_score,
        "semantic_similarity": round(sem_sim, 3),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "strengths": strengths,
        "recommendations": recommendations,
    }
