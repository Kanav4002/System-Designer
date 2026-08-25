import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 8000,
  mongoURI: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  groqApiKey: process.env.GROQ_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  clientURL: process.env.CLIENT_URL || "http://localhost:3000",
  aiProvider: process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "groq"),
};