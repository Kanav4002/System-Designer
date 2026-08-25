import { groq } from "../../config/groq.js";

export const generateAIResponse = async (
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
): Promise<string> => {
  const completion = await groq.chat.completions.create({
    model: "qwen/qwen3.6-27b",
    messages,
    temperature: 0.3,
    max_tokens: 4096,
  });

  return completion.choices[0]?.message?.content || "";
};