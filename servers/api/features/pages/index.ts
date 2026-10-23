export { createPagesController, type PagesController, type PagesControllerDependencies } from "./pages.controller.js";
export { PageModel, type PageDocument } from "./pages.model.js";
export { createPagesRepository, type PagesRepository } from "./pages.repository.js";
export { createPagesRoutes, type PagesRouteDependencies } from "./pages.route.js";
export { createPagesService, type PagesService, type PagesServiceDependencies } from "./pages.service.js";
export {
  createPageSchema,
  pageIdParamSchema,
  updatePageSchema,
  type CreatePageInput,
  type PageIdParam,
  type UpdatePageInput
} from "./pages.validation.js";
