"""
Shared Learning-Content Catalog for career.AI (Modules 5 & 6)
Consolidates course recommendations and certification suggestions into a single dataset.
"""

from typing import List, Dict, Any, Optional

COURSES: List[Dict[str, Any]] = [
    # Python & Data
    {
        "id": "course-py-1",
        "skill": "Python",
        "provider": "Coursera / DeepLearning.AI",
        "title": "Python for Everybody Specialization",
        "url": "https://www.coursera.org/specializations/python",
        "difficulty": "Beginner",
        "duration": "4 weeks",
        "rating": 4.8,
        "description": "Learn to Program and Analyze Data with Python from basic syntax to web scraping.",
    },
    {
        "id": "course-py-2",
        "skill": "Python",
        "provider": "edX / MIT",
        "title": "Introduction to Computer Science using Python",
        "url": "https://www.edx.org/course/introduction-to-computer-science-and-programming-7",
        "difficulty": "Intermediate",
        "duration": "9 weeks",
        "rating": 4.7,
        "description": "Comprehensive introduction to Python, algorithms, and computational thinking.",
    },
    # React & Frontend
    {
        "id": "course-react-1",
        "skill": "React",
        "provider": "Meta / Coursera",
        "title": "Meta Front-End Developer Professional Certificate",
        "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
        "difficulty": "Intermediate",
        "duration": "6 weeks",
        "rating": 4.8,
        "description": "Master React components, state management, hooks, and modern frontend architecture.",
    },
    {
        "id": "course-react-2",
        "skill": "TypeScript",
        "provider": "Udemy",
        "title": "Understanding TypeScript - 2026 Edition",
        "url": "https://www.udemy.com/course/understanding-typescript/",
        "difficulty": "Intermediate",
        "duration": "15 hours",
        "rating": 4.9,
        "description": "Deep dive into TypeScript types, interfaces, generics, and integration with React/Node.",
    },
    # FastAPI & Backend Architecture
    {
        "id": "course-api-1",
        "skill": "FastAPI",
        "provider": "TestDriven.io",
        "title": "Developing Web Apps with FastAPI & Docker",
        "url": "https://testdriven.io/courses/fastapi-crud/",
        "difficulty": "Intermediate",
        "duration": "8 hours",
        "rating": 4.8,
        "description": "Build high-performance REST APIs with Python, FastAPI, Postgres, and Docker.",
    },
    {
        "id": "course-api-2",
        "skill": "REST APIs",
        "provider": "Pluralsight",
        "title": "RESTful Web Services & API Design",
        "url": "https://www.pluralsight.com/courses/restful-web-services-design",
        "difficulty": "Beginner",
        "duration": "3 hours",
        "rating": 4.6,
        "description": "Learn API design best practices, HTTP methods, status codes, and security patterns.",
    },
    # SQL & Databases
    {
        "id": "course-db-1",
        "skill": "SQL",
        "provider": "Datacamp",
        "title": "SQL Fundamentals & Database Optimization",
        "url": "https://www.datacamp.com/tracks/sql-fundamentals",
        "difficulty": "Beginner",
        "duration": "12 hours",
        "rating": 4.7,
        "description": "Master SQL queries, joins, indexes, subqueries, and relational schema design.",
    },
    {
        "id": "course-db-2",
        "skill": "PostgreSQL",
        "provider": "Udemy",
        "title": "PostgreSQL Bootcamp: Go from Zero to Hero",
        "url": "https://www.udemy.com/course/postgres-bootcamp/",
        "difficulty": "Intermediate",
        "duration": "18 hours",
        "rating": 4.8,
        "description": "Advanced indexing, JSONB queries, query optimization, and transaction management.",
    },
    # Docker & Cloud / DevOps
    {
        "id": "course-cloud-1",
        "skill": "Docker",
        "provider": "Udemy",
        "title": "Docker & Kubernetes: The Practical Guide",
        "url": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/",
        "difficulty": "Intermediate",
        "duration": "23 hours",
        "rating": 4.9,
        "description": "Containerize apps, manage multi-container setups, and orchestrate with Kubernetes.",
    },
    {
        "id": "course-cloud-2",
        "skill": "AWS",
        "provider": "AWS Training / Coursera",
        "title": "AWS Cloud Practitioner Essentials",
        "url": "https://www.coursera.org/learn/aws-cloud-practitioner-essentials",
        "difficulty": "Beginner",
        "duration": "6 hours",
        "rating": 4.8,
        "description": "Fundamentals of AWS Cloud services, computing, storage, IAM, and security.",
    },
    # Machine Learning / AI
    {
        "id": "course-ai-1",
        "skill": "Machine Learning",
        "provider": "Stanford / DeepLearning.AI",
        "title": "Machine Learning Specialization",
        "url": "https://www.coursera.org/specializations/machine-learning-introduction",
        "difficulty": "Intermediate",
        "duration": "8 weeks",
        "rating": 4.9,
        "description": "Supervised learning, neural networks, decision trees, and ML system design.",
    },
    {
        "id": "course-ai-2",
        "skill": "PyTorch",
        "provider": "Udacity",
        "title": "Deep Learning with PyTorch",
        "url": "https://www.udacity.com/course/deep-learning-pytorch--ud188",
        "difficulty": "Advanced",
        "duration": "2 months",
        "rating": 4.8,
        "description": "Build modern deep learning models, CNNs, RNNs, and transformer networks.",
    },
    # System Design & Software Process
    {
        "id": "course-sys-1",
        "skill": "System Design",
        "provider": "Educative.io",
        "title": "Grokking the System Design Interview",
        "url": "https://www.educative.io/courses/grokking-the-system-design-interview",
        "difficulty": "Advanced",
        "duration": "20 hours",
        "rating": 4.9,
        "description": "Scalable systems, microservices, load balancing, caching, and rate limiting.",
    },
    {
        "id": "course-agile-1",
        "skill": "Agile",
        "provider": "Coursera",
        "title": "Agile Software Development",
        "url": "https://www.coursera.org/learn/agile-software-development",
        "difficulty": "Beginner",
        "duration": "4 weeks",
        "rating": 4.6,
        "description": "Scrum methodology, sprint planning, user stories, and continuous integration.",
    },
]

