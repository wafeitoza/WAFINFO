import { GoogleGenAI, Type } from "@google/genai";
import type { ShoppingItem } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getEmojiForItem = async (itemName: string): Promise<string> => {
  if (!API_KEY) {
    return "🛒";
  }

  const prompt = `Given the shopping item "${itemName}", return a single, relevant emoji. Your response must be a JSON object with a single key "emoji". For example, for "Apple", you should return {"emoji": "🍎"}. If no specific emoji fits, use "🛒".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emoji: {
              type: Type.STRING,
              description: "A single emoji."
            }
          },
          required: ["emoji"]
        },
      },
    });
    
    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    return data.emoji || "🛒";

  } catch (error) {
    console.error(`Error fetching emoji for "${itemName}":`, error);
    return "🛒";
  }
};


export const getSuggestions = async (items: ShoppingItem[]): Promise<string[]> => {
  if (!API_KEY) {
    // Return mock data if API key is not available
    return new Promise(resolve => setTimeout(() => resolve(["Leite", "Pão", "Ovos", "Manteiga", "Café"]), 500));
  }
  
  const existingItems = items.map(item => item.name).join(', ') || 'Nenhum';
  const prompt = `Você é um assistente de compras inteligente. Baseado nos seguintes itens que já estão na lista de compras, sugira 5 outros itens complementares ou comumente comprados juntos. Não sugira itens que já estão na lista. Os itens atuais são: ${existingItems}. Se a lista estiver vazia, sugira 5 itens essenciais para uma compra básica. Retorne sua resposta como um array JSON contendo apenas as strings das sugestões. Exemplo: ["Leite", "Pão", "Ovos", "Manteiga", "Café"]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "Um item para a lista de compras"
          },
          description: "Uma lista de 5 sugestões de itens de compra."
        },
      },
    });
    
    const jsonText = response.text.trim();
    const suggestions = JSON.parse(jsonText);
    
    if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
      return suggestions;
    }
    
    console.warn("Gemini API returned an unexpected format for suggestions.");
    return [];

  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    return [];
  }
};


export const getCategorizedItems = async (items: ShoppingItem[]): Promise<{id: string, category: string}[]> => {
  if (!API_KEY || items.length === 0) {
    return [];
  }

  const itemsForPrompt = items.map(item => ({ id: item.id, name: item.name }));

  const prompt = `Você é um organizador de listas de compras. Agrupe os seguintes itens em categorias de supermercado (ex: 'Laticínios e Frios', 'Hortifruti', 'Padaria', 'Bebidas', 'Limpeza', 'Higiene Pessoal', 'Mercearia'). Para cada item, forneça sua categoria correspondente. Se um item não se encaixar bem, coloque-o na categoria 'Outros'.

Retorne a resposta como um array de objetos JSON, onde cada objeto tem duas chaves: "id" (o ID original do item) e "category" (o nome da categoria que você atribuiu).

Exemplo de resposta: [{"id": "uuid-1", "category": "Hortifruti"}, {"id": "uuid-2", "category": "Laticínios e Frios"}]

Itens a serem categorizados:
${JSON.stringify(itemsForPrompt)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "Uma lista de itens com suas categorias atribuídas.",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { 
                type: Type.STRING,
                description: "O ID único do item."
              },
              category: { 
                type: Type.STRING,
                description: "A categoria do item."
              }
            },
            required: ["id", "category"]
          }
        },
      },
    });
    
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (Array.isArray(result) && result.every(r => typeof r === 'object' && 'id' in r && 'category' in r)) {
      return result;
    }
    
    console.warn("Gemini API returned an unexpected format for categories.");
    return [];

  } catch (error) {
    console.error("Error fetching categories from Gemini API:", error);
    // Return an empty array on error to allow fallback on the client side
    return [];
  }
};