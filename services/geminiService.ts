
import { GoogleGenAI } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLuckyPrediction = async (gameType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a mystical lucky assistant for an online game called "${gameType}". 
      Give a short, exciting 2-sentence prediction for the next round. 
      Mention luck, colors (like Red or Green), or sizes (Big or Small) depending on the game. 
      Keep it high energy and fun.`,
      config: {
        // Removed maxOutputTokens to follow guidelines recommending avoidance unless paired with thinkingBudget for Gemini 3 models.
        temperature: 0.9,
      }
    });
    return response.text || "Luck is in the air! Trust your gut this round.";
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    return "The stars are aligning for a big win!";
  }
};
