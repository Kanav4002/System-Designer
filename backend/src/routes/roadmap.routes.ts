import { Router } from "express";
import { generateRoadmapHandler, getRoadmapHandler, updateTaskStatusHandler } from "../controllers/roadmap.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/generate", generateRoadmapHandler);
router.get("/", getRoadmapHandler);
router.patch("/tasks/:phaseIndex/:taskIndex", updateTaskStatusHandler);

export default router;
