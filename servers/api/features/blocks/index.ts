export { createBlocksController, type BlocksController, type BlocksControllerDependencies } from "./blocks.controller.js";
export { BlockModel, type BlockDocument } from "./blocks.model.js";
export { createBlocksRepository, type BlocksRepository } from "./blocks.repository.js";
export { createBlocksRoutes, type BlocksRouteDependencies } from "./blocks.route.js";
export { createBlocksService, type BlocksService, type BlocksServiceDependencies } from "./blocks.service.js";
export {
  blockIdParamSchema,
  createBlockSchema,
  listBlocksQuerySchema,
  updateBlockSchema,
  type BlockIdParam,
  type CreateBlockInput,
  type ListBlocksQuery,
  type UpdateBlockInput
} from "./blocks.validation.js";
