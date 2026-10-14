from app.ats.skill_detector import detect_skills
from app.ats.text_cleaner import clean_resume_text


def test_text_cleaner_preserves_tech_symbols():
    text = "Proficient in C++, C#, .NET, Node.js, and CI/CD pipelines."
    cleaned = clean_resume_text(text)
    
    assert "c++" in cleaned
    assert "c#" in cleaned
    assert ".net" in cleaned
    assert "node.js" in cleaned
    assert "ci/cd" in cleaned


def test_skill_detector_no_false_next_match():
    text = "In my next role, I want to lead software development teams."
    skills = detect_skills(text)
    
    assert "Next.js" not in skills


def test_skill_detector_valid_nextjs_match():
    text = "Built web applications using Next.js and React."
    skills = detect_skills(text)
    
    assert "Next.js" in skills
    assert "React" in skills
