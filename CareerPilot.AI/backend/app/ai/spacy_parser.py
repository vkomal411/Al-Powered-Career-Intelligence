import logging
from typing import Dict, List, Any

logger = logging.getLogger("career_platform")

# Try importing spacy
try:
    import spacy
    from spacy.pipeline import EntityRuler

    try:
        NLP = spacy.load("en_core_web_sm")
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
        patterns = [{"label": "SKILL", "pattern": skill} for skill in SKILLS_TAXONOMY]
        ruler.add_patterns(patterns)

    HAS_SPACY = True
    logger.info("spaCy NLP engine with EntityRuler initialized successfully.")
except Exception as e:
    NLP = None
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
                skills.add(ent.text)
            else:
                entities.append({"text": ent.text, "label": ent.label_})

        return {
            "skills": sorted(list(skills)),
            "entities": entities
        }
    except Exception as e:
        logger.warning("Error during spaCy parsing: %s", e)
        return {"skills": [], "entities": []}
