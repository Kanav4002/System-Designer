import { genAI } from "../../config/gemini.js";

const MODELS = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite"];

export const generateAIResponse = async (
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
): Promise<string> => {
  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const contents = chatMessages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  let lastError: any = null;

  for (const modelName of MODELS) {
    try {
      console.log(`[Gemini Service] Attempting generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemMessage?.content,
      });

      const result = await model.generateContent({ contents });
      const response = await result.response;
      const text = response.text();
      if (text) {
        return text;
      }
    } catch (error: any) {
      console.warn(`[Gemini Service] Model ${modelName} failed:`, error.message || error);
      lastError = error;
    }
  }

  throw lastError || new Error("All Gemini models failed to generate response.");
};
