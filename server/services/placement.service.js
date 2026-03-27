import axios from "axios";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

const PlacementService = {

  async predict(data) {
    try {
      const {
        age, gender, degree, branch, cgpa,
        internships, projects, codingSkills,
        communicationSkills, aptitude,
        softSkills, certifications, backlogs,
      } = data;

      const response = await axios.post(
        `${FASTAPI_URL}/predict`,
        {
          Age:                   Number(age),
          Gender:                String(gender),
          Degree:                String(degree),
          Branch:                String(branch),
          CGPA:                  parseFloat(cgpa),
          Internships:           Number(internships),
          Projects:              Number(projects),
          Coding_Skills:         Number(codingSkills),
          Communication_Skills:  Number(communicationSkills),
          Aptitude_Test_Score:   Number(aptitude),
          Soft_Skills_Rating:    Number(softSkills),
          Certifications:        Number(certifications),
          Backlogs:              Number(backlogs),
        },
        { timeout: 8000 }
      );

      const r = response.data;

      // Return the full FastAPI response — the frontend uses these fields directly
      return {
        prediction:            r.prediction,           // 1 = placed, 0 = not placed
        label:                 r.label,                // "Placed" | "Not Placed"
        placed_probability:    r.placed_probability,   // 0–100
        not_placed_probability: r.not_placed_probability,
        confidence:            r.confidence,           // "Very High" | "High" | "Moderate" | "Low"
        tips:                  r.tips,                 // string[]
      };

    } catch (error) {
      console.error("PLACEMENT API ERROR:", error.message);
      throw new Error(
        error.response?.data?.detail ||
        "ML service unavailable. Is FastAPI running on port 8000?"
      );
    }
  },

  async getStats() {
    const response = await axios.get(`${FASTAPI_URL}/stats`, { timeout: 5000 });
    return response.data;
  },

  async checkHealth() {
    const response = await axios.get(`${FASTAPI_URL}/health`, { timeout: 5000 });
    return response.data;
  },
};

export default PlacementService;