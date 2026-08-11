import json
import logging
from typing import Dict, Any, List

from app.config import settings

logger = logging.getLogger("career_platform")

# Try loading google genai SDK if installed
try:
    from google import genai
    HAS_GEMINI_SDK = True
except ImportError:
    HAS_GEMINI_SDK = False

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


def generate_heuristic_advice(user_profile: Dict[str, Any], resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generates structured career intelligence advice using heuristic AI engine."""
    target_role = user_profile.get("target_role") or "Software Engineer"
    skills = user_profile.get("skills") or resume_data.get("extracted_skills") or []
    skills_str = ", ".join(skills[:6]) if skills else "technical and analytical skills"
    exp_level = user_profile.get("experience_level") or "Mid-Level"

    summary = (
        f"Your profile shows a promising foundation as a {exp_level} professional targeting {target_role} positions. "
        f"With active competencies in {skills_str}, optimizing your ATS formatting and quantifying key project impact will significantly improve interview callback rates."
    )

    strengths = [
        f"Strong technical skill alignment in {skills_str}.",
        "Multi-section profile coverage including education and project experience.",
        "Demonstrated hands-on experience suitable for ATS automated screening."
    ]

    improvements = [
        "Include metrics and KPIs (e.g., 'Improved performance by 35%') in project bullet points.",
        "Align resume keywords directly with specific job description requirements before applying.",
        "Add relevant industry-standard professional certifications to boost profile credibility."
    ]

    action_plan = [
        f"Step 1: Focus on building 1-2 featured projects targeting {target_role} core tech stack.",
        "Step 2: Utilize the Job Matcher tool on your dashboard to customize your resume for every application.",
        "Step 3: Network with industry peers and obtain recommendations for highlighted skills."
    ]

    certifications = [
        "AWS Certified Solutions Architect / Cloud Practitioner",
        "Google Professional Cloud Architect / Developer",
        "Certified ScrumMaster (CSM) / Professional Scrum Developer"
    ]

    return {
        "summary": summary,
        "key_strengths": strengths,
        "improvement_areas": improvements,
        "action_plan": action_plan,
        "suggested_certifications": certifications
    }


def generate_gemini_advice(user_profile: Dict[str, Any], resume_data: Dict[str, Any], custom_prompt: str = "") -> Dict[str, Any]:
    """Calls Gemini REST / SDK to generate AI Career Advice."""
    api_key = settings.gemini_api_key
    if not api_key:
        logger.info("Gemini API Key not set. Falling back to heuristic AI advisor.")
        return generate_heuristic_advice(user_profile, resume_data)

    target_role = user_profile.get("target_role") or "Software Engineer"
    skills = user_profile.get("skills") or resume_data.get("extracted_skills") or []

    prompt = f"""
You are an expert AI Career Coach and Resume Intelligence Specialist.
Analyze the following candidate profile and return a JSON object with EXACTLY the following keys:
- "summary": string (2-3 sentences overview of candidate readiness for {target_role})
- "key_strengths": list of strings (3 strengths)
- "improvement_areas": list of strings (3 areas to improve)
- "action_plan": list of strings (3 clear actionable steps)
- "suggested_certifications": list of strings (3 top certifications)

Candidate Target Role: {target_role}
Candidate Skills: {', '.join(skills)}
Candidate Experience Level: {user_profile.get('experience_level', 'Mid-Level')}
Custom Query: {custom_prompt or 'None'}

Return ONLY valid raw JSON without markdown formatting.
"""

    if HAS_GEMINI_SDK:
        try:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            text = response.text.strip()
            # Clean markdown JSON formatting if present
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
        except Exception as e:
            logger.warning("Gemini SDK call failed (%s). Attempting REST API fallback.", e)

    if HAS_REQUESTS:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            resp = requests.post(url, json=payload, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                if raw_text.startswith("```json"):
                    raw_text = raw_text.replace("```json", "").replace("```", "").strip()
                return json.loads(raw_text)
        except Exception as e:
            logger.warning("Gemini REST API call failed: %s", e)

    return generate_heuristic_advice(user_profile, resume_data)


def get_ai_career_advice(user_profile: Dict[str, Any], resume_data: Dict[str, Any], custom_prompt: str = "") -> Dict[str, Any]:
    """Main entry point for generating AI Career Advice."""
    provider = settings.ai_provider.lower()

    if provider == "gemini" and settings.gemini_api_key:
        return generate_gemini_advice(user_profile, resume_data, custom_prompt)

    return generate_heuristic_advice(user_profile, resume_data)
