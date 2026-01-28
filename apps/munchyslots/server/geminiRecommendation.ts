import { GoogleGenAI } from "@google/genai";
import type { FilterState, RestaurantResult, GroundingChunk } from "../types";

function buildPrompt(filters: FilterState): string {
  let prompt = `Recommend exactly ONE best restaurant in ${filters.location} that matches these criteria:`;

  if (filters.cuisine && filters.cuisine !== "Anything") {
    prompt += ` Cuisine: ${filters.cuisine}.`;
  }
  if (filters.price && filters.price !== "Any Price") {
    prompt += ` Price Range: ${filters.price}.`;
  }
  if (filters.vibe && filters.vibe !== "No Preference") {
    prompt += ` Vibe: ${filters.vibe}.`;
  }

  prompt += `
If the specific request isn't perfectly matched, find the closest high-quality alternative.
Provide a brief enticing description of why it's a good choice.
Focus on local favorites or highly rated spots.
Important: The response MUST focus on a single specific place so I can display it as the "Winner".`;

  return prompt;
}

export async function recommendRestaurantWithGemini(
  filters: FilterState,
  apiKey: string,
): Promise<RestaurantResult> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(filters);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      // We do NOT use responseMimeType: 'application/json' because it's incompatible with googleMaps tool
      // We will parse the text and grounding metadata manually
      temperature: 1,
    },
  });

  const candidate = response.candidates?.[0];
  const text =
    candidate?.content?.parts?.map((p) => p.text).join("") ||
    "No recommendation found.";

  const groundingChunks =
    (candidate?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];

  const mapChunk = groundingChunks.find(
    (chunk) => chunk.maps?.uri && chunk.maps?.title,
  );

  const name = mapChunk?.maps?.title || "Mystery Spot";
  const mapLink = mapChunk?.maps?.uri;

  return {
    name,
    description: text,
    mapLink,
    sourceChunks: groundingChunks,
  };
}


