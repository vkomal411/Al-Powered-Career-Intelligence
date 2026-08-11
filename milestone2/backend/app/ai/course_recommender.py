"""
Course & Skill-Gap Recommender Engine for career.AI (Module 5)
Maps missing skills to courses from the shared catalog and constructs a structured, ordered learning path timeline.
"""

from typing import List, Dict, Any, Optional
from app.data.learning_catalog import get_courses_for_skills, COURSES

DIFFICULTY_ORDER = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}


def generate_course_recommendations(
    missing_skills: List[str],
    target_role: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate ranked course recommendations and a ordered learning path timeline.
    """
    cleaned_skills = [s.strip() for s in missing_skills if s and s.strip()]

    # Fetch courses from shared catalog
    recommended_courses = get_courses_for_skills(cleaned_skills)

    # Sort courses for the Learning Path timeline (Beginner -> Intermediate -> Advanced)
    learning_path_courses = sorted(
        recommended_courses,
        key=lambda c: (DIFFICULTY_ORDER.get(c.get("difficulty", "Intermediate"), 2), -c.get("rating", 0))
    )

    timeline_steps = []
    for idx, course in enumerate(learning_path_courses, start=1):
        timeline_steps.append({
            "step_number": idx,
            "title": f"Step {idx}: Master {course.get('matched_skill', course.get('skill', 'Skill'))}",
            "course_id": course.get("id"),
            "course_title": course.get("title"),
            "provider": course.get("provider"),
            "difficulty": course.get("difficulty"),
            "duration": course.get("duration"),
            "reason": f"Fills critical skill gap in {course.get('matched_skill', course.get('skill'))} for target role ({target_role or 'Target Career'})",
            "url": course.get("url"),
        })

    return {
        "missing_skills": cleaned_skills,
        "target_role": target_role or "Software Professional",
        "recommended_courses": recommended_courses,
        "learning_path": {
            "total_steps": len(timeline_steps),
            "estimated_duration": f"{len(timeline_steps) * 3}-{(len(timeline_steps) * 5)} weeks",
            "steps": timeline_steps,
        }
    }
