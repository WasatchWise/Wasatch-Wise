
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DAgentProfile, AgentInteraction, DateIdea, ChatMessage, ProfileChatResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API Key is not configured. AI-powered features will be unavailable or may fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = "gemini-2.5-flash-preview-04-17";

export const simulateAgentDialogue = async (userAgent: DAgentProfile, otherAgent: DAgentProfile): Promise<Omit<AgentInteraction, 'interactingAgents'>> => {
  if (!API_KEY) {
    return Promise.resolve({
        transcript: "Error: API Key not configured.",
        summary: "Agent dialogue simulation requires a valid API key.",
        matchPotential: 0,
        matchDecision: "NO",
        error: "API Key for Gemini is not configured.",
    });
  }

  const prompt = `
    You are an AI matchmaking system facilitating a "vibe check" conversation between two users' personal CYRAiNO agents.
    Your goal is to simulate their interaction based on their defined profiles and assess their compatibility on behalf of their users.

    User A's CYRAiNO (${userAgent.agentName}):
    - Persona: ${userAgent.agentPersonaType} (${userAgent.personaBackstory?.substring(0,100)}...)
    - Core Values: ${userAgent.coreValues.join(', ')}
    - Hobbies & Interests: ${userAgent.hobbiesInterests.join(', ')}
    - Relationship Goal: ${userAgent.relationshipGoal}
    - Communication Tone: Warmth ${userAgent.communicationTone.warmth}, Humor ${userAgent.communicationTone.humor}, Directness ${userAgent.communicationTone.directness}

    User B's CYRAiNO (${otherAgent.agentName}):
    - Persona: ${otherAgent.agentPersonaType} (${otherAgent.personaBackstory?.substring(0,100)}...)
    - Core Values: ${otherAgent.coreValues.join(', ')}
    - Hobbies & Interests: ${otherAgent.hobbiesInterests.join(', ')}
    - Relationship Goal: ${otherAgent.relationshipGoal}
    - Communication Tone: Warmth ${otherAgent.communicationTone.warmth}, Humor ${otherAgent.communicationTone.humor}, Directness ${otherAgent.communicationTone.directness}

    Instructions:
    1. Simulate a short, insightful, and natural-sounding conversation (3-5 exchanges for each agent, so 6-10 lines total) between these two CYRAiNO agents. They should try to gauge compatibility based on their profiles, as if they were representing their users. The conversation should reflect their defined personas and communication tones.
    2. After the conversation, provide a brief summary of their interaction and perceived compatibility.
    3. Provide a "matchPotential" score (integer between 0 and 100).
    4. Provide a "matchDecision" (string: "YES" if high potential, "NO" if low potential). Base this on the dialogue and their profiles.
    5. If "matchDecision" is "YES", optionally provide a "blindDatePitch" (string, 1-2 sentences). This is a short, intriguing teaser that could be used if recommending a blind date between their USERS, focusing on shared esoteric compatibilities or unique dynamics observed in the CYRAiNOs' interaction, WITHOUT revealing names or explicit profile details of the users. Example: "Your CYRAiNOs found a shared love for existentialist puppet shows and a similar dry wit; this could be an unexpectedly delightful meeting of minds for you both." If no strong pitch comes to mind, omit this field or set to null.

    Format the entire output strictly as a JSON object with the following keys: "transcript" (string, with each line starting with the CYRAiNO's name, e.g., "${userAgent.agentName}: Hello!"), "summary" (string), "matchPotential" (number), "matchDecision" (string: "YES" or "NO"), and optionally "blindDatePitch" (string or null).
    Ensure the JSON is valid. Do not include any explanatory text outside the JSON object.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsed = JSON.parse(jsonStr);
    
    if (typeof parsed.transcript !== 'string' || 
        typeof parsed.summary !== 'string' ||
        typeof parsed.matchPotential !== 'number' ||
        (parsed.matchDecision !== "YES" && parsed.matchDecision !== "NO") ||
        (parsed.blindDatePitch !== undefined && parsed.blindDatePitch !== null && typeof parsed.blindDatePitch !== 'string')
      ) {
      console.error("Gemini response for agent dialogue is not in the expected JSON format.", parsed);
      throw new Error("Gemini response is not in the expected JSON format for dialogue.");
    }
    
    return {
        transcript: parsed.transcript,
        summary: parsed.summary,
        matchPotential: parsed.matchPotential,
        matchDecision: parsed.matchDecision as "YES" | "NO",
        blindDatePitch: parsed.blindDatePitch || undefined, 
    };

  } catch (error) {
    console.error('Error calling Gemini API for agent dialogue or parsing response:', error);
    let errorMessage = 'An unexpected error occurred while simulating agent dialogue.';
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            errorMessage = "The Gemini API key is invalid. Please check your configuration.";
        } else if (error.message.includes("JSON format for dialogue")) {
             errorMessage = "The AI's dialogue response format was unexpected. Please try again.";
        } else if (error.message.includes("JSON")) {
            errorMessage = "Failed to parse the AI's response. The format might be incorrect.";
        } else {
            errorMessage = `Gemini API error: ${error.message}`;
        }
    }
     return {
        transcript: "Error: Could not simulate dialogue.",
        summary: `Interaction failed: ${errorMessage}`,
        matchPotential: 0,
        matchDecision: "NO",
        error: errorMessage 
    };
  }
};


export const generateDateIdeas = async (userCyrano: DAgentProfile, matchedCyrano: DAgentProfile, interactionSummary: string, isBlindDate?: boolean): Promise<DateIdea[] | { error: string }> => {
  if (!API_KEY) {
    return { error: "API Key for Gemini is not configured. Date ideas cannot be generated." };
  }

  const blindDateContext = isBlindDate 
    ? "This is for a BLIND DATE between the USERS of these CYRAiNO agents. The users haven't seen photos or had prior direct contact. The date ideas should foster natural interaction and discovery for the users. Focus on experiences over explicit profile matching."
    : "The users' CYRAiNO agents have reviewed each other's profiles and had an initial positive interaction, suggesting their users might connect well.";

  const prompt = `
    You are CYRAiNO, an AI dating concierge and coach, tasked with planning a date for two USERS based on the interaction of their personal CYRAiNO agents.
    Your suggestions should be creative, thoughtful, and tailored to foster connection and maybe even a little personal growth for the USERS.
    The target audience for these suggestions and especially the "cyranoConvoCatalysts" is Gen Z and young Millennials (Alphas) - keep it cool, witty, authentic, and gently thought-provoking.

    Context: ${blindDateContext}

    User A's CYRAiNO (${userCyrano.agentName}):
    - Persona: ${userCyrano.agentPersonaType}
    - Core Values: ${userCyrano.coreValues.join(', ')}
    - Hobbies & Interests: ${userCyrano.hobbiesInterests.join(', ')}
    - Relationship Goal: ${userCyrano.relationshipGoal}

    User B's CYRAiNO (${isBlindDate ? "Mystery CYRAiNO" : matchedCyrano.agentName}):
    ${isBlindDate ? "- Profile details are intentionally sparse for a blind date experience for the users." : `
    - Persona: ${matchedCyrano.agentPersonaType}
    - Core Values: ${matchedCyrano.coreValues.join(', ')}
    - Hobbies & Interests: ${matchedCyrano.hobbiesInterests.join(', ')}
    - Relationship Goal: ${matchedCyrano.relationshipGoal}
    `}

    Summary of the CYRAiNO Agents' interaction: "${interactionSummary}"

    Instructions:
    1. Generate 3 diverse date ideas suitable for the USERS in the context (blind date or regular).
    2. For each idea, provide:
        - "activity": (string) The name of the date activity.
        - "description": (string) A brief, appealing description of the date.
        - "budget": (string) Estimated budget (e.g., "$", "$$", "$$$", "Free").
        - "quirkFactor": (string) How unique or classic is it (e.g., "Super Unique", "Chill Classic", "Artsy Edge").
        - "vibe": (string) The overall vibe of the date (e.g., "Low-key & Deep", "High Energy Fun", "Creative Spark").
        - "suggestedTimeSlots": (array of 2-3 strings) General time slots (e.g., ["Friday Evening", "Saturday Afternoon"]).
        - "cyranoConvoCatalysts": (array of 2-3 strings) Witty, engaging, and authentic conversation starters/prompts FOR THE USERS on their date. They should be clever but not try-hard, good for breaking the ice, sparking fun debate, or encouraging slight vulnerability and connection. Think Zone of Proximal Development: gentle pushes. Examples: "If this [activity/place] was a song, what would its title be and why?", "What's a small 'win' you've had recently that you're proud of?", "Unpopular opinion time: what's something everyone loves that you just don't get?". ${isBlindDate ? "For blind dates, make catalysts more general and discovery-oriented." : ""}

    Format the entire output strictly as a JSON array of 3 objects, each object conforming to the structure above.
    Ensure the JSON is valid. Do not include any explanatory text outside the JSON array.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(idea => 
        typeof idea.activity === 'string' &&
        typeof idea.description === 'string' &&
        typeof idea.budget === 'string' &&
        typeof idea.quirkFactor === 'string' &&
        typeof idea.vibe === 'string' &&
        Array.isArray(idea.cyranoConvoCatalysts) && 
        Array.isArray(idea.suggestedTimeSlots) &&
        idea.cyranoConvoCatalysts.every((s: any) => typeof s === 'string') &&
        idea.suggestedTimeSlots.every((s: any) => typeof s === 'string')
    )) {
      console.error("Gemini response for date ideas is not in the expected JSON format.", parsed);
      throw new Error("Gemini response is not in the expected JSON format for date ideas.");
    }
    
    return parsed as DateIdea[];

  } catch (error) {
    console.error('Error calling Gemini API for date ideas or parsing response:', error);
    let errorMessage = 'An unexpected error occurred while generating date ideas.';
     if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            errorMessage = "The Gemini API key is invalid. Please check your configuration.";
        } else if (error.message.includes("JSON format for date ideas")) {
             errorMessage = "The AI's date ideas response format was unexpected. Please try again.";
        } else if (error.message.includes("JSON")) {
            errorMessage = "Failed to parse the AI's date ideas. The format might be incorrect.";
        } else {
            errorMessage = `Gemini API error: ${error.message}`;
        }
    }
    return { error: errorMessage };
  }
};


