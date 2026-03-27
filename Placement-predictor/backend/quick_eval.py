import sys; sys.path.insert(0, '.')
from src.data_loader import load_dataset
from src.preprocessor import prepare_features, encode_target

df = load_dataset()
X = prepare_features(df)
y = encode_target(df['Placement_Status'])

print(f"Dataset: {len(df)} rows | Placement rate: {y.mean()*100:.1f}%")

from src.model import evaluate_models
results = evaluate_models(X, y)
print()
for name, r in results.items():
    print(f"{name:<25} acc={r['accuracy']:.3f} | f1={r['f1']:.3f} | auc={r['roc_auc']:.3f}")
