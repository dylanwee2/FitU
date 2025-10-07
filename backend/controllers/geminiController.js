// pages/api/gemini/generate.js
import { GoogleGenAI } from "@google/genai";

export default async function generateContent(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const prompt = req.body?.prompt;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // `response.text` contains the generated text
    res.status(200).json({ result: response.text });
  } catch (err) {
    console.error("Gemini SDK error:", err);
    res.status(500).json({ error: err.message });
  }
}