import { GoogleGenAI } from "@google/genai";
import { Occurrence } from "../types";

const getClient = () => {
    // Assuming process.env.API_KEY is available as per instructions
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeOccurrence = async (title: string, description: string, product: string): Promise<string> => {
    try {
        const ai = getClient();
        const prompt = `
        Você é um especialista em análise de riscos e litígios de varejo.
        Analise a seguinte ocorrência e forneça um parecer preliminar curto (máximo 3 frases) sobre se parece ser PROCEDENTE (culpa da empresa/logística) ou NÃO PROCEDENTE (culpa do cliente/mau uso), e por quê.
        
        Título: ${title}
        Produto: ${product}
        Descrição: ${description}
        
        Responda em formato de texto simples.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Não foi possível gerar uma análise no momento.";
    } catch (error) {
        console.error("Erro na análise IA:", error);
        return "Erro ao conectar com o serviço de IA.";
    }
};

export const generateResolutionSuggestion = async (occurrence: Occurrence): Promise<string> => {
     try {
        const ai = getClient();
        const prompt = `
        Como administrador de um Centro de Distribuição, sugira uma ação técnica para a seguinte ocorrência.
        Seja direto.

        Problema: ${occurrence.title}
        Descrição: ${occurrence.description}
        Produto: ${occurrence.productName}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Sem sugestão disponível.";
    } catch (error) {
        console.error("Erro na sugestão IA:", error);
        return "Erro ao gerar sugestão.";
    }
}
