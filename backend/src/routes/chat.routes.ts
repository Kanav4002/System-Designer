import { Router } from "express";
import { sendMessageHandler, getChatHistoryHandler, clearChatHistoryHandler } from "../controllers/chat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/", sendMessageHandler);
router.get("/", getChatHistoryHandler);
router.delete("/", clearChatHistoryHandler);

export default router;