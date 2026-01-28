import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;
const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

let ai: GoogleGenAI | null = null;
let isAIServiceAvailable = false;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    isAIServiceAvailable = true;
    console.info("Google GenAI SDK initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    isAIServiceAvailable = false;
  }
} else {
  console.warn("API_KEY is not set. AI features will be unavailable. Please ensure the API_KEY environment variable is configured.");
  isAIServiceAvailable = false;
}

export const getIsAIServiceAvailable = (): boolean => isAIServiceAvailable;

export const generateAIContent = async (prompt: string): Promise<string> => {
  if (!ai || !isAIServiceAvailable) {
    throw new Error("AI service is not available or not initialized.");
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content with AI:", error);
    // Consider more specific error handling or re-throwing a custom error
    throw new Error("Failed to generate AI content.");
  }
};

// Add other AI functionalities like chat or image generation here if needed following the same pattern.
