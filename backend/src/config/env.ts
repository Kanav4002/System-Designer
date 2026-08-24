import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 8000,
  mongoURI: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  groqApiKey: process.env.GROQ_API_KEY || "",
  clientURL: process.env.CLIENT_URL || "http://localhost:3000",
};