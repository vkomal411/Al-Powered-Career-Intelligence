import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tests.test_jd_matcher import (
    test_keyword_overlap_exact_match,
    test_keyword_overlap_missing_keywords,
    test_keyword_overlap_empty_input,
)
from tests.test_advice_status import (
    test_text_cleaner_preserves_tech_symbols,
    test_skill_detector_no_false_next_match,
    test_skill_detector_valid_nextjs_match,
)
from tests.test_login_flow import (
    test_password_hashing_and_verification,
    test_access_token_creation_and_decoding,
    test_refresh_token_creation_and_rotation,
)
from tests.test_jobs import (
    test_job_skill_score_calculation,
    test_job_qualification_score,
    test_job_experience_score,
    test_job_recommendation_pipeline,
)
from tests.test_modules_5_6_7 import (
    test_learning_catalog_courses,
    test_learning_catalog_certifications,
    test_course_recommender_timeline,
    test_resume_optimizer,
    test_app_routes_registered,
    test_analytics_calculation_with_job_recommender,
)



if __name__ == "__main__":
    print("Running Comprehensive Test Suite...")
    test_keyword_overlap_exact_match()
    test_keyword_overlap_missing_keywords()
    test_keyword_overlap_empty_input()
    print("[PASS] JD Matcher Tests Passed!")

    test_text_cleaner_preserves_tech_symbols()
    test_skill_detector_no_false_next_match()
    test_skill_detector_valid_nextjs_match()
    print("[PASS] Skill Detector & Text Cleaner Tests Passed!")

    test_password_hashing_and_verification()
    test_access_token_creation_and_decoding()
    test_refresh_token_creation_and_rotation()
    print("[PASS] Login & Authentication Flow Tests Passed!")

    test_job_skill_score_calculation()
    test_job_qualification_score()
    test_job_experience_score()
    test_job_recommendation_pipeline()
    print("[PASS] Module 4 Job Recommendation Engine Tests Passed!")

    test_learning_catalog_courses()
    test_learning_catalog_certifications()
    test_course_recommender_timeline()
    test_resume_optimizer()
    test_app_routes_registered()
    test_analytics_calculation_with_job_recommender()
    print("[PASS] Modules 5, 6 & 7 (Courses, Optimizer, Analytics) Tests Passed!")


    print("SUCCESS: ALL BACKEND UNIT TESTS PASSED!")



