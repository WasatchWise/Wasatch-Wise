// Client-side service that calls serverless API functions
// API keys are kept secure on the server

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Robust check for the specific 404 "Requested entity was not found" error
export const isKeyNotFoundError = (error: any) => {
  const errorString = typeof error === 'string' ? error : JSON.stringify(error);
  return errorString.includes("Requested entity was not found") || 
         errorString.includes("404") ||
         (error?.message && error.message.includes("Requested entity was not found"));
};

export async function synthesizeNarrative(sectionGoal: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/synthesize-narrative`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sectionGoal }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to synthesize narrative');
    }

    return await response.json();
  } catch (error) {
    console.error("Error synthesizing narrative:", error);
    return null;
  }
}

export async function answerObjection(userQuestion: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/answer-objection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: userQuestion }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to answer question');
    }

    return await response.json();
  } catch (error) {
    console.error("Error answering objection:", error);
    throw error;
  }
}

export async function getInfrastructureContext() {
  try {
    const response = await fetch(`${API_BASE_URL}/infrastructure-context`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get infrastructure context');
    }

    return await response.json();
  } catch (error) {
    console.error("Maps grounding error:", error);
    throw error;
  }
}