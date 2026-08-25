import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env.js";

if (!env.geminiApiKey) {
  console.warn("GEMINI_API_KEY is not configured");
}

export const genAI = new GoogleGenerativeAI(env.geminiApiKey);
