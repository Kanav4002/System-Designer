import { Router } from "express";
import { generateArchitectureHandler, getArchitectureHandler, updateArchitectureHandler } from "../controllers/architecture.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/generate", generateArchitectureHandler);
router.get("/", getArchitectureHandler);
router.put("/", updateArchitectureHandler);

export default router;