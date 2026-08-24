import Groq from "groq-sdk";
import { env } from "./env.js";

if (!env.groqApiKey) {
  console.warn("GROQ_API_KEY is not configured");
}

export const groq = new Groq({
  apiKey: env.groqApiKey,
});