import { Request, Response } from "express";
import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { sendMessage, getChatHistory, clearChatHistory } from "../services/ai/chat.service.js";
import { sendMessageSchema } from "../validators/chat.validator.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const sendMessageHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const project = await Project.findOne({ _id: id, userId: req.userId });
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    const validation = sendMessageSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.format(),
      });
      return;
    }

    const { message } = validation.data;

    const result = await sendMessage(id, req.userId, message);

    res.status(200).json({
      success: true,
      data: {
        message: {
          role: "assistant",
          content: result.response,
        },
      },
    });
  } catch (error: any) {
    console.error("Chat error:", error.message, error.stack);
    res.status(500).json({ success: false, message: error.message || "Failed to send message" });
  }
};

export const getChatHistoryHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const project = await Project.findOne({ _id: id, userId: req.userId });
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    const messages = await getChatHistory(id, req.userId);

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const clearChatHistoryHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const project = await Project.findOne({ _id: id, userId: req.userId });
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    await clearChatHistory(id, req.userId);

    res.status(200).json({
      success: true,
      message: "Chat history cleared successfully",
    });
  } catch (error) {
    console.error("Clear chat history error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};