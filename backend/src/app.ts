import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import authRouter from "./routes/auth.routes.js";

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

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "System Designer API is running",
  });
});

export default app;