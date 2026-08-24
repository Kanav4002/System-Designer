import { Router } from "express";
import { generateRoadmap, getRoadmap } from "../controllers/roadmap.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/generate", generateRoadmap);
router.get("/", getRoadmap);

export default router;