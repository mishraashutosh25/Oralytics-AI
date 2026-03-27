const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const predictPlacement = async (formData) => {
  const res = await fetch(`${BASE}/api/placement/predict`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(formData),
  });
  return res.json();
};
