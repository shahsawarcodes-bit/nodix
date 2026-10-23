import { Router } from "express";
import { optionalAuth } from "../../middleware/auth.middleware.js";
import { createTemplatesController } from "./templates.controller.js";

export const createTemplatesRoutes = (): Router => {
  const router = Router();
  router.use(optionalAuth);
  const controller = createTemplatesController();

  router.get("/", (req, res, next) => {
    void controller.list(req, res).catch(next);
  });

  router.post("/", (req, res, next) => {
    void controller.create(req, res).catch(next);
  });

  router.post("/seed", (req, res, next) => {
    void controller.seed(req, res).catch(next);
  });

  router.post("/:id/apply", (req, res, next) => {
    void controller.apply(req, res).catch(next);
  });

  return router;
};
