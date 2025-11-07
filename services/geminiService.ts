
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY is not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const organizeGroceryList = async (list: string, store: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.reject(new Error("API key is not configured."));
  }

  const model = "gemini-2.5-flash";

  const prompt = `
    You are an expert shopping assistant. Your task is to organize a grocery list to make shopping as efficient as possible.
    I am going to the store: "${store}".
    Please categorize the following grocery list based on the typical layout of a large supermarket.
    Use clear, common category headings like 'Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Pantry & Dry Goods', 'Canned Goods', 'Frozen Foods', 'Beverages', and 'Household & Personal Care'.
    Format the output as a clean, easy-to-read list with Markdown headings for each category. Do not add any introductory or concluding sentences, just the organized list itself.

    Here is the raw list:
    ---
    ${list}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error organizing grocery list:", error);
    throw new Error("Failed to generate the organized grocery list.");
  }
};
