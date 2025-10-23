
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { OutfitDescriptions } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function generateOutfitDescriptions(base64: string, mimeType: string): Promise<OutfitDescriptions> {
    const model = 'gemini-2.5-pro';
    
    const imagePart = {
        inlineData: {
            data: base64,
            mimeType: mimeType,
        },
    };

    const textPart = {
        text: `You are a virtual fashion stylist. A user has uploaded an image of a single clothing item. Your task is to generate three distinct and complete outfit ideas based on this item for the following occasions: Casual, Business, and Night Out.
        
        For each outfit, provide a detailed textual description of all the pieces that would create a stylish, cohesive look. This includes other clothing items, shoes, and accessories. The description should be clear and descriptive enough to be used as a prompt for an image generation model.
        
        Ensure your descriptions explicitly mention the original item to be included in the final image.`
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [textPart, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    casual: {
                        type: Type.STRING,
                        description: "A detailed description of a casual outfit featuring the user's item."
                    },
                    business: {
                        type: Type.STRING,
                        description: "A detailed description of a business-appropriate outfit featuring the user's item."
                    },
                    nightOut: {
                        type: Type.STRING,
                        description: "A detailed description of a 'night out' outfit featuring the user's item."
                    }
                },
                required: ["casual", "business", "nightOut"]
            }
        }
    });

    try {
        const jsonText = response.text.trim();
        const parsedDescriptions = JSON.parse(jsonText);
        
        if (typeof parsedDescriptions.casual === 'string' &&
            typeof parsedDescriptions.business === 'string' &&
            typeof parsedDescriptions.nightOut === 'string') {
            return parsedDescriptions;
        } else {
            throw new Error("Invalid format for outfit descriptions received from API.");
        }
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("Could not understand the stylist's suggestions. Please try again.");
    }
}


export async function generateOutfitImage(description: string): Promise<string> {
    const model = 'gemini-2.5-flash-image';

    const prompt = `Generate a clean, minimalist flat-lay photograph of a complete fashion outfit, styled on a neutral light gray background. The outfit must consist of: ${description}. The image should be well-lit, high-quality, and showcase each item clearly.`;

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [{ text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
        const base64Image = firstPart.inlineData.data;
        return `data:${firstPart.inlineData.mimeType};base64,${base64Image}`;
    }

    throw new Error('Image generation failed. No image data received.');
}
