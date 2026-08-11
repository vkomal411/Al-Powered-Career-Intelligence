import re
from typing import List, Dict, Any
from app.ats.skill_detector import detect_skills, SKILL_KEYWORDS

def extract_jd_keywords(jd_text: str) -> List[str]:
    """
    Extracts technical skills and key terms from Job Description text.
    """
    cleaned = jd_text.lower()
    found_skills = set(detect_skills(cleaned))

    # Fallback to broader keyword scan
    for skill in SKILL_KEYWORDS:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, cleaned):
            found_skills.add(skill)

    return sorted(list(found_skills))


def compute_keyword_overlap(resume_text: str, jd_text: str) -> Dict[str, Any]:
    """
    Computes deterministic keyword overlap between resume text and job description.
    Used by tailor_router and ATS metrics.
    """
    if not jd_text or len(jd_text.strip()) < 20:
        return {"matched": [], "missing": [], "overlap_score": 0.0}

    jd_keywords = extract_jd_keywords(jd_text)
    
    if not jd_keywords:
        words = re.findall(r"\b[a-zA-Z]{3,}\b", jd_text.lower())
        word_counts: Dict[str, int] = {}
        stop_words = {
            "the", "and", "for", "with", "that", "this", "from", "have", "will",
            "you", "your", "are", "our", "work", "team", "about", "role", "must",
            "ability", "experience", "looking", "candidate", "responsibilities"
        }
        for w in words:
            if w not in stop_words:
                word_counts[w] = word_counts.get(w, 0) + 1
        sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
        jd_keywords = [w[0] for w in sorted_words[:12]]

    resume_text_lower = (resume_text or "").lower()

    matched = []
    missing = []

    for kw in jd_keywords:
        kw_lower = kw.lower()
        pattern = r"\b" + re.escape(kw_lower) + r"\b"
        if re.search(pattern, resume_text_lower):
            matched.append(kw)
        else:
            missing.append(kw)

    total = len(jd_keywords)
    overlap_score = round((len(matched) / total * 100), 1) if total > 0 else 100.0

    return {
        "matched": matched,
        "missing": missing,
        "overlap_score": overlap_score,
    }


def match_job_description(
    resume_text: str,
    resume_skills: List[str],
    jd_text: str
) -> Dict[str, Any]:
    """
    Compares a candidate's resume text and skills against a target Job Description.
    Returns match percentage, matched skills, missing skills, and actionable suggestions.
    """
    if not jd_text or len(jd_text.strip()) < 20:
        raise ValueError("Job description text must be at least 20 characters long.")

    overlap_res = compute_keyword_overlap(resume_text, jd_text)
    matched = overlap_res["matched"]
    missing = overlap_res["missing"]
    match_pct = overlap_res["overlap_score"]

    # Incorporate explicitly listed resume skills into matched list if present in JD keywords
    normalized_resume_skills = set(s.lower() for s in (resume_skills or []))
    for kw in list(missing):
        if kw.lower() in normalized_resume_skills:
            missing.remove(kw)
            matched.append(kw)

    total = len(matched) + len(missing)
    if total > 0:
        match_pct = round((len(matched) / total * 100), 1)

    suggestions = []
    if missing:
        top_missing = missing[:5]
        suggestions.append(
            f"Consider integrating these target keywords into your skills or experience sections: {', '.join(top_missing)}."
        )
    if match_pct < 60:
        suggestions.append(
            "Your resume has a low keyword overlap with this job posting. Tailor your summary and project descriptions to mirror the key requirements."
        )
    elif match_pct >= 80:
        suggestions.append(
            "Strong match! Your resume contains the majority of core technical terms highlighted in this job description."
        )

    return {
        "match_percentage": match_pct,
        "matched_skills": sorted(matched),
        "missing_skills": sorted(missing),
        "suggestions": suggestions,
    }
