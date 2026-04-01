<div align="center">
  <h2>🤖 Oralytics AI - Placement Prediction Core</h2>
  <p><strong>Scalable Machine Learning Microservice for Career Forecasting</strong></p>

  [![Python](https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![Scikit-Learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
  [![XGBoost](https://img.shields.io/badge/XGBoost-1271D5?style=for-the-badge&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io/)
</div>

<br />

> The Placement Prediction core is a high-performance **Machine Learning microservice** built with Python and FastAPI. It processes 14-dimensional candidate features (academic scores, skills, internships) to predict the statistical probability of a candidate securing tier-1 industry placements. The resulting predictive intelligence powers the analytics engine of Oralytics AI.

---

## 🏛️ Microservice Architecture

```
placement-predictor/
└── backend/
    ├── data/
    │   └── placement_data.csv       ← Structured training dataset (50k+ records)
    ├── models/
    │   └── placement_model.pkl      ← Automatically generated predictive engine (Pickle)
    ├── src/
    │   ├── config.py                ← Environment constants & hyperparameters
    │   ├── data_loader.py           ← Data ingestion & validation (Pandas)
    │   ├── preprocessor.py          ← Encoding pipelines & feature scaling
    │   ├── model.py                 ← GridSearch evaluation & training logic
    │   └── logger.py                ← Microservice structured application logging
    ├── app.py                       ← High-concurrency FastAPI entry point
    ├── train.py                     ← Standalone ML training pipeline script
    └── requirements.txt             ← Python dependency manifest
```

---

## 📈 Data Dimensions & Features

The model processes the following 14 structured endpoints for its regression and classification tasks:

| Feature Dimension | Data Type | Permitted Range | Priority |
|---|---|---|---|
| Age | `int` | `18 - 35` | Standard |
| Gender | `categorical` | `Male`, `Female` | Low |
| Degree | `categorical` | `B.Tech`, `MCA`, `BCA`, `B.Sc` | High |
| Branch | `categorical` | `CSE`, `IT`, `ECE`, `Civil`, `ME` | High |
| CGPA | `float` | `4.0 - 10.0` | **Crucial** |
| Internships | `int` | `0 - 5` | **Crucial** |
| Projects | `int` | `0 - 10` | High |
| Coding Skills | `int` | `1 - 10` | **Crucial** |
| Communication | `int` | `1 - 10` | High |
| Aptitude Score | `int` | `30 - 100` | Standard |
| Soft Skills Rating| `int` | `1 - 10` | Standard |
| Certifications | `int` | `0 - 5` | Standard |
| Backlogs | `int` | `0 - 10` | High Penalty |
| **Placement_Status**| **Target Label**| **Placed (1) / Not Placed (0)** | N/A |

---

## 🚀 Deployment & Operations

### 1. Environment Preparation
Ensure Python 3.9+ is installed, then set up the virtual environment:
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

### 2. Model Training Pipeline
The pipeline handles preprocessing (StandardScaler + OrdinalEncoder) and cross-validates via 5-Folds between Logistic Regression, Random Forest, and XGBoost based on optimal **ROC-AUC**.

```bash
python train.py
```
> *Artifact generation successful: `models/placement_model.pkl` created.*

### 3. Service Instantiation
Launch the ASGI FastAPI server using Uvicorn:
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🔌 API Definitions

### `POST /api/v1/predict`
Calculates and returns the deterministic probability of a placement outcome.

**Example Request Payload:**
```json
{
  "Age": 21,
  "Gender": "Male",
  "Degree": "B.Tech",
  "Branch": "CSE",
  "CGPA": 8.5,
  "Internships": 2,
  "Projects": 4,
  "Coding_Skills": 8,
  "Communication_Skills": 7,
  "Aptitude_Test_Score": 85,
  "Soft_Skills_Rating": 7,
  "Certifications": 2,
  "Backlogs": 0
}
```

**Example Prediction Response:**
```json
{
  "prediction": 1,
  "label": "Placed",
  "placed_probability": 97.3,
  "not_placed_probability": 2.7,
  "confidence": "Very High",
  "tips": ["🌟 Excellent profile! Focus on mock interviews & company research."]
}
```

---
<div align="center">
  <p>Engineered for the Oralytics AI Platform.</p>
</div>
