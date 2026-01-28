import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [{ text: `High-end industrial architecture, ${prompt}. Minimalist, corporate aesthetic, dawn lighting, crisp details.` }],
      },
      config: {
        responseModalities: ["image", "text"],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return res.status(200).json({
          image: `data:image/png;base64,${part.inlineData.data}`
        });
      }
    }

    return res.status(200).json({ image: null });
  } catch (error) {
    console.error("Image Generation Error:", error);
    return res.status(500).json({ image: null, error: 'Failed to generate image' });
  }
}
