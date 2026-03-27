"""
create_dataset.py
Run this ONCE to generate/download the placement dataset.
If you have the CSV already, just place it in backend/data/placement_data.csv.
This script downloads a similar dataset from a public source or generates synthetic data.
"""
import sys
import pathlib
import pandas as pd
import numpy as np

data_dir = pathlib.Path(__file__).parent / "data"
data_dir.mkdir(exist_ok=True)
out_path = data_dir / "placement_data.csv"

if out_path.exists():
    df = pd.read_csv(out_path)
    print(f"✅ Dataset already exists: {len(df)} rows")
    sys.exit(0)

print("Generating realistic placement dataset (50,000 students)...")

rng = np.random.default_rng(42)
N = 50000

DEGREES = ["B.Tech", "MCA", "BCA", "B.Sc"]
BRANCHES = ["Civil", "CSE", "IT", "ECE", "ME"]
GENDERS = ["Male", "Female"]

degree_p = [0.35, 0.20, 0.25, 0.20]
branch_p = [0.15, 0.25, 0.20, 0.20, 0.20]
gender_p = [0.60, 0.40]

age         = rng.integers(18, 25, size=N)
gender      = rng.choice(GENDERS, size=N, p=gender_p)
degree      = rng.choice(DEGREES, size=N, p=degree_p)
branch      = rng.choice(BRANCHES, size=N, p=branch_p)
cgpa        = np.clip(rng.normal(7.0, 0.9, N), 4.5, 10.0).round(2)
internships = rng.choice([0,1,2,3], size=N, p=[0.40,0.38,0.16,0.06])
projects    = rng.integers(1, 7, size=N)
coding      = rng.integers(1, 11, size=N)
comm        = rng.integers(1, 11, size=N)
aptitude    = rng.integers(35, 101, size=N)
soft_skills = rng.integers(1, 11, size=N)
certs       = rng.integers(0, 4, size=N)
backlogs    = rng.choice([0,1,2,3], size=N, p=[0.68,0.18,0.09,0.05])

# Placement logic
score = (
    (cgpa - 4.5) / 5.5 * 3.0
    + internships * 0.7
    + (projects - 1) * 0.15
    + (coding - 1) / 9 * 1.0
    + (comm - 1) / 9 * 0.5
    + (aptitude - 35) / 65 * 1.0
    + (soft_skills - 1) / 9 * 0.4
    + certs * 0.2
    - backlogs * 2.2
    + np.where(np.isin(branch, ["CSE","IT"]), 0.5, 0.0)
    + np.where(degree == "B.Tech", 0.3, 0.0)
    + rng.normal(0, 0.5, N)
)
prob = 1 / (1 + np.exp(-score + 1.0))
placed = np.where(rng.uniform(size=N) < prob, "Placed", "Not Placed")

student_ids = rng.choice(range(1, 99999), size=N, replace=False)

df = pd.DataFrame({
    "Student_ID":            student_ids,
    "Age":                   age,
    "Gender":                gender,
    "Degree":                degree,
    "Branch":                branch,
    "CGPA":                  cgpa,
    "Internships":           internships,
    "Projects":              projects,
    "Coding_Skills":         coding,
    "Communication_Skills":  comm,
    "Aptitude_Test_Score":   aptitude,
    "Soft_Skills_Rating":    soft_skills,
    "Certifications":        certs,
    "Backlogs":              backlogs,
    "Placement_Status":      placed,
})

df.to_csv(out_path, index=False)
print(f"✅ Dataset saved: {len(df)} rows → {out_path}")
print(f"   Placement rate : {(df['Placement_Status']=='Placed').mean()*100:.1f}%")
print(f"   Branch dist    : {df['Branch'].value_counts().to_dict()}")
print("\nNow run: python train.py")
