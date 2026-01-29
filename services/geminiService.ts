import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Recipe } from "../types";

// Helper to generate a random ID for new recipes
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to clean JSON string if model wraps it in markdown
const cleanAndParseJson = <T>(text: string): T => {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\n/, "").replace(/\n```$/, "");
    }
    return JSON.parse(cleanText) as T;
  } catch (e) {
    console.error("Failed to parse JSON", text);
    throw new Error("The AI response could not be processed. Please try again.");
  }
};

const RECIPE_SCHEMA_OBJ: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    ingredients: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    instructions: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    prepTime: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard", "Expert"] },
    tags: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    nutrition: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.STRING, description: "e.g. 450 kcal" },
        protein: { type: Type.STRING, description: "e.g. 20g" },
        carbs: { type: Type.STRING, description: "e.g. 45g" },
        fat: { type: Type.STRING, description: "e.g. 15g" }
      },
      required: ["calories", "protein", "carbs", "fat"]
    }
  },
  required: ["title", "description", "ingredients", "instructions", "prepTime", "difficulty", "tags", "nutrition"],
};

const RECIPE_LIST_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: RECIPE_SCHEMA_OBJ,
};

// Helper to hydrate AI response with client-side only fields (id, reviews)
const hydrateRecipe = (data: any): Recipe => {
  return {
    ...data,
    id: generateId(),
    reviews: [],
    rating: 0
  };
};

export const identifyFoodAndGetRecipe = async (base64Image: string, mimeType: string): Promise<Recipe> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Note: gemini-2.5-flash-image does NOT support responseSchema or responseMimeType in config.
  // We must prompt purely via text for JSON structure.
  
  const prompt = `
    Analyze this image of food. Identify the dish.
    Then, create a detailed recipe for it.
    
    You MUST return the result as a raw JSON object (no markdown formatting) with the following structure:
    {
      "title": "Name of the dish",
      "description": "A short appetizing description",
      "ingredients": ["List of ingredients with quantities"],
      "instructions": ["Step-by-step cooking instructions"],
      "prepTime": "e.g., 30 mins",
      "difficulty": "Easy" or "Medium" or "Hard",
      "tags": ["Tag1", "Tag2"],
      "nutrition": {
         "calories": "e.g. 500 kcal",
         "protein": "e.g. 20g",
         "carbs": "e.g. 60g",
         "fat": "e.g. 15g"
      }
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ],
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  const rawData = cleanAndParseJson<Omit<Recipe, 'id' | 'reviews' | 'rating'>>(text);
  return hydrateRecipe(rawData);
};

export const getRecipeByName = async (foodName: string): Promise<Recipe> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Create a detailed, authentic recipe for: ${foodName}. Include nutritional breakdown.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: RECIPE_SCHEMA_OBJ,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  const rawData = JSON.parse(text);
  return hydrateRecipe(rawData);
};

export const getRecipesByIngredients = async (ingredients: string[]): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const ingredientList = ingredients.join(", ");
  const prompt = `
    I have the following ingredients: ${ingredientList}.
    Suggest 3 distinct, delicious recipes I can make primarily using these ingredients (you can assume I have basic pantry staples like oil, salt, pepper, flour).
    Include nutritional breakdown for each.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: RECIPE_LIST_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  const rawList = JSON.parse(text) as any[];
  return rawList.map(hydrateRecipe);
};