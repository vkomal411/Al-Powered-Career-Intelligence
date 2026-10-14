import re


def clean_resume_text(text: str) -> str:
    """
    Cleans extracted resume text.
    """

    if not text:
        return ""

    # Lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r"http\S+|www\S+", " ", text)

    # Remove emails (optional)
    # text = re.sub(r"\S+@\S+", " ", text)

    # Keep letters, numbers, spaces, and tech-relevant symbols (+, #, ., -, /)
    text = re.sub(r"[^a-z0-9\s\+\#\.\-/]", " ", text)

    # Remove multiple spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()