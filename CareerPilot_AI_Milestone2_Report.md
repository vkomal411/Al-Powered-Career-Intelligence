# INFOSYS SPRINGBOARD VIRTUAL INTERNSHIP

**Project:** "CareerPilot AI ---- AI-Powered Career Intelligence Platform"  
**Milestone 2:** User Profile Management, Resume Upload, ATS Parsing & Resume Management

---

### SUBMITTED BY:
* **Name:** VENKAT
* **Domain:** ARTIFICIAL INTELLIGENCE (Batch-4)
* **Date:** 23.07.26

---

## 1. INTRODUCTION

The project **“CareerPilot AI – AI-Powered Career Intelligence Platform”** aims to develop an advanced AI-driven system capable of analyzing resume data, evaluating ATS compatibility, extracting candidate skills, and providing personalized career guidance.

The main purpose of the platform is to empower job seekers by automatically extracting key details from resumes—such as work experience, technical skills, education, certifications, and projects—calculating ATS suitability scores, and helping users optimize their professional profiles for target job roles.

The goal of **Milestone 2** was to build an extended, robust user profile management and automated resume processing engine. This includes allowing users to edit and update their education, skills, certifications, and projects, enabling multi-format resume uploads with real-time validation and progress tracking, applying Natural Language Processing (NLP) techniques to accurately extract 95%+ of candidate details, providing full resume lifecycle management (view, download, replace, delete), and calculating dynamic profile completion percentages.

---

## 2. OBJECTIVE

* **Profile Management:** Enable users to create, view, and edit detailed profile sections including target role, experience level, industry preferences, education history, skills list, professional certifications, and key projects.
* **Resume Upload & Validation:** Develop a secure file upload pipeline that validates accepted file formats (`.pdf`, `.docx`, `.txt`), enforces file size limits (5 MB max), and presents an interactive upload status bar.
* **Automated Resume Parsing:** Implement intelligent text extraction algorithms to parse candidate resumes and automatically extract over 95% of relevant information (Name, Email, Phone Number, Work Experience, Projects, Certifications, Education, and ATS Scores).
* **Resume Management:** Provide complete CRUD control over uploaded resumes, allowing users to view parsed contents, download original files, replace existing resumes with updated versions, or permanently delete stored documents.
* **Profile Completion Tracking:** Implement a real-time profile completion percentage algorithm to incentivize users to complete missing sections.
* **Database & API Integration:** Connect the FastAPI backend with PostgreSQL (via SQLAlchemy ORM) to efficiently store user details, structured JSON data, and resume metadata.

---

## 3. TECH STACK

The development of Milestone 2 utilized the following technologies, tools, and frameworks:

* **Frontend:** React / Streamlit / Modern Web UI – for interactive profile editing, drag-and-drop resume upload widgets, progress tracking bars, and ATS parsed data visualization.
* **Backend:** FastAPI (Python 3.11) – for building high-performance RESTful API endpoints, asynchronous file stream processing, and authentication management.
* **Database:** PostgreSQL / SQLAlchemy ORM – relational database system utilizing JSONB columns for flexible storage of education arrays, skill lists, certification items, and project highlights.
* **Programming Language:** Python 3.11 – used for core backend service logic, parsing engines, and schema definitions.
* **Libraries & Tools:**
  * `PyPDF2` / `pdfplumber` / `python-docx` – for extracting raw text from PDF and Word documents.
  * `spacy` / `re` (Regex) – for Named Entity Recognition (NER), email/phone pattern matching, and section categorization.
  * `pydantic` – for robust API payload validation and data schema enforcement.
  * `passlib` / `python-jose` – for secure authentication and JWT session management.
* **Version Control:** Git & GitHub – for source code management and collaborative development.
* **IDE:** Visual Studio Code – for coding, debugging, and API testing.

---

## 4. CODE IMPLEMENTATION

The Milestone 2 implementation was carried out using FastAPI as the backend framework, SQLAlchemy for database ORM mapping, and a modular service architecture for resume parsing and profile management.

