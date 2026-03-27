"""
Feature Engineering & Preprocessing Pipeline
Handles the real 14-feature placement dataset.
"""
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OrdinalEncoder, LabelEncoder

from src.config import (
    NUMERIC_FEATURES, CATEGORICAL_FEATURES,
    VALID_GENDERS, VALID_DEGREES, VALID_BRANCHES,
)
from src.logger import get_logger

logger = get_logger(__name__)


def build_preprocessor() -> ColumnTransformer:
    """
    ColumnTransformer:
      - StandardScaler  → numeric features
      - OrdinalEncoder  → Gender, Degree, Branch (fixed categories)
    """
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                StandardScaler(),
                NUMERIC_FEATURES,
            ),
            (
                "gender",
                OrdinalEncoder(
                    categories=[VALID_GENDERS],
                    handle_unknown="use_encoded_value",
                    unknown_value=-1,
                ),
                ["Gender"],
            ),
            (
                "degree",
                OrdinalEncoder(
                    categories=[VALID_DEGREES],
                    handle_unknown="use_encoded_value",
                    unknown_value=-1,
                ),
                ["Degree"],
            ),
            (
                "branch",
                OrdinalEncoder(
                    categories=[VALID_BRANCHES],
                    handle_unknown="use_encoded_value",
                    unknown_value=-1,
                ),
                ["Branch"],
            ),
        ],
        remainder="drop",
    )
    logger.info("Preprocessor pipeline built.")
    return preprocessor


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """Cast columns to correct dtypes and ensure correct column order."""
    df = df.copy()

    for col in NUMERIC_FEATURES:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    for col in CATEGORICAL_FEATURES:
        df[col] = df[col].astype(str).str.strip()

    return df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]


def encode_target(series: pd.Series) -> pd.Series:
    """Map 'Placed' → 1, 'Not Placed' → 0."""
    return series.map({"Placed": 1, "Not Placed": 0}).astype(int)
