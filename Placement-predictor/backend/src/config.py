"""
Application Configuration — updated for real 14-feature dataset.
"""
from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    APP_NAME: str = "PlaceIQ"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    MODEL_PATH: str = "models/placement_model.pkl"
    LOG_LEVEL: str = "INFO"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    @property
    def model_path_abs(self) -> Path:
        return BASE_DIR / self.MODEL_PATH

    class Config:
        env_file = str(BASE_DIR / ".env")
        extra = "ignore"


settings = Settings()

# ─── Domain Constants ─────────────────────────────────────────────────────────

VALID_GENDERS = ["Male", "Female"]
VALID_DEGREES = ["B.Tech", "MCA", "BCA", "B.Sc"]
VALID_BRANCHES = ["Civil", "CSE", "IT", "ECE", "ME"]

AGE_RANGE = (18, 35)
CGPA_RANGE = (4.0, 10.0)
INTERNSHIP_RANGE = (0, 5)
PROJECT_RANGE = (0, 10)
SKILL_RANGE = (1, 10)
APTITUDE_RANGE = (30, 100)
SOFT_SKILL_RANGE = (1, 10)
CERTIFICATION_RANGE = (0, 5)
BACKLOG_RANGE = (0, 10)

# Feature columns (in order used for training)
NUMERIC_FEATURES = [
    "Age", "CGPA", "Internships", "Projects",
    "Coding_Skills", "Communication_Skills",
    "Aptitude_Test_Score", "Soft_Skills_Rating",
    "Certifications", "Backlogs",
]
CATEGORICAL_FEATURES = ["Gender", "Degree", "Branch"]
ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES

TARGET_COL = "Placement_Status"
TARGET_POS = "Placed"
TARGET_NEG = "Not Placed"

# Tips
TIPS: dict[str, list[str]] = {
    "high": [
        "🌟 Excellent profile! Focus on mock interviews & company research.",
        "💡 Contribute to open-source — it sets you apart.",
        "📝 Tailor your resume for each company you target.",
    ],
    "medium": [
        "📚 Boost your CGPA — aim for 7.5+.",
        "🛠️ Get at least one quality internship before graduation.",
        "💻 Practice DSA daily on LeetCode or GeeksforGeeks.",
        "🏆 Add certifications in your branch's key technologies.",
    ],
    "low": [
        "⚠️ Clear all backlogs immediately — companies screen on this first.",
        "📖 Start a focused DSA revision plan (4–6 weeks).",
        "🤝 Seek guidance from your college placement cell.",
        "🎯 Work on communication skills — they matter as much as technical skills.",
        "📊 Improve your aptitude score with daily practice.",
    ],
}
