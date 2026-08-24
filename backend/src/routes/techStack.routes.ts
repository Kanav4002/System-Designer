import { Router } from "express";
import { generateTechStack, getTechStack, updateTechStack } from "../controllers/techStack.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/generate", generateTechStack);
router.get("/", getTechStack);
router.put("/", updateTechStack);

export default router;