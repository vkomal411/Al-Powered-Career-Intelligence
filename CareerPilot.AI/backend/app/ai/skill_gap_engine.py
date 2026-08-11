"""
CareerPilot.AI Skill Gap Analysis Engine v2.

Ontology-driven redesign replacing the keyword-only matcher. The engine:

  1. Resolves free-form skill mentions to a canonical skill ontology
     (the taxonomy in ``app.ai.skill_taxonomy``) via aliases, normalization
     and containment fallbacks.
  2. Infers proficiency per skill from resume text signals (mentions,
     years-of-experience phrases, certifications, explicit profile skills).
  3. Computes market-weighted gap priorities using taxonomy demand,
     salary impact and demand trend (emerging > high > stable).
  4. Produces a readiness score, category breakdown, a dependency-aware
     learning roadmap and generated insights & certifications.
"""

import logging
import re
from typing import Any, Dict, List, Optional

from app.ai.skill_taxonomy import (
    SKILL_TAXONOMY,
    skill_blurb,
    skill_category,
    skill_certification,
    skill_demand,
    skill_related,
    skill_resource,
    skill_salary_impact,
    skill_trend,
    skill_weeks,
    categories as taxonomy_categories,
)
from app.ai.vector_matcher import extract_jd_skills, compute_semantic_similarity

logger = logging.getLogger("career_platform")

TREND_BOOST = {"emerging": 1.0, "high": 0.6, "stable": 0.2}

# ---------------------------------------------------------------------------
# Skill resolution: aliases + normalized taxonomy index
# ---------------------------------------------------------------------------

SKILL_ALIASES: Dict[str, str] = {
    # Languages
    "js": "javascript",
    "reactjs": "react",
    "react js": "react",
    "react.js": "react",
    "ts": "typescript",
    "py": "python",
    "golang": "go",
    "nodejs": "node.js",
    "node js": "node.js",
    "node": "node.js",
    "expressjs": "express",
    "nextjs": "next.js",
    "next js": "next.js",
    "vuejs": "vue",
    "tailwindcss": "tailwind",
    "tailwind css": "tailwind",
    # Databases
    "postgres": "postgresql",
    "pg": "postgresql",
    "mongo": "mongodb",
    "mongo db": "mongodb",
    "sql server": "postgresql",
    # AI / ML / Data
    "ml": "machine learning",
    "machinelearning": "machine learning",
    "ai": "machine learning",
    "artificial intelligence": "machine learning",
    "data science": "machine learning",
    "data scientist": "machine learning",
    "dl": "deep learning",
    "sklearn": "machine learning",
    "scikit learn": "machine learning",
    "keras": "machine learning",
    "genai": "llm",
    "generative ai": "llm",
    "llms": "llm",
    "llmops": "llm",
    "gpt": "llm",
    "power bi": "data analysis",
    "excel": "data analysis",
    # Cloud & DevOps
    "k8s": "kubernetes",
    "kube": "kubernetes",
    "helm": "kubernetes",
    "devops": "ci/cd",
    "cicd": "ci/cd",
    "github actions": "ci/cd",
    "sre": "observability",
    "amazon web services": "aws",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "microsoft azure": "azure",
    # APIs & Architecture
    "rest": "rest api",
    "restful": "rest api",
    "restful api": "rest api",
    "rest apis": "rest api",
    "api": "rest api",
    "web api": "rest api",
    "microservice": "microservices",
    "system architecture": "system design",
    "architecture": "system design",
    # Security
    "security": "cybersecurity",
    "security engineering": "cybersecurity",
    "appsec": "cybersecurity",
    # Methods & Soft
    "unit testing": "testing",
    "qa": "testing",
    "scrum": "agile",
    "communication skills": "communication",
    "ux": "ux design",
    "ui": "ux design",
    "ui design": "ux design",
    "visual design": "ux design",
    "prototyping": "ux design",
    "wireframing": "ux design",
    "figma design": "figma",
}

