"""Test the /predict root alias endpoint that Node.js service calls."""
import json, urllib.request

payload = json.dumps({
    "Age": 22, "Gender": "Male", "Degree": "B.Tech", "Branch": "CSE",
    "CGPA": 8.5, "Internships": 2, "Projects": 4,
    "Coding_Skills": 8, "Communication_Skills": 7, "Aptitude_Test_Score": 85,
    "Soft_Skills_Rating": 7, "Certifications": 2, "Backlogs": 0,
}).encode()

req = urllib.request.Request(
    "http://localhost:8000/predict", data=payload,
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req) as r:
    res = json.load(r)
    print("Root /predict alias working!")
    print(f"  prediction          : {res['prediction']}")
    print(f"  label               : {res['label']}")
    print(f"  placed_probability  : {res['placed_probability']}%")
    print(f"  not_placed_prob     : {res['not_placed_probability']}%")
    print(f"  confidence          : {res['confidence']}")
    print(f"  tips[0]             : {res['tips'][0]}")
    print("\n✅ All fields match frontend expectations!")
