import { Router } from "express";
import { optionalAuth } from "../../middleware/auth.middleware.js";
import { createBlocksController, type BlocksControllerDependencies } from "./blocks.controller.js";
import { createBlocksRepository } from "./blocks.repository.js";
import { createBlocksService } from "./blocks.service.js";

export type BlocksRouteDependencies = Partial<BlocksControllerDependencies>;

export const createBlocksRoutes = (dependencies: BlocksRouteDependencies = {}): Router => {
  const router = Router();
  router.use(optionalAuth);
  const repository = createBlocksRepository();
  const service = dependencies.service ?? createBlocksService({ repository });
  const controller = createBlocksController({ service });

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
