import { groq } from "../../config/groq.js";

export const generateAIResponse = async (
  systemPrompt: string,
  userPrompt: string
): Promise<string> => {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  return completion.choices[0]?.message?.content || "";
};