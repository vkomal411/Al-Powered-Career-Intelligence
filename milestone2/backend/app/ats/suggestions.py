def generate_suggestions(contact, sections, skills):

    suggestions = []

    if not contact["email"]:
        suggestions.append(
            "It looks like you're missing an email address. Adding a professional email "
            "(like first.last@gmail.com) near the top ensures recruiters can easily get in touch with you."
        )

    if not contact["phone"]:
        suggestions.append(
            "A contact phone number was not detected. We highly recommend adding your primary phone "
            "number so hiring managers can reach out directly for phone screens."
        )

    if not contact["linkedin"]:
        suggestions.append(
            "We couldn't find a link to your LinkedIn profile. Linking your professional LinkedIn page "
            "helps recruiters view your endorsements, recommendations, and extended professional network."
        )

    if not contact["github"]:
        suggestions.append(
            "No GitHub profile was detected. For technical roles, adding a link to your GitHub "
            "is a great way to showcase your real-world coding projects and open-source contributions."
        )

    if not sections["summary"]:
        suggestions.append(
            "Your resume is missing a professional summary. Adding a brief, 3-4 sentence overview "
            "at the top of your resume helps tell your story and frames your key achievements instantly."
        )

    if not sections["projects"]:
        suggestions.append(
            "We couldn't find a projects section. Incorporating 2-3 key personal or academic projects "
            "with a quick description of the tech stack is a powerful way to demonstrate hands-on experience."
        )

    if not sections["certifications"]:
        suggestions.append(
            "There is no certifications section listed. If you have any industry credentials (like AWS, "
            "Google, or Scrum Master certificates), adding them builds trust and proves your expertise."
        )

    if len(skills) < 10:
        suggestions.append(
            f"You currently have only {len(skills)} skills detected. Because ATS filters scan heavily for keyword density, "
            "try listing more of your core technical skills, libraries, frameworks, or tools to improve matching."
        )

    return suggestions