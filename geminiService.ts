
import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysisResult } from "../types";

/**
 * Analisa um alimento via imagem (base64) ou texto usando o modelo Gemini.
 */
export const analyzeFood = async (imageB64?: string, textQuery?: string): Promise<FoodAnalysisResult> => {
  // Use o process.env.API_KEY diretamente. 
  // O SDK deve ser instanciado logo antes do uso para garantir a chave mais atual.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    Você é um nutricionista e cientista de alimentos de classe mundial. 
    Analise o alimento fornecido (por imagem ou texto) e forneça um relatório nutricional completo.
    - Se houver uma imagem, identifique os itens e estime as porções.
    - Se houver texto, use os dados fornecidos.
    - O 'healthScore' deve ser um inteiro de 0 a 100 baseado na densidade nutricional e nível de processamento.
    - O campo 'processingLevel' deve ser: 'Natural', 'Minimamente Processado', 'Processado' ou 'Ultraprocessado'.
    - Idioma: Português Brasileiro.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      foodName: { type: Type.STRING, description: "Nome principal do prato ou alimento" },
      confidence: { type: Type.NUMBER, description: "Nível de confiança da análise (0-1)" },
      description: { type: Type.STRING, description: "Breve descrição do alimento e seus componentes" },
      estimatedWeight: { type: Type.STRING, description: "Peso estimado da porção analisada" },
      calories: { type: Type.NUMBER, description: "Total de calorias (kcal)" },
      macros: {
        type: Type.OBJECT,
        properties: {
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
          fiber: { type: Type.NUMBER },
        },
        required: ["protein", "carbs", "fat", "fiber"],
      },
      micronutrients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            value: { type: Type.NUMBER },
            unit: { type: Type.STRING },
          },
        },
      },
      allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
      healthScore: { type: Type.NUMBER },
      pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de pontos positivos para a saúde" },
      cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de pontos de atenção ou negativos" },
      tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dicas de como tornar a refeição mais saudável" },
      processingLevel: { type: Type.STRING },
    },
    required: [
      "foodName", "calories", "macros", "healthScore", "description", 
      "pros", "cons", "tips", "processingLevel", "allergens", "estimatedWeight"
    ],
  };

  const contentsParts: any[] = [];
  
  if (imageB64) {
    // Remove o prefixo data:image/jpeg;base64, se existir
    const cleanBase64 = imageB64.includes(',') ? imageB64.split(',')[1] : imageB64;
    contentsParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBase64
      }
    });
  }
  
  if (textQuery) {
    contentsParts.push({ text: `Alimento para analisar: ${textQuery}` });
  } else if (!imageB64) {
    throw new Error("Nenhuma imagem ou texto fornecido para análise.");
  } else {
    contentsParts.push({ text: "Analise nutricionalmente o alimento nesta imagem." });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: contentsParts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("O modelo não retornou conteúdo.");
    }

    return JSON.parse(resultText) as FoodAnalysisResult;
  } catch (error) {
    console.error("Erro na análise do Gemini:", error);
    throw new Error("Não foi possível analisar o alimento. Verifique sua conexão ou tente novamente.");
  }
};