CERTIFICATIONS: List[Dict[str, Any]] = [
    # Software Engineering / Backend
    {
        "id": "cert-aws-dva",
        "skill_domain": "Cloud & Backend",
        "title": "AWS Certified Developer – Associate",
        "provider": "Amazon Web Services",
        "level": "Associate",
        "url": "https://aws.amazon.com/certification/certified-developer-associate/",
        "description": "Demonstrates core expertise in developing and maintaining applications on AWS.",
    },
    {
        "id": "cert-gcp-ace",
        "skill_domain": "Cloud Infrastructure",
        "title": "Google Associate Cloud Engineer",
        "provider": "Google Cloud",
        "level": "Associate",
        "url": "https://cloud.google.com/certification/cloud-engineer",
        "description": "Validates ability to deploy applications, monitor operations, and manage cloud enterprise solutions.",
    },
    {
        "id": "cert-cka",
        "skill_domain": "DevOps & Containers",
        "title": "Certified Kubernetes Administrator (CKA)",
        "provider": "CNCF / Linux Foundation",
        "level": "Professional",
        "url": "https://www.cncf.io/certification/cka/",
        "description": "Hands-on certification for container management, networking, and cluster management.",
    },
    # AI / Machine Learning
    {
        "id": "cert-aws-mla",
        "skill_domain": "Machine Learning / AI",
        "title": "AWS Certified Machine Learning – Specialty",
        "provider": "Amazon Web Services",
        "level": "Specialty",
        "url": "https://aws.amazon.com/certification/certified-machine-learning-specialty/",
        "description": "Validates expertise in designing, implementing, and deploying ML models.",
    },
    {
        "id": "cert-tf-dev",
        "skill_domain": "Machine Learning / AI",
        "title": "TensorFlow Developer Certificate",
        "provider": "Google / TensorFlow",
        "level": "Associate",
        "url": "https://www.tensorflow.org/certificate",
        "description": "Demonstrates proficiency in building Computer Vision, NLP, and Deep Learning models.",
    },
    # Data Engineering / Databases
    {
        "id": "cert-dp203",
        "skill_domain": "Data Engineering",
        "title": "Microsoft Certified: Azure Data Engineer Associate (DP-203)",
        "provider": "Microsoft",
        "level": "Associate",
        "url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/",
        "description": "Integrates, transforms, and consolidates data from structured and unstructured systems.",
    },
    # Security & Systems
    {
        "id": "cert-sec-plus",
        "skill_domain": "Cybersecurity",
        "title": "CompTIA Security+",
        "provider": "CompTIA",
        "level": "Associate",
        "url": "https://www.comptia.org/certifications/security",
        "description": "Global certification validating baseline cybersecurity skills and operational security.",
    },
    # Frontend & Fullstack
    {
        "id": "cert-meta-fs",
        "skill_domain": "Full-Stack Development",
        "title": "Meta Full-Stack Engineer Certificate",
        "provider": "Meta",
        "level": "Associate",
        "url": "https://www.coursera.org/professional-certificates/meta-full-stack-developer",
        "description": "Covers end-to-end web engineering with React, Node.js, databases, and deployment.",
    },
]


def get_courses_for_skills(missing_skills: List[str]) -> List[Dict[str, Any]]:
    """
    Find courses matching any of the user's missing skills (case-insensitive substring match).
    If no specific skills provided or no match, returns top popular default courses.
    """
    if not missing_skills:
        return COURSES[:4]

    matched_courses = []
    seen_ids = set()

    for skill in missing_skills:
        skill_lower = skill.strip().lower()
        if not skill_lower:
            continue

        for course in COURSES:
            if course["id"] in seen_ids:
                continue

            course_skill = course["skill"].lower()
            if skill_lower in course_skill or course_skill in skill_lower:
                matched_courses.append({**course, "matched_skill": skill})
                seen_ids.add(course["id"])

    # Fallback to general courses if matches are few
    if len(matched_courses) < 3:
        for course in COURSES:
            if course["id"] not in seen_ids:
                matched_courses.append({**course, "matched_skill": course["skill"]})
                seen_ids.add(course["id"])
                if len(matched_courses) >= 5:
                    break

    return matched_courses


def get_certifications_for_role(target_role: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Returns relevant certifications filtered by target role or domain keyword.
    """
    if not target_role:
        return CERTIFICATIONS[:5]

    role_lower = target_role.lower()
    results = []

    for cert in CERTIFICATIONS:
        domain = cert["skill_domain"].lower()
        title = cert["title"].lower()

        if any(term in role_lower for term in ["cloud", "aws", "backend", "devops", "software", "developer", "engineer", "fullstack", "ai", "machine learning", "data"]) or \
           any(term in domain for term in ["cloud", "backend", "devops", "full-stack", "machine learning"]):
            results.append(cert)

    if not results:
        results = CERTIFICATIONS[:4]

    return results
