import { Router } from "express";
import {
  getProjectTasks,
  getTaskById,
  updateTaskStatus,
  updateTask,
  deleteTask,
  createTask,
} from "../controllers/task.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/tasks", getProjectTasks);
router.get("/tasks/:taskId", getTaskById);
router.post("/tasks", createTask);
router.put("/tasks/:taskId", updateTask);
router.delete("/tasks/:taskId", deleteTask);
router.put("/tasks/:taskId/status", updateTaskStatus);

export default router;