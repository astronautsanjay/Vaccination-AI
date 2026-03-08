import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, MessageRole } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const streamAnswer = async (
  knowledgeBase: string,
  history: ChatMessage[],
  question: string,
  onChunk: (chunk: string) => void
): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-3.1-pro-preview';
  
  const systemInstruction = `You are "Vaccine Mitra" (टीकाकरण मित्र), a friendly and highly intelligent AI assistant for healthcare workers in India. 
Your goal is to provide human-like, supportive, and precise information based EXCLUSIVELY on the provided "Immunization Handbook for Health Workers".

CONVERSATIONAL GUIDELINES:
1. BE HUMAN-LIKE: Use a supportive, professional, yet approachable tone. Acknowledge the user's concerns.
2. CONTEXT AWARE: You have access to the previous conversation history. Use it to provide relevant follow-up information.
3. SOURCE ADHERENCE: Use ONLY the provided handbook. If the answer isn't there, politely say so in both languages.
4. BILINGUAL: Always respond in both Hindi and English.
5. STRUCTURE:
   - Start with a warm, direct answer.
   - Use bullet points for details.
   - End with 3 relevant follow-up questions.

--- KNOWLEDGE BASE START ---
${knowledgeBase}
--- KNOWLEDGE BASE END ---`;

  // Convert app history to Gemini format
  const contents = history.map(msg => ({
    role: msg.role === MessageRole.USER ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  // Add the current question
  contents.push({
    role: 'user',
    parts: [{ text: question }]
  });

  try {
    const result = await ai.models.generateContentStream({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    let fullText = '';
    for await (const chunk of result) {
      const text = (chunk as GenerateContentResponse).text;
      if (text) {
        fullText += text;
        onChunk(fullText);
      }
    }

    return fullText;
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    throw error;
  }
};

// Keep the non-streaming version for compatibility if needed, but updated to use history
export const answerQuestion = async (knowledgeBase: string, question: string, history: ChatMessage[] = []): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-3.1-pro-preview';
  
  const systemInstruction = `You are "Vaccine Mitra" (टीकाकरण मित्र), a helpful AI assistant for healthcare workers. Use ONLY the provided handbook. Respond in Hindi and English.`;

  const contents = history.map(msg => ({
    role: msg.role === MessageRole.USER ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: question }] });

  const response = await ai.models.generateContent({
    model,
    contents,
    config: { systemInstruction, temperature: 0.2 },
  });

  return response.text || "";
};
