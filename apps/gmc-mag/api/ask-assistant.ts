import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, context } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: `Context: ${context || ''}\n\nUser Question: ${question}`,
      config: {
        systemInstruction: `You are the GMC Strategic Liaison. Your goal is to provide sophisticated, high-conviction answers to institutional investors.
        Focus on:
        - Resource scale (100M tonnes).
        - Geopolitical risk mitigation (Sovereignty).
        - Capital discipline ($25M Phase I logic).
        - Technical differentiation (HydroMet vs Pidgeon).
        If the user asks about recent events, leverage your internal knowledge of geopolitical trends. Be precise, adult, and professional.`,
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceLinks = grounding.map((chunk: any) => chunk.web?.uri).filter(Boolean);

    let text = response.text || '';
    if (sourceLinks.length > 0) {
      text += "\n\nSources:\n" + [...new Set(sourceLinks)].map(url => `- ${url}`).join('\n');
    }

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Gemini Pro Error:", error);
    return res.status(500).json({
      text: "The strategic intelligence unit is currently recalibrating. Please proceed with the technical documentation below."
    });
  }
}
