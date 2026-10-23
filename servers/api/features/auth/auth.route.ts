import { Router } from "express";
import { createAuthController } from "./auth.controller.js";
import { createAuthService } from "./auth.service.js";
import { authenticateToken } from "../../middleware/auth.middleware.js";

export const createAuthRoutes = (): Router => {
  const router = Router();
  const service = createAuthService();
  const controller = createAuthController(service);

  router.post("/register", (req, res, next) => {
    void controller.register(req, res).catch(next);
  });

  router.post("/login", (req, res, next) => {
    void controller.login(req, res).catch(next);
  });

  router.get("/me", authenticateToken, (req, res, next) => {
    void controller.getMe(req, res).catch(next);
  });

  return router;
};
