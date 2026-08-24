import { Router } from "express";
import { generateAnalysis, getAnalysis } from "../controllers/analysis.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/generate", generateAnalysis);
router.get("/", getAnalysis);

export default router;