export const chatWithAgentAndExtractProfile = async (
  chatHistory: ChatMessage[],
  currentUserPersonalCyranoProfile: DAgentProfile, // This is the user's own CYRAiNO profile being built
  userMessageContent: string
): Promise<ProfileChatResponse | { error: string }> => {
  if (!API_KEY) {
    return { error: "API Key for Gemini is not configured. Profile chat unavailable." };
  }

  const formattedChatHistory = chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'CYRAiNO (System Coach)'}: ${msg.content}`).join('\n');

  const prompt = `
    You are CYRAiNO, a friendly, witty, and deeply insightful AI dating coach (AgentPersonaType.Coach). Your primary goals are:
    1.  Help the user build and refine *their own personal CYRAiNO* (their AI Matchmaker profile). This involves understanding their personality, values, hobbies, relationship goals, dealbreakers, their desired name for their CYRAiNO, and its persona.
    2.  Act as a supportive coach: offer positive affirmations, notice nuances in their communication, and provide constructive feedback to foster a growth mindset.
    3.  Gently challenge preconceived notions or limiting beliefs if they arise, using Socratic questioning or offering alternative perspectives in a supportive way.
    
    The user's current draft for *their personal CYRAiNO* (their AI Matchmaker) is:
    ${JSON.stringify(currentUserPersonalCyranoProfile, null, 2)}

    The conversation history so far (User is talking to you, CYRAiNO the System Coach):
    ${formattedChatHistory}

    The user just said: "${userMessageContent}"

    Your Persona, CYRAiNO (System Coach):
    - Tone: Warm (85), Humorous (70), Direct but Empathetic (65). You're like a wise, witty friend helping them build something cool.
    - Approach: Use open-ended questions. Listen actively. Affirm positive statements. If the user expresses a limiting belief (e.g., "I'm bad at X"), you might gently ask, "That's an interesting thought. What makes you feel that way about X?" or "I hear you. Sometimes we're our own harshest critics. What if X is a skill you're still developing?"
    - Naming their CYRAiNO: If they haven't named their personal CYRAiNO or mention wanting to change it, guide them. "What name feels right for your AI matchmaker? Something that reflects its style or your connection with it?"

    Instructions for your response:
    1.  Craft a "chatResponse" (string): Your textual response to the user. Maintain your CYRAiNO (System Coach) persona. This response should integrate coaching elements naturally.
    2.  Identify "profileUpdate" (object or null): Based on the *entire conversation context* and *latest user message*, extract information for *the user's personal CYRAiNO profile* (agentName, agentPersonaType, personaBackstory, communicationTone, coreValues, hobbiesInterests, relationshipGoal, dealbreakers).
        - Only include fields you are reasonably confident about.
        - For array fields (coreValues, hobbiesInterests, dealbreakers), append new, unique items.

    Output Format:
    Strictly provide a single JSON object with "chatResponse" and "profileUpdate".

    Example 1 (Profile update for user's CYRAiNO):
    {
      "chatResponse": "That's a powerful realization about valuing 'Authenticity' for your CYRAiNO! It truly shines through. What other qualities do you envision for your personal AI matchmaker?",
      "profileUpdate": {
        "coreValues": ["Authenticity"]
      }
    }

    Example 2 (Coaching, no profile update):
    {
      "chatResponse": "I hear you saying you're 'not very adventurous.' That's one way to see it. I also hear a thoughtful person who perhaps values comfort and predictability. When you think about the kinds of experiences you'd like your CYRAiNO to help facilitate, what small step outside your usual routine might feel intriguing, even if not 'adventurous' in a big way?",
      "profileUpdate": null
    }
     Example 3 (Updating user's CYRAiNO name):
    {
      "chatResponse": "Ah, 'Pathfinder' - I love that name for your personal CYRAiNO! It sounds like it will be a great guide. What kind of personality or backstory do you imagine for Pathfinder?",
      "profileUpdate": {
        "agentName": "Pathfinder"
      }
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const matchJson = jsonStr.match(fenceRegex);
    if (matchJson && matchJson[2]) {
      jsonStr = matchJson[2].trim();
    }
    
    const parsed = JSON.parse(jsonStr);

    if (typeof parsed.chatResponse !== 'string' || 
        (parsed.profileUpdate !== null && typeof parsed.profileUpdate !== 'object')
       ) {
      console.error("Gemini response for profile chat is not in the expected JSON format.", parsed);
      throw new Error("Gemini response is not in the expected JSON format for profile chat.");
    }
    
    return parsed as ProfileChatResponse;

  } catch (error) {
    console.error('Error calling Gemini API for profile chat or parsing response:', error);
    let errorMessage = 'An unexpected error occurred while chatting with CYRAiNO.';
     if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            errorMessage = "The Gemini API key is invalid. Please check your configuration.";
        } else if (error.message.includes("JSON format")) { 
             errorMessage = "The AI's response format was unexpected. Please try again.";
        } else {
            errorMessage = `Gemini API error: ${error.message}`;
        }
    }
    return { error: errorMessage };
  }
};

// This function is less central now but can be kept for auxiliary uses if any.
// The main greeting is handled by INITIAL_CHAT_MESSAGE_CONTENT for the System CYRAiNO.
export const getAgentGreeting = async (agentName: string): Promise<string> => {
  if (!API_KEY) {
    console.warn("Gemini API Key not available for getAgentGreeting.");
    return `Hello, I am ${agentName}. (AI greeting disabled)`;
  }
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Generate a friendly, short, and slightly quirky welcome message for an AI dating agent named ${agentName}. Reflect a hint of its unique personality if possible, but keep it concise.`,
       config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating agent greeting:", error);
    return `Hello, I am ${agentName}. I'm having a little trouble thinking right now!`;
  }
};