
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateHairstyle = async (
  base64Image: string,
  styleDescription: string,
  referenceImage?: string | null
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  // Helper to remove header
  const getBase64Data = (str: string) => str.split(',')[1] || str;
  // Helper for mime type
  const getMimeType = (str: string) => {
    if (str.includes('data:image/jpeg')) return 'image/jpeg';
    if (str.includes('data:image/webp')) return 'image/webp';
    return 'image/png';
  }

  const parts: any[] = [];

  // 1. Add Original Image
  parts.push({
    inlineData: {
      data: getBase64Data(base64Image),
      mimeType: getMimeType(base64Image),
    },
  });

  // 2. Add Reference Image (if exists) or Prompt
  let finalPrompt = '';

  if (referenceImage) {
    parts.push({
      inlineData: {
        data: getBase64Data(referenceImage),
        mimeType: getMimeType(referenceImage),
      },
    });
    
    finalPrompt = `You are an expert hair stylist AI. 
    Task: Transfer the hairstyle from the SECOND image to the person in the FIRST image.
    1. Analyze the hairstyle in the second image (cut, texture, color, volume).
    2. Apply exactly that hairstyle to the person in the first image.
    3. CRITICAL: Keep the first person's face, facial features, skin tone, lighting, pose, and background EXACTLY the same. Only change the hair area.
    4. The result must be photorealistic.`;
  } else {
    finalPrompt = `Change the hairstyle of the person in the image to: ${styleDescription}. 
    Important: Keep the face, facial features, skin tone, lighting, and background exactly the same. 
    Only change the hair. The result should be photorealistic and high quality.`;
  }

  parts.push({ text: finalPrompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
    });

    // Extract image from response
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