DISPLAY_NAMES: Dict[str, str] = {
    "python": "Python", "javascript": "JavaScript", "typescript": "TypeScript",
    "java": "Java", "go": "Go", "c++": "C++", "rust": "Rust", "sql": "SQL",
    "bash": "Bash", "node.js": "Node.js", "express": "Express", "fastapi": "FastAPI",
    "django": "Django", "flask": "Flask", "spring boot": "Spring Boot",
    "graphql": "GraphQL", "rest api": "REST API", "microservices": "Microservices",
    "system design": "System Design", "git": "Git", "swagger": "Swagger",
    "react": "React", "next.js": "Next.js", "vue": "Vue", "angular": "Angular",
    "html": "HTML", "css": "CSS", "tailwind": "Tailwind CSS",
    "accessibility": "Accessibility", "jest": "Jest",
    "machine learning": "Machine Learning", "deep learning": "Deep Learning",
    "pytorch": "PyTorch", "tensorflow": "TensorFlow", "pandas": "Pandas",
    "nlp": "NLP", "llm": "LLM", "rag": "RAG", "vector database": "Vector Database",
    "data analysis": "Data Analysis", "statistics": "Statistics", "tableau": "Tableau",
    "excel": "Excel", "aws": "AWS", "azure": "Azure", "gcp": "GCP",
    "docker": "Docker", "kubernetes": "Kubernetes", "terraform": "Terraform",
    "ci/cd": "CI/CD", "linux": "Linux", "observability": "Observability",
    "serverless": "Serverless", "mlops": "MLOps", "postgresql": "PostgreSQL",
    "mongodb": "MongoDB", "redis": "Redis", "database design": "Database Design",
    "cybersecurity": "Cybersecurity", "network security": "Network Security",
    "oauth": "OAuth", "jwt": "JWT", "penetration testing": "Penetration Testing",
    "figma": "Figma", "ux design": "UX Design", "user research": "User Research",
    "design systems": "Design Systems", "project management": "Project Management",
    "agile": "Agile", "communication": "Communication", "leadership": "Leadership",
    "testing": "Testing", "problem solving": "Problem Solving",
}


def _normalize_skill(skill: str) -> str:
    """Lowercase + strip punctuation so taxonomy keys and variants align."""
    if not skill:
        return ""
    return re.sub(
        r"\s+", " ",
        skill.strip().lower().replace("-", " ").replace(".", "").replace("#", "").replace("/", " "),
    )


_TAXONOMY_INDEX: Optional[Dict[str, str]] = None


def _build_taxonomy_index() -> Dict[str, str]:
    """Maps every normalized form of each taxonomy key back to its canonical key."""
    global _TAXONOMY_INDEX
    if _TAXONOMY_INDEX is not None:
        return _TAXONOMY_INDEX
    index: Dict[str, str] = {}
    for key in SKILL_TAXONOMY:
        norm = _normalize_skill(key)
        index[norm] = key
        for variant in SKILL_ALIASES:
            if SKILL_ALIASES[variant] == key:
                index[_normalize_skill(variant)] = key
    _TAXONOMY_INDEX = index
    return index


def resolve_skill(skill: str) -> Optional[str]:
    """Resolve a free-form skill mention to a canonical taxonomy key (or None)."""
    if not skill:
        return None
    norm = _normalize_skill(skill)
    if not norm:
        return None

    index = _build_taxonomy_index()

    # 1. Exact normalized match (covers direct taxonomy keys + aliases)
    if norm in index:
        return index[norm]

    # 2. Containment fallback for verbose mentions
    #    e.g. "machine learning models" -> "machine learning"
    for canon_norm, canon_key in index.items():
        if not canon_norm or len(canon_norm) < 3:
            continue
        if canon_norm in norm:
            return canon_key
        if norm in canon_norm and len(norm) >= 4:
            return canon_key

    return None


def resolve_skills(skills: Optional[List[str]]) -> List[str]:
    """Resolve a list of skill mentions, deduplicated, order preserved."""
    resolved: List[str] = []
    seen = set()
    for s in skills or []:
        key = resolve_skill(s)
        if key and key not in seen:
            seen.add(key)
            resolved.append(key)
    return resolved


def display_name(key: str) -> str:
    if key in DISPLAY_NAMES:
        return DISPLAY_NAMES[key]
    return key.title()


# ---------------------------------------------------------------------------
# Role profiles: structured requirements per archetype
# ---------------------------------------------------------------------------

