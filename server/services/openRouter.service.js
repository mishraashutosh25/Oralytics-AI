import axios from "axios";

export const askAi = async (messages) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error("Message array is empty.")
  }

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "openai/gpt-4o-mini",
      messages,
      temperature: 0.3,
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Oralytics AI",
      },
      timeout: 60000,
    });

    const content = response?.data?.choices?.[0]?.message?.content;

    if (!content || !content.trim()) {
      throw new Error("AI returned an empty response.")
    }

    return content;

  } catch (error) {
    const detail =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Unknown OpenRouter error"
    console.error("OpenRouter Error:", detail)
    throw new Error(detail)
  }
}