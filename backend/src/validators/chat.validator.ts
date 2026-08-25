import { z } from "zod";

export const sendMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(5000, "Message too long"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;