ROLE_PROFILES: List[Dict[str, Any]] = [
    {
        "title": "Senior Full Stack Software Engineer",
        "keywords": ["full stack", "fullstack", "full-stack", "senior software engineer", "software engineer"],
        "skills": {
            "javascript": 3, "typescript": 4, "react": 4, "next.js": 3,
            "node.js": 4, "python": 3, "rest api": 3, "sql": 3,
            "postgresql": 3, "docker": 2, "git": 2, "system design": 3,
            "testing": 2, "ci/cd": 2, "aws": 2, "microservices": 2,
        },
    },
    {
        "title": "Backend Python / FastAPI Engineer",
        "keywords": ["backend", "fastapi", "python engineer", "backend engineer"],
        "skills": {
            "python": 5, "fastapi": 4, "rest api": 4, "sql": 4,
            "postgresql": 4, "docker": 3, "redis": 2, "testing": 2,
            "system design": 2, "git": 2, "microservices": 2, "ci/cd": 2,
            "aws": 2, "oauth": 2,
        },
    },
    {
        "title": "Frontend React / Next.js Developer",
        "keywords": ["frontend", "front-end", "front end", "react developer", "next.js developer", "ui engineer"],
        "skills": {
            "javascript": 4, "typescript": 5, "react": 5, "next.js": 4,
            "html": 4, "css": 4, "tailwind": 3, "accessibility": 2,
            "testing": 2, "rest api": 2, "design systems": 2, "git": 2,
        },
    },
    {
        "title": "Data Scientist & AI Specialist",
        "keywords": ["data scientist", "data science", "ai specialist", "analytics"],
        "skills": {
            "python": 5, "sql": 4, "statistics": 4, "pandas": 3,
            "machine learning": 5, "data analysis": 3, "tableau": 2,
            "nlp": 2, "git": 2, "communication": 2,
        },
    },
    {
        "title": "Machine Learning & LLM Engineer",
        "keywords": ["machine learning engineer", "ml engineer", "llm engineer", "ai engineer", "mlops engineer", "deep learning"],
        "skills": {
            "python": 5, "machine learning": 5, "deep learning": 4,
            "pytorch": 4, "nlp": 3, "llm": 4, "rag": 3,
            "vector database": 2, "docker": 2, "fastapi": 3, "aws": 2,
            "mlops": 2, "sql": 2, "statistics": 2,
        },
    },
    {
        "title": "DevOps & Cloud Security Engineer",
        "keywords": ["devops", "cloud engineer", "cloud security", "site reliability", "platform engineer"],
        "skills": {
            "linux": 4, "bash": 3, "docker": 4, "kubernetes": 4,
            "terraform": 3, "ci/cd": 4, "aws": 4, "observability": 3,
            "python": 2, "git": 3, "network security": 2, "cybersecurity": 2,
            "microservices": 2,
        },
    },
    {
        "title": "Kubernetes & Cloud Infrastructure Lead",
        "keywords": ["kubernetes", "infrastructure", "sre", "cloud architect"],
        "skills": {
            "kubernetes": 5, "docker": 4, "terraform": 4, "aws": 4,
            "linux": 4, "observability": 4, "ci/cd": 3, "system design": 3,
            "bash": 3, "serverless": 2, "microservices": 3, "redis": 2,
        },
    },
    {
        "title": "UI/UX & Design Systems Engineer",
        "keywords": ["ui/ux", "ux designer", "ui designer", "product designer", "design engineer", "design systems"],
        "skills": {
            "figma": 5, "ux design": 4, "user research": 3, "design systems": 4,
            "html": 3, "css": 3, "accessibility": 4, "communication": 3,
            "javascript": 2, "project management": 2,
        },
    },
    {
        "title": "Product Manager & Technical Lead",
        "keywords": ["product manager", "technical lead", "engineering manager", "project manager", "tpm"],
        "skills": {
            "project management": 5, "communication": 5, "leadership": 4,
            "agile": 4, "system design": 2, "data analysis": 3,
            "statistics": 2, "figma": 2, "user research": 3, "sql": 2,
        },
    },
    {
        "title": "Cybersecurity Engineer",
        "keywords": ["cyber", "security engineer", "penetration", "soc", "infosec", "information security"],
        "skills": {
            "cybersecurity": 5, "network security": 4, "penetration testing": 4,
            "linux": 3, "oauth": 3, "jwt": 2, "bash": 2, "python": 2,
            "aws": 2, "cloud": 1, "communication": 2,
        },
    },
    {
        "title": "Data Analyst",
        "keywords": ["data analyst", "business intelligence", "analyst", "bi developer"],
        "skills": {
            "sql": 5, "excel": 5, "data analysis": 5, "statistics": 3,
            "tableau": 3, "python": 3, "pandas": 2, "postgresql": 2,
            "communication": 3,
        },
    },
    {
        "title": "Mobile Developer",
        "keywords": ["mobile", "ios", "android", "react native", "flutter"],
        "skills": {
            "javascript": 3, "typescript": 3, "react": 3, "rest api": 3,
            "testing": 2, "git": 2, "figma": 2, "aws": 1, "accessibility": 2,
        },
    },
]

