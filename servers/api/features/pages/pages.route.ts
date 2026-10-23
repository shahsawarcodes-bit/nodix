import { Router } from "express";
import { optionalAuth } from "../../middleware/auth.middleware.js";
import { createPagesController, type PagesControllerDependencies } from "./pages.controller.js";
import { createPagesRepository } from "./pages.repository.js";
import { createPagesService } from "./pages.service.js";

export type PagesRouteDependencies = Partial<PagesControllerDependencies>;

export const createPagesRoutes = (dependencies: PagesRouteDependencies = {}): Router => {
  const router = Router();
  router.use(optionalAuth);
  const repository = createPagesRepository();
  const service = dependencies.service ?? createPagesService({ repository });
  const controller = createPagesController({ service });

  router.get("/", (req, res, next) => {
    void controller.list(req, res).catch(next);
  });
  router.post("/", (req, res, next) => {
    void controller.create(req, res).catch(next);
  });
  router.get("/:id", (req, res, next) => {
    void controller.getById(req, res).catch(next);
  });
  router.patch("/:id", (req, res, next) => {
    void controller.update(req, res).catch(next);
  });
  router.delete("/:id", (req, res, next) => {
    void controller.remove(req, res).catch(next);
  });

  return router;
};
