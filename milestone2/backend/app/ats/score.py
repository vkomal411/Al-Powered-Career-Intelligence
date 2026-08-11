def calculate_ats_score(contact, sections, skills):
    """
    Calculate ATS score out of 100.
    contact -> 0-40
    sections -> 0-30
    skills -> 0-30
    """

    total = contact + sections + skills

    if total > 100:
        total = 100

    if total < 0:
        total = 0

    return round(total)