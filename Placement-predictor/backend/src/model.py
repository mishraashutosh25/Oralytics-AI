"""
Model Training, Evaluation & Selection
Trains LR, Random Forest, XGBoost; picks best by ROC-AUC; optionally tunes XGBoost.
"""
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate, GridSearchCV
from sklearn.metrics import (
    accuracy_score, f1_score, roc_auc_score, classification_report,
)
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier

from src.preprocessor import build_preprocessor, prepare_features
from src.config import settings
from src.logger import get_logger

logger = get_logger(__name__)

CV_FOLDS = 5
RANDOM_STATE = 42


def _build_models() -> dict:
    return {
        "logistic_regression": Pipeline([
            ("pre", build_preprocessor()),
            ("clf", LogisticRegression(max_iter=2000, random_state=RANDOM_STATE)),
        ]),
        "random_forest": Pipeline([
            ("pre", build_preprocessor()),
            ("clf", RandomForestClassifier(
                n_estimators=300, max_depth=10,
                min_samples_split=5, random_state=RANDOM_STATE, n_jobs=-1,
            )),
        ]),
        "xgboost": Pipeline([
            ("pre", build_preprocessor()),
            ("clf", XGBClassifier(
                n_estimators=300, max_depth=6, learning_rate=0.05,
                subsample=0.8, colsample_bytree=0.8,
                use_label_encoder=False, eval_metric="logloss",
                random_state=RANDOM_STATE, n_jobs=-1,
            )),
        ]),
    }


def evaluate_models(X: pd.DataFrame, y: pd.Series) -> dict:
    """Cross-validate all models; return metrics dict."""
    models = _build_models()
    cv = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE)
    scoring = ["accuracy", "precision", "recall", "f1", "roc_auc"]
    results = {}

    for name, pipeline in models.items():
        logger.info("Evaluating %s ...", name)
        scores = cross_validate(pipeline, X, y, cv=cv, scoring=scoring, n_jobs=-1)
        results[name] = {
            "accuracy":  round(float(scores["test_accuracy"].mean()), 4),
            "precision": round(float(scores["test_precision"].mean()), 4),
            "recall":    round(float(scores["test_recall"].mean()), 4),
            "f1":        round(float(scores["test_f1"].mean()), 4),
            "roc_auc":   round(float(scores["test_roc_auc"].mean()), 4),
        }
        logger.info(
            "%s → acc=%.4f | f1=%.4f | auc=%.4f",
            name, results[name]["accuracy"],
            results[name]["f1"], results[name]["roc_auc"],
        )
    return results


def train_best_model(X: pd.DataFrame, y: pd.Series) -> tuple:
    """Train all models, pick best by ROC-AUC, fine-tune, return (pipeline, metrics)."""
    cv_results = evaluate_models(X, y)
    best_name = max(cv_results, key=lambda k: cv_results[k]["roc_auc"])
    logger.info(
        "Best model: %s  (AUC=%.4f)",
        best_name, cv_results[best_name]["roc_auc"],
    )

    models = _build_models()
    best_pipeline = models[best_name]

    if best_name == "xgboost":
        logger.info("Fine-tuning XGBoost with GridSearchCV ...")
        param_grid = {
            "clf__max_depth":     [4, 5, 6],
            "clf__learning_rate": [0.03, 0.05, 0.1],
            "clf__n_estimators":  [200, 300],
        }
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
        gs = GridSearchCV(
            best_pipeline, param_grid, cv=cv,
            scoring="roc_auc", n_jobs=-1, verbose=1,
        )
        gs.fit(X, y)
        best_pipeline = gs.best_estimator_
        logger.info("Best XGB params: %s", gs.best_params_)
    elif best_name == "random_forest":
        logger.info("Fine-tuning Random Forest ...")
        param_grid = {
            "clf__n_estimators": [200, 300],
            "clf__max_depth":    [8, 10, 12],
        }
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
        gs = GridSearchCV(
            best_pipeline, param_grid, cv=cv,
            scoring="roc_auc", n_jobs=-1, verbose=1,
        )
        gs.fit(X, y)
        best_pipeline = gs.best_estimator_
        logger.info("Best RF params: %s", gs.best_params_)
    else:
        best_pipeline.fit(X, y)

    # Final metrics
    y_pred = best_pipeline.predict(X)
    y_prob = best_pipeline.predict_proba(X)[:, 1]

    final_metrics = {
        "model_name":        best_name,
        "training_accuracy": round(float(accuracy_score(y, y_pred)), 4),
        "training_f1":       round(float(f1_score(y, y_pred)), 4),
        "training_roc_auc":  round(float(roc_auc_score(y, y_prob)), 4),
        "cv_results":        cv_results,
        "classification_report": classification_report(y, y_pred),
    }
    logger.info("Training complete | acc=%.4f", final_metrics["training_accuracy"])
    return best_pipeline, final_metrics


def save_artifacts(pipeline, model_dir: Path) -> None:
    model_dir.mkdir(parents=True, exist_ok=True)
    path = model_dir / "placement_model.pkl"
    joblib.dump(pipeline, path)
    logger.info("Model saved → %s", path)


def load_model(model_path: Path):
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}. Run `python train.py` first.")
    model = joblib.load(model_path)
    logger.info("Model loaded from %s", model_path)
    return model
