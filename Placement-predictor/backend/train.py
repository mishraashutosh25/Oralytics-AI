"""
Training Script — loads real CSV dataset, trains pipeline, saves artifact.
Usage (from backend/): python train.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from src.data_loader import load_dataset, validate_dataset
from src.preprocessor import prepare_features, encode_target
from src.model import train_best_model, save_artifacts
from src.logger import get_logger

logger = get_logger("train")


def main():
    logger.info("=" * 65)
    logger.info("PlaceIQ — Model Training Pipeline (Real Dataset)")
    logger.info("=" * 65)

    # 1. Load & validate
    logger.info("Step 1/3 — Loading dataset ...")
    df = load_dataset()
    validate_dataset(df)

    # 2. Prepare features
    logger.info("Step 2/3 — Preparing features ...")
    X = prepare_features(df)
    y = encode_target(df["Placement_Status"])
    logger.info(
        "X shape: %s | Placement rate: %.1f%%",
        X.shape, y.mean() * 100,
    )

    # 3. Train
    logger.info("Step 3/3 — Training & selecting best model ...")
    pipeline, metrics = train_best_model(X, y)

    # Save
    model_dir = Path(__file__).parent / "models"
    save_artifacts(pipeline, model_dir)

    # Summary
    logger.info("=" * 65)
    logger.info("TRAINING SUMMARY")
    logger.info("=" * 65)
    logger.info("Best model   : %s", metrics["model_name"])
    logger.info("Train Acc    : %.4f", metrics["training_accuracy"])
    logger.info("Train F1     : %.4f", metrics["training_f1"])
    logger.info("Train ROC-AUC: %.4f", metrics["training_roc_auc"])
    logger.info("-" * 65)
    logger.info("Cross-Validation Results:")
    for name, cv in metrics["cv_results"].items():
        logger.info(
            "  %-22s acc=%.3f | f1=%.3f | auc=%.3f",
            name, cv["accuracy"], cv["f1"], cv["roc_auc"],
        )
    logger.info("-" * 65)
    logger.info("Classification Report:\n%s", metrics["classification_report"])
    logger.info("=" * 65)
    logger.info("✅ Done! Run `uvicorn app:app --reload` to start the API.")


if __name__ == "__main__":
    main()
