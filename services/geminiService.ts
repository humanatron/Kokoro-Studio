
import { GoogleGenAI, Type } from "@google/genai";
import { Person } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates abstract, poetic gift ideas based on personal nuances.
 */
export const getRelationshipAdvice = async (person: Person) => {
  const preferencesText = person.preferences.map(p => `- ${p.category}: ${p.content}`).join('\n');
  const datesText = person.dates.map(d => `- ${d.label}: ${d.date}`).join('\n');

  const prompt = `
    Based ONLY on the following information about ${person.name}, who is my ${person.relationship}, provide 3 thoughtful, small gestures or gift ideas.
    
    Preferences:
    ${preferencesText}
    
    Important Dates:
    ${datesText}
    
    Context:
    ${person.notes}
    
    Be minimalist, warm, and avoid generic suggestions. Focus on the specific details provided. 
    Format as a brief list. Do not use markdown headers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I couldn't generate insights right now. Please try again later.";
  }
};

/**
 * Deeply analyzes the relationship narrative to provide a "Connection Pulse".
 */
export const getBondInsight = async (person: Person) => {
  const prompt = `
    Analyze the current bond with ${person.name} (${person.relationship}).
    Nuances: ${person.preferences.map(p => p.content).join(', ')}
    Narrative: ${person.notes}
    
    Provide:
    1. A "Bond Status" (2-3 words, e.g., "Quietly Steadfast", "Evolving Complexity").
    2. A brief analysis of the relationship's current "vibe".
    3. One "Nurture Action" - a non-generic way to deepen this specific connection.
    
    Return in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            vibe: { type: Type.STRING },
            action: { type: Type.STRING }
          },
          required: ["status", "vibe", "action"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Bond Insight Error:", error);
    return null;
  }
};

/**
 * Generates an abstract symbol of the person's essence.
 */
export const generateSoulPortrait = async (person: Person) => {
  const nuances = person.preferences.map(p => p.content).slice(0, 5).join(', ');
  const prompt = `An abstract, minimalist soul portrait representing a ${person.relationship} named ${person.name}. 
    Themes: ${nuances}. 
    Style: Organic shapes, textured fine art, Bauhaus mixed with Japanese wabi-sabi. 
    Colors: Earthy and muted. 
    No faces, no text, no realistic people. Pure symbolic abstraction.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

/**
 * Uses Google Search to find actual, real-world gifts.
 */
export const getProductRecommendations = async (person: Person) => {
  const preferencesText = person.preferences.map(p => p.content).join(', ');
  
  const prompt = `
    Find 3 specific, real products that would make great gifts for ${person.name} (${person.relationship}).
    Their interests/nuances: ${preferencesText}.
    
    For each product, provide:
    1. Product Name
    2. Approximate Price
    3. Why it fits them specifically.
    
    Use Google Search to ensure these are real, currently available items.
    Return the response in a structured JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              price: { type: Type.STRING },
              reason: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["name", "reason"]
          }
        }
      },
    });

    const products = JSON.parse(response.text || "[]");
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return products.map((p: any, i: number) => ({
      ...p,
      url: p.url || (chunks[i]?.web?.uri || chunks[0]?.web?.uri)
    }));
  } catch (error) {
    console.error("Gemini Product Search Error:", error);
    return [];
  }
};

/**
 * Natural language command processor.
 */
export const processCommand = async (userInput: string, existingPeople: string[]) => {
  const prompt = `
    You are the Kokoro AI Assistant. You help users manage their relationship circle.
    
    Users might want to:
    1. ADD_PERSON: Add a new person
    2. ADD_DATE: Add a date/event
    3. ADD_PREFERENCE: Add a nuance/fact
    4. UPDATE_PERSON: Update contact info or details
    5. NONE: Just chat or ask for advice.

    Existing people: ${existingPeople.join(', ')}

    Analyze the user's input: "${userInput}"
    
    Return JSON with message and command.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            command: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING },
                data: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    relationship: { type: Type.STRING },
                    label: { type: Type.STRING },
                    date: { type: Type.STRING },
                    content: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    email: { type: Type.STRING },
                    address: { type: Type.STRING },
                    notes: { type: Type.STRING },
                    nickname: { type: Type.STRING }
                  }
                }
              }
            }
          },
          required: ["message"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Command processing error:", error);
    return { message: "I'm having trouble processing that right now.", command: { action: "NONE" } };
  }
};

/**
 * Suggests relevant occasions for a person based on their profile and relationship.
 */
export const suggestOccasions = async (person: Person) => {
  const prompt = `
    Suggest 5 relevant annual occasions or rituals for ${person.name}, who is my ${person.relationship}.
    Context: ${person.notes}
    Nuances: ${person.preferences.map(p => p.content).join(', ')}
    
    Include standard holidays if relevant (e.g., Mother's Day if relationship is Mother) and unique rituals based on their notes/preferences.
    For each, provide:
    1. Label (e.g., "Mother's Day", "Coffee Date Anniversary")
    2. Approximate Date (MM-DD format)
    3. Reason (Briefly why this is suggested)
    
    Return in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              date: { type: Type.STRING, description: "MM-DD format" },
              reason: { type: Type.STRING }
            },
            required: ["label", "date", "reason"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Suggest Occasions Error:", error);
    return [];
  }
};