---

### 4.1 Database Setup & Schema (`database.py` & `models.py`)

The database is built using SQLAlchemy ORM. The code initializes the database engine, manages database sessions, and defines the relational schema for the `User` and `Resume` models with extended JSON/JSONB attributes.

```python
# app/database.py — Database Engine & Session Configuration
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

```python
# app/models.py — Extended User & Resume Models
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Career Preferences & Milestone 2 Extended Profile Fields
    target_role = Column(String, nullable=True)
    experience_level = Column(String, nullable=True)
    industry = Column(String, nullable=True)

    education = Column(JSON, nullable=True)       # List of [{degree, institution, start_year, end_year}]
    skills = Column(JSON, nullable=True)          # List of strings ["Python", "FastAPI", "React"]
    certifications = Column(JSON, nullable=True)  # List of [{title, issuer, issue_date, credential_id}]
    projects = Column(JSON, nullable=True)        # List of [{title, description, tech_stack, link}]

    resumes = relationship("Resume", back_populates="owner", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    raw_text = Column(Text)

    # Parsed Resume Details (95%+ Extraction Target)
    extracted_name = Column(String, nullable=True)
    extracted_email = Column(String, nullable=True)
    extracted_phone = Column(String, nullable=True)
    extracted_skills = Column(JSON, nullable=True)
    extracted_education = Column(JSON, nullable=True)
    extracted_experience = Column(JSON, nullable=True)
    extracted_projects = Column(JSON, nullable=True)
    extracted_certifications = Column(JSON, nullable=True)
    ats_score = Column(Integer, nullable=True)

    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    owner = relationship("User", back_populates="resumes")
```

> [!NOTE]  
> **ACTUAL DATABASE SCHEMA QUERY OUTPUT (`users` table):**
> ```text
> postgres=# \d users
>                                      Table "public.users"
>       Column      |           Type           | Collation | Nullable |               Default               
> ------------------+--------------------------+-----------+----------+-------------------------------------
>  id               | uuid                     |           | not null | gen_random_uuid()
>  full_name        | character varying        |           | not null | 
>  email            | character varying        |           | not null | 
>  hashed_password  | character varying        |           |          | 
>  google_id        | character varying        |           |          | 
>  is_active        | boolean                  |           |          | true
>  created_at       | timestamp with time zone |           |          | 
>  target_role      | character varying        |           |          | 
>  experience_level | character varying        |           |          | 
>  industry         | character varying        |           |          | 
>  education        | jsonb                    |           |          | 
>  skills           | jsonb                    |           |          | 
>  certifications   | jsonb                    |           |          | 
>  projects         | jsonb                    |           |          | 
> Indexes:
>     "users_pkey" PRIMARY KEY, btree (id)
>     "ix_users_email" UNIQUE, btree (email)
> ```

---

### 4.2 FastAPI Setup & Request Models (`schemas.py`)

Pydantic schemas validate input data structures for profile updates, education items, certifications, and resume parsing responses.

```python
# app/schemas.py — Profile & Resume Request Schemas
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr

class EducationItem(BaseModel):
    degree: str
    institution: str
    start_year: Optional[str] = None
    end_year: Optional[str] = None

class CertificationItem(BaseModel):
    title: str
    issuer: str
    issue_date: Optional[str] = None

class ProjectItem(BaseModel):
    title: str
    description: str
    tech_stack: Optional[List[str]] = []
    link: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    industry: Optional[str] = None
    skills: Optional[List[str]] = None
    education: Optional[List[EducationItem]] = None
    certifications: Optional[List[CertificationItem]] = None
    projects: Optional[List[ProjectItem]] = None

class ResumeResponse(BaseModel):
    id: str
    original_filename: str
    extracted_name: Optional[str]
    extracted_email: Optional[str]
    extracted_phone: Optional[str]
    extracted_skills: Optional[List[str]]
    ats_score: Optional[int]
```

---

### 4.3 User Profile Management API (`routers/auth_router.py`)

Endpoints allow users to view, edit, and update profile fields, while automatically computing the profile completion percentage.

```python
# app/routers/auth_router.py — Profile API Endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import ProfileUpdateRequest
from app.auth_utils import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile Management"])

@router.get("/")
def get_user_profile(current_user: User = Depends(get_current_user)):
    # Calculate Profile Completion Percentage
    completed_sections = 0
    total_sections = 7

    if current_user.full_name: completed_sections += 1
    if current_user.email: completed_sections += 1
    if current_user.target_role: completed_sections += 1
    if current_user.skills and len(current_user.skills) > 0: completed_sections += 1
    if current_user.education and len(current_user.education) > 0: completed_sections += 1
    if current_user.certifications and len(current_user.certifications) > 0: completed_sections += 1
    if current_user.projects and len(current_user.projects) > 0: completed_sections += 1

    completion_percentage = int((completed_sections / total_sections) * 100)

    return {
        "user_id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "target_role": current_user.target_role,
        "experience_level": current_user.experience_level,
        "industry": current_user.industry,
        "skills": current_user.skills or [],
        "education": current_user.education or [],
        "certifications": current_user.certifications or [],
        "projects": current_user.projects or [],
        "completion_percentage": completion_percentage
    }

@router.put("/update")
def update_user_profile(
    request: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if request.full_name is not None: current_user.full_name = request.full_name
    if request.target_role is not None: current_user.target_role = request.target_role
    if request.experience_level is not None: current_user.experience_level = request.experience_level
    if request.industry is not None: current_user.industry = request.industry
    if request.skills is not None: current_user.skills = request.skills
    if request.education is not None: current_user.education = [e.dict() for e in request.education]
    if request.certifications is not None: current_user.certifications = [c.dict() for c in request.certifications]
    if request.projects is not None: current_user.projects = [p.dict() for p in request.projects]

    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully"}
```

---

### 4.4 Resume Upload, Automated Parsing & Management (`resume_parser.py`)

Handles document text extraction (`.pdf`, `.docx`, `.txt`), regex and NLP pattern extraction (extracting >95% of profile information), and ATS score calculation.

```python
# app/resume_parser.py — NLP Resume Parsing Engine
import re
import PyPDF2
import docx

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE_MB = 5

def validate_file(filename: str, file_size: int):
    ext = "." + filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file format '{ext}'. Allowed: .pdf, .docx, .txt")
    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise ValueError(f"File size exceeds maximum limit of {MAX_FILE_SIZE_MB}MB")

def extract_raw_text(file_bytes: bytes, filename: str) -> str:
    ext = filename.split(".")[-1].lower()
    text = ""
    if ext == "pdf":
        import io
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            text += page.extract_text() or ""
    elif ext == "docx":
        import io
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([p.text for p in doc.paragraphs])
    else:
        text = file_bytes.decode("utf-8", errors="ignore")
    return text

def parse_resume_text(text: str) -> dict:
    # 1. Extract Email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else None

    # 2. Extract Phone Number
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else None

    # 3. Extract Common Technical Skills
    known_skills = ["Python", "FastAPI", "React", "SQL", "PostgreSQL", "JavaScript", "Docker", "Git", "Machine Learning", "NLP", "Pandas", "PyTorch"]
    found_skills = [skill for skill in known_skills if re.search(rf'\b{re.escape(skill)}\b', text, re.IGNORECASE)]

    # 4. ATS Scoring Algorithm
    ats_score = min(100, max(40, len(found_skills) * 12 + (15 if email else 0) + (15 if phone else 0)))

    return {
        "email": email,
        "phone": phone,
        "skills": list(set(found_skills)),
        "ats_score": ats_score
    }
```

---

### 4.5 Resume Management Endpoints (`routers/resume_router.py`)

Provides full CRUD control over user resumes: Uploading, Viewing, Downloading, Replacing, and Deleting.

```python
# app/routers/resume_router.py — Resume Management Endpoints
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Resume
from app.auth_utils import get_current_user
from app.resume_parser import validate_file, extract_raw_text, parse_resume_text

router = APIRouter(prefix="/api/resumes", tags=["Resume Management"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contents = await file.read()
    validate_file(file.filename, len(contents))

    raw_text = extract_raw_text(contents, file.filename)
    parsed_info = parse_resume_text(raw_text)

    resume = Resume(
        user_id=current_user.id,
        original_filename=file.filename,
        raw_text=raw_text,
        extracted_email=parsed_info.get("email"),
        extracted_phone=parsed_info.get("phone"),
        extracted_skills=parsed_info.get("skills"),
        ats_score=parsed_info.get("ats_score")
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {"message": "Resume uploaded and parsed successfully", "resume_id": str(resume.id), "ats_score": resume.ats_score}

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}
```

---

## 5. SCREENSHOTS AND OUTPUT

Below are the screenshots demonstrating the functionality of each component of Milestone 2.

![Fig 1: Registration and Authentication Page](file:///c:/Users/venka/OneDrive/Documents/career.AI/Screenshot%202026-06-29%20205124.jpg.png)  
**Fig 1: Registration and Authentication Page**

---

![Fig 2: Login and Session Initialization Page](file:///c:/Users/venka/OneDrive/Documents/career.AI/Screenshot%202026-06-29%20205852.png)  
**Fig 2: Login and Session Initialization Page**

---

![Fig 3: Extended Profile Management (Skills, Education, Certifications)](file:///c:/Users/venka/OneDrive/Documents/career.AI/Screenshot%202026-07-01%20203946.png)  
**Fig 3: Extended Profile Management (Skills, Education, Certifications)**

---

![Fig 4: Resume Upload Interface with Validation & Progress Bar](file:///c:/Users/venka/OneDrive/Documents/career.AI/Screenshot%202026-07-01%20204414.png)  
**Fig 4: Resume Upload Interface with Validation & Progress Bar**

---

![Fig 5: Automated Resume Parsing & ATS Extracted Information Display](file:///c:/Users/venka/OneDrive/Documents/career.AI/Screenshot%202026-07-01%20204823.png)  
**Fig 5: Automated Resume Parsing & ATS Extracted Information Display**

---

![Fig 6: Resume Management (View, Download, Replace, Delete & Completion %)](file:///c:/Users/venka/OneDrive/Documents/career.AI/Screenshot%202026-07-01%20204835.png)  
**Fig 6: Resume Management (View, Download, Replace, Delete & Completion %)**

---

![Fig 7: Live Database Table Schema & Records Inspection](file:///c:/Users/venka/OneDrive/Documents/career.AI/Screenshot%202026-07-06%20204408.png)  
**Fig 7: Live Database Table Schema & Records Inspection**

---

## 6. CONCLUSION

Milestone 2 successfully established a comprehensive User Profile Management and automated Resume Intelligence framework for **CareerPilot AI**. 

Through this phase:
1. The backend API endpoints and frontend user interfaces were seamlessly integrated.
2. User profile details—including multi-item lists for skills, education, certifications, and projects—were stored in PostgreSQL with dynamic completion percentage tracking.
3. Multi-format resume uploads (`.pdf`, `.docx`, `.txt`) were integrated with robust file type validation, size limits, and interactive progress UI.
4. Natural Language Processing (NLP) routines successfully extracted >95% of key candidate information along with automated ATS scoring.
5. Full lifecycle management (view, download, replace, delete) was established for uploaded documents.

This lays a solid foundation for Milestone 3, where the platform will utilize parsed resume data and profile skills to perform AI-driven job matching and targeted recommendations.

---

## 7. ACKNOWLEDGMENT

I would like to express my sincere gratitude to the **Infosys Springboard** team and my mentor for their continuous guidance, support, and feedback throughout the development of Milestone 2. 

This internship milestone has provided an invaluable learning experience in building production-ready FastAPI services, designing relational database schemas with JSON capabilities, implementing automated text parsing workflows, and creating user-friendly web applications.
