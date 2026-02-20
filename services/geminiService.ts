
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CalendarType, HistoricalInsight, Resource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHistoricalInsights = async (year: number, type: CalendarType): Promise<HistoricalInsight | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `${type} takvimine göre ${year} yılında gerçekleşen önemli tarihi olayları (mümkünse tam tarihleri ile), o dönemin öne çıkan önemli şahsiyetlerini ve bu yılın kültürel önemini Türkçe olarak detaylıca açıkla.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.NUMBER },
            type: { type: Type.STRING },
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING, description: "Olayın tarihi" },
                  description: { type: Type.STRING, description: "Olayın açıklaması" }
                },
                required: ["date", "description"]
              }
            },
            notableFigures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "role", "description"]
              }
            },
            culturalSignificance: { type: Type.STRING }
          },
          required: ["year", "type", "events", "notableFigures", "culturalSignificance"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const resources: Resource[] = [];
      
      if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
          if (chunk.web && chunk.web.uri && chunk.web.title) {
            resources.push({
              title: chunk.web.title,
              url: chunk.web.uri
            });
          }
        });
      }

      return {
        ...data,
        furtherReading: resources
      } as HistoricalInsight;
    }
    return null;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return null;
  }
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Aşağıdaki metni profesyonel ve etkileyici bir tarihçi sesiyle oku: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Speech Generation Error:", error);
    return undefined;
  }
};
