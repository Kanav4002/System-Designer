import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import analysisRouter from "./routes/analysis.routes.js";
import techStackRouter from "./routes/techStack.routes.js";
import roadmapRouter from "./routes/roadmap.routes.js";
import taskRouter from "./routes/task.routes.js";
import architectureRouter from "./routes/architecture.routes.js";
import chatRouter from "./routes/chat.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.clientURL,
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/projects/:id/analysis", analysisRouter);
app.use("/api/projects/:id/tech-stack", techStackRouter);
app.use("/api/projects/:id/roadmap", roadmapRouter);
app.use("/api/projects/:id", taskRouter);
app.use("/api/projects/:id/architecture", architectureRouter);
app.use("/api/projects/:id/chat", chatRouter);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "System Designer API is running",
  });
});

export default app;