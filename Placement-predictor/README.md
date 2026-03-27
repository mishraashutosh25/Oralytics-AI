# PlaceIQ — Industry-Level Student Placement Prediction System

## 🏗️ Project Structure

```
Placement-predictor/
└── backend/
    ├── data/
    │   └── placement_data.csv       ← Your real CSV goes here
    ├── models/
    │   └── placement_model.pkl      ← Auto-generated after training
    ├── src/
    │   ├── config.py                ← App settings & constants
    │   ├── data_loader.py           ← Dataset loading & validation
    │   ├── preprocessor.py          ← Feature engineering pipeline
    │   ├── model.py                 ← Training, evaluation, selection
    │   └── logger.py                ← Structured logging
    ├── app.py                       ← FastAPI application
    ├── train.py                     ← Run once to train model
    ├── create_dataset.py            ← Generate synthetic data (if no real CSV)
    └── requirements.txt
```

## 📊 Dataset Features (14 columns)

| Feature | Type | Range/Values |
|---|---|---|
| Age | int | 18–35 |
| Gender | categorical | Male, Female |
| Degree | categorical | B.Tech, MCA, BCA, B.Sc |
| Branch | categorical | Civil, CSE, IT, ECE, ME |
| CGPA | float | 4.0–10.0 |
| Internships | int | 0–5 |
| Projects | int | 0–10 |
| Coding_Skills | int | 1–10 |
| Communication_Skills | int | 1–10 |
| Aptitude_Test_Score | int | 30–100 |
| Soft_Skills_Rating | int | 1–10 |
| Certifications | int | 0–5 |
| Backlogs | int | 0–10 |
| **Placement_Status** | **target** | **Placed / Not Placed** |

## 🚀 Setup & Run

```bash
# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2a. Use your real CSV (place it in backend/data/placement_data.csv)
# 2b. OR generate synthetic data:
python create_dataset.py

# 3. Train the model
python train.py

# 4. Start the API
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/health` | GET | Health check |
| `/api/v1/stats` | GET | Live prediction stats |
| `/api/v1/predict` | POST | Get placement prediction |

### Example Request

```json
POST /api/v1/predict
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

### Example Response

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

## 🤖 ML Pipeline

1. **Data** — 50k realistic student records (or use your real Kaggle CSV)
2. **Preprocessing** — StandardScaler + OrdinalEncoder via sklearn ColumnTransformer
3. **Models Evaluated** — Logistic Regression, Random Forest, XGBoost (5-fold CV)
4. **Selection** — Best by ROC-AUC, then GridSearchCV fine-tuning
5. **CV Results** (on synthetic 50k dataset):
   - Logistic Regression: Acc=89.4% | F1=93.7% | **AUC=90.1%** ← Winner
   - Random Forest: Acc=89.0% | F1=93.5% | AUC=89.8%
   - XGBoost: Acc=89.1% | F1=93.5% | AUC=89.8%

> **With your real dataset** (50k rows from Kaggle), XGBoost typically achieves higher AUC.

## 🔄 Using Your Real CSV

Just replace `backend/data/placement_data.csv` with your Kaggle CSV and re-run:
```bash
python train.py
```
The CSV must have these columns: `Student_ID`, `Age`, `Gender`, `Degree`, `Branch`, `CGPA`, `Internships`, `Projects`, `Coding_Skills`, `Communication_Skills`, `Aptitude_Test_Score`, `Soft_Skills_Rating`, `Certifications`, `Backlogs`, `Placement_Status`