GENERIC_PROFILE: Dict[str, Any] = ROLE_PROFILES[0]


def resolve_role_profile(target_role: str) -> Optional[Dict[str, Any]]:
    """Best-matching role profile for a free-form target role string."""
    tl = target_role.lower().strip()
    best: Optional[Dict[str, Any]] = None
    best_score = 0
    for profile in ROLE_PROFILES:
        score = 0
        for kw in profile["keywords"]:
            if kw in tl:
                score += 2
        for word in profile["title"].lower().split():
            if len(word) > 3 and word in tl:
                score += 1
        if score > best_score:
            best = profile
            best_score = score
    return best if best_score > 0 else None


# ---------------------------------------------------------------------------
# Proficiency inference
# ---------------------------------------------------------------------------

def _mention_count(resume_text: str, key: str) -> int:
    if not resume_text:
        return 0
    text = resume_text.lower()
    terms = {_normalize_skill(key), display_name(key).lower()}
    count = 0
    for term in terms:
        if term:
            count += len(re.findall(re.escape(term), text))
    return count


def _year_signal(resume_text: str, key: str) -> bool:
    """Detect a 'X years' phrase adjacent to the skill mention."""
    if not resume_text:
        return False
    text = resume_text.lower()
    variants = {_normalize_skill(key), display_name(key).lower()}
    for v in variants:
        if not v:
            continue
        esc = re.escape(v)
        after = rf"{esc}[\w\s,;&\-]{{0,90}}\d{{1,2}}\+?\s*(?:years|yrs)"
        before = rf"\d{{1,2}}\+?\s*(?:years|yrs)[\w\s,;&\-]{{0,90}}{esc}"
        if re.search(after, text) or re.search(before, text):
            return True
    return False


def _cert_signal(resume_text: str, key: str) -> bool:
    cert = skill_certification(key)
    if not cert or not resume_text:
        return False
    return cert.lower() in resume_text.lower()


def _infer_proficiency(key: str, resume_text: str, held: set) -> float:
    """Return 0.0-1.0 proficiency estimate for a held skill."""
    if key not in held:
        return 0.0
    score = 0.5
    mentions = _mention_count(resume_text, key)
    score += min(0.15, 0.05 * mentions)
    if _year_signal(resume_text, key):
        score += 0.2
    if _cert_signal(resume_text, key):
        score += 0.1
    return min(1.0, max(0.0, score))


def _proficiency_label(proficiency: float) -> str:
    if proficiency >= 0.85:
        return "Expert"
    if proficiency >= 0.7:
        return "Advanced"
    if proficiency >= 0.55:
        return "Proficient"
    if proficiency >= 0.4:
        return "Intermediate"
    if proficiency >= 0.2:
        return "Beginner"
    return "Missing"


# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

def _priority(demand: int, salary_impact: int, trend: str) -> int:
    """Market-weighted 0-100 priority: demand + salary impact + trend momentum."""
    boost = TREND_BOOST.get(trend, 0.2)
    score = (demand / 10.0) * 45 + (salary_impact / 15.0) * 30 + boost * 25
    return max(0, min(100, round(score)))


