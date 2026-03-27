"""
Data Loader — loads and validates the real placement CSV dataset.
"""
import pandas as pd
from pathlib import Path
from src.config import TARGET_COL, ALL_FEATURES
from src.logger import get_logger

logger = get_logger(__name__)

DATASET_PATH = Path(__file__).resolve().parent.parent / "data" / "placement_data.csv"

# Columns to drop (not used for training)
DROP_COLS = ["Student_ID"]


def load_dataset(path: Path = DATASET_PATH) -> pd.DataFrame:
    """Load the CSV dataset and perform basic cleaning."""
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found at {path}")

    df = pd.read_csv(path)
    logger.info("Loaded dataset: %d rows, %d cols from %s", len(df), len(df.columns), path.name)

    # Drop unused columns
    for col in DROP_COLS:
        if col in df.columns:
            df = df.drop(columns=[col])

    # Drop rows with null target
    df = df.dropna(subset=[TARGET_COL])

    # Strip whitespace in string columns
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].str.strip()

    logger.info(
        "After cleaning: %d rows | placement_rate=%.1f%%",
        len(df),
        (df[TARGET_COL] == "Placed").mean() * 100,
    )
    return df


def validate_dataset(df: pd.DataFrame) -> None:
    required = set(ALL_FEATURES) | {TARGET_COL}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Dataset missing columns: {missing}")
    assert df[TARGET_COL].isin(["Placed", "Not Placed"]).all(), "Unexpected target values"
    logger.info("Dataset validation passed.")
