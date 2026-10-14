SECTION_KEYWORDS = {
    "summary": [
        "summary",
        "professional summary",
        "profile",
        "objective"
    ],

    "skills": [
        "skills",
        "technical skills",
        "core skills"
    ],

    "experience": [
        "experience",
        "work experience",
        "employment",
        "internship"
    ],

    "education": [
        "education",
        "academic"
    ],

    "projects": [
        "projects",
        "academic projects"
    ],

    "certifications": [
        "certifications",
        "certificate",
        "licenses"
    ]
}


def detect_sections(text):
    lines = text.lower().split('\n')
    result = {}
    
    for section, keywords in SECTION_KEYWORDS.items():
        found = False
        for line in lines:
            stripped = line.strip()
            for keyword in keywords:
                # Check if keyword appears as a line header (at start, possibly followed by colon or is the whole line)
                if (stripped == keyword or
                    stripped.startswith(keyword + ':') or
                    stripped.startswith(keyword + ' ') or
                    keyword in stripped[:40]):
                    found = True
                    break
            if found:
                break
        result[section] = found
    
    return result


def section_score(sections):
    """
    Resume sections score out of 30
    """

    score = 0

    if sections.get("summary"):
        score += 5

    if sections.get("skills"):
        score += 5

    if sections.get("experience"):
        score += 5

    if sections.get("education"):
        score += 5

    if sections.get("projects"):
        score += 5

    if sections.get("certifications"):
        score += 5

    return score