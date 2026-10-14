import re
from typing import Dict, Any

STRONG_ACTION_VERBS = [
    "Architected", "Engineered", "Optimized", "Spearheaded", "Deployed",
    "Implemented", "Streamlined", "Accelerated", "Pioneered", "Automated",
    "Formulated", "Orchestrated", "Overhauled", "Established"
]

WEAK_PHRASES_MAP = {
    r"\bwas responsible for\b": "Spearheaded",
    r"\bresponsible for\b": "Managed and executed",
    r"\bworked on\b": "Engineered and delivered",
    r"\bhelped with\b": "Collaborated on",
    r"\bassisted in\b": "Supported development of",
    r"\bhandled\b": "Orchestrated",
    r"\bdid\b": "Executed",
    r"\bmade\b": "Developed",
    r"\bchanged\b": "Refactored",
    r"\bbuilt\b": "Architected",
    r"\bused\b": "Leveraged",
}


def enhance_bullet_point(bullet_text: str) -> Dict[str, Any]:
    """
    Transforms weak or passive bullet points into high-impact, action-verb statements.
    """
    text = (bullet_text or "").strip()
    if not text or len(text) < 5:
        raise ValueError("Bullet point text must be at least 5 characters long.")

    enhanced = text
    replaced_phrases = []

    # 1. Replace weak passive phrases
    for weak_pattern, strong_verb in WEAK_PHRASES_MAP.items():
        if re.search(weak_pattern, enhanced, re.IGNORECASE):
            enhanced = re.sub(weak_pattern, strong_verb, enhanced, flags=re.IGNORECASE)
            replaced_phrases.append(strong_verb)

    # 2. Capitalize first letter if needed
    if enhanced and enhanced[0].islower():
        enhanced = enhanced[0].upper() + enhanced[1:]

    # 3. Ensure sentence starts with a strong action verb if it doesn't already
    first_word = enhanced.split()[0] if enhanced.split() else ""
    if not replaced_phrases and not any(first_word.lower() == v.lower() for v in STRONG_ACTION_VERBS):
        # Prepend a strong action verb if not present
        if not re.search(r"^(Engineered|Architected|Optimized|Spearheaded|Implemented|Deployed)\b", enhanced, re.IGNORECASE):
            enhanced = f"Engineered {enhanced[0].lower() + enhanced[1:] if len(enhanced) > 1 else enhanced}"
            replaced_phrases.append("Engineered")

    # 4. Check if metric / quantitative result is present; suggest adding one if missing
    has_metrics = bool(re.search(r"(\d+%|\$\d+|\b\d+\b|\bseveral\b|\bmultiple\b)", text, re.IGNORECASE))
    
    summary_parts = []
    if replaced_phrases:
        summary_parts.append(f"Replaced passive wording with strong action verbs ({', '.join(set(replaced_phrases))}).")
    else:
        summary_parts.append("Enhanced sentence structure and active phrasing.")

    if not has_metrics:
        summary_parts.append("Tip: Add measurable results (e.g. 'reducing latency by 30%' or 'serving 10k+ active users').")

    changes_summary = " ".join(summary_parts)

    return {
        "original": text,
        "enhanced": enhanced,
        "changes_summary": changes_summary,
    }
