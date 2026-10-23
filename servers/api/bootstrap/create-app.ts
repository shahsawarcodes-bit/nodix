import express, { type Express } from "express";
import { createHttpLogger, type Logger } from "@workspace/logging";
import type { ApiConfig } from "../types/index.js";
import { apiRuntime } from "../constants/index.js";
import path from "node:path";
import { createAuthRoutes } from "../features/auth/index.js";
import { createBlocksRoutes } from "../features/blocks/index.js";
import { createHealthRoutes } from "../features/health/index.js";
import { createPagesRoutes } from "../features/pages/index.js";
import { createTemplatesRoutes } from "../features/templates/index.js";
import { createUploadRoutes } from "../features/upload/index.js";
import { createCorsMiddleware, createErrorHandler, createNotFoundHandler } from "../middleware/index.js";

type AppDependencies = Readonly<{ config: ApiConfig; logger: Logger }>;

export const createApp = ({ config, logger }: AppDependencies): Express => {
  const app = express();
  app.disable("x-powered-by");
  app.use(createHttpLogger({
    logger,
    format: config.environment === "production" ? "combined" : "dev"
  }));
  app.use(createCorsMiddleware({ origin: config.webOrigin }));
  app.use(express.json({ limit: apiRuntime.jsonBodyLimit }));
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
  app.use(createHealthRoutes({
    environment: config.environment,
    serviceName: apiRuntime.serviceName
  }));
  app.use("/api/auth", createAuthRoutes());
  app.use("/api/pages", createPagesRoutes());
  app.use("/api/blocks", createBlocksRoutes());
  app.use("/api/templates", createTemplatesRoutes());
  app.use("/api/upload", createUploadRoutes());
  app.use(createNotFoundHandler());
  app.use(createErrorHandler({ logger }));
  return app;
};
