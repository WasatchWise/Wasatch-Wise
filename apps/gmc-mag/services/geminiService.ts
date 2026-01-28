export async function askAssistant(question: string, context: string) {
  try {
    const response = await fetch('/api/ask-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Gemini Pro Error:", error);
    return "The strategic intelligence unit is currently recalibrating. Please proceed with the technical documentation below.";
  }
}

export async function generateVisualRepresentation(prompt: string) {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.image;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
}
