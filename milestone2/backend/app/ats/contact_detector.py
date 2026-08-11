import re


EMAIL_PATTERN = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"

PHONE_PATTERN = (
    r"(?:\+?\d{1,3}[\-\s.]?)?"
    r"\(?\d{2,4}\)?[\-\s.]?"
    r"\d{3,4}[\-\s.]?"
    r"\d{3,4}"
)


def detect_contact_info(text: str):

    email = re.search(EMAIL_PATTERN, text)

    phone = re.search(PHONE_PATTERN, text)

    linkedin = "linkedin.com" in text.lower()

    github = "github.com" in text.lower()

    return {
        "email": email.group() if email else None,
        "phone": phone.group() if phone else None,
        "linkedin": linkedin,
        "github": github
    }


def contact_score(contact):
    """
    Contact score out of 40
    """

    score = 0

    # Email
    if contact["email"]:
        score += 10

    # Phone
    if contact["phone"]:
        score += 10

    # LinkedIn
    if contact["linkedin"]:
        score += 10

    # GitHub
    if contact["github"]:
        score += 10

    return score