def _readiness_level(score: int) -> str:
    if score >= 80:
        return "Strong Match"
    if score >= 60:
        return "Good Progress"
    if score >= 40:
        return "Building Foundations"
    if score >= 20:
        return "Early Stage"
    return "Getting Started"


def _resource_dict(key: str) -> Optional[Dict[str, str]]:
    res = skill_resource(key)
    if not res:
        return None
    title, provider, url = res
    return {"title": title, "provider": provider, "url": url}


# ---------------------------------------------------------------------------
# Main engine
# ---------------------------------------------------------------------------

def analyze_skill_gaps(
    target_role: str,
    job_description: str = "",
    candidate_skills: Optional[List[str]] = None,
    resume_text: str = "",
    experience_level: str = "mid_level",
) -> Dict[str, Any]:
    """Run the full ontology-driven skill gap analysis.

    Returns a structured dict (serializable via ``SkillGapAnalysisResponse``)
    containing readiness, per-skill status, category breakdown, roadmap,
    insights, next actions and recommended certifications.
    """
    role_title = (target_role or "Senior Software Engineer").strip()
    profile = resolve_role_profile(role_title)
    exp_bump = {"senior": 3, "mid_level": 0, "entry_level": -2}.get(
        (experience_level or "mid_level").lower(), 0
    )

    # --- Required skill set -------------------------------------------------
    required: Dict[str, int] = {}
    if profile:
        required.update(profile["skills"])

    jd_keys: List[str] = []
    if job_description and job_description.strip():
        jd_keys = resolve_skills(extract_jd_skills(job_description))
        for k in jd_keys:
            required[k] = max(required.get(k, 0), 3)

    if not required:
        required.update(GENERIC_PROFILE["skills"])
        profile = GENERIC_PROFILE

    if jd_keys and profile is not None and profile_used(profile, role_title):
        source = "hybrid"
    elif jd_keys:
        source = "job_description"
    elif profile is not None and profile_used(profile, role_title):
        source = "profile"
    else:
        source = "profile"

    # --- Candidate held skills ----------------------------------------------
    held = set(resolve_skills(candidate_skills))

    # --- Build per-skill evaluation ------------------------------------------
    evaluated_keys = list(required.keys())
    for k in held:
        if k not in evaluated_keys:
            evaluated_keys.append(k)

    def _item(key: str, is_required: bool) -> Dict[str, Any]:
        demand = skill_demand(key)
        salary_impact = skill_salary_impact(key)
        trend = skill_trend(key)
        if key in held:
            status = "strength"
            prof = _infer_proficiency(key, resume_text, held)
        else:
            related = skill_related(key)
            if any(r in held for r in related):
                status = "partial"
                prof = 0.35
            else:
                status = "gap"
                prof = 0.0
        return {
            "skill": display_name(key),
            "key": key,
            "category": skill_category(key),
            "status": status,
            "proficiency": round(prof, 2),
            "proficiency_label": _proficiency_label(prof) if status == "strength" else status.title(),
            "demand": demand,
            "salary_impact": salary_impact,
            "trend": trend,
            "priority": 0 if status == "strength" else _priority(demand, salary_impact, trend),
            "weeks_to_learn": skill_weeks(key),
            "blurb": skill_blurb(key),
            "resource": _resource_dict(key),
            "certification": skill_certification(key),
            "related": [display_name(r) for r in skill_related(key)],
            "source": "profile" if is_required else "candidate",
            "is_required": is_required,
        }

    items = [_item(k, k in required) for k in evaluated_keys]

    # --- Readiness score ------------------------------------------------------
    total_weight = 0.0
    weighted = 0.0
    for item in items:
        if not item["is_required"]:
            continue
        key = item["key"]
        weight = required[key]
        total_weight += weight
        if item["status"] == "strength":
            weighted += weight * item["proficiency"]
        elif item["status"] == "partial":
            weighted += weight * 0.35
    readiness = round((weighted / total_weight * 100) if total_weight else 0)
    readiness = max(0, min(100, readiness + exp_bump))

    # --- Sort evaluated items ------------------------------------------------
    order = {"gap": 0, "partial": 1, "strength": 2}
    items.sort(key=lambda i: (order[i["status"]], -i["priority"], -i["demand"]))

    strengths = [i["skill"] for i in items if i["status"] == "strength"]
    partials = [i["skill"] for i in items if i["status"] == "partial"]
    gaps = [i["skill"] for i in items if i["status"] == "gap"]
    gap_items = [i for i in items if i["status"] == "gap"]
    partial_items = [i for i in items if i["status"] == "partial"]

    # --- Category breakdown -----------------------------------------------------
    categories: List[Dict[str, Any]] = []
    cat_order = {c: idx for idx, c in enumerate(taxonomy_categories())}
    cat_map: Dict[str, List[Dict[str, Any]]] = {}
    for item in items:
        cat_map.setdefault(item["category"], []).append(item)
    for cat, members in cat_map.items():
        req_members = [m for m in members if m["is_required"]]
        if req_members:
            cat_weighted = sum(required[m["key"]] * m["proficiency"] for m in req_members)
            cat_total = sum(required[m["key"]] for m in req_members)
            cat_readiness = round(cat_weighted / cat_total * 100) if cat_total else 0
        else:
            cat_readiness = 0
        top_gap = None
        for m in members:
            if m["status"] in ("gap", "partial"):
                top_gap = m["skill"]
                break
        categories.append({
            "category": cat,
            "readiness": cat_readiness,
            "total": len(members),
            "strengths": sum(1 for m in members if m["status"] == "strength"),
            "partials": sum(1 for m in members if m["status"] == "partial"),
            "gaps": sum(1 for m in members if m["status"] == "gap"),
            "top_gap": top_gap,
        })
    categories.sort(key=lambda c: (cat_order.get(c["category"], 999), c["category"]))

    # --- Roadmap (market-prioritized, dependency-aware) -------------------------
    roadmap: List[Dict[str, Any]] = []
    if gap_items:
        roadmap_items = gap_items
        phases = [
            ("Core Foundations", "Closing the highest-priority prerequisites first so later skills compound."),
            ("Core Competencies", "Round out the responsibilities employers screen for most."),
            ("Market Edge & Senior Signals", "High-leverage, high-salary skills that differentiate you."),
        ]
        chunk = 4
        for idx, start in enumerate(range(0, len(roadmap_items), chunk)):
            group = roadmap_items[start:start + chunk]
            if not group:
                continue
            order = idx + 1
            title, focus = phases[min(idx, len(phases) - 1)]
            total_weeks = sum(m["weeks_to_learn"] for m in group)
            must_have = any(m["demand"] >= 9 for m in group)
            roadmap.append({
                "order": order,
                "title": f"Phase {order} · {title}",
                "focus_area": focus,
                "duration_weeks": total_weeks,
                "priority": "must_have" if must_have else "should_have",
                "goal": (
                    f"Build {len(group)} high-demand {'skill' if len(group) == 1 else 'skills'} "
                    f"({', '.join(m['skill'] for m in group[:3])}) to close the most impactful "
                    f"gaps for {role_title}."
                ),
                "skills": [
                    {
                        "skill": m["skill"],
                        "demand": m["demand"],
                        "salary_impact": m["salary_impact"],
                        "trend": m["trend"],
                        "weeks_to_learn": m["weeks_to_learn"],
                        "why_it_matters": m["blurb"],
                        "resource": m["resource"],
                        "certification": m["certification"],
                    }
                    for m in group
                ],
            })
    elif partial_items:
        total_weeks = sum(m["weeks_to_learn"] for m in partial_items)
        roadmap.append({
            "order": 1,
            "title": "Phase 1 · Convert Adjacent Skills",
            "focus_area": "You already hold related skills — formalize them to fully satisfy requirements.",
            "duration_weeks": total_weeks,
            "priority": "should_have",
            "goal": f"Strengthen {len(partial_items)} adjacent skills to full requirements for {role_title}.",
            "skills": [
                {
                    "skill": m["skill"],
                    "demand": m["demand"],
                    "salary_impact": m["salary_impact"],
                    "trend": m["trend"],
                    "weeks_to_learn": m["weeks_to_learn"],
                    "why_it_matters": m["blurb"],
                    "resource": m["resource"],
                    "certification": m["certification"],
                }
                for m in partial_items
            ],
        })

    # --- Certifications ---------------------------------------------------------
    certs: Dict[str, Dict[str, Any]] = {}
    for item in gap_items + partial_items:
        cert = item["certification"]
        if not cert:
            continue
        priority = "must_have" if item["demand"] >= 9 else "should_have"
        if cert not in certs:
            certs[cert] = {
                "name": cert,
                "skill": item["skill"],
                "priority": priority,
                "reason": f"Validates {item['skill']}, a key requirement for {role_title}.",
            }
    certifications = sorted(
        certs.values(), key=lambda c: (c["priority"] != "must_have", c["name"])
    )

    # --- Insights ----------------------------------------------------------------
    insights: List[str] = []
    req_count = len([i for i in items if i["is_required"]])
    insights.append(
        f"You currently match {len(strengths)} of {req_count} required skills for "
        f"{role_title} — a {readiness}/100 readiness score ({_readiness_level(readiness)})."
    )
    if gap_items:
        top_gap = gap_items[0]
        insights.append(
            f"Highest-impact gap: {top_gap['skill']} — rated {top_gap['demand']}/10 market demand "
            f"with ~{top_gap['salary_impact']}% salary impact, currently "
            f"{top_gap['trend'].title()} demand."
        )
        rising = [m for m in gap_items if m["trend"] in ("emerging", "high")]
        if rising:
            insights.append(
                f"Market pulse: {len(rising)} of your gaps are "
                f"{'emerging' if any(m['trend'] == 'emerging' for m in rising) else 'high-demand'} "
                f"skills worth prioritizing in 2026."
            )
    if partials:
        insights.append(
            f"You hold related skills for {len(partials)} requirement(s) — close those gaps fastest "
            f"by formalizing ({', '.join(partials[:3])})."
        )
    if strengths:
        insights.append(
            f"Strongest anchors: {', '.join(strengths[:3])}. Lean into these in your summary "
            f"and interview framing."
        )

    # --- Next actions -------------------------------------------------------------
    next_actions: List[str] = []
    for m in (gap_items + partial_items)[:3]:
        res = m["resource"]
        if res:
            next_actions.append(
                f"Learn {m['skill']}: {res['title']} ({res['provider']}, ~{m['weeks_to_learn']} weeks)."
            )
        else:
            next_actions.append(f"Learn {m['skill']} (~{m['weeks_to_learn']} weeks).")
    if not next_actions:
        next_actions.append(f"No critical gaps remain — prepare for interviews and senior-level scope for {role_title}.")

    # --- Semantic similarity (JD only) ----------------------------------------------
    semantic = None
    if job_description and job_description.strip():
        context = f"{resume_text}\nSkills: {', '.join(sorted(held))}" if resume_text or held else ""
        semantic = round(compute_semantic_similarity(context, job_description), 3) if context else None

    profile_title = profile["title"] if profile else role_title
    market_demand = round(
        sum(skill_demand(k) for k in required) / len(required)
    ) if required else 0

    # --- Public payload (strip internal keys) ---------------------------------------
    return {
        "target_role": role_title,
        "source": source,
        "profile_title": profile_title,
        "readiness_score": readiness,
        "readiness_level": _readiness_level(readiness),
        "overall_score": readiness,
        "profile_match": {
            "matched": len(strengths),
            "partial": len(partials),
            "gaps": len(gaps),
            "required": req_count,
            "readiness": readiness,
            "semantic_similarity": semantic,
            "market_demand": market_demand,
            "estimated_timeline_weeks": sum(m["weeks_to_learn"] for m in gap_items),
        },
        "matched_skill_count": len(strengths),
        "partial_skill_count": len(partials),
        "gap_count": len(gaps),
        "total_required": req_count,
        "skills": [
            {k: v for k, v in item.items() if k not in ("key", "is_required")}
            for item in items
        ],
        "categories": categories,
        "roadmap": roadmap,
        "strengths": strengths,
        "partials": partials,
        "gaps": gaps,
        "insights": insights,
        "next_actions": next_actions,
        "certifications_recommended": certifications,
    }


def profile_used(profile: Optional[Dict[str, Any]], role_title: str) -> bool:
    """Whether the resolved profile actually matched the requested role title."""
    if not profile:
        return False
    return any(kw in role_title.lower() for kw in profile["keywords"])
