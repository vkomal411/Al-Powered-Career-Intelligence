import re

SKILL_PATTERNS = {
    "Python": [r"\bpython\b"],
    "Java": [r"\bjava\b"],
    "C": [r"(?<![\w+])c(?![\w+])"],
    "C++": [r"\bc\+\+\b"],
    "HTML": [r"\bhtml5?\b"],
    "CSS": [r"\bcss3?\b"],
    "JavaScript": [r"\bjavascript\b", r"\bjs\b"],
    "TypeScript": [r"\btypescript\b", r"\bts\b"],

    "React": [r"\breact\b", r"\breactjs\b", r"\breact\.js\b"],
    "Next.js": [r"\bnextjs\b", r"\bnext\.js\b"],
    "Node.js": [r"\bnode\b", r"\bnodejs\b", r"\bnode\.js\b"],

    "SQL": [r"\bsql\b"],
    "MySQL": [r"\bmysql\b"],
    "PostgreSQL": [r"\bpostgres\b", r"\bpostgresql\b"],
    "MongoDB": [r"\bmongodb\b", r"\bmongo\b"],

    "Linux": [r"\blinux\b"],
    "Git": [r"\bgit\b"],
    "GitHub": [r"\bgithub\b"],

    "Docker": [r"\bdocker\b"],
    "Kubernetes": [r"\bkubernetes\b", r"\bk8s\b"],

    "AWS": [r"\baws\b", r"\bamazon web services\b"],
    "Azure": [r"\bazure\b"],
    "GCP": [r"\bgcp\b", r"\bgoogle cloud\b"],

    "TensorFlow": [r"\btensorflow\b"],
    "Keras": [r"\bkeras\b"],
    "OpenCV": [r"\bopencv\b"],

    "Power BI": [r"\bpower\s*bi\b", r"\bpowerbi\b"],
    "Excel": [r"\bexcel\b", r"\bmicrosoft excel\b"],

    "Machine Learning": [
        r"\bmachine learning\b",
        r"\bmachine-learning\b",
        r"\bml\b",
    ],

    "Deep Learning": [
        r"\bdeep learning\b",
        r"\bdeep-learning\b",
        r"\bdl\b",
    ],

    "Artificial Intelligence": [
        r"\bartificial intelligence\b",
        r"\bai\b",
    ],

    "Data Analysis": [
        r"\bdata analysis\b",
        r"\bdata analytics\b",
        r"\bdata analyst\b",
    ],

    "Pandas": [r"\bpandas\b"],
    "NumPy": [r"\bnumpy\b"],
    "Scikit-learn": [r"\bscikit[- ]?learn\b", r"\bsklearn\b"],
    "FastAPI": [r"\bfastapi\b"],
    "Flask": [r"\bflask\b"],
    "Django": [r"\bdjango\b"],
}


def detect_skills(text):
    text = text.lower()
    detected = []

    for skill, patterns in SKILL_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                detected.append(skill)
                break

    return sorted(detected)


def skill_score(found_skills):
    count = len(found_skills)

    if count >= 15:
        return 30
    elif count >= 12:
        return 27
    elif count >= 10:
        return 24
    elif count >= 8:
        return 20
    elif count >= 6:
        return 15
    elif count >= 4:
        return 10
    elif count >= 2:
        return 5
    return 0

SKILL_KEYWORDS = list(SKILL_PATTERNS.keys())