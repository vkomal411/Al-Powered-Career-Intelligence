import logging
from typing import Dict, List, Any

logger = logging.getLogger("career_platform")

# Try importing spacy
try:
    import spacy
    from spacy.pipeline import EntityRuler

    try:
        # Disable heavy unused syntactic components while keeping EntityRuler & NER fast and accurate
        NLP = spacy.load("en_core_web_sm", disable=["parser", "tagger", "lemmatizer", "attribute_ruler"])
    except Exception:
        # Fallback to downloading or creating blank english model
        NLP = spacy.blank("en")

    # Add custom skill pattern matching rules
    if "entity_ruler" not in NLP.pipe_names:
        ruler = NLP.add_pipe("entity_ruler", before="ner" if "ner" in NLP.pipe_names else None)
        SKILLS_TAXONOMY = [
            "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "SQL", "NoSQL",
            "React", "Next.js", "Angular", "Vue.js", "Node.js", "Express", "Django",
            "FastAPI", "Flask", "Spring Boot", "PostgreSQL", "MySQL", "MongoDB", "Redis",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "GitLab",
            "Linux", "Machine Learning", "Deep Learning", "NLP", "Data Science", "Pandas",
            "NumPy", "TensorFlow", "PyTorch", "Scikit-Learn", "REST API", "GraphQL",
            "Microservices", "CI/CD", "DevOps", "Agile", "Scrum", "Jira", "HTML", "CSS",
            "Tailwind CSS", "Bootstrap", "Data Analysis", "Tableau", "Power BI", "Excel"
        ]
        patterns = []
        for skill in SKILLS_TAXONOMY:
            patterns.append({"label": "SKILL", "pattern": skill})
            # Also add token pattern for case-insensitive matching
            patterns.append({"label": "SKILL", "pattern": [{"LOWER": t.lower()} for t in skill.split()]})

        ruler.add_patterns(patterns)
        CANONICAL_SKILLS = {s.lower(): s for s in SKILLS_TAXONOMY}

    HAS_SPACY = True
    logger.info("spaCy NLP engine with EntityRuler initialized successfully.")
except Exception as e:
    NLP = None
    CANONICAL_SKILLS = {}
    HAS_SPACY = False
    logger.warning("spaCy not available or failed to load (%s). Standard parsing active.", e)


def parse_resume_with_spacy(text: str) -> Dict[str, Any]:
    """Runs spaCy NER pipeline on resume text to extract skills and structured entities."""
    if not HAS_SPACY or NLP is None:
        return {"skills": [], "entities": []}

    try:
        doc = NLP(text)
        skills = set()
        entities = []

        for ent in doc.ents:
            if ent.label_ == "SKILL":
                canonical = CANONICAL_SKILLS.get(ent.text.lower(), ent.text)
                skills.add(canonical)
            else:
                entities.append({"text": ent.text, "label": ent.label_})

        return {
            "skills": sorted(list(skills)),
            "entities": entities
        }
    except Exception as e:
        logger.warning("Error during spaCy parsing: %s", e)
        return {"skills": [], "entities": []}
