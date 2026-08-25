import { env } from "../../config/env.js";
import { generateAIResponse as groqGenerate } from "./groq.service.js";
import { generateAIResponse as geminiGenerate } from "./gemini.service.js";

export type AIProvider = "groq" | "gemini";

export const generateAIResponse = async (
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
): Promise<string> => {
  const provider = (env.aiProvider as AIProvider) || "groq";
  console.log('[AI Provider Debug] Using provider:', provider);
  
  if (provider === "gemini") {
    return geminiGenerate(messages);
  }
  return groqGenerate(messages);
};

export const getCurrentProvider = (): AIProvider => {
  return (env.aiProvider as AIProvider) || "groq";
};