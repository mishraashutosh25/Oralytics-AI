"""
PlaceIQ — FastAPI Application (Real 14-feature dataset)
Endpoints (all available at both /api/v1/* AND root /* for Node.js service):
  GET  /health / /api/v1/health     — Health check
  GET  /stats  / /api/v1/stats      — Live prediction statistics
  POST /predict / /api/v1/predict   — Placement prediction
"""
import sys
import time
from pathlib import Path
from contextlib import asynccontextmanager

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

sys.path.insert(0, str(Path(__file__).parent))

from src.config import (
    settings,
    VALID_GENDERS, VALID_DEGREES, VALID_BRANCHES,
    TIPS, AGE_RANGE, CGPA_RANGE, ALL_FEATURES,
    NUMERIC_FEATURES, CATEGORICAL_FEATURES,
    SKILL_RANGE, APTITUDE_RANGE, BACKLOG_RANGE,
    SOFT_SKILL_RANGE, CERTIFICATION_RANGE,
    PROJECT_RANGE, INTERNSHIP_RANGE,
)
from src.logger import get_logger
from src.model import load_model
from src.preprocessor import prepare_features

logger = get_logger("app")

_state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading PlaceIQ model ...")
    try:
        _state["model"] = load_model(settings.model_path_abs)
        _state["request_count"] = 0
        _state["placed_count"] = 0
        logger.info("✅ Model loaded successfully.")
    except FileNotFoundError as e:
        logger.error(str(e))
        raise
    yield
    logger.info("PlaceIQ API shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Industry-level Student Placement Prediction API — 14 features",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response Pydantic Models ───────────────────────────────────────
class StudentInput(BaseModel):
    Age: int = Field(..., ge=AGE_RANGE[0], le=AGE_RANGE[1], example=21)
    Gender: str = Field(..., example="Male")
    Degree: str = Field(..., example="B.Tech")
    Branch: str = Field(..., example="CSE")
    CGPA: float = Field(..., ge=CGPA_RANGE[0], le=CGPA_RANGE[1], example=7.8)
    Internships: int = Field(..., ge=INTERNSHIP_RANGE[0], le=INTERNSHIP_RANGE[1], example=1)
    Projects: int = Field(..., ge=PROJECT_RANGE[0], le=PROJECT_RANGE[1], example=3)
    Coding_Skills: int = Field(..., ge=SKILL_RANGE[0], le=SKILL_RANGE[1], example=7, description="1–10")
    Communication_Skills: int = Field(..., ge=SKILL_RANGE[0], le=SKILL_RANGE[1], example=6, description="1–10")
    Aptitude_Test_Score: int = Field(..., ge=APTITUDE_RANGE[0], le=APTITUDE_RANGE[1], example=75)
    Soft_Skills_Rating: int = Field(..., ge=SOFT_SKILL_RANGE[0], le=SOFT_SKILL_RANGE[1], example=6)
    Certifications: int = Field(..., ge=CERTIFICATION_RANGE[0], le=CERTIFICATION_RANGE[1], example=2)
    Backlogs: int = Field(..., ge=BACKLOG_RANGE[0], le=BACKLOG_RANGE[1], example=0)

    @field_validator("Gender")
    @classmethod
    def validate_gender(cls, v):
        if v not in VALID_GENDERS:
            raise ValueError(f"Gender must be one of {VALID_GENDERS}")
        return v

    @field_validator("Degree")
    @classmethod
    def validate_degree(cls, v):
        if v not in VALID_DEGREES:
            raise ValueError(f"Degree must be one of {VALID_DEGREES}")
        return v

    @field_validator("Branch")
    @classmethod
    def validate_branch(cls, v):
        if v not in VALID_BRANCHES:
            raise ValueError(f"Branch must be one of {VALID_BRANCHES}")
        return v


class PredictionResponse(BaseModel):
    prediction: int
    label: str
    placed_probability: float
    not_placed_probability: float
    confidence: str
    tips: list[str]


class StatsResponse(BaseModel):
    total_predictions: int
    placed_predictions: int
    placement_rate_live: float
    valid_genders: list[str]
    valid_degrees: list[str]
    valid_branches: list[str]


class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
    uptime_requests: int


# ─── Middleware ────────────────────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    logger.info("%s %s → %d [%.1fms]", request.method, request.url.path, response.status_code, ms)
    return response


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/api/v1/health", response_model=HealthResponse, tags=["Ops"])
async def health():
    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        model_loaded="model" in _state,
        uptime_requests=_state.get("request_count", 0),
    )


@app.get("/api/v1/stats", response_model=StatsResponse, tags=["Stats"])
async def stats():
    total = _state.get("request_count", 0)
    placed = _state.get("placed_count", 0)
    return StatsResponse(
        total_predictions=total,
        placed_predictions=placed,
        placement_rate_live=round(placed / total * 100, 1) if total > 0 else 0.0,
        valid_genders=VALID_GENDERS,
        valid_degrees=VALID_DEGREES,
        valid_branches=VALID_BRANCHES,
    )


@app.post("/api/v1/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict(student: StudentInput):
    model = _state.get("model")
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run train.py first.")

    try:
        input_df = pd.DataFrame([student.model_dump()])
        X = prepare_features(input_df)

        prediction: int = int(model.predict(X)[0])
        proba: np.ndarray = model.predict_proba(X)[0]

        placed_prob = round(float(proba[1]) * 100, 2)
        not_placed_prob = round(float(proba[0]) * 100, 2)

        confidence = (
            "Very High" if placed_prob >= 80 else
            "High"      if placed_prob >= 60 else
            "Moderate"  if placed_prob >= 40 else
            "Low"
        )

        tips_key = "high" if placed_prob >= 70 else ("medium" if placed_prob >= 40 else "low")
        tips = TIPS[tips_key]

        _state["request_count"] = _state.get("request_count", 0) + 1
        if prediction == 1:
            _state["placed_count"] = _state.get("placed_count", 0) + 1

        logger.info(
            "Result: %s | prob=%.1f%% | CGPA=%.1f | Branch=%s | Backlogs=%d",
            "PLACED" if prediction == 1 else "NOT PLACED",
            placed_prob, student.CGPA, student.Branch, student.Backlogs,
        )

        return PredictionResponse(
            prediction=prediction,
            label="Placed" if prediction == 1 else "Not Placed",
            placed_probability=placed_prob,
            not_placed_probability=not_placed_prob,
            confidence=confidence,
            tips=tips,
        )

    except Exception as e:
        logger.exception("Prediction error: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.exception_handler(404)
async def not_found(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": "Endpoint not found."})


# ─── Root-level aliases (for Node.js service calling ${FASTAPI_URL}/predict) ──
@app.get("/health", response_model=HealthResponse, tags=["Ops"], include_in_schema=False)
async def health_alias():
    return await health()


@app.get("/stats", response_model=StatsResponse, tags=["Stats"], include_in_schema=False)
async def stats_alias():
    return await stats()


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"], include_in_schema=False)
async def predict_alias(student: StudentInput):
    return await predict(student)
