"""
save_dataset.py — Utility to verify the dataset exists & show a summary.
The user should manually place their full placement_data.csv in backend/data/
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import pandas as pd

data_path = Path(__file__).parent / "data" / "placement_data.csv"

if not data_path.exists():
    print(f"❌  Dataset not found at: {data_path}")
    print("    Please place your placement_data.csv file in the backend/data/ folder.")
    sys.exit(1)

df = pd.read_csv(data_path)
print(f"✅  Dataset loaded: {len(df)} rows × {len(df.columns)} columns")
print(f"    Columns: {list(df.columns)}")
print(f"\n    Placement Rate: {(df['Placement_Status']=='Placed').mean()*100:.1f}%")
print(f"    Gender split  : {df['Gender'].value_counts().to_dict()}")
print(f"    Degree split  : {df['Degree'].value_counts().to_dict()}")
print(f"    Branch split  : {df['Branch'].value_counts().to_dict()}")
print(f"    CGPA range    : {df['CGPA'].min():.2f} – {df['CGPA'].max():.2f}")
print(f"    Backlogs range: {df['Backlogs'].min()} – {df['Backlogs'].max()}")
print("\n✅  Dataset looks good! Run `python train.py` to train your model